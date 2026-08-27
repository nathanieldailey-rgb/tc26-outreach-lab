export type KnowledgeEntry = {
  slug: string
  title: string
  text: string
  keywords: string[]
  sourceSlugs: string[]
}

export const knowledgeEntries: readonly KnowledgeEntry[] = [
  {
    slug: 'committee-mission',
    title: 'Committee publication mission',
    text:
      'The publication program brings technical, operational, governance, and outreach questions into one space traffic management conversation. This site offers an independent public orientation to that record and does not speak for the committee.',
    keywords: [
      'committee',
      'mission',
      'space traffic management',
      'outreach',
      'public understanding',
      'technical',
      'operations',
      'governance'
    ],
    sourceSlugs: ['stm-outreach', 'synthesis-report']
  },
  {
    slug: 'cross-volume-structure',
    title: 'A cross-volume publication structure',
    text:
      'The public library contains nineteen topic reports and one synthesis record. The records span volumes of Acta Astronautica, while the terminology report appears in the Journal of Space Safety Engineering; they are not one conventional bound issue.',
    keywords: [
      'cross-volume',
      'collection',
      'publication library',
      'nineteen reports',
      'synthesis',
      'journal',
      'volume'
    ],
    sourceSlugs: ['stm-terminology', 'synthesis-report']
  },
  {
    slug: 'outreach-rationale',
    title: 'Outreach as part of the safety conversation',
    text:
      'This project treats outreach as a way to connect public understanding with technical, operational, and governance work. Clear explanations can identify uncertainty, avoid invented consensus, and guide readers to the publication record without replacing it.',
    keywords: [
      'outreach',
      'education',
      'public engagement',
      'safety architecture',
      'public understanding',
      'communication'
    ],
    sourceSlugs: ['stm-outreach', 'synthesis-report']
  },
  {
    slug: 'orbital-knowledge-data-fusion',
    title: 'Orbital knowledge, precision, data fusion, and shared catalogs',
    text:
      'Orbital knowledge depends on the precision and accuracy of data, the combination of inputs through data fusion, and ways to make catalog information usable across participants. A shared picture is a coordination goal, not necessarily a single database.',
    keywords: [
      'orbital knowledge',
      'precision',
      'accuracy',
      'data fusion',
      'shared catalog',
      'space object catalog',
      'database',
      'tracking'
    ],
    sourceSlugs: [
      'orbital-data-precision',
      'data-fusion',
      'shared-space-object-catalog'
    ]
  },
  {
    slug: 'operations-reentry-cola',
    title: 'Operations, reentry, collision avoidance, and constellations',
    text:
      'The operations cluster links practical traffic questions including reentry hazards, spacecraft collision avoidance, in-orbit servicing, large constellations, and radio-frequency interference. Each publication record provides a distinct route into that wider operational landscape.',
    keywords: [
      'operations',
      'reentry',
      're-entry',
      'hazards',
      'COLA',
      'collision avoidance',
      'large constellations',
      'in-orbit servicing',
      'radio-frequency interference'
    ],
    sourceSlugs: [
      'reentry-hazards',
      'collision-avoidance',
      'in-orbit-servicing',
      'large-constellations',
      'radio-frequency-interference'
    ]
  },
  {
    slug: 'governance-registration-capacity',
    title: 'Governance, registration, regulation, and capacity',
    text:
      'The governance cluster connects registration practices, technical regulations, compliance with orbital-debris mitigation rules, and space capacity management. These records show that traffic management questions include both operational conduct and institutional responsibilities.',
    keywords: [
      'governance',
      'registration',
      'technical regulation',
      'compliance',
      'orbital debris mitigation',
      'space capacity management',
      'institutional responsibility'
    ],
    sourceSlugs: [
      'registration-practices',
      'technical-regulations',
      'orbital-debris-compliance',
      'space-capacity-management'
    ]
  },
  {
    slug: 'future-domains',
    title: 'Future domains from sub-orbital activity to Moon and Mars',
    text:
      'The future-domains records extend the space traffic management conversation through sub-orbital transit and ground support, growing activity in near-Earth space, and cislunar and cismartian environments. The titles establish scope; the linked papers remain the source for detailed frameworks or findings.',
    keywords: [
      'future domains',
      'sub-orbital',
      'airspace',
      'ground support',
      'near-Earth',
      'Moon to Mars',
      'cislunar',
      'cismartian'
    ],
    sourceSlugs: [
      'sub-orbital-activities',
      'near-earth-future-activities',
      'moon-to-mars'
    ]
  },
  {
    slug: 'ai-content-limitations',
    title: 'AI and content limitations',
    text:
      'Answers in preview mode are deterministic combinations of site-owned explanations and bibliographic metadata. They do not use publisher-owned paper content, do not establish official positions, and must state when the public context is insufficient.',
    keywords: [
      'AI',
      'preview mode',
      'limitations',
      'site-owned',
      'bibliographic metadata',
      'official position',
      'insufficient context'
    ],
    sourceSlugs: []
  }
]
