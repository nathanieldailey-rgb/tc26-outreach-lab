import { useState } from 'react'

import ArticleFeature from './components/ArticleFeature'
import AskCommittee from './components/AskCommittee'
import Contribute from './components/Contribute'
import ExplainerStudio from './components/ExplainerStudio'
import Header from './components/Header'
import PublicationLibrary from './components/PublicationLibrary'
import ResearchDesk from './components/ResearchDesk'

const contentPolicyUrl =
  'https://github.com/nathanieldailey-rgb/tc26-outreach-lab/blob/main/CONTENT_POLICY.md'

export default function App() {
  const [question, setQuestion] = useState('')
  const [isAskBusy, setIsAskBusy] = useState(false)

  const moveQuestionToAsk = (draft: string) => {
    if (isAskBusy) return

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
        <ResearchDesk
          isAskBusy={isAskBusy}
          onStartQuestion={moveQuestionToAsk}
        />
        <ArticleFeature />
        <AskCommittee
          question={question}
          isBusy={isAskBusy}
          onBusyChange={setIsAskBusy}
          onQuestionChange={setQuestion}
        />
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
          <p>© 2026 Dr. Nate Dailey and TC26 Outreach Lab contributors.</p>
        </div>
        <div>
          <p>Source code is available under the MIT License.</p>
          <p>
            Editorial and media content: rights reserved pending a committee decision.{' '}
            <a href={contentPolicyUrl} target="_blank" rel="noopener noreferrer">
              Read the content and rights policy <span aria-hidden="true">↗</span>
            </a>
          </p>
          <p>No institutional logos or marks are used.</p>
          <p>Generated answers are not an official committee position.</p>
          <p>Prototype for review; no formal adoption or endorsement is claimed.</p>
        </div>
      </footer>
    </>
  )
}
