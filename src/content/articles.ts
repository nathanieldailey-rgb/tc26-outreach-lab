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
      'For this project, a useful starting picture of space traffic management includes sensors, catalogs, conjunction warnings, and rules. Technical information does not explain its own meaning, audience, or urgency, so our editorial question is how people’s understanding affects the use of those elements. That is why this project treats outreach as part of the safety architecture, not as publicity added after the technical work is finished. We do not claim the cited papers prove that framing. We offer it as a way to examine how specialized knowledge might be used across a varied space community whose participants can have different missions, authorities, vocabularies, and levels of technical access.',
      'The publication record itself gives this idea a visible place. “Outreach on Space Traffic Management” appears as topic report 15 in this project’s Foundations cluster. It was published in Acta Astronautica, volume 229, in 2025, on pages 250–259, with DOI 10.1016/j.actaastro.2025.01.031. Those facts establish the paper’s identity and location in the series. They do not, by themselves, tell us what the authors found, which audiences they examined, or what actions they may have proposed.',
      'The project’s editorial interpretation begins with that placement: outreach is grouped here with foundations. We read that choice as an invitation to think about communication as enabling infrastructure. In this reading, outreach can help make specialized ideas legible beyond the circles that produce them. It can also create conditions in which operators, authorities, researchers, commercial participants, and public audiences are better able to recognize a shared problem. This is an interpretation of the publication map, not a reported finding from the paper and not an official position of the committee named in the series.',
      'A second publication broadens the frame without supplying details we have not verified. “IAF – IISL – IAA initiative on space traffic management: Synthesis report on IAF technical committee TC 26 on space traffic management” was published in Acta Astronautica, volume 232, in 2025, on pages 706–720, with DOI 10.1016/j.actaastro.2025.03.024. The catalog identifies it as a synthesis rather than a topic report and this project also places it in Foundations. Its title signals a relationship to the wider TC 26 initiative, but the metadata alone does not establish the synthesis report’s conclusions, priorities, or endorsement of any particular outreach model.',
      'Read together at the level of title, type, and placement, the two records suggest a useful editorial question: how does a specialized body of work become shared understanding? A topic report devoted to outreach exists within the same public record as a separate synthesis report about the initiative. Their coexistence does not prove influence or adoption, and we should not imply either. It does, however, make outreach visible within the architecture of the publication set. In this project’s reading, that visibility matters because the existence of technical information does not by itself establish shared understanding.',
      'The practical so-what is modest but consequential. Readers can approach outreach as a safety-relevant design question: who must understand a concept, what context do they need, and how might misunderstanding affect coordination? Those questions are ours, offered by this project to help readers navigate the record. They are not attributed recommendations from either paper, and they should not be read as an official committee position. The verified papers remain the authoritative sources for their own findings. Our narrower claim is editorial: a field concerned with shared movement, shared information, and shared responsibilities should also pay close attention to how understanding is built and maintained.'
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
      'This project starts with a tempting image: treat a common operating picture as a technology purchase, build one authoritative database, and consider the coordination problem solved. We use three titles in the TC 26 publication record to test that image. “Improvement of orbital data precision and accuracy,” “Space traffic management: Data fusion,” and “Space traffic management: A shared space object catalog” name different parts of the knowledge problem. In our editorial reading, those distinctions make the one-database image too tidy and suggest that sharing a picture involves more than opening a catalog and seeing objects on a screen.',
      'That sequence is an editorial interpretation by this project, not a summary of the papers’ findings or an official position of TC 26, the journals, or their publishers. The public metadata establishes only that all three are topic reports in this project’s Orbital Knowledge cluster, published in Acta Astronautica in 2025. Their titles provide a useful set of distinctions, but they do not, by themselves, tell us what methods the authors assessed, what results they reported, or what institutional arrangements they favored. Those questions belong with the papers themselves.',
      'Start with precision and accuracy. In this project’s editorial reading, the title “Improvement of orbital data precision and accuracy” turns attention toward the quality of what is known about an object, not merely whether a record exists. For public orientation, our concern is modest but consequential: a larger collection is not automatically a clearer one. Counts, updates, and coverage may matter, but understanding the character of the underlying information can still matter as well. The title does not establish a particular quality threshold or prescribe how improvement should occur. Our reading simply asks readers to look behind a shared display and consider whether meaningful differences in the data remain visible.',
      '“Data fusion” introduces a second layer in our editorial map. Combining information is not the same act as producing each input, and it is not automatically the same as agreeing on the result. For this public explanation, fusion can be understood as bringing sources into relation: asking what can be compared, where descriptions may differ, and what context might help people interpret the combined picture. That is a conceptual reading of the title, not a reported method from the article. Our concern is that a polished output may make uncertainty, provenance, or disagreement less visible precisely when a user would benefit from seeing it.',
      'The phrase “a shared space object catalog” adds the social word: shared. This project reads that word as broader than “centralized.” A catalog could be shared through common access, common references, exchange arrangements, or other forms of coordination; the metadata does not specify which model the paper advances. Nor does the title prove that every participant would see identical data at the same moment or interpret it identically. For this project, it raises a useful public question: shared by whom, for what decisions, under what expectations about quality and meaning?',
      'Our practical lesson is not that one database is useless. It is that infrastructure alone may not carry the full burden implied by a shared picture. Data quality, combination, and catalog-level sharing are separate ideas in the titles, even when an implementation might connect them. Our concern is that treating those ideas as synonyms may create false confidence in visible agreement. This project therefore presents the three records as an invitation to examine layers of orbital knowledge rather than as a packaged solution. Readers who need the authors’ findings, recommendations, or precise technical claims should follow the cited papers; our purpose here is to make the public conversation more exact before the technical conversation begins.'
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
      'Sub-orbital transit, expanding near-Earth activity, and Moon-to-Mars concepts widen the places and operating contexts involved in traffic questions.',
    audience: 'Public readers, planners, educators, and emerging-space practitioners',
    readingMinutes: 4,
    body: [
      'This project begins with a familiar picture of space traffic: satellites circling Earth. We use three titles in the TC 26 publication record to ask whether that picture is wide enough. One links sub-orbital activity with transit through airspace and ground support; another addresses future activity in near-Earth space amid increasing traffic; a third names cislunar and cismartian environments in a Moon-to-Mars context. In our editorial reading, those titles widen the frame and caution against discussing “traffic” as though every movement occurs in the same region, touches the same systems, or raises the same coordination questions.',
      'This widening frame is the project’s editorial interpretation, not a statement of the papers’ findings and not an official position of TC 26, Acta Astronautica, or the publisher. The public metadata shows that the three works are topic reports in this project’s Future Domains cluster. The sub-orbital and near-Earth reports appeared in 2024; the Moon-to-Mars report appeared in 2025. Their titles identify subjects and settings. They do not establish what conclusions the authors reached, which challenges they ranked highest, or what strategic framework they endorsed.',
      'The first title, “Context and perspectives of sub-orbital activities and transit through airspace/ground support activities,” places sub-orbital activity alongside airspace transit and ground support. That wording makes multiple operating contexts visible at the level of the title alone. This project does not infer particular rules, risks, or remedies from it. Instead, we use the title to ask whether some traffic questions might begin before a vehicle reaches space and continue through operational handoffs that an orbital map alone would not describe. That is our prompt for readers, not a reported conclusion from the paper.',
      'The second title, “Future activities in the near-earth space in the face of ever-increasing space traffic,” shifts attention from a particular transition to a changing operating environment. “Future activities” leaves the category broad, while “ever-increasing space traffic” supplies the condition against which those activities are considered. The title does not quantify that increase or specify its consequences. Editorially, however, it prompts a disciplined question: as activity grows or diversifies, which assumptions about coordination remain sound, and which need to be examined again rather than carried forward by habit?',
      'The third title makes the largest geographic move: “Moon to mars: Challenges and strategic frameworks for space traffic management in cislunar and cismartian environments.” Cislunar and cismartian are named as environments in the public record. That does not mean the paper declares Earth-orbit practices obsolete, nor can the title tell us which practices might transfer. Editorially, the change in distance raises questions for this project about actors, timelines, and dependencies, none of which the title specifies. In our reading, the record signals that space traffic management is being considered across a longer arc of activity where familiar labels may cover unfamiliar operating contexts.',
      'Placed side by side, the three records create an editorial map, not a roadmap. One edge touches ground support and airspace; another spans future activity near Earth; the third reaches toward the Moon and Mars. Our so-what is that scope should be stated before solutions are compared. Our caution is that a framework suited to one environment should not automatically be assumed to govern another simply because both are called “space traffic.” This feature makes no claim about the papers’ findings or recommendations. It invites readers to use the publication titles as signposts, then consult the cited articles for the authors’ evidence, arguments, and formal conclusions.'
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
