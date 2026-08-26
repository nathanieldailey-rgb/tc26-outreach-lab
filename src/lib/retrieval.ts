import {
  knowledgeEntries,
  type KnowledgeEntry
} from '../content/knowledge'

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'does',
  'do',
  'for',
  'from',
  'how',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with'
])

const FIELD_WEIGHTS = {
  title: 5,
  keywords: 3,
  text: 1
} as const

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

function scoreEntry(queryTokens: readonly string[], entry: KnowledgeEntry): number {
  const titleTokens = tokenSet(entry.title)
  const keywordTokens = tokenSet(entry.keywords.join(' '))
  const textTokens = tokenSet(entry.text)

  return queryTokens.reduce((score, token) => {
    const titleScore = titleTokens.has(token) ? FIELD_WEIGHTS.title : 0
    const keywordScore = keywordTokens.has(token) ? FIELD_WEIGHTS.keywords : 0
    const textScore = textTokens.has(token) ? FIELD_WEIGHTS.text : 0

    return score + titleScore + keywordScore + textScore
  }, 0)
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
      score: scoreEntry(queryTokens, entry)
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, resultLimit)

  const seenSourceSlugs = new Set<string>()

  return ranked.map(({ entry, score }) => ({
    ...entry,
    sourceSlugs: entry.sourceSlugs.filter((sourceSlug) => {
      if (seenSourceSlugs.has(sourceSlug)) {
        return false
      }

      seenSourceSlugs.add(sourceSlug)
      return true
    }),
    score
  }))
}

export function composePreviewAnswer(results: readonly RetrievalResult[]): string {
  if (results.length === 0) {
    return 'Preview limitation: The public project knowledge base does not contain enough information to answer this question. Consult the linked publication records or ask a committee reviewer.'
  }

  const answer = results.map(({ title, text }) => `${title}: ${text}`).join(' ')
  const sourceSlugs = [
    ...new Set(results.flatMap(({ sourceSlugs: sources }) => sources))
  ]
  const sourceNote =
    sourceSlugs.length > 0 ? ` Source records: ${sourceSlugs.join(', ')}.` : ''

  return `Preview answer — site-owned material only: ${answer}${sourceNote} Limitation: This deterministic preview uses project-original explanations and bibliographic metadata. It is not an official committee position and does not substitute for the linked papers.`
}
