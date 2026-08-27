import {
  expectNoBrowserErrors,
  observeBrowserErrors,
  type BrowserEventSource
} from '../e2e/support/browser-errors'

class FakeBrowserPage implements BrowserEventSource {
  private readonly listeners = new Map<string, Set<(value: never) => void>>()

  on(event: 'pageerror' | 'console', listener: (value: never) => void): this {
    const eventListeners = this.listeners.get(event) ?? new Set()
    eventListeners.add(listener)
    this.listeners.set(event, eventListeners)
    return this
  }

  off(event: 'pageerror' | 'console', listener: (value: never) => void): this {
    this.listeners.get(event)?.delete(listener)
    return this
  }

  emit(event: 'pageerror' | 'console', value: unknown): void {
    for (const listener of this.listeners.get(event) ?? []) {
      listener(value as never)
    }
  }
}

function consoleMessage(type: string, text: string) {
  return { type: () => type, text: () => text }
}

describe('browser error monitor', () => {
  it('captures page errors and only error-level console messages', () => {
    const page = new FakeBrowserPage()
    const monitor = observeBrowserErrors(page)

    page.emit('console', consoleMessage('warning', 'an expected warning'))
    page.emit('console', consoleMessage('error', 'browser console failed'))
    page.emit('pageerror', new Error('uncaught page failure'))

    expect(monitor.errors).toEqual([
      'console.error: browser console failed',
      'pageerror: uncaught page failure'
    ])
    expect(() => expectNoBrowserErrors(monitor.errors)).toThrowError(
      /browser console failed.*uncaught page failure/s
    )

    monitor.detach()
    page.emit('console', consoleMessage('error', 'after detach'))
    expect(monitor.errors).toHaveLength(2)
  })

  it('accepts a journey with no captured browser errors', () => {
    expect(() => expectNoBrowserErrors([])).not.toThrow()
  })
})
