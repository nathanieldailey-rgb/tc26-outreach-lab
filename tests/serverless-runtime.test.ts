import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

function sourcePathForImport(importer: string, specifier: string): string {
  const withoutRuntimeExtension = specifier.endsWith('.js')
    ? specifier.slice(0, -3)
    : specifier
  const candidate = resolve(dirname(importer), `${withoutRuntimeExtension}.ts`)

  if (!existsSync(candidate)) {
    throw new Error(`Unable to resolve ${specifier} from ${importer}`)
  }

  return candidate
}

function collectServerlessModules(entrypoint: string): string[] {
  const pending = [entrypoint]
  const visited = new Set<string>()

  while (pending.length > 0) {
    const current = pending.pop()
    if (current === undefined || visited.has(current)) continue

    visited.add(current)
    const source = readFileSync(current, 'utf8')
    const specifiers = [
      ...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/\bimport\s+['"]([^'"]+)['"]/g)
    ].map((match) => match[1])

    for (const specifier of specifiers) {
      if (!specifier.startsWith('.')) continue

      expect(
        specifier,
        `${current} must use a Node ESM-compatible relative import`
      ).toMatch(/\.js$/)
      pending.push(sourcePathForImport(current, specifier))
    }
  }

  return [...visited]
}

describe('Vercel serverless runtime compatibility', () => {
  it('uses explicit JavaScript extensions throughout the API import graph', () => {
    const entrypoint = resolve(process.cwd(), 'api/ask.ts')

    expect(collectServerlessModules(entrypoint)).toEqual(
      expect.arrayContaining([
        entrypoint,
        resolve(process.cwd(), 'src/content/publications.ts'),
        resolve(process.cwd(), 'src/content/knowledge.ts'),
        resolve(process.cwd(), 'src/lib/retrieval.ts')
      ])
    )
  })
})
