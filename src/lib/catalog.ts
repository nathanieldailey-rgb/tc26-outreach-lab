import { publications, type Publication } from '../content/publications.js'

// Only unqualified collection-count questions belong here. Unknown words
// (topics, dates, journals, instructions) must not become whole-catalog totals.
const COUNT_QUESTION_WORDS = new Set([
  'how', 'many', 'what', 'is', 'the', 'total', 'number', 'count', 'of',
  'publications', 'papers', 'reports', 'records', 'currently', 'current',
  'exist', 'exists', 'are', 'there', 'do', 'you', 'we', 'have', 'in',
  'this', 'your', 'our', 'catalog', 'catalogue', 'library', 'corpus',
  'collection', 'website', 'site', 'tc26'
])

export function catalogCountAnswer(
  question: string,
  records: readonly Publication[] = publications
): string | undefined {
  const normalized = question.toLocaleLowerCase('en').trim()
  const words = normalized.match(/[\p{L}\p{N}]+/gu) ?? []
  if (
    !/\b(?:how\s+many|number\s+of|count\s+of|total)\b/.test(normalized) ||
    !words.some((word) => ['publications', 'papers', 'reports', 'records'].includes(word)) ||
    words.some((word) => !COUNT_QUESTION_WORDS.has(word))
  ) return undefined

  const topicCount = records.filter((record) => record.kind === 'topic-report').length
  const synthesisCount = records.filter((record) => record.kind === 'synthesis').length
  return `The website catalog currently contains ${records.length} publications: ${topicCount} topic reports and ${synthesisCount} synthesis ${synthesisCount === 1 ? 'paper' : 'papers'}. This is the site's collection, not a count of every TC26 publication or all publications worldwide.`
}
