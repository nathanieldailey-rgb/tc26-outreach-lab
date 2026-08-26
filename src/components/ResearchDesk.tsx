export default function ResearchDesk() {
  return (
    <section className="research-desk traffic-field" id="research-desk" aria-labelledby="desk-title">
      <div className="research-desk__lead">
        <p className="section-index">Research desk / 01</p>
        <h1 id="desk-title">A public route into space traffic management</h1>
        <p className="research-desk__standfirst">
          Original explanations connect a cross-volume technical record to the questions
          that operators, policymakers, students, and public readers bring to a shared
          operating domain.
        </p>
        <p className="margin-note">
          Demonstrator status — proposed for committee review. No organizational marks or
          formal endorsement are implied.
        </p>
      </div>

      <div className="research-index" aria-label="Research desk starting points">
        <a className="research-index__entry research-index__entry--feature" href="#articles">
          <span className="research-index__number">01 / Featured reading</span>
          <strong>Outreach is part of the safety architecture</strong>
          <span>Read the four-minute original feature</span>
        </a>
        <a className="research-index__entry" href="#library">
          <span className="research-index__number">02 / Publication record</span>
          <strong>
            <span data-record-count>20</span> records across volumes
          </strong>
          <span>19 topic reports and one synthesis paper</span>
        </a>
        <a className="research-index__entry" href="#ask">
          <span className="research-index__number">03 / Source-bounded Q&amp;A</span>
          <strong>Ask the Committee</strong>
          <span>Question the public record and see every source</span>
        </a>
      </div>
    </section>
  )
}
