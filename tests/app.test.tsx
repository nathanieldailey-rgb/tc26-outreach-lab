import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import App from '../src/App'

const repositoryUrl =
  'https://github.com/nathanieldailey-rgb/tc26-outreach-lab'

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

  it('gives a transparent interface-only error before the Ask API exists', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    render(<App />)

    const ask = sectionNamed(/ask the committee/i)
    await user.type(
      within(ask).getByRole('textbox', { name: /your question/i }),
      'What are the hazards of reentry?'
    )
    await user.click(within(ask).getByRole('button', { name: /ask this question/i }))

    expect(
      await within(ask).findByText(/ask service is not available in this interface-only prototype/i)
    ).toBeVisible()
    expect(within(ask).getByRole('status')).toHaveTextContent(/request could not be completed/i)
  })

  it('limits contribution links to the approved public repository and issue/pull paths', () => {
    render(<App />)

    const contribute = sectionNamed(/contribute to the prototype/i)
    const links = within(contribute).getAllByRole('link')
    expect(links).toHaveLength(4)

    for (const link of links) {
      expect(link.getAttribute('href')).toMatch(
        new RegExp(`^${repositoryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|/(?:issues|pull)(?:/|$))`)
      )
    }
    expect(within(contribute).getByText(/article lane/i)).toBeVisible()
    expect(within(contribute).getByText(/feature lane/i)).toBeVisible()
    expect(within(contribute).getByText(/review lane/i)).toBeVisible()
    expect(within(contribute).getByText(/committee decisions requested/i)).toBeVisible()
  })
})
