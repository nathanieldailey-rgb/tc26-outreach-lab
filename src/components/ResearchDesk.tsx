import { type FormEvent, useRef, useState } from 'react'

type ResearchDeskProps = {
  isAskBusy: boolean
  onStartQuestion: (question: string) => void
}

export default function ResearchDesk({
  isAskBusy,
  onStartQuestion
}: ResearchDeskProps) {
  const [draft, setDraft] = useState('')
  const [validationError, setValidationError] = useState('')
  const questionInput = useRef<HTMLInputElement>(null)

  const submitQuestionStarter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isAskBusy) return

    const question = draft.trim()

    if (!question) {
      setValidationError('Enter a question to continue to the full Ask workspace.')
      questionInput.current?.focus()
      return
    }

    setValidationError('')
    onStartQuestion(question)
  }

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
        <form
          className="question-starter"
          aria-label="Start an Ask the Committee question"
          onSubmit={submitQuestionStarter}
          noValidate
        >
          <label htmlFor="starter-question">Start with a question</label>
          <div className="question-starter__control">
            <input
              ref={questionInput}
              id="starter-question"
              type="text"
              value={draft}
              maxLength={500}
              disabled={isAskBusy}
              aria-describedby="starter-guidance starter-validation"
              aria-invalid={validationError ? 'true' : 'false'}
              onChange={(event) => {
                if (isAskBusy) return
                setDraft(event.target.value)
                if (validationError) setValidationError('')
              }}
            />
            <button type="submit" disabled={isAskBusy}>
              Take this question to Ask
            </button>
          </div>
          <p id="starter-guidance">
            Draft here, then continue to the full source-bounded question workspace.
          </p>
          <p id="starter-validation" role="status" aria-live="polite">
            {validationError}
          </p>
        </form>
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
        <a className="research-index__entry" href="#studio">
          <span className="research-index__number">04 / Explainer media</span>
          <strong>Videos / Studio</strong>
          <span>Review three briefs and control the storyboard</span>
        </a>
      </div>
    </section>
  )
}
