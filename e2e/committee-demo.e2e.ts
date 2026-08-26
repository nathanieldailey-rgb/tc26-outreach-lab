import { expect, test, type Page } from '@playwright/test'

const reviewPrototypeNotice = 'Co-chair-led prototype · committee review copy'

const articleJourneys = [
  {
    title: 'Outreach is part of the safety architecture',
    doiUrls: [
      'https://doi.org/10.1016/j.actaastro.2025.01.031',
      'https://doi.org/10.1016/j.actaastro.2025.03.024'
    ]
  },
  {
    title: 'A shared picture is not a single database',
    doiUrls: [
      'https://doi.org/10.1016/j.actaastro.2025.01.003',
      'https://doi.org/10.1016/j.actaastro.2024.08.056',
      'https://doi.org/10.1016/j.actaastro.2024.09.009'
    ]
  },
  {
    title: 'The traffic conversation now extends beyond Earth orbit',
    doiUrls: [
      'https://doi.org/10.1016/j.actaastro.2024.09.011',
      'https://doi.org/10.1016/j.actaastro.2024.09.063',
      'https://doi.org/10.1016/j.actaastro.2024.12.056'
    ]
  }
] as const

async function openPrototype(page: Page): Promise<void> {
  await page.goto('/')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'A public route into space traffic management'
    })
  ).toBeVisible()
}

async function expectNoPageWidthOverflow(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        body: document.body.scrollWidth <= document.body.clientWidth,
        document:
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      }))
    )
    .toEqual({ body: true, document: true })
}

test.describe('committee-demo first view', () => {
  test('presents the public research desk and its key paths on desktop', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openPrototype(page)

    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
    await expect(page.getByText(reviewPrototypeNotice, { exact: true })).toBeVisible()
    await expect(page.getByText('20 records across volumes', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /Ask the Committee/ })).toHaveAttribute(
      'href',
      '#ask'
    )
    await expect(page.getByRole('link', { name: /Videos \/ Studio/ })).toHaveAttribute(
      'href',
      '#studio'
    )
    await expectNoPageWidthOverflow(page)
  })

  test('retains the prototype notice, collection fact, and layout on mobile', async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openPrototype(page)

    await expect(page.getByText(reviewPrototypeNotice, { exact: true })).toBeVisible()
    await expect(page.getByText('20 records across volumes', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: /Featured reading/ })).toHaveAttribute(
      'href',
      '#articles'
    )
    await expect(page.getByRole('link', { name: /Ask the Committee/ })).toHaveAttribute(
      'href',
      '#ask'
    )
    await expectNoPageWidthOverflow(page)
  })
})

test('each original article exposes only its canonical DOI pathways', async ({ page }) => {
  await openPrototype(page)

  const articleSection = page.locator('#articles')
  const selector = articleSection.getByLabel('Choose an outreach article')

  for (const article of articleJourneys) {
    await selector.selectOption({ label: article.title })
    await expect(
      articleSection.getByRole('heading', { level: 3, name: article.title })
    ).toBeVisible()

    const sourceLinks = articleSection
      .getByRole('complementary', { name: 'Article source pathways' })
      .getByRole('link')

    await expect(sourceLinks).toHaveCount(article.doiUrls.length)
    await expect(sourceLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href')))).resolves.toEqual(
      article.doiUrls
    )
  }
})

test('filters the publication library for reentry and Moon-to-Mars records', async ({
  page
}) => {
  await openPrototype(page)

  const library = page.locator('#library')
  const search = library.getByRole('searchbox', { name: 'Search publications' })
  const results = library.getByRole('list', { name: 'Publication results' }).locator(':scope > li')

  await search.fill('reentry')
  await expect(library.getByText('1 publication', { exact: true })).toBeVisible()
  await expect(results).toHaveCount(1)
  await expect(results.first()).toContainText('Hazards associated with reentry')
  await expect(results.first().getByRole('link')).toHaveAttribute(
    'href',
    'https://doi.org/10.1016/j.actaastro.2024.10.040'
  )

  await search.fill('Moon to Mars')
  await expect(library.getByText('1 publication', { exact: true })).toBeVisible()
  await expect(results).toHaveCount(1)
  await expect(results.first()).toContainText(/Moon to mars:/i)
  await expect(results.first().getByRole('link')).toHaveAttribute(
    'href',
    'https://doi.org/10.1016/j.actaastro.2024.12.056'
  )
})

test('renders a source-bounded preview and preserves the submitted question', async ({
  page
}) => {
  const question = 'Why is outreach part of space traffic management?'
  const sourceTitle = 'Outreach on Space Traffic Management'
  const sourceHref = 'https://doi.org/10.1016/j.actaastro.2025.01.031'
  const notice = 'Preview answer from project-owned public context; not an official position.'
  let postedBody: unknown

  await page.route('**/api/ask', async (route) => {
    const request = route.request()
    expect(request.method()).toBe('POST')
    expect(request.headers()['content-type']).toContain('application/json')
    postedBody = request.postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer:
          'Outreach connects public understanding to the technical record while keeping interpretation distinct from paper findings.',
        mode: 'preview',
        sources: [{ title: sourceTitle, href: sourceHref }],
        notice
      })
    })
  })

  await openPrototype(page)
  await page.getByLabel('Your question').fill(question)
  await page.getByRole('button', { name: 'Ask this question' }).click()

  await expect.poll(() => postedBody).toEqual({ question })
  await expect(page.getByText('Deterministic preview mode', { exact: true })).toBeVisible()
  await expect(page.getByRole('blockquote')).toHaveText(question)
  await expect(page.locator('.answer__text')).toContainText('Outreach connects')
  await expect(page.locator('.answer').getByRole('link', { name: sourceTitle, exact: true })).toHaveAttribute(
    'href',
    sourceHref
  )
  await expect(page.getByText(notice, { exact: true })).toBeVisible()
})

test('coordinates all question controls while an Ask request is loading', async ({
  page
}) => {
  let releaseResponse: () => void = () => undefined
  let markRequestSeen: () => void = () => undefined
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve
  })
  const requestSeen = new Promise<void>((resolve) => {
    markRequestSeen = resolve
  })

  await page.route('**/api/ask', async (route) => {
    markRequestSeen()
    await responseGate
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: 'A bounded preview answer.',
        mode: 'preview',
        sources: [],
        notice: 'Preview mode; no model call was made.'
      })
    })
  })

  await openPrototype(page)
  await page.getByLabel('Your question').fill('What are the hazards of reentry?')
  await page.getByRole('button', { name: 'Ask this question' }).click()
  await requestSeen

  await expect(page.getByLabel('Your question')).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ask this question' })).toBeDisabled()
  await expect(page.getByLabel('Start an Ask the Committee question').getByRole('textbox')).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Take this question to Ask' })).toBeDisabled()
  const sampleButtons = page.locator('.sample-questions').getByRole('button')
  await expect(sampleButtons).toHaveCount(3)
  for (const sampleButton of await sampleButtons.all()) {
    await expect(sampleButton).toBeDisabled()
  }
  await expect(page.getByRole('status').filter({ hasText: 'Researching the public record' })).toBeVisible()

  releaseResponse()
  await expect(page.getByRole('heading', { name: 'Response from the public record' })).toBeVisible()
  await expect(page.getByLabel('Your question')).toBeEnabled()
})

test('supports play, pause, step controls, and timeline scrubbing', async ({ page }) => {
  await openPrototype(page)

  const storyboard = page.getByRole('group', { name: 'Interactive explainer storyboard' })
  const previous = storyboard.getByRole('button', { name: 'Previous frame' })
  const playback = storyboard.getByRole('button', { name: /storyboard/ })
  const next = storyboard.getByRole('button', { name: 'Next frame' })
  const timeline = storyboard.getByRole('slider', { name: 'Storyboard frame' })

  await expect(storyboard.getByText('Frame 1 of 5', { exact: true })).toBeVisible()
  await expect(previous).toBeDisabled()

  await storyboard.getByRole('button', { name: 'Play storyboard' }).click()
  await expect(storyboard.getByRole('button', { name: 'Pause storyboard' })).toBeVisible()
  await storyboard.getByRole('button', { name: 'Pause storyboard' }).click()
  await expect(playback).toHaveText('Play storyboard')

  await next.click()
  await expect(storyboard.getByText('Frame 2 of 5', { exact: true })).toBeVisible()
  await previous.click()
  await expect(storyboard.getByText('Frame 1 of 5', { exact: true })).toBeVisible()

  await timeline.fill('5')
  await expect(storyboard.getByText('Frame 5 of 5', { exact: true })).toBeVisible()
  await expect(timeline).toHaveAttribute('aria-valuetext', /Frame 5 of 5:/)
  await expect(next).toBeDisabled()
  await expect(playback).toBeDisabled()
})

test('keeps manual storyboard controls available with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPrototype(page)

  const storyboard = page.getByRole('group', { name: 'Interactive explainer storyboard' })
  await expect(storyboard.getByText(/Reduced motion is on/)).toBeVisible()
  await expect(storyboard.getByRole('button', { name: 'Play storyboard' })).toBeDisabled()

  await storyboard.getByRole('button', { name: 'Next frame' }).click()
  await expect(storyboard.getByText('Frame 2 of 5', { exact: true })).toBeVisible()
  await storyboard.getByRole('slider', { name: 'Storyboard frame' }).fill('4')
  await expect(storyboard.getByText('Frame 4 of 5', { exact: true })).toBeVisible()
  await storyboard.getByRole('button', { name: 'Previous frame' }).click()
  await expect(storyboard.getByText('Frame 3 of 5', { exact: true })).toBeVisible()
})

test('offers a keyboard-visible skip link and preserves page width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openPrototype(page)

  const skipLink = page.getByRole('link', { name: 'Skip to the research desk' })
  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()
  await expect(skipLink).toHaveAttribute('href', '#main-content')

  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main-content$/)
  await expectNoPageWidthOverflow(page)
})
