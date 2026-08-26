import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { createElement } from 'react'

import ExplainerStudio from '../src/components/ExplainerStudio'

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
  })

  it('presents three video briefs and a five-frame storyboard that never auto-plays', () => {
    render(createElement(ExplainerStudio))

    expect(
      within(screen.getByRole('list', { name: /explainer video briefs/i })).getAllByRole(
        'listitem'
      )
    ).toHaveLength(3)
    expect(within(player()).getByText(/frame 1 of 5/i)).toBeVisible()
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
})
