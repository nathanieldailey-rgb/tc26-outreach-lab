import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { articles } from '../src/content/articles'
import { doiUrl, publications } from '../src/content/publications'

const expectedPublications = [
  {
    slug: 'stm-terminology',
    sequence: 1,
    title: 'Space traffic management terminology',
    journal: 'Journal of Space Safety Engineering',
    volume: '9(4)',
    year: 2022,
    pages: '644–648',
    doi: '10.1016/j.jsse.2022.09.001',
    cluster: 'Foundations',
    kind: 'topic-report'
  },
  {
    slug: 'registration-practices',
    sequence: 2,
    title:
      'The need to improve registration practices in the context of space traffic management',
    journal: 'Acta Astronautica',
    volume: '223',
    year: 2024,
    pages: '242–248',
    doi: '10.1016/j.actaastro.2024.06.052',
    cluster: 'Governance',
    kind: 'topic-report'
  },
  {
    slug: 'space-debris-monitoring',
    sequence: 3,
    title:
      'Improving the knowledge of the orbital population New technical means of space debris monitoring',
    journal: 'Acta Astronautica',
    volume: '223',
    year: 2024,
    pages: '734–740',
    doi: '10.1016/j.actaastro.2024.06.028',
    cluster: 'Orbital Knowledge',
    kind: 'topic-report'
  },
  {
    slug: 'orbital-data-precision',
    sequence: 4,
    title: 'Improvement of orbital data precision and accuracy',
    journal: 'Acta Astronautica',
    volume: '229',
    year: 2025,
    pages: '218–224',
    doi: '10.1016/j.actaastro.2025.01.003',
    cluster: 'Orbital Knowledge',
    kind: 'topic-report'
  },
  {
    slug: 'reentry-hazards',
    sequence: 5,
    title: 'Hazards associated with reentry',
    journal: 'Acta Astronautica',
    volume: '228',
    year: 2025,
    pages: '246–252',
    doi: '10.1016/j.actaastro.2024.10.040',
    cluster: 'Operations',
    kind: 'topic-report'
  },
  {
    slug: 'collision-avoidance',
    sequence: 6,
    title:
      'Space traffic management: Improvements to spacecraft collision avoidance (COLA)',
    journal: 'Acta Astronautica',
    volume: '229',
    year: 2025,
    pages: '600–605',
    doi: '10.1016/j.actaastro.2025.01.042',
    cluster: 'Operations',
    kind: 'topic-report'
  },
  {
    slug: 'in-orbit-servicing',
    sequence: 7,
    title:
      'Future in-orbit servicing operations in the space traffic management context',
    journal: 'Acta Astronautica',
    volume: '220',
    year: 2024,
    pages: '469–477',
    doi: '10.1016/j.actaastro.2024.05.007',
    cluster: 'Operations',
    kind: 'topic-report'
  },
  {
    slug: 'technical-regulations',
    sequence: 8,
    title: 'An insight on technical regulations for new activities in space',
    journal: 'Acta Astronautica',
    volume: '225',
    year: 2024,
    pages: '707–718',
    doi: '10.1016/j.actaastro.2024.09.056',
    cluster: 'Governance',
    kind: 'topic-report'
  },
  {
    slug: 'orbital-debris-compliance',
    sequence: 9,
    title:
      'Effective compliance to technical regulations - Why is compliance to the orbital debris mitigation rules so poor?',
    journal: 'Acta Astronautica',
    volume: '226',
    year: 2025,
    pages: '839–845',
    doi: '10.1016/j.actaastro.2024.11.013',
    cluster: 'Governance',
    kind: 'topic-report'
  },
  {
    slug: 'small-object-trackability',
    sequence: 10,
    title:
      'Innovative methods for trackability and identification improvement of small objects for space traffic management',
    journal: 'Acta Astronautica',
    volume: '225',
    year: 2024,
    pages: '1012–1018',
    doi: '10.1016/j.actaastro.2024.10.004',
    cluster: 'Orbital Knowledge',
    kind: 'topic-report'
  },
  {
    slug: 'data-fusion',
    sequence: 11,
    title: 'Space traffic management: Data fusion',
    journal: 'Acta Astronautica',
    volume: '230',
    year: 2025,
    pages: '131–138',
    doi: '10.1016/j.actaastro.2024.08.056',
    cluster: 'Orbital Knowledge',
    kind: 'topic-report'
  },
  {
    slug: 'shared-space-object-catalog',
    sequence: 12,
    title: 'Space traffic management: A shared space object catalog',
    journal: 'Acta Astronautica',
    volume: '228',
    year: 2025,
    pages: '1099–1106',
    doi: '10.1016/j.actaastro.2024.09.009',
    cluster: 'Orbital Knowledge',
    kind: 'topic-report'
  },
  {
    slug: 'large-constellations',
    sequence: 13,
    title: 'Space traffic management: Large constellations',
    journal: 'Acta Astronautica',
    volume: '229',
    year: 2025,
    pages: '698–704',
    doi: '10.1016/j.actaastro.2025.01.043',
    cluster: 'Operations',
    kind: 'topic-report'
  },
  {
    slug: 'space-capacity-management',
    sequence: 14,
    title:
      'Space capacity management and its interaction with space traffic management',
    journal: 'Acta Astronautica',
    volume: '233',
    year: 2025,
    pages: '223–229',
    doi: '10.1016/j.actaastro.2025.01.069',
    cluster: 'Governance',
    kind: 'topic-report'
  },
  {
    slug: 'stm-outreach',
    sequence: 15,
    title: 'Outreach on Space Traffic Management',
    journal: 'Acta Astronautica',
    volume: '229',
    year: 2025,
    pages: '250–259',
    doi: '10.1016/j.actaastro.2025.01.031',
    cluster: 'Foundations',
    kind: 'topic-report'
  },
  {
    slug: 'radio-frequency-interference',
    sequence: 16,
    title:
      'Management of radio-frequency interferences for space traffic management: Current regulations, operations practice, technology mitigation solutions and future trends',
    journal: 'Acta Astronautica',
    volume: '225',
    year: 2024,
    pages: '1019–1030',
    doi: '10.1016/j.actaastro.2024.10.005',
    cluster: 'Operations',
    kind: 'topic-report'
  },
  {
    slug: 'sub-orbital-activities',
    sequence: 17,
    title:
      'Context and perspectives of sub-orbital activities and transit through airspace/ground support activities',
    journal: 'Acta Astronautica',
    volume: '225',
    year: 2024,
    pages: '285–294',
    doi: '10.1016/j.actaastro.2024.09.011',
    cluster: 'Future Domains',
    kind: 'topic-report'
  },
  {
    slug: 'near-earth-future-activities',
    sequence: 18,
    title:
      'Future activities in the near-earth space in the face of ever-increasing space traffic',
    journal: 'Acta Astronautica',
    volume: '225',
    year: 2024,
    pages: '891–897',
    doi: '10.1016/j.actaastro.2024.09.063',
    cluster: 'Future Domains',
    kind: 'topic-report'
  },
  {
    slug: 'moon-to-mars',
    sequence: 19,
    title:
      'Moon to mars: Challenges and strategic frameworks for space traffic management in cislunar and cismartian environments',
    journal: 'Acta Astronautica',
    volume: '229',
    year: 2025,
    pages: '211–217',
    doi: '10.1016/j.actaastro.2024.12.056',
    cluster: 'Future Domains',
    kind: 'topic-report'
  },
  {
    slug: 'synthesis-report',
    sequence: 'S',
    title:
      'IAF – IISL – IAA initiative on space traffic management: Synthesis report on IAF technical committee TC 26 on space traffic management',
    journal: 'Acta Astronautica',
    volume: '232',
    year: 2025,
    pages: '706–720',
    doi: '10.1016/j.actaastro.2025.03.024',
    cluster: 'Foundations',
    kind: 'synthesis'
  }
]

describe('public publication metadata', () => {
  it('contains the exact 19 topic reports and one synthesis record', () => {
    expect(publications).toEqual(expectedPublications)
    expect(publications).toHaveLength(20)
    expect(publications.filter(({ kind }) => kind === 'topic-report')).toHaveLength(19)
    expect(publications.filter(({ kind }) => kind === 'synthesis')).toHaveLength(1)
  })

  it('uses unique DOI values and canonical HTTPS DOI links', () => {
    const dois = publications.map(({ doi }) => doi)

    expect(new Set(dois)).toHaveLength(20)
    for (const doi of dois) {
      expect(doiUrl(doi)).toBe(`https://doi.org/${doi}`)
    }
  })
})

describe('project-original outreach articles', () => {
  it('provides three bounded articles with one featured story', () => {
    expect(articles).toHaveLength(3)
    expect(articles.filter(({ featured }) => featured)).toHaveLength(1)
    expect(articles.find(({ featured }) => featured)?.title).toBe(
      'Outreach is part of the safety architecture'
    )

    for (const article of articles) {
      expect(article.provenance).toBe('project-original')
      expect(article.notice).toMatch(/not (?:a substitute|substitutes) for/i)
      expect(article.deck.length).toBeGreaterThan(20)
      expect(article.audience.length).toBeGreaterThan(0)
      expect(article.readingMinutes).toBeGreaterThan(0)
      expect(article.body.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('resolves every article source to a publication slug', () => {
    const publicationSlugs = new Set(publications.map(({ slug }) => slug))

    for (const sourceSlug of articles.flatMap(({ sourceSlugs }) => sourceSlugs)) {
      expect(publicationSlugs.has(sourceSlug)).toBe(true)
    }
  })
})

describe('clean-room public source boundary', () => {
  it('contains no employer marker, local absolute path, credential, or source-control remote', () => {
    const projectFiles = [
      'src/content/publications.ts',
      'src/content/articles.ts',
      'src/content/knowledge.ts',
      'src/lib/retrieval.ts'
    ]
    const publicSource = projectFiles
      .map((file) => readFileSync(resolve(process.cwd(), file), 'utf8'))
      .join('\n')
    const employerMarker = String.fromCharCode(109, 105, 116, 114, 101)
    const localUserRoot = ['/', 'Users', '/'].join('')

    expect(publicSource.toLowerCase()).not.toContain(employerMarker)
    expect(publicSource).not.toContain(localUserRoot)
    expect(publicSource).not.toMatch(/(?:sk-|ghp_|glpat-)[A-Za-z0-9_-]{12,}/)
    expect(publicSource).not.toMatch(/-----BEGIN [A-Z ]+PRIVATE KEY-----/)
    expect(publicSource).not.toMatch(/https?:\/\/(?:[^/]+\.)?git(?:hub|lab)\./i)
    expect(publicSource).not.toMatch(/(?:abstract|fullText)\s*:/)
  })
})
