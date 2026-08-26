import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repositoryUrl =
  'https://github.com/nathanieldailey-rgb/tc26-outreach-lab'

const requiredFiles = [
  'README.md',
  'CONTRIBUTING.md',
  'CONTENT_POLICY.md',
  'LICENSE',
  'docs/demo-runbook.md',
  'docs/video-briefs.md',
  '.github/ISSUE_TEMPLATE/article_pitch.yml',
  '.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/pull_request_template.md',
  '.github/workflows/ci.yml'
] as const

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

function expectAll(source: string, patterns: RegExp[]): void {
  for (const pattern of patterns) {
    expect.soft(source).toMatch(pattern)
  }
}

describe('public collaboration package', () => {
  it('provides every contributor, policy, workflow, and demo artifact', () => {
    for (const relativePath of requiredFiles) {
      expect(existsSync(resolve(process.cwd(), relativePath)), relativePath).toBe(
        true
      )
    }
  })

  it('makes the prototype scope, collection, modes, and setup unambiguous', () => {
    const readme = read('README.md')

    expectAll(readme, [
      /co-chair-led prototype/i,
      /not (?:an )?official|not endorsed/i,
      /cross-volume/i,
      /20[- ]record/i,
      /three original outreach/i,
      /preview mode/i,
      /live mode/i,
      /OPENAI_API_KEY/,
      /OPENAI_MODEL/,
      /ALLOWED_ORIGIN/,
      /per-instance/i,
      /durable rate limit/i,
      /npm ci/,
      /npm run dev/,
      /npm test -- --run/,
      /npm run test:coverage/,
      /npm run build/
    ])
    expect(readme).toContain(repositoryUrl)
  })

  it('does not represent the plain Vite server as a full-stack Ask runtime', () => {
    const packageManifest = JSON.parse(read('package.json')) as {
      scripts: Record<string, string>
    }
    const readme = read('README.md')
    const runbook = read('docs/demo-runbook.md')

    expect(packageManifest.scripts.dev).toBe('vite')
    expectAll(readme, [
      /UI-only/i,
      /plain Vite[\s\S]{0,240}\/api\/ask[\s\S]{0,180}(?:not available|unavailable)/i,
      /full demonstration[\s\S]{0,240}(?:deployed|hosted) preview/i
    ])
    expectAll(runbook, [
      /verified (?:deployed )?preview/i,
      /plain Vite[\s\S]{0,240}(?:does not|cannot)[\s\S]{0,120}\/api\/ask/i
    ])
  })

  it('creates two distinct issue lanes and a reviewable pull-request path', () => {
    const contributing = read('CONTRIBUTING.md')
    const articleTemplate = read(
      '.github/ISSUE_TEMPLATE/article_pitch.yml'
    )
    const featureTemplate = read(
      '.github/ISSUE_TEMPLATE/feature_request.yml'
    )
    const issueConfig = read('.github/ISSUE_TEMPLATE/config.yml')
    const pullRequestTemplate = read('.github/pull_request_template.md')

    expectAll(contributing, [
      /article pitch/i,
      /feature request/i,
      /pull request/i,
      /audience/i,
      /central question/i,
      /source version/i,
      /DOI/i,
      /licen[cs]e|permission/i,
      /AI assistance/i,
      /contribution grant/i
    ])
    expect(contributing).toContain(
      `${repositoryUrl}/issues/new?template=article_pitch.yml`
    )
    expect(contributing).toContain(
      `${repositoryUrl}/issues/new?template=feature_request.yml`
    )

    expectAll(articleTemplate, [
      /Article pitch/i,
      /audience/i,
      /central question/i,
      /author|contributor/i,
      /DOI/i,
      /source version/i,
      /rights|permission|licen[cs]e/i,
      /AI assistance/i,
      /required:\s*true/i
    ])
    expectAll(featureTemplate, [
      /Feature request/i,
      /problem/i,
      /audience/i,
      /accessibility/i,
      /privacy|AI/i,
      /required:\s*true/i
    ])
    expect(issueConfig).toMatch(/blank_issues_enabled:\s*false/i)
    expectAll(pullRequestTemplate, [
      /Summary/i,
      /Evidence and rights/i,
      /Test plan/i,
      /AI assistance/i,
      /publisher/i,
      /secret/i,
      /accessibility/i
    ])
  })

  it('separates the MIT code license from reserved editorial rights', () => {
    const license = read('LICENSE')
    const policy = read('CONTENT_POLICY.md')

    expectAll(license, [
      /MIT License/,
      /Permission is hereby granted, free of charge/,
      /software source code/i,
      /editorial content is not licensed under (?:the )?MIT/i
    ])
    expectAll(policy, [
      /code.*MIT|MIT.*code/is,
      /editorial.*rights reserved|rights reserved.*editorial/is,
      /pending (?:a )?committee decision/i,
      /contribution grant/i,
      /non-exclusive/i,
      /source version/i,
      /DOI/i,
      /licen[cs]e|permission/i,
      /publisher (?:abstracts?|text)/i,
      /full[- ]text|full papers?/i,
      /subscription corpus/i,
      /logo|mark/i,
      /not.*official|not.*endorsed/is
    ])
  })

  it('provides a seven-minute, no-key-safe committee demonstration', () => {
    const runbook = read('docs/demo-runbook.md')

    expectAll(runbook, [
      /seven-minute/i,
      /7:00/,
      /45 seconds/i,
      /75 seconds/i,
      /90 seconds/i,
      /Why is outreach part of space traffic management\?/i,
      /reentry/i,
      /Moon to Mars/i,
      /storyboard/i,
      /GitHub/i,
      /without (?:an )?API key|no API key/i,
      /preview mode/i,
      /committee decisions/i
    ])
  })

  it('specifies three rights-aware, non-autoplay explainer concepts', () => {
    const briefs = read('docs/video-briefs.md')
    const concepts = briefs.split(/^## Concept \d+:/m).slice(1)

    expect(concepts).toHaveLength(3)
    for (const concept of concepts) {
      expectAll(concept, [
        /Duration:\s*(?:6\d|7\d|8\d|90) seconds/i,
        /Storyboard/i,
        /Narration/i,
        /Rights/i,
        /captions/i,
        /transcript/i,
        /non-autoplay|does not autoplay/i
      ])
    }
  })

  it('runs repeatable public-repository checks on Node 24', () => {
    const workflow = read('.github/workflows/ci.yml')

    expectAll(workflow, [
      /node-version:\s*['"]?24['"]?/,
      /npm ci/,
      /npm test -- --run/,
      /npm run test:coverage/,
      /npm run build/,
      /npm run test:e2e/,
      /permissions:\s*\n\s+contents:\s*read/i
    ])
  })
})

describe('clean-room repository policy', () => {
  it('keeps environment examples declarative and secret-free', () => {
    const environment = read('.env.example')

    expect(environment).toMatch(/^OPENAI_API_KEY=\s*$/m)
    expect(environment).toMatch(/^OPENAI_MODEL=gpt-5\.6-luna\s*$/m)
    expect(environment).toMatch(/^ALLOWED_ORIGIN=\s*$/m)
    expect(environment).not.toMatch(
      /(?:sk-|ghp_|glpat-)[A-Za-z0-9_-]{12,}/
    )
    expect(environment).not.toMatch(/-----BEGIN [A-Z ]+PRIVATE KEY-----/)
  })

  it('keeps every new public artifact free of private identity, hosts, paths, and tokens', () => {
    const employerMarker = String.fromCharCode(109, 105, 116, 114, 101)
    const localRoots = [
      ['/', 'Users', '/'].join(''),
      ['/', 'home', '/'].join(''),
      ['C:', '\\', 'Users', '\\'].join('')
    ]
    const internalHost = /https?:\/\/[^\s)`>]*(?:\.internal|\.corp|\.lan)(?:[/:\s)`>]|$)/i
    const secret = /(?:sk-|ghp_|glpat-)[A-Za-z0-9_-]{12,}/
    const privateKey = /-----BEGIN [A-Z ]+PRIVATE KEY-----/

    for (const relativePath of requiredFiles) {
      const source = read(relativePath)

      expect(source.toLowerCase(), relativePath).not.toContain(employerMarker)
      for (const localRoot of localRoots) {
        expect(source, relativePath).not.toContain(localRoot)
      }
      expect(source, relativePath).not.toMatch(internalHost)
      expect(source, relativePath).not.toMatch(secret)
      expect(source, relativePath).not.toMatch(privateKey)
    }
  })

  it('uses only the designated repository in collaboration artifacts', () => {
    const sourceControlUrl = /https?:\/\/[^\s"'`)<>{\]]*(?:github|gitlab)[^\s"'`)<>{\]]*/gi

    for (const relativePath of requiredFiles) {
      const urls = read(relativePath).match(sourceControlUrl) ?? []

      for (const url of urls) {
        expect(url, `${relativePath}: ${url}`).toMatch(
          /^https:\/\/github\.com\/nathanieldailey-rgb\/tc26-outreach-lab(?:$|\/(?:issues|pull)(?:\/|$))/
        )
      }
    }
  })
})
