import { knowledgeEntries } from '../src/content/knowledge'
import {
  collectSourceSlugs,
  composePreviewAnswer,
  retrieveKnowledge
} from '../src/lib/retrieval'
const insufficientPreview =
  'Preview limitation: The public project knowledge base does not contain enough information to answer this question. Consult the linked publication records or ask a committee reviewer.'

describe('knowledge retrieval', () => {
  it('returns no results for an empty or stopword-only query', () => {
    expect(retrieveKnowledge('')).toEqual([])
    expect(retrieveKnowledge('  the AND of  ')).toEqual([])
  })

  it.each([
    ['Why does outreach matter?', 'outreach-rationale'],
    ['What are the hazards of reentry?', 'operations-reentry-cola'],
    ['How do large constellations affect operations?', 'operations-reentry-cola'],
    ['What changes from Móon to Mars?', 'future-domains']
  ])('ranks relevant knowledge for %s', (question, expectedSlug) => {
    expect(retrieveKnowledge(question)[0]?.slug).toBe(expectedSlug)
  })

  it.each([
    [
      'Why is outreach part of space traffic management?',
      'committee-mission'
    ],
    ['What are the hazards of reentry?', 'operations-reentry-cola'],
    [
      'How does traffic management change from Moon to Mars?',
      'future-domains'
    ]
  ])(
    'grounds the displayed Ask sample in coherent public context: %s',
    (question, expectedSlug) => {
      const results = retrieveKnowledge(question)
      const preview = composePreviewAnswer(results)

      expect(results.length).toBeGreaterThan(0)
      expect(results[0]?.slug).toBe(expectedSlug)
      expect(collectSourceSlugs(results).length).toBeGreaterThan(0)
      expect(preview).toMatch(/^Preview answer — site-owned material only:/)
      expect(preview).not.toBe(insufficientPreview)
    }
  )

  it.each([
    [
      'Could you explain why public outreach matters to ordinary people?',
      ['outreach-rationale', 'committee-mission']
    ],
    [
      'Tell me about reentry hazards for a satellite falling through the atmosphere',
      ['operations-reentry-cola']
    ]
  ])('keeps only strong in-domain evidence in verbose plain-language questions: %s', (question, expectedSlugs) => {
    expect(retrieveKnowledge(question).map(({ slug }) => slug)).toEqual(
      expectedSlugs
    )
  })

  it.each([
    'What is the space weather forecast?',
    'How do I bake a space-themed cake?',
    'Moon cake',
    'outreach cake',
    'AI Moon',
    'How do I pay a space traffic ticket?',
    'Where can I buy collision avoidance insurance?'
  ])('rejects generic-overlap questions outside the public knowledge domain: %s', (question) => {
    const results = retrieveKnowledge(question)

    expect(results).toEqual([])
    expect(composePreviewAnswer(results)).toBe(insufficientPreview)
  })

  it('rejects mixed terms that only match unrelated knowledge entries', () => {
    const results = retrieveKnowledge('AI forecast Moon')

    expect(results).toEqual([])
    expect(composePreviewAnswer(results)).toBe(insufficientPreview)
  })

  it('honors the result limit and gives tied scores a stable order', () => {
    const first = retrieveKnowledge('space traffic management', 2)
    const second = retrieveKnowledge('space traffic management', 2)

    expect(first).toHaveLength(2)
    expect(second).toEqual(first)
    expect(retrieveKnowledge('space', 0)).toEqual([])
  })

  it('preserves each ranked entry\'s complete declared source provenance', () => {
    const results = retrieveKnowledge('public outreach', 5)
    const declaredBySlug = new Map(
      knowledgeEntries.map((entry) => [entry.slug, entry.sourceSlugs])
    )

    expect(results.length).toBeGreaterThan(1)
    for (const result of results) {
      const declaredSources = declaredBySlug.get(result.slug)

      expect(result.sourceSlugs).toEqual(declaredSources)
      expect(result.sourceSlugs).not.toBe(declaredSources)
    }

    const firstResult = results[0]
    const declaredSources = declaredBySlug.get(firstResult.slug) ?? []
    const mutationProbe = 'retrieval-mutation-probe'
    let mutationLeaked = false

    try {
      firstResult.sourceSlugs.push(mutationProbe)
      mutationLeaked = declaredSources.includes(mutationProbe)
    } finally {
      firstResult.sourceSlugs.pop()
    }

    expect(mutationLeaked).toBe(false)
  })

  it('exports a deterministic stable aggregate source de-duplication helper', () => {
    expect(
      collectSourceSlugs([
        { sourceSlugs: ['report-a', 'report-b', 'report-a'] },
        { sourceSlugs: ['report-b', 'report-c'] },
        { sourceSlugs: [] }
      ])
    ).toEqual(['report-a', 'report-b', 'report-c'])
  })
})

describe('deterministic preview composition', () => {
  it('builds the same labeled answer from the same ranked entries', () => {
    const results = retrieveKnowledge('Why is outreach important?', 2)
    const first = composePreviewAnswer(results)
    const second = composePreviewAnswer(results)

    expect(second).toBe(first)
    expect(first).toMatch(/^Preview answer — site-owned material only:/)
    expect(first).toContain('Limitation:')
    expect(first).toContain('not an official committee position')
    expect(first).toContain('does not substitute for the linked papers')
  })

  it('de-duplicates sources only in final preview citation composition', () => {
    const results = retrieveKnowledge('public outreach', 5)
    const preview = composePreviewAnswer(results)

    expect(results.flatMap(({ sourceSlugs }) => sourceSlugs)).toEqual([
      'stm-outreach',
      'synthesis-report',
      'stm-outreach',
      'synthesis-report'
    ])
    expect(preview).toContain('Source records: stm-outreach, synthesis-report.')
  })

  it('labels insufficient public context without inventing an answer', () => {
    expect(composePreviewAnswer([])).toBe(insufficientPreview)
  })
})
