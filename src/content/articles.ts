export type OutreachArticle = {
  slug: string
  title: string
  deck: string
  audience: string
  readingMinutes: number
  body: string[]
  sourceSlugs: string[]
  featured: boolean
  provenance: 'project-original'
  notice: string
}

const originalContentNotice =
  'Project-original outreach commentary; it is not a substitute for the linked papers.'

export const articles: readonly OutreachArticle[] = [
  {
    slug: 'outreach-safety-architecture',
    title: 'Outreach is part of the safety architecture',
    deck:
      'Public understanding helps technical, operational, and governance work meet in a shared conversation about safer space activity.',
    audience: 'Public readers, educators, operators, and policymakers',
    readingMinutes: 4,
    body: [
      'Space traffic management is often introduced through tracking, collision avoidance, or rules. Those subjects matter, but people must also understand why information is shared, why operational choices affect others, and where governance fits. In this project’s editorial framing, outreach helps connect those parts of the safety conversation.',
      'The publication record itself gives outreach a visible place: one topic report is devoted to outreach, and the synthesis report connects the wider set of technical and policy subjects. That pairing supports a careful public pathway from plain-language orientation to the bibliographic record without turning an outreach article into a replacement for research.',
      'Good outreach should make uncertainty and responsibility easier to see. It can define terms, distinguish evidence from interpretation, and direct readers to the underlying papers. It should not claim consensus where none has been documented or present this project’s explanations as an official committee position.'
    ],
    sourceSlugs: ['stm-outreach', 'synthesis-report'],
    featured: true,
    provenance: 'project-original',
    notice: originalContentNotice
  },
  {
    slug: 'shared-picture-not-single-database',
    title: 'A shared picture is not a single database',
    deck:
      'Precision, fusion, and a shared catalog are related ideas, but each addresses a different part of building usable orbital knowledge.',
    audience: 'Operators, data practitioners, students, and policy readers',
    readingMinutes: 4,
    body: [
      'A common picture of orbital activity begins with the quality of observations and orbital data. It also depends on how different inputs are combined and how catalog information can be shared. The report titles on precision and accuracy, data fusion, and a shared space object catalog mark these as connected but distinct questions.',
      'That distinction matters for public discussion. A shared picture does not automatically imply that every contributor uses one database or one method. It can instead describe a goal: participants need information they can interpret together, with enough clarity about provenance, precision, and limitations to support decisions.',
      'This project uses the three publication records as a reading path, not as permission to infer a particular technical architecture. Readers seeking methods, findings, or recommendations should follow the DOI links to the papers.'
    ],
    sourceSlugs: [
      'orbital-data-precision',
      'data-fusion',
      'shared-space-object-catalog'
    ],
    featured: false,
    provenance: 'project-original',
    notice: originalContentNotice
  },
  {
    slug: 'traffic-conversation-beyond-earth-orbit',
    title: 'The traffic conversation now extends beyond Earth orbit',
    deck:
      'Sub-orbital transit, expanding near-Earth activity, and Moon-to-Mars concepts widen the places and participants involved in traffic questions.',
    audience: 'Public readers, planners, educators, and emerging-space practitioners',
    readingMinutes: 4,
    body: [
      'The publication titles trace an expanding conversation. One report addresses sub-orbital activity together with airspace and ground support. Another looks at future near-Earth activity as traffic increases. A third names cislunar and cismartian environments in a Moon-to-Mars frame.',
      'Taken together, those records invite readers to think across domains. Future traffic questions may involve transitions between ground, airspace, Earth orbit, and more distant operating regions. The relevant participants, time scales, and information needs can change as the operating context changes.',
      'This article does not prescribe a framework for those environments. It identifies a public reading path through three records whose titles broaden the geographic and operational scope of the discussion.'
    ],
    sourceSlugs: [
      'sub-orbital-activities',
      'near-earth-future-activities',
      'moon-to-mars'
    ],
    featured: false,
    provenance: 'project-original',
    notice: originalContentNotice
  }
]
