const repositoryUrl =
  'https://github.com/nathanieldailey-rgb/tc26-outreach-lab'

const contributionLanes = [
  {
    name: 'Article lane',
    description:
      'Pitch an audience, a public question, original copy, and DOI-backed source path.',
    label: 'Open an article pitch',
    href: `${repositoryUrl}/issues/new?template=article_pitch.yml`
  },
  {
    name: 'Feature lane',
    description:
      'Propose an interface, accessibility, research-navigation, or explainer improvement.',
    label: 'Open a feature request',
    href: `${repositoryUrl}/issues/new?template=feature_request.yml`
  },
  {
    name: 'Review lane',
    description:
      'Prepare a focused change for committee and maintainer review through the public repository.',
    label: 'Start a pull request',
    href: `${repositoryUrl}/pull/new/main`
  }
] as const

const decisions = [
  'Sponsor and final public name',
  'Permission to use organizational marks',
  'Editorial board and approval workflow',
  'Authors for the first derivative-article series',
  'Publisher guidance for any future use beyond metadata and links',
  'Owner and budget for the model project key and hosting',
  'Video priorities, narrators, and accessibility review'
] as const

export default function Contribute() {
  return (
    <section className="editorial-section contribute" id="contribute" aria-labelledby="contribute-title">
      <div className="section-heading section-heading--split">
        <div>
          <p className="section-index">Open working table / 06</p>
          <h2 id="contribute-title">Contribute to the prototype</h2>
        </div>
        <div className="contribute__repository">
          <p>Public working repository</p>
          <a href={repositoryUrl} target="_blank" rel="noopener noreferrer">
            View the repository <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="contribution-lanes">
        {contributionLanes.map((lane, index) => (
          <article key={lane.name}>
            <p className="contribution-lanes__number">0{index + 1}</p>
            <h3>{lane.name}</h3>
            <p>{lane.description}</p>
            <a href={lane.href} target="_blank" rel="noopener noreferrer">
              {lane.label} <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>

      <div className="decision-table">
        <div>
          <p className="eyebrow">Governance handoff</p>
          <h3>Committee decisions requested</h3>
          <p>
            This demonstrator can organize the questions. Adoption, authority, identity,
            and publication cadence remain committee decisions.
          </p>
        </div>
        <ol>
          {decisions.map((decision) => (
            <li key={decision}>{decision}</li>
          ))}
        </ol>
      </div>
    </section>
  )
}
