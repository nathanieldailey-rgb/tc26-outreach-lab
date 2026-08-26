import { useMemo, useState } from 'react'

import { articles } from '../content/articles'
import { doiUrl, publications } from '../content/publications'

export default function ArticleFeature() {
  const initialArticle = articles.find(({ featured }) => featured) ?? articles[0]
  const [selectedSlug, setSelectedSlug] = useState(initialArticle.slug)
  const selectedArticle =
    articles.find(({ slug }) => slug === selectedSlug) ?? initialArticle
  const sources = useMemo(
    () =>
      selectedArticle.sourceSlugs.flatMap((sourceSlug) => {
        const publication = publications.find(({ slug }) => slug === sourceSlug)
        return publication ? [publication] : []
      }),
    [selectedArticle]
  )

  return (
    <section className="editorial-section article-feature" id="articles" aria-labelledby="articles-title">
      <div className="section-heading section-heading--split">
        <div>
          <p className="section-index">Original features / 02</p>
          <h2 id="articles-title">Featured outreach article</h2>
        </div>
        <div className="article-selector">
          <label htmlFor="article-select">Choose an outreach article</label>
          <select
            id="article-select"
            value={selectedArticle.slug}
            onChange={(event) => setSelectedSlug(event.target.value)}
          >
            {articles.map((article) => (
              <option key={article.slug} value={article.slug}>
                {article.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <article className="feature-story" aria-labelledby={`article-${selectedArticle.slug}`}>
        <div className="feature-story__header">
          <p className="feature-story__kicker">
            Project-original · {selectedArticle.readingMinutes} minute read
          </p>
          <h3 id={`article-${selectedArticle.slug}`}>{selectedArticle.title}</h3>
          <p className="feature-story__deck">{selectedArticle.deck}</p>
          <dl className="article-metadata">
            <div>
              <dt>For</dt>
              <dd>{selectedArticle.audience}</dd>
            </div>
            <div>
              <dt>Evidence path</dt>
              <dd>{sources.length} DOI-backed {sources.length === 1 ? 'record' : 'records'}</dd>
            </div>
          </dl>
        </div>

        <div className="feature-story__body">
          {selectedArticle.body.map((paragraph, index) => (
            <p data-testid="article-paragraph" key={`${selectedArticle.slug}-${index}`}>
              {paragraph}
            </p>
          ))}
        </div>

        <aside className="source-pathways" aria-label="Article source pathways">
          <p className="source-pathways__label">Continue into the publication record</p>
          <ol>
            {sources.map((publication) => (
              <li key={publication.slug}>
                <span className="source-pathways__reference">
                  Ref. {publication.sequence} · {publication.journal} {publication.volume} ({publication.year})
                </span>
                <strong>{publication.title}</strong>
                <a
                  href={doiUrl(publication.doi)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the full paper <span className="sr-only">— {publication.title}</span>
                  <span aria-hidden="true"> ↗</span>
                </a>
              </li>
            ))}
          </ol>
          <p className="source-pathways__notice">{selectedArticle.notice}</p>
        </aside>
      </article>
    </section>
  )
}
