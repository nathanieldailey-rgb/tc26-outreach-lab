import {
  composePreviewAnswer,
  retrieveKnowledge
} from '../src/lib/retrieval'

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

  it('honors the result limit and gives tied scores a stable order', () => {
    const first = retrieveKnowledge('space traffic management', 2)
    const second = retrieveKnowledge('space traffic management', 2)

    expect(first).toHaveLength(2)
    expect(second).toEqual(first)
    expect(retrieveKnowledge('space', 0)).toEqual([])
  })

  it('de-duplicates publication sources across ranked results', () => {
    const results = retrieveKnowledge('outreach committee mission', 5)
    const sources = results.flatMap(({ sourceSlugs }) => sourceSlugs)

    expect(sources.length).toBeGreaterThan(0)
    expect(new Set(sources).size).toBe(sources.length)
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

  it('labels insufficient public context without inventing an answer', () => {
    expect(composePreviewAnswer([])).toBe(
      'Preview limitation: The public project knowledge base does not contain enough information to answer this question. Consult the linked publication records or ask a committee reviewer.'
    )
  })
})
