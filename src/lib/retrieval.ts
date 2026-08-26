import {
  knowledgeEntries,
  type KnowledgeEntry
} from '../content/knowledge'

const STOPWORDS = new Set([
  'a',
  'about',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'can',
  'could',
  'does',
  'do',
  'explain',
  'for',
  'from',
  'how',
  'i',
  'in',
  'is',
  'it',
  'important',
  'matter',
  'matters',
  'me',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'through',
  'tell',
  'to',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
  'you'
])

const FIELD_WEIGHTS = {
  title: 5,
  keywords: 3,
  text: 1
} as const

const MINIMUM_RELEVANCE_SCORE = 8

const QUERY_TERM_EQUIVALENTS: Readonly<
  Record<string, readonly string[]>
> = {
  affect: ['links'],
  atmosphere: ['reentry'],
  changes: ['extend'],
  falling: ['reentry'],
  ordinary: ['public'],
  people: ['public'],
  satellite: ['spacecraft']
}

export type RetrievalResult = KnowledgeEntry & {
  score: number
}

function normalizeTokens(value: string): string[] {
  return (
    value
      .normalize('NFKD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase('en')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  ).filter((token) => !STOPWORDS.has(token))
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeTokens(value))
}

function scoreEntry(
  queryTokens: readonly string[],
  entry: KnowledgeEntry
): { matchedTokenCount: number; score: number } {
  const titleTokens = tokenSet(entry.title)
  const keywordTokens = tokenSet(entry.keywords.join(' '))
  const textTokens = tokenSet(entry.text)
  let matchedTokenCount = 0

  const score = queryTokens.reduce((total, token) => {
    const titleScore = titleTokens.has(token) ? FIELD_WEIGHTS.title : 0
    const keywordScore = keywordTokens.has(token) ? FIELD_WEIGHTS.keywords : 0
    const textScore = textTokens.has(token) ? FIELD_WEIGHTS.text : 0
    const equivalentMatch = (QUERY_TERM_EQUIVALENTS[token] ?? []).some(
      (equivalentToken) =>
        titleTokens.has(equivalentToken) ||
        keywordTokens.has(equivalentToken) ||
        textTokens.has(equivalentToken)
    )

    if (
      titleScore > 0 ||
      keywordScore > 0 ||
      textScore > 0 ||
      equivalentMatch
    ) {
      matchedTokenCount += 1
    }

    return total + titleScore + keywordScore + textScore
  }, 0)

  return { matchedTokenCount, score }
}

export function retrieveKnowledge(
  question: string,
  limit = 3
): RetrievalResult[] {
  const queryTokens = [...new Set(normalizeTokens(question))]
  const resultLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 3

  if (queryTokens.length === 0 || resultLimit === 0) {
    return []
  }

  const ranked = knowledgeEntries
    .map((entry, index) => ({
      entry,
      index,
      ...scoreEntry(queryTokens, entry)
    }))
    .filter(
      ({ matchedTokenCount, score }) =>
        matchedTokenCount === queryTokens.length &&
        score >= MINIMUM_RELEVANCE_SCORE
    )
    .sort((left, right) => right.score - left.score || left.index - right.index)

  return ranked.slice(0, resultLimit).map(({ entry, score }) => ({
    ...entry,
    sourceSlugs: [...entry.sourceSlugs],
    score
  }))
}

export function collectSourceSlugs(
  entries: readonly { readonly sourceSlugs: readonly string[] }[]
): string[] {
  const seenSourceSlugs = new Set<string>()
  const collectedSourceSlugs: string[] = []

  for (const { sourceSlugs } of entries) {
    for (const sourceSlug of sourceSlugs) {
      if (!seenSourceSlugs.has(sourceSlug)) {
        seenSourceSlugs.add(sourceSlug)
        collectedSourceSlugs.push(sourceSlug)
      }
    }
  }

  return collectedSourceSlugs
}

export function composePreviewAnswer(results: readonly RetrievalResult[]): string {
  if (results.length === 0) {
    return 'Preview limitation: The public project knowledge base does not contain enough information to answer this question. Consult the linked publication records or ask a committee reviewer.'
  }

  const answer = results.map(({ title, text }) => `${title}: ${text}`).join(' ')
  const sourceSlugs = collectSourceSlugs(results)
  const sourceNote =
    sourceSlugs.length > 0 ? ` Source records: ${sourceSlugs.join(', ')}.` : ''

  return `Preview answer — site-owned material only: ${answer}${sourceNote} Limitation: This deterministic preview uses project-original explanations and bibliographic metadata. It is not an official committee position and does not substitute for the linked papers.`
}
