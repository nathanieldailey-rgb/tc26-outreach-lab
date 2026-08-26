import { useState } from 'react'

import ArticleFeature from './components/ArticleFeature'
import AskCommittee from './components/AskCommittee'
import Contribute from './components/Contribute'
import ExplainerStudio from './components/ExplainerStudio'
import Header from './components/Header'
import PublicationLibrary from './components/PublicationLibrary'
import ResearchDesk from './components/ResearchDesk'

export default function App() {
  const [question, setQuestion] = useState('')

  const moveQuestionToAsk = (draft: string) => {
    setQuestion(draft)

    const askSection = document.getElementById('ask')
    const askInput = document.getElementById('committee-question')

    askSection?.scrollIntoView?.({ block: 'start' })
    askInput?.focus()
  }

  return (
    <>
      <Header />
      <main id="main-content">
        <ResearchDesk onStartQuestion={moveQuestionToAsk} />
        <ArticleFeature />
        <AskCommittee question={question} onQuestionChange={setQuestion} />
        <PublicationLibrary />
        <ExplainerStudio />
        <Contribute />
      </main>
      <footer className="site-footer">
        <div>
          <p className="site-footer__title">TC26 Outreach Lab · prototype record</p>
          <p>
            Project-original public interpretation and bibliographic navigation. Publisher
            papers remain authoritative for their own findings.
          </p>
        </div>
        <div>
          <p>No institutional logos or marks are used.</p>
          <p>Generated answers are not an official committee position.</p>
          <p>Prototype for review; no formal adoption or endorsement is claimed.</p>
        </div>
      </footer>
    </>
  )
}
