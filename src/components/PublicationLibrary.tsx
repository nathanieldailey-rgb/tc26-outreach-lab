import { useMemo, useState } from 'react'

import {
  doiUrl,
  publications,
  topicClusters,
  type TopicCluster
} from '../content/publications'

type ClusterFilter = TopicCluster | 'All'

export default function PublicationLibrary() {
  const [query, setQuery] = useState('')
  const [cluster, setCluster] = useState<ClusterFilter>('All')

  const filteredPublications = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('en')

    return publications.filter((publication) => {
      const matchesCluster = cluster === 'All' || publication.cluster === cluster
      const searchableRecord = [
        publication.title,
        publication.journal,
        publication.volume,
        publication.year,
        publication.doi,
        publication.cluster
      ]
        .join(' ')
        .toLocaleLowerCase('en')

      return matchesCluster && searchableRecord.includes(normalizedQuery)
    })
  }, [cluster, query])

  const resetLibrary = () => {
    setQuery('')
    setCluster('All')
  }

  return (
    <section className="editorial-section publication-library" id="library" aria-labelledby="library-title">
      <div className="section-heading section-heading--library">
        <div>
          <p className="section-index">Publication record / 04</p>
          <h2 id="library-title">Publication library</h2>
          <p className="section-standfirst">
            Twenty DOI-linked records form a virtual collection across journal volumes:
            nineteen topic reports plus one synthesis paper, not one conventional bound
            issue.
          </p>
        </div>
        <p className="collection-fact" aria-label="20 publication records">
          <strong>20</strong>
          <span>cross-volume records</span>
        </p>
      </div>

      <div className="topic-map">
        <div className="topic-map__intro">
          <p className="eyebrow">Editorial index</p>
          <h3>Five-cluster topic map</h3>
          <p>Select a cluster to use the map as a library filter.</p>
        </div>
        <ul aria-label="Five topic clusters">
          {topicClusters.map((topic, index) => (
            <li key={topic}>
              <button
                type="button"
                aria-pressed={cluster === topic}
                onClick={() => setCluster(cluster === topic ? 'All' : topic)}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <strong>{topic}</strong>
                <small>
                  {publications.filter((publication) => publication.cluster === topic).length}{' '}
                  records
                </small>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="library-controls">
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="publication-search">Search publications</label>
          <input
            id="publication-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try reentry, catalog, or Moon"
          />
        </form>
        <div>
          <label htmlFor="cluster-filter">Filter by topic cluster</label>
          <select
            id="cluster-filter"
            value={cluster}
            onChange={(event) => setCluster(event.target.value as ClusterFilter)}
          >
            <option value="All">All clusters</option>
            {topicClusters.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
        <button className="button button--quiet" type="button" onClick={resetLibrary}>
          Reset library
        </button>
      </div>

      <p className="result-count" aria-live="polite" aria-atomic="true">
        {filteredPublications.length}{' '}
        {filteredPublications.length === 1 ? 'publication' : 'publications'}
      </p>

      {filteredPublications.length === 0 ? (
        <div className="empty-state">
          <p>No publications match this query and cluster.</p>
          <button className="text-button" type="button" onClick={resetLibrary}>
            Clear the search and show all records
          </button>
        </div>
      ) : null}

      <ol className="publication-results" aria-label="Publication results">
        {filteredPublications.map((publication) => (
          <li key={publication.slug}>
            <div className="publication-results__reference">
              <span>{publication.sequence}</span>
              <small>{publication.cluster}</small>
            </div>
            <div className="publication-results__record">
              <h3>{publication.title}</h3>
              <p>
                {publication.journal} · Vol. {publication.volume} · {publication.year} · pp.{' '}
                {publication.pages}
              </p>
              <p className="doi">DOI {publication.doi}</p>
            </div>
            <a
              className="publication-results__link"
              href={doiUrl(publication.doi)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${publication.title} — Read the full paper`}
            >
              Read the full paper <span className="sr-only">— {publication.title}</span>
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
