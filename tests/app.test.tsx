import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import App from '../src/App'

const repositoryUrl =
  'https://github.com/nathanieldailey-rgb/tc26-outreach-lab'

const trustedAskResponse = {
  answer: 'Trusted answer from the public record.',
  mode: 'preview',
  sources: [
    {
      title: 'Outreach on Space Traffic Management',
      href: 'https://doi.org/10.1016/j.actaastro.2025.01.031'
    }
  ],
  notice: 'Deterministic preview; not an official committee position.'
} as const

const untrustedAskResponses = [
  ['a whitespace-only answer', { ...trustedAskResponse, answer: '   ' }],
  ['a whitespace-only notice', { ...trustedAskResponse, notice: '\n\t' }],
  [
    'an empty source title',
    { ...trustedAskResponse, sources: [{ title: ' ', href: trustedAskResponse.sources[0].href }] }
  ],
  [
    'a non-HTTPS DOI link',
    {
      ...trustedAskResponse,
      sources: [{ title: 'Untrusted HTTP source', href: 'http://doi.org/10.1000/unsafe' }]
    }
  ],
  [
    'a DOI URL containing credentials',
    {
      ...trustedAskResponse,
      sources: [
        {
          title: 'Credential-bearing source',
          href: 'https://reader:secret@doi.org/10.1000/unsafe'
        }
      ]
    }
  ],
  [
    'a DOI lookalike host',
    {
      ...trustedAskResponse,
      sources: [
        {
          title: 'Wrong-host source',
          href: 'https://doi.org.example/10.1000/unsafe'
        }
      ]
    }
  ],
  [
    'a JavaScript URL',
    {
      ...trustedAskResponse,
      sources: [{ title: 'Script source', href: 'javascript:alert(1)' }]
    }
  ]
] as const

function hexChannel(channel: string): number {
  return Number.parseInt(channel, 16) / 255
}

function relativeLuminance(hex: string): number {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(
    hexChannel
  )

  return channels.reduce((total, channel, index) => {
    const linear =
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
    return total + linear * [0.2126, 0.7152, 0.0722][index]
  }, 0)
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort(
    (left, right) => right - left
  )
  return (lighter + 0.05) / (darker + 0.05)
}

function sectionNamed(name: string | RegExp): HTMLElement {
  const heading = screen.getByRole('heading', { name })
  const section = heading.closest('section')

  if (!section) {
    throw new Error(`Heading ${String(name)} is not inside a section`)
  }

  return section
}

describe('editorial application', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses semantic landmarks and makes the prototype boundary visible', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText(/co-chair-led prototype/i)).toBeVisible()
    expect(screen.getAllByText(/not an official committee position/i).length).toBeGreaterThan(0)

    const main = screen.getByRole('main')
    expect(within(main).getByText('20', { selector: '[data-record-count]' })).toBeVisible()
    expect(within(main).getByRole('link', { name: /ask the committee/i })).toBeVisible()
    const researchDesk = screen.getByRole('heading', { level: 1 }).closest('section')
    expect(researchDesk).not.toBeNull()
    expect(
      within(researchDesk as HTMLElement).getByRole('link', { name: /featured reading/i })
    ).toBeVisible()
    expect(
      within(researchDesk as HTMLElement).getByRole('link', { name: /20 records across volumes/i })
    ).toBeVisible()
    expect(
      within(researchDesk as HTMLElement).getByRole('link', { name: /videos.*studio/i })
    ).toBeVisible()
    expect(
      within(main).getByRole('heading', {
        name: 'Outreach is part of the safety architecture'
      })
    ).toBeVisible()
  })

  it('transfers a first-view question into Ask and focuses it without a request', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    const researchDesk = screen.getByRole('heading', { level: 1 }).closest('section')
    if (!researchDesk) throw new Error('Research desk section was not found')

    const starterForm = within(researchDesk).getByRole('form', {
      name: /start an ask the committee question/i
    })
    const starterInput = within(starterForm).getByRole('textbox', {
      name: /start with a question/i
    })
    const askSection = sectionNamed(/ask the committee/i)
    const scrollIntoView = vi.fn()
    askSection.scrollIntoView = scrollIntoView

    await user.type(starterInput, 'How do shared catalogs support coordination?')
    await user.click(
      within(starterForm).getByRole('button', { name: /take this question to ask/i })
    )

    const askInput = within(askSection).getByRole('textbox', { name: /your question/i })
    expect(askInput).toHaveValue('How do shared catalogs support coordination?')
    expect(askInput).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps a blank first-view question in place with accessible validation', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    const researchDesk = screen.getByRole('heading', { level: 1 }).closest('section')
    if (!researchDesk) throw new Error('Research desk section was not found')

    const starterForm = within(researchDesk).getByRole('form', {
      name: /start an ask the committee question/i
    })
    const starterInput = within(starterForm).getByRole('textbox', {
      name: /start with a question/i
    })

    await user.click(
      within(starterForm).getByRole('button', { name: /take this question to ask/i })
    )

    expect(starterInput).toHaveAttribute('aria-invalid', 'true')
    expect(starterInput).toHaveFocus()
    expect(within(starterForm).getByRole('status')).toHaveTextContent(
      /enter a question to continue/i
    )
    expect(
      within(sectionNamed(/ask the committee/i)).getByRole('textbox', {
        name: /your question/i
      })
    ).toHaveValue('')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('declares an embedded favicon that cannot trigger a page-load request', () => {
    const documentSource = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

    expect(documentSource).toMatch(
      /<link\s+[^>]*rel=["']icon["'][^>]*href=["']data:image\//i
    )
  })

  it('shows the complete featured article and DOI-backed source pathways', () => {
    render(<App />)

    const articleSection = sectionNamed(/featured outreach article/i)
    expect(
      within(articleSection).getByRole('heading', {
        name: 'Outreach is part of the safety architecture'
      })
    ).toBeVisible()
    expect(within(articleSection).getAllByTestId('article-paragraph')).toHaveLength(6)

    const source = within(articleSection).getByRole('link', {
      name: /read the full paper.*outreach on space traffic management/i
    })
    expect(source).toHaveAttribute(
      'href',
      'https://doi.org/10.1016/j.actaastro.2025.01.031'
    )
    expect(source).toHaveAttribute('target', '_blank')
    expect(source).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('switches accessibly among all three original outreach features', async () => {
    const user = userEvent.setup()
    render(<App />)

    const selector = screen.getByRole('combobox', {
      name: /choose an outreach article/i
    })
    expect(within(selector).getAllByRole('option')).toHaveLength(3)

    await user.selectOptions(selector, 'shared-picture-not-single-database')
    expect(
      screen.getByRole('heading', {
        name: 'A shared picture is not a single database'
      })
    ).toBeVisible()
    expect(screen.getAllByTestId('article-paragraph')).toHaveLength(6)
    expect(
      screen.getByRole('link', {
        name: /read the full paper.*data fusion/i
      })
    ).toHaveAttribute(
      'href',
      'https://doi.org/10.1016/j.actaastro.2024.08.056'
    )

    await user.selectOptions(selector, 'traffic-conversation-beyond-earth-orbit')
    expect(
      screen.getByRole('heading', {
        name: 'The traffic conversation now extends beyond Earth orbit'
      })
    ).toBeVisible()
    expect(screen.getAllByTestId('article-paragraph')).toHaveLength(6)
  })

  it('searches and cluster-filters the exact 20-record publication library', async () => {
    const user = userEvent.setup()
    render(<App />)

    const library = sectionNamed(/publication library/i)
    const results = within(library).getByRole('list', {
      name: /publication results/i
    })
    expect(within(results).getAllByRole('listitem')).toHaveLength(20)
    expect(within(library).getByText('20 publications')).toBeVisible()
    expect(
      within(results).getAllByRole('link', { name: /read the full paper/i })
    ).toHaveLength(20)

    await user.type(
      within(library).getByRole('searchbox', { name: /search publications/i }),
      'reentry'
    )
    expect(within(results).getAllByRole('listitem')).toHaveLength(1)
    expect(within(library).getByText('1 publication')).toBeVisible()
    expect(within(library).getByText('Hazards associated with reentry')).toBeVisible()

    await user.selectOptions(
      within(library).getByRole('combobox', { name: /filter by topic cluster/i }),
      'Future Domains'
    )
    expect(within(library).getByText('0 publications')).toBeVisible()
    expect(within(library).getByText(/no publications match/i)).toBeVisible()

    await user.click(within(library).getByRole('button', { name: /reset library/i }))
    expect(within(results).getAllByRole('listitem')).toHaveLength(20)
    expect(within(library).getByText('20 publications')).toBeVisible()
  })

  it('presents all five topic clusters without relying on color alone', () => {
    render(<App />)

    const topicMap = screen.getByRole('list', { name: /five topic clusters/i })
    for (const cluster of [
      'Foundations',
      'Orbital Knowledge',
      'Operations',
      'Governance',
      'Future Domains'
    ]) {
      expect(within(topicMap).getByText(cluster)).toBeVisible()
    }
    expect(within(topicMap).getAllByRole('listitem')).toHaveLength(5)
  })

  it('offers sample questions and rejects blank or oversized Ask submissions', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    const ask = sectionNamed(/ask the committee/i)
    const question = within(ask).getByRole('textbox', { name: /your question/i })
    const submit = within(ask).getByRole('button', { name: /ask this question/i })
    const status = within(ask).getByRole('status')

    await user.click(submit)
    expect(status).toHaveTextContent(/enter a question/i)
    expect(fetchMock).not.toHaveBeenCalled()

    const sample = within(ask).getByRole('button', {
      name: 'Why is outreach part of space traffic management?'
    })
    await user.click(sample)
    expect(question).toHaveValue('Why is outreach part of space traffic management?')

    fireEvent.change(question, { target: { value: 'q'.repeat(501) } })
    await user.click(submit)
    expect(status).toHaveTextContent(/500 characters or fewer/i)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('places an accessible live-data warning before the Ask submission control', () => {
    render(<App />)

    const ask = sectionNamed(/ask the committee/i)
    const notice = within(ask).getByRole('note', {
      name: /before you submit/i
    })
    const question = within(ask).getByRole('textbox', { name: /your question/i })
    const submit = within(ask).getByRole('button', { name: /ask this question/i })

    expect(notice).toBeVisible()
    expect(notice).toHaveClass('submission-notice')
    expect(notice).toHaveTextContent(
      /live mode may send your question, public site context, and a pseudonymous safety identifier to openai/i
    )
    expect(notice).toHaveTextContent(
      /do not submit personal, confidential, controlled, or proprietary information/i
    )
    expect(notice).toHaveTextContent(
      /store:false does not promise zero abuse-monitoring retention/i
    )
    expect(
      notice.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(question).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('question-data-notice')
    )
  })

  it('posts the Ask JSON contract and renders loading, mode, sources, and notice', async () => {
    const user = userEvent.setup()
    let resolveRequest: ((response: Response) => void) | undefined
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve
        })
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    const ask = sectionNamed(/ask the committee/i)
    await user.type(
      within(ask).getByRole('textbox', { name: /your question/i }),
      'Why does outreach matter?'
    )
    await user.click(within(ask).getByRole('button', { name: /ask this question/i }))

    expect(within(ask).getByRole('status')).toHaveTextContent(/researching the public record/i)
    expect(within(ask).getByRole('button', { name: /ask this question/i })).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledWith('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Why does outreach matter?' })
    })

    resolveRequest?.({
      ok: true,
      json: async () => ({
        answer: 'Outreach connects shared understanding with safer coordination.',
        mode: 'preview',
        sources: [
          {
            title: 'Outreach on Space Traffic Management',
            href: 'https://doi.org/10.1016/j.actaastro.2025.01.031'
          }
        ],
        notice: 'Deterministic preview; not an official committee position.'
      })
    } as Response)

    expect(
      await within(ask).findByText(
        'Outreach connects shared understanding with safer coordination.'
      )
    ).toBeVisible()
    expect(within(ask).getByText(/deterministic preview mode/i)).toBeVisible()
    expect(
      within(ask).getByRole('link', {
        name: 'Outreach on Space Traffic Management'
      })
    ).toHaveAttribute(
      'href',
      'https://doi.org/10.1016/j.actaastro.2025.01.031'
    )
    expect(within(ask).getByText(/not an official committee position/i)).toBeVisible()
    await waitFor(() => {
      expect(within(ask).getByRole('status')).toHaveTextContent(/answer ready/i)
    })
  })

  it('locks every shared question path to one submitted context while Ask is pending', async () => {
    const user = userEvent.setup()
    let resolveRequest: ((response: Response) => void) | undefined
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve
        })
    )
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    const submittedQuestion = 'Why does outreach support safer coordination?'
    const ask = sectionNamed(/ask the committee/i)
    const mainQuestion = within(ask).getByRole('textbox', { name: /your question/i })
    const submit = within(ask).getByRole('button', { name: /ask this question/i })
    const sample = within(ask).getByRole('button', {
      name: 'What are the hazards of reentry?'
    })
    const researchDesk = screen.getByRole('heading', { level: 1 }).closest('section')
    if (!researchDesk) throw new Error('Research desk section was not found')
    const starterForm = within(researchDesk).getByRole('form', {
      name: /start an ask the committee question/i
    })
    const starterInput = within(starterForm).getByRole('textbox', {
      name: /start with a question/i
    })
    const starterSubmit = within(starterForm).getByRole('button', {
      name: /take this question to ask/i
    })

    await user.type(mainQuestion, submittedQuestion)
    await user.click(submit)

    expect(mainQuestion).toBeDisabled()
    expect(submit).toBeDisabled()
    expect(sample).toBeDisabled()
    expect(starterInput).toBeDisabled()
    expect(starterSubmit).toBeDisabled()
    expect(within(ask).getByRole('status')).toHaveTextContent(
      /researching the public record/i
    )

    await user.type(mainQuestion, ' changed while pending')
    await user.click(sample)
    await user.type(starterInput, 'A different question')
    await user.click(starterSubmit)
    await user.click(submit)

    expect(mainQuestion).toHaveValue(submittedQuestion)
    expect(starterInput).toHaveValue('')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(within(ask).getByRole('status')).toHaveTextContent(
      /researching the public record/i
    )

    resolveRequest?.({
      ok: true,
      json: async () => trustedAskResponse
    } as Response)

    expect(await within(ask).findByText(trustedAskResponse.answer)).toBeVisible()
    expect(mainQuestion).toBeEnabled()
    expect(submit).toBeEnabled()
    expect(sample).toBeEnabled()
    expect(starterInput).toBeEnabled()
    expect(starterSubmit).toBeEnabled()

    const answer = within(ask)
      .getByRole('heading', { name: /response from the public record/i })
      .closest('article')
    if (!answer) throw new Error('Answer article was not found')
    expect(within(answer).getByText(submittedQuestion)).toBeVisible()

    await user.click(sample)
    expect(mainQuestion).toHaveValue('What are the hazards of reentry?')
    expect(within(answer).getByText(submittedQuestion)).toBeVisible()
  })

  it.each(untrustedAskResponses)(
    'rejects a successful response containing %s',
    async (_caseName, payload) => {
      const user = userEvent.setup()
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => payload
        } as Response)
      )
      render(<App />)

      const ask = sectionNamed(/ask the committee/i)
      const question = within(ask).getByRole('textbox', { name: /your question/i })
      await user.type(question, 'Show me the trusted public sources.')
      await user.click(
        within(ask).getByRole('button', { name: /ask this question/i })
      )

      expect(await within(ask).findByText(/ask response was rejected/i)).toBeVisible()
      expect(within(ask).getByRole('status')).toHaveTextContent(/response rejected/i)
      expect(within(ask).queryByText(trustedAskResponse.answer)).not.toBeInTheDocument()
      expect(
        within(ask).queryByRole('heading', { name: /response from the public record/i })
      ).not.toBeInTheDocument()
      expect(question).toBeEnabled()
    }
  )

  it('gives truthful retry guidance when the current Ask service is unavailable', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    render(<App />)

    const ask = sectionNamed(/ask the committee/i)
    await user.type(
      within(ask).getByRole('textbox', { name: /your question/i }),
      'What are the hazards of reentry?'
    )
    await user.click(within(ask).getByRole('button', { name: /ask this question/i }))

    const error = await within(ask).findByText(/ask service is temporarily unavailable/i)

    expect(error).toHaveTextContent(/retry/i)
    expect(error).toHaveTextContent(/no answer was generated/i)
    expect(error).not.toHaveTextContent(/task 3|interface-only prototype/i)
    expect(within(ask).getByRole('status')).toHaveTextContent(
      /service unavailable.*retry.*no answer was generated/i
    )
  })

  it('renders the copyright and editorial-rights boundary with a usable policy link', () => {
    render(<App />)

    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText(/\u00a9 2026 Dr\. Nate Dailey and TC26 Outreach Lab contributors/i)).toBeVisible()
    expect(within(footer).getByText(/editorial and media content.*rights reserved pending a committee decision/i)).toBeVisible()
    expect(within(footer).getByText(/source code.*MIT License/i)).toBeVisible()
    expect(within(footer).getByRole('link', { name: /content and rights policy/i })).toHaveAttribute(
      'href',
      `${repositoryUrl}/blob/main/CONTENT_POLICY.md`
    )
  })

  it('limits public source-control links to the approved repository paths', () => {
    render(<App />)

    const contribute = sectionNamed(/contribute to the prototype/i)
    expect(within(contribute).getAllByRole('link')).toHaveLength(4)

    const links = screen.getAllByRole('link').filter((link) =>
      link.getAttribute('href')?.startsWith(repositoryUrl)
    )
    expect(links).toHaveLength(6)

    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(
        new RegExp(
          `^${repositoryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|/(?:issues|pull)(?:/|$)|/blob/main/CONTENT_POLICY\\.md$)`
        )
      )
    }
    expect(within(contribute).getByText(/article lane/i)).toBeVisible()
    expect(within(contribute).getByText(/feature lane/i)).toBeVisible()
    expect(within(contribute).getByText(/review lane/i)).toBeVisible()
    expect(within(contribute).getByText(/committee decisions requested/i)).toBeVisible()
  })

  it('keeps signal orange text above 4.5:1 on the deep paper surface', () => {
    const styleSource = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8')
    const signalOrange = styleSource.match(/--orange:\s*(#[0-9a-f]{6})/i)?.[1]
    const deepPaper = styleSource.match(/--paper-deep:\s*(#[0-9a-f]{6})/i)?.[1]

    expect(signalOrange).toBeDefined()
    expect(deepPaper).toBeDefined()
    expect(contrastRatio(signalOrange as string, deepPaper as string)).toBeGreaterThanOrEqual(
      4.5
    )
  })

  it('styles the current Ask form label selector and removes the dead predecessor', () => {
    const styleSource = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8')

    expect(styleSource).toMatch(/\.committee-query\s+form\s*>\s*label/)
    expect(styleSource).not.toMatch(/\.ask-committee\s+form\s*>\s*label/)
  })
})
