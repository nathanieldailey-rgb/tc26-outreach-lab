import { Buffer } from 'node:buffer'

import handler, {
  MAX_RATE_LIMIT_CLIENTS,
  MAX_REQUEST_BODY_BYTES,
  OPENAI_TIMEOUT_MS,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  __getRateLimitSizeForTests,
  __resetRateLimitForTests
} from '../api/ask'

type HeaderValue = string | number | readonly string[]

type Invocation = {
  status: number
  body: unknown
  ended: boolean
  header(name: string): HeaderValue | undefined
}

const originalEnvironment = {
  allowedOrigin: process.env.ALLOWED_ORIGIN,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL
}

const defaultQuestion = 'Why does outreach matter?'

function restoreEnvironment(
  name: 'ALLOWED_ORIGIN' | 'OPENAI_API_KEY' | 'OPENAI_MODEL',
  value: string | undefined
) {
  if (value === undefined) {
    delete process.env[name]
  } else {
    process.env[name] = value
  }
}

async function invoke(
  overrides: Record<string, unknown> = {}
): Promise<Invocation> {
  const request = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'api-handler-test-agent',
      'x-forwarded-for': '203.0.113.10'
    },
    body: { question: defaultQuestion },
    socket: { remoteAddress: '203.0.113.200' },
    ...overrides
  }

  let status = 200
  let body: unknown
  let ended = false
  const headers = new Map<string, HeaderValue>()
  const response = {
    status(code: number) {
      status = code
      return response
    },
    setHeader(name: string, value: HeaderValue) {
      headers.set(name.toLocaleLowerCase('en'), value)
      return response
    },
    json(payload: unknown) {
      body = payload
      ended = true
    },
    end(payload?: unknown) {
      body = payload
      ended = true
    }
  }

  await handler(request as never, response as never)

  return {
    status,
    body,
    ended,
    header: (name: string) => headers.get(name.toLocaleLowerCase('en'))
  }
}

function upstreamResponse(payload: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 503,
    json: vi.fn().mockResolvedValue(payload)
  } as unknown as Response
}

function installSuccessfulOpenAi(payload: unknown = { output_text: 'Grounded live answer.' }) {
  const fetchMock = vi.fn().mockResolvedValue(upstreamResponse(payload))
  vi.stubGlobal('fetch', fetchMock)
  process.env.OPENAI_API_KEY = 'server-only-test-secret'
  return fetchMock
}

function parseUpstreamRequest(fetchMock: ReturnType<typeof vi.fn>) {
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
  return {
    url,
    init,
    body: JSON.parse(String(init.body)) as Record<string, unknown>
  }
}

function expectPreviewFallback(result: Invocation) {
  expect(result.status).toBe(200)
  expect(result.body).toMatchObject({
    mode: 'preview',
    answer: expect.stringMatching(/^Preview answer — site-owned material only:/),
    notice: expect.stringMatching(/live answer unavailable/i)
  })
  expect(JSON.stringify(result.body)).not.toContain('server-only-test-secret')
}

beforeEach(() => {
  __resetRateLimitForTests()
  delete process.env.ALLOWED_ORIGIN
  delete process.env.OPENAI_API_KEY
  delete process.env.OPENAI_MODEL
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

afterAll(() => {
  restoreEnvironment('ALLOWED_ORIGIN', originalEnvironment.allowedOrigin)
  restoreEnvironment('OPENAI_API_KEY', originalEnvironment.openAiApiKey)
  restoreEnvironment('OPENAI_MODEL', originalEnvironment.openAiModel)
  __resetRateLimitForTests()
})

describe('method, CORS, and response headers', () => {
  it.each(['GET', 'PUT', 'PATCH', 'DELETE'])('rejects %s with 405 and an Allow header', async (method) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await invoke({ method })

    expect(result.status).toBe(405)
    expect(result.body).toEqual({ error: 'Method not allowed.' })
    expect(result.header('Allow')).toBe('POST, OPTIONS')
    expect(result.header('Cache-Control')).toBe('no-store')
    expect(result.header('Content-Type')).toMatch(/^application\/json\b/)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('handles an allowed preflight without invoking retrieval generation', async () => {
    process.env.ALLOWED_ORIGIN =
      'https://review.example, https://committee.example'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await invoke({
      method: 'OPTIONS',
      headers: {
        origin: 'https://committee.example',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type'
      },
      body: undefined
    })

    expect(result.status).toBe(204)
    expect(result.ended).toBe(true)
    expect(result.body).toBeUndefined()
    expect(result.header('Access-Control-Allow-Origin')).toBe(
      'https://committee.example'
    )
    expect(result.header('Access-Control-Allow-Methods')).toBe('POST, OPTIONS')
    expect(result.header('Access-Control-Allow-Headers')).toBe('Content-Type')
    expect(result.header('Allow')).toBe('POST, OPTIONS')
    expect(result.header('Vary')).toBe('Origin')
    expect(result.header('Cache-Control')).toBe('no-store')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each(['OPTIONS', 'POST'])('rejects a supplied disallowed origin for %s', async (method) => {
    process.env.ALLOWED_ORIGIN = 'https://committee.example'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await invoke({
      method,
      headers: {
        origin: 'https://lookalike.example',
        'content-type': 'application/json'
      }
    })

    expect(result.status).toBe(403)
    expect(result.body).toEqual({ error: 'Origin not allowed.' })
    expect(result.header('Access-Control-Allow-Origin')).toBeUndefined()
    expect(result.header('Vary')).toBe('Origin')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('supports public CORS when no exact allowlist is configured', async () => {
    const result = await invoke({
      headers: {
        origin: 'https://public-reader.example',
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.11',
        'user-agent': 'cors-reader'
      }
    })

    expect(result.status).toBe(200)
    expect(result.header('Access-Control-Allow-Origin')).toBe('*')
    expect(result.header('Cache-Control')).toBe('no-store')
    expect(result.header('Content-Type')).toMatch(/^application\/json\b/)
    expect(result.header('RateLimit-Limit')).toBe(String(RATE_LIMIT_MAX_REQUESTS))
    expect(result.header('RateLimit-Remaining')).toBe(
      String(RATE_LIMIT_MAX_REQUESTS - 1)
    )
  })
})

describe('bounded JSON request parsing', () => {
  it.each([
    [{ question: '  What are the hazards of reentry?  ' }, 'object'],
    [JSON.stringify({ question: 'What are the hazards of reentry?' }), 'string'],
    [Buffer.from(JSON.stringify({ question: 'What are the hazards of reentry?' })), 'Buffer']
  ])('accepts a JSON body and trims the question: %s', async (body, _description) => {
    const result = await invoke({
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-forwarded-for': '203.0.113.12',
        'user-agent': 'body-test'
      },
      body
    })

    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({
      mode: 'preview',
      answer: expect.stringContaining('Operations, reentry')
    })
  })

  it.each([
    [{}, 'missing'],
    [{ 'content-type': 'text/plain' }, 'non-JSON']
  ])('rejects a Content-Type that is %s', async (headers, _description) => {
    const result = await invoke({ headers })

    expect(result.status).toBe(415)
    expect(result.body).toEqual({ error: 'Content-Type must be application/json.' })
  })

  it.each([
    ['{not valid json', 'malformed JSON text'],
    [Buffer.from('{not valid json'), 'malformed JSON Buffer'],
    ['null', 'JSON null'],
    ['[]', 'JSON array'],
    ['"question"', 'JSON primitive'],
    [null, 'object null'],
    [[], 'object array'],
    [42, 'unsupported raw type']
  ])('rejects an invalid body safely: %s', async (body, _description) => {
    const result = await invoke({ body })

    expect(result.status).toBe(400)
    expect(result.body).toEqual({ error: 'Request body must be a JSON object.' })
  })

  it('rejects an object body that cannot be safely serialized', async () => {
    const circular: Record<string, unknown> = { question: defaultQuestion }
    circular.circular = circular

    const result = await invoke({ body: circular })

    expect(result.status).toBe(400)
    expect(result.body).toEqual({ error: 'Request body must be a JSON object.' })
  })

  it.each([undefined, null, 1, true, [], {}, { nested: 'question' }])(
    'rejects a non-string question value: %s',
    async (question) => {
      const result = await invoke({ body: { question } })

      expect(result.status).toBe(400)
      expect(result.body).toEqual({ error: 'Question must be a string.' })
    }
  )

  it.each(['', '   \n\t  '])('rejects an empty question after trimming', async (question) => {
    const result = await invoke({ body: { question } })

    expect(result.status).toBe(400)
    expect(result.body).toEqual({
      error: 'Question must contain between 1 and 500 characters.'
    })
  })

  it('accepts 500 trimmed characters and rejects 501', async () => {
    const accepted = await invoke({
      body: { question: ` ${'q'.repeat(500)} ` },
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.13',
        'user-agent': 'question-limit-accepted'
      }
    })
    const rejected = await invoke({
      body: { question: 'q'.repeat(501) },
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.14',
        'user-agent': 'question-limit-rejected'
      }
    })

    expect(accepted.status).toBe(200)
    expect(rejected.status).toBe(400)
    expect(rejected.body).toEqual({
      error: 'Question must contain between 1 and 500 characters.'
    })
  })

  it.each([
    [JSON.stringify({ question: defaultQuestion, padding: 'x'.repeat(MAX_REQUEST_BODY_BYTES) }), 'raw string'],
    [Buffer.alloc(MAX_REQUEST_BODY_BYTES + 1, 32), 'raw Buffer'],
    [{ question: defaultQuestion, padding: 'x'.repeat(MAX_REQUEST_BODY_BYTES) }, 'parsed object']
  ])('rejects an oversized body before use: %s', async (body, _description) => {
    const result = await invoke({ body })

    expect(result.status).toBe(413)
    expect(result.body).toEqual({ error: 'Request body is too large.' })
  })

  it('rejects a declared oversized body without reading it', async () => {
    const result = await invoke({
      headers: {
        'content-type': 'application/json',
        'content-length': String(MAX_REQUEST_BODY_BYTES + 1)
      }
    })

    expect(result.status).toBe(413)
    expect(result.body).toEqual({ error: 'Request body is too large.' })
  })
})

describe('source-bounded preview behavior', () => {
  it('returns the deterministic preview contract without an API key', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await invoke({ body: { question: 'Why does public outreach matter?' } })

    expect(result.status).toBe(200)
    expect(result.body).toEqual({
      answer: expect.stringMatching(/^Preview answer — site-owned material only:/),
      mode: 'preview',
      sources: [
        {
          title: 'Outreach on Space Traffic Management',
          href: 'https://doi.org/10.1016/j.actaastro.2025.01.031'
        },
        {
          title:
            'IAF – IISL – IAA initiative on space traffic management: Synthesis report on IAF technical committee TC 26 on space traffic management',
          href: 'https://doi.org/10.1016/j.actaastro.2025.03.024'
        }
      ],
      notice: expect.stringMatching(
        /deterministic preview.*not an official committee position.*does not substitute for the linked papers/i
      )
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns stable de-duplicated sources containing canonical DOI URLs only', async () => {
    const first = await invoke({
      body: { question: 'Why does public outreach matter?' },
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.15',
        'user-agent': 'source-test-one'
      }
    })
    const second = await invoke({
      body: { question: 'Why does public outreach matter?' },
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '203.0.113.16',
        'user-agent': 'source-test-two'
      }
    })

    const firstSources = (first.body as { sources: Array<{ title: string; href: string }> }).sources
    const secondSources = (second.body as { sources: Array<{ title: string; href: string }> }).sources

    expect(secondSources).toEqual(firstSources)
    expect(new Set(firstSources.map(({ href }) => href)).size).toBe(firstSources.length)
    for (const source of firstSources) {
      expect(source.title.trim()).not.toBe('')
      expect(source.href).toMatch(
        /^https:\/\/doi\.org\/10\.\d{4,9}\/[A-Za-z0-9._;()/:-]+$/
      )
    }
  })

  it('returns a transparent insufficient-context preview and never calls the model', async () => {
    process.env.OPENAI_API_KEY = 'server-only-test-secret'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = await invoke({
      body: { question: 'How do I bake a space-themed cake?' }
    })

    expect(result.status).toBe(200)
    expect(result.body).toEqual({
      answer:
        'Preview limitation: The public project knowledge base does not contain enough information to answer this question. Consult the linked publication records or ask a committee reviewer.',
      mode: 'preview',
      sources: [],
      notice: expect.stringMatching(
        /insufficient.*not an official committee position.*does not substitute for the linked papers/i
      )
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('live OpenAI request and output contract', () => {
  it('sends the exact bounded Responses API body and keeps authorization server-only', async () => {
    process.env.OPENAI_MODEL = 'approved-model-override'
    const fetchMock = installSuccessfulOpenAi({ output_text: '  Grounded live answer.  ' })
    const rawIp = '198.51.100.42'
    const rawUserAgent = 'committee-demo-browser/1.0'

    const result = await invoke({
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': `${rawIp}, 198.51.100.99`,
        'user-agent': rawUserAgent
      },
      body: { question: 'What are the hazards of reentry?' }
    })
    const upstream = parseUpstreamRequest(fetchMock)

    expect(upstream.url).toBe('https://api.openai.com/v1/responses')
    expect(upstream.init).toMatchObject({ method: 'POST' })
    expect(upstream.init.headers).toEqual({
      Authorization: 'Bearer server-only-test-secret',
      'Content-Type': 'application/json'
    })
    expect(upstream.body).toEqual({
      model: 'approved-model-override',
      store: false,
      max_output_tokens: 450,
      instructions: expect.stringMatching(
        /use only.*site-owned context.*never invent.*official committee position/is
      ),
      input: expect.any(String),
      safety_identifier: expect.stringMatching(/^[a-f0-9]{64}$/)
    })
    expect(String(upstream.body.input).length).toBeLessThanOrEqual(12_000)
    expect(upstream.body.input).toContain('What are the hazards of reentry?')
    expect(upstream.body.input).toContain('Operations, reentry, collision avoidance')
    expect(upstream.body.input).toContain(
      'https://doi.org/10.1016/j.actaastro.2024.10.040'
    )
    expect(upstream.body.safety_identifier).not.toContain(rawIp)
    expect(upstream.body.safety_identifier).not.toContain(rawUserAgent)
    expect(String(upstream.body.safety_identifier)).toHaveLength(64)
    expect(upstream.init.signal).toBeInstanceOf(AbortSignal)

    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({
      answer: 'Grounded live answer.',
      mode: 'openai',
      notice: expect.stringMatching(
        /openai-assisted.*not an official committee position.*does not substitute for the linked papers/i
      )
    })
    expect(JSON.stringify(result.body)).not.toContain('server-only-test-secret')
    expect(JSON.stringify(result.body)).not.toContain(rawIp)
    expect(JSON.stringify(result.body)).not.toContain(rawUserAgent)
  })

  it('defaults the model and derives a stable, non-raw safety identifier', async () => {
    const fetchMock = installSuccessfulOpenAi()
    const commonHeaders = {
      'content-type': 'application/json',
      'x-forwarded-for': '192.0.2.44',
      'user-agent': 'stable-client'
    }

    await invoke({ headers: commonHeaders })
    await invoke({ headers: commonHeaders })
    await invoke({
      headers: { ...commonHeaders, 'x-forwarded-for': '192.0.2.45' }
    })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    const bodies = fetchMock.mock.calls.map(([, init]) =>
      JSON.parse(String((init as RequestInit).body)) as Record<string, unknown>
    )

    expect(bodies.map(({ model }) => model)).toEqual([
      'gpt-5.6-luna',
      'gpt-5.6-luna',
      'gpt-5.6-luna'
    ])
    expect(bodies[0].safety_identifier).toBe(bodies[1].safety_identifier)
    expect(bodies[2].safety_identifier).not.toBe(bodies[0].safety_identifier)
    expect(String(bodies[0].safety_identifier)).toMatch(/^[a-f0-9]{64}$/)
    expect(String(bodies[0].safety_identifier)).not.toContain('192.0.2.44')
  })

  it('extracts and trims the top-level output_text field', async () => {
    installSuccessfulOpenAi({ output_text: '\n  Direct output text.  \n' })

    const result = await invoke()

    expect(result.body).toMatchObject({
      answer: 'Direct output text.',
      mode: 'openai'
    })
  })

  it('falls back through output content and joins only nonempty output_text blocks', async () => {
    installSuccessfulOpenAi({
      output: [
        {
          type: 'message',
          content: [
            { type: 'output_text', text: ' First grounded block. ' },
            { type: 'refusal', refusal: 'not relevant to extraction' },
            { type: 'output_text', text: '   ' }
          ]
        },
        {
          type: 'message',
          content: [{ type: 'output_text', text: 'Second grounded block.' }]
        }
      ]
    })

    const result = await invoke()

    expect(result.body).toMatchObject({
      answer: 'First grounded block.\nSecond grounded block.',
      mode: 'openai'
    })
  })

  it.each([
    ['network error', () => vi.fn().mockRejectedValue(new Error('private network detail'))],
    ['non-OK response', () => vi.fn().mockResolvedValue(upstreamResponse({ secret: 'upstream body' }, false))],
    ['malformed JSON', () => vi.fn().mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockRejectedValue(new SyntaxError('bad upstream json')) })],
    ['non-object JSON', () => vi.fn().mockResolvedValue(upstreamResponse(['unexpected']))],
    ['wrong output shape', () => vi.fn().mockResolvedValue(upstreamResponse({ output_text: 42, output: 'unexpected' }))],
    ['empty output', () => vi.fn().mockResolvedValue(upstreamResponse({ output_text: '   ', output: [] }))],
    ['unbounded output', () => vi.fn().mockResolvedValue(upstreamResponse({ output_text: 'x'.repeat(12_001) }))]
  ])('returns a deterministic 200 preview when upstream has a %s', async (_case, makeFetch) => {
    process.env.OPENAI_API_KEY = 'server-only-test-secret'
    vi.stubGlobal('fetch', makeFetch())

    const result = await invoke()

    expectPreviewFallback(result)
    expect(JSON.stringify(result.body)).not.toMatch(
      /private network detail|upstream body|bad upstream json|unexpected/i
    )
  })

  it('times out an unresolved upstream call and returns the transparent preview', async () => {
    vi.useFakeTimers()
    process.env.OPENAI_API_KEY = 'server-only-test-secret'
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => undefined)))

    const pending = invoke()
    await vi.advanceTimersByTimeAsync(OPENAI_TIMEOUT_MS + 1)
    const result = await pending

    expectPreviewFallback(result)
  })

  it('also times out unresolved upstream JSON body consumption', async () => {
    vi.useFakeTimers()
    process.env.OPENAI_API_KEY = 'server-only-test-secret'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn(() => new Promise<unknown>(() => undefined))
      } as unknown as Response)
    )

    let settledResult: Invocation | undefined
    void invoke().then((result) => {
      settledResult = result
    })
    await vi.advanceTimersByTimeAsync(OPENAI_TIMEOUT_MS + 1)
    await Promise.resolve()

    expect(settledResult).toBeDefined()
    expectPreviewFallback(settledResult as Invocation)
  })
})

describe('bounded per-client throttling', () => {
  it('shares one allowance for the same IP when User-Agent values change', async () => {
    const sharedAddress = '198.51.100.87'

    for (let index = 0; index < RATE_LIMIT_MAX_REQUESTS; index += 1) {
      const allowed = await invoke({
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': sharedAddress,
          'user-agent': `rotating-agent-${index}`
        }
      })
      expect(allowed.status).toBe(200)
    }

    const limited = await invoke({
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': sharedAddress,
        'user-agent': 'rotating-agent-evasion-attempt'
      }
    })

    expect(limited.status).toBe(429)
    expect(limited.header('RateLimit-Remaining')).toBe('0')
  })

  it('returns 429 with Retry-After and can be reset deterministically for tests', async () => {
    const headers = {
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.88',
      'user-agent': 'rate-limited-client'
    }

    for (let index = 0; index < RATE_LIMIT_MAX_REQUESTS; index += 1) {
      const allowed = await invoke({ headers })
      expect(allowed.status).toBe(200)
    }

    const limited = await invoke({ headers })

    expect(limited.status).toBe(429)
    expect(limited.body).toEqual({ error: 'Too many requests. Please retry later.' })
    expect(Number(limited.header('Retry-After'))).toBeGreaterThan(0)
    expect(limited.header('RateLimit-Limit')).toBe(String(RATE_LIMIT_MAX_REQUESTS))
    expect(limited.header('RateLimit-Remaining')).toBe('0')

    __resetRateLimitForTests()
    expect(__getRateLimitSizeForTests()).toBe(0)
    const afterReset = await invoke({ headers })
    expect(afterReset.status).toBe(200)
  })

  it('prunes expired client windows', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-26T12:00:00Z'))

    await invoke({
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '198.51.100.90',
        'user-agent': 'expired-client'
      }
    })
    expect(__getRateLimitSizeForTests()).toBe(1)

    vi.setSystemTime(Date.now() + RATE_LIMIT_WINDOW_MS + 1)
    await invoke({
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '198.51.100.91',
        'user-agent': 'new-client'
      }
    })

    expect(__getRateLimitSizeForTests()).toBe(1)
  })

  it('never lets the module-instance client map exceed its fixed bound', async () => {
    for (let index = 0; index < MAX_RATE_LIMIT_CLIENTS + 7; index += 1) {
      const result = await invoke({
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': `198.18.0.${index}`,
          'user-agent': `bounded-client-${index}`
        }
      })
      expect(result.status).toBe(200)
    }

    expect(__getRateLimitSizeForTests()).toBeLessThanOrEqual(
      MAX_RATE_LIMIT_CLIENTS
    )
  })
})
