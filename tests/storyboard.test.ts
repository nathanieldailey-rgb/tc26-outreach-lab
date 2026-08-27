import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'

import ExplainerStudio from '../src/components/ExplainerStudio'

type MotionPreferenceController = {
  listenerCount: () => number
  setReducedMotion: (matches: boolean) => void
}

function installMotionPreference(initialMatches: boolean): MotionPreferenceController {
  let matches = initialMatches
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const mediaQuery = {
    get matches() {
      return matches
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_type: 'change', listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_type: 'change', listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  } as unknown as MediaQueryList

  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

  return {
    listenerCount: () => listeners.size,
    setReducedMotion: (nextMatches: boolean) => {
      matches = nextMatches
      const event = { matches, media: mediaQuery.media } as MediaQueryListEvent
      act(() => listeners.forEach((listener) => listener(event)))
    }
  }
}

function player(): HTMLElement {
  return screen.getByRole('group', { name: /interactive explainer storyboard/i })
}

describe('Explainer Studio storyboard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    act(() => vi.runOnlyPendingTimers())
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('presents three video briefs and a five-frame storyboard that never auto-plays', () => {
    render(createElement(ExplainerStudio))

    const slate = screen.getByRole('list', { name: /explainer video briefs/i })
    const concepts = within(slate).getAllByRole('listitem')

    expect(concepts).toHaveLength(3)
    expect(concepts[0]).toHaveTextContent('Outreach Is Part of the Safety Architecture')
    expect(concepts[0]).toHaveTextContent('75 seconds')
    expect(concepts[1]).toHaveTextContent('Reentry Does Not End at an Orbital Boundary')
    expect(concepts[1]).toHaveTextContent('80 seconds')
    expect(concepts[2]).toHaveTextContent('Traffic Management Beyond Earth Orbit')
    expect(concepts[2]).toHaveTextContent('75 seconds')
    expect(screen.getByText(/three concepts total/i)).toBeVisible()
    expect(screen.getByText(/one interactive storyboard plus two additional briefs/i)).toBeVisible()
    expect(within(player()).getByText(/concept 1.*interactive storyboard/i)).toBeVisible()
    expect(within(player()).getByText(/frame 1 of 5/i)).toBeVisible()
    expect(within(player()).getByText('One environment. Many decisions.')).toBeVisible()
    expect(within(player()).getByRole('button', { name: /play storyboard/i })).toBeVisible()

    act(() => vi.advanceTimersByTime(10_500))
    expect(within(player()).getByText(/frame 1 of 5/i)).toBeVisible()
  })

  it('plays, pauses, and cleans up its progress timer', () => {
    const { unmount } = render(createElement(ExplainerStudio))
    const controls = player()

    fireEvent.click(within(controls).getByRole('button', { name: /play storyboard/i }))
    expect(within(controls).getByRole('button', { name: /pause storyboard/i })).toBeVisible()
    expect(vi.getTimerCount()).toBe(1)

    act(() => vi.advanceTimersByTime(3_500))
    expect(within(controls).getByText(/frame 2 of 5/i)).toBeVisible()

    fireEvent.click(within(controls).getByRole('button', { name: /pause storyboard/i }))
    expect(within(controls).getByRole('button', { name: /play storyboard/i })).toBeVisible()
    act(() => vi.advanceTimersByTime(7_000))
    expect(within(controls).getByText(/frame 2 of 5/i)).toBeVisible()

    fireEvent.click(within(controls).getByRole('button', { name: /play storyboard/i }))
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('supports previous, next, range, and bounded navigation', () => {
    render(createElement(ExplainerStudio))
    const controls = player()
    const previous = within(controls).getByRole('button', { name: /previous frame/i })
    const next = within(controls).getByRole('button', { name: /next frame/i })
    const range = within(controls).getByRole('slider', { name: /storyboard frame/i })

    expect(previous).toBeDisabled()
    expect(next).toBeEnabled()
    expect(range).toHaveAttribute('aria-valuetext', expect.stringMatching(/frame 1 of 5/i))

    fireEvent.click(next)
    expect(within(controls).getByText(/frame 2 of 5/i)).toBeVisible()
    expect(previous).toBeEnabled()

    fireEvent.click(previous)
    expect(within(controls).getByText(/frame 1 of 5/i)).toBeVisible()
    expect(previous).toBeDisabled()

    fireEvent.change(range, { target: { value: '5' } })
    expect(within(controls).getByText(/frame 5 of 5/i)).toBeVisible()
    expect(next).toBeDisabled()
    expect(within(controls).getByRole('button', { name: /play storyboard/i })).toBeDisabled()

    fireEvent.change(range, { target: { value: '1' } })
    expect(within(controls).getByText(/frame 1 of 5/i)).toBeVisible()
    expect(previous).toBeDisabled()
  })

  it('disables timed play for reduced motion while preserving manual controls', () => {
    installMotionPreference(true)
    render(createElement(ExplainerStudio))
    const controls = player()

    expect(within(controls).getByText(/reduced motion is on/i)).toBeVisible()
    expect(within(controls).getByRole('button', { name: /play storyboard/i })).toBeDisabled()
    expect(within(controls).getByRole('button', { name: /next frame/i })).toBeEnabled()
    expect(within(controls).getByRole('slider', { name: /storyboard frame/i })).toBeEnabled()
    expect(vi.getTimerCount()).toBe(0)

    act(() => vi.advanceTimersByTime(10_500))
    expect(within(controls).getByText(/frame 1 of 5/i)).toBeVisible()

    fireEvent.click(within(controls).getByRole('button', { name: /next frame/i }))
    expect(within(controls).getByText(/frame 2 of 5/i)).toBeVisible()
    expect(within(controls).getByRole('button', { name: /previous frame/i })).toBeEnabled()
  })

  it('stops playback when motion preference changes and removes its listener', () => {
    const preference = installMotionPreference(false)
    const { unmount } = render(createElement(ExplainerStudio))
    const controls = player()

    expect(preference.listenerCount()).toBe(1)
    fireEvent.click(within(controls).getByRole('button', { name: /play storyboard/i }))
    expect(vi.getTimerCount()).toBe(1)

    preference.setReducedMotion(true)
    expect(within(controls).getByRole('button', { name: /play storyboard/i })).toBeDisabled()
    expect(vi.getTimerCount()).toBe(0)
    act(() => vi.advanceTimersByTime(7_000))
    expect(within(controls).getByText(/frame 1 of 5/i)).toBeVisible()

    preference.setReducedMotion(false)
    expect(within(controls).getByRole('button', { name: /play storyboard/i })).toBeEnabled()
    expect(within(controls).queryByText(/reduced motion is on/i)).not.toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(0)

    unmount()
    expect(preference.listenerCount()).toBe(0)
  })
})
