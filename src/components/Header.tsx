const repositoryUrl =
  'https://github.com/nathanieldailey-rgb/tc26-outreach-lab'

export default function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to the research desk
      </a>
      <div className="site-header__inner">
        <a className="site-identity" href="#research-desk" aria-label="TC26 Outreach Lab home">
          <span className="site-identity__name">TC26 Outreach Lab</span>
          <span className="site-identity__descriptor">Public research desk</span>
        </a>

        <p className="prototype-flag">
          <span className="prototype-flag__signal" aria-hidden="true" />
          Co-chair-led prototype · committee review copy
        </p>

        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="#articles">Articles</a>
          <a href="#ask">Ask</a>
          <a href="#library">Library</a>
          <a href="#studio">Studio</a>
          <a href="#contribute">Contribute</a>
          <a href={repositoryUrl} target="_blank" rel="noopener noreferrer">
            Repository <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
