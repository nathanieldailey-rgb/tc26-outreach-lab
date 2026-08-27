import type { Page } from '@playwright/test'

type BrowserConsoleMessage = {
  type(): string
  text(): string
}

export type BrowserEventSource = {
  on(
    event: 'pageerror' | 'console',
    listener: (value: never) => void
  ): unknown
  off(
    event: 'pageerror' | 'console',
    listener: (value: never) => void
  ): unknown
}

export type BrowserErrorMonitor = {
  errors: string[]
  detach(): void
}

export function observeBrowserErrors(page: Page): BrowserErrorMonitor
export function observeBrowserErrors(
  page: BrowserEventSource
): BrowserErrorMonitor
export function observeBrowserErrors(
  page: Page | BrowserEventSource
): BrowserErrorMonitor {
  const errors: string[] = []
  const eventSource = page as BrowserEventSource
  const recordPageError = ((error: Error) => {
    errors.push(`pageerror: ${error.message}`)
  }) as (value: never) => void
  const recordConsoleError = ((message: BrowserConsoleMessage) => {
    if (message.type() === 'error') {
      errors.push(`console.error: ${message.text()}`)
    }
  }) as (value: never) => void

  eventSource.on('pageerror', recordPageError)
  eventSource.on('console', recordConsoleError)

  return {
    errors,
    detach() {
      eventSource.off('pageerror', recordPageError)
      eventSource.off('console', recordConsoleError)
    }
  }
}

export function expectNoBrowserErrors(errors: readonly string[]): void {
  if (errors.length > 0) {
    throw new Error(`Browser errors were observed:\n${errors.join('\n')}`)
  }
}
