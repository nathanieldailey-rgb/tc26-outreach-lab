import { type FormEvent, useRef, useState } from 'react'

export type AskResponse = {
  answer: string
  mode: 'preview' | 'openai'
  sources: Array<{ title: string; href: string }>
  notice: string
}

const questionLimit = 500
const sampleQuestions = [
  'Why is outreach part of space traffic management?',
  'What are the hazards of reentry?',
  'How does traffic management change from Moon to Mars?'
]

type AskCommitteeProps = {
  question: string
  isBusy: boolean
  onBusyChange: (isBusy: boolean) => void
  onQuestionChange: (question: string) => void
}

type AnswerRecord = {
  response: AskResponse
  submittedQuestion: string
}

function hasVisibleText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isCanonicalDoiUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith('https://doi.org/')) return false

  try {
    const url = new URL(value)
    const decodedPath = decodeURIComponent(url.pathname)

    return (
      url.protocol === 'https:' &&
      url.hostname === 'doi.org' &&
      url.username === '' &&
      url.password === '' &&
      url.port === '' &&
      url.search === '' &&
      url.hash === '' &&
      /^\/10\.\d{4,9}\/[^\s]+$/i.test(decodedPath)
    )
  } catch {
    return false
  }
}

function isAskResponse(value: unknown): value is AskResponse {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<AskResponse>
  return (
    hasVisibleText(candidate.answer) &&
    (candidate.mode === 'preview' || candidate.mode === 'openai') &&
    Array.isArray(candidate.sources) &&
    candidate.sources.every(
      (source) =>
        source !== null &&
        typeof source === 'object' &&
        hasVisibleText(source.title) &&
        isCanonicalDoiUrl(source.href)
    ) &&
    hasVisibleText(candidate.notice)
  )
}

export default function AskCommittee({
  question,
  isBusy,
  onBusyChange,
  onQuestionChange
}: AskCommitteeProps) {
  const [status, setStatus] = useState('Ready for a question.')
  const [validationError, setValidationError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [answer, setAnswer] = useState<AnswerRecord | null>(null)
  const requestInFlight = useRef(false)

  const chooseSample = (sample: string) => {
    if (isBusy) return

    onQuestionChange(sample)
    setValidationError('')
    setRequestError('')
    setStatus('Sample question ready to submit.')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isBusy || requestInFlight.current) return

    const boundedQuestion = question.trim()

    setAnswer(null)
    setRequestError('')

    if (boundedQuestion.length === 0) {
      setValidationError('Enter a question before submitting.')
      setStatus('Enter a question before submitting.')
      return
    }

    if (boundedQuestion.length > questionLimit) {
      setValidationError(`Keep the question to ${questionLimit} characters or fewer.`)
      setStatus(`Keep the question to ${questionLimit} characters or fewer.`)
      return
    }

    setValidationError('')
    requestInFlight.current = true
    onBusyChange(true)
    setStatus('Researching the public record…')

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: boundedQuestion })
      })

      if (!response.ok) {
        throw new Error(`Ask request failed with status ${response.status}`)
      }

      const payload: unknown = await response.json()
      if (!isAskResponse(payload)) {
        setRequestError(
          'The Ask response was rejected because its content or source links did not meet the public trust contract. No answer or source link was rendered.'
        )
        setStatus('Response rejected. No untrusted content was rendered.')
        return
      }

      setAnswer({ response: payload, submittedQuestion: boundedQuestion })
      setStatus('Answer ready. Sources and mode are shown below.')
    } catch {
      setRequestError(
        'The Ask service is not available in this interface-only prototype yet. The source-bounded API arrives in Task 3; no answer has been generated.'
      )
      setStatus('Request could not be completed. No answer was generated.')
    } finally {
      requestInFlight.current = false
      onBusyChange(false)
    }
  }

  return (
    <section className="editorial-section committee-query" id="ask" aria-labelledby="ask-title">
      <div className="committee-query__context">
        <p className="section-index">Public questions / 03</p>
        <h2 id="ask-title">Ask the Committee</h2>
        <p className="section-standfirst">
          Ask a plain-language question. The answer pathway is designed to use only
          project-owned explanations and bibliographic metadata, then show its mode and
          sources.
        </p>
        <p className="margin-note">
          Answers are interpretive aids. They do not establish policy, replace a paper,
          or represent an official committee position.
        </p>
      </div>

      <div className="committee-query__workspace" aria-busy={isBusy}>
        <form onSubmit={handleSubmit} noValidate>
          <div
            className="submission-notice"
            role="note"
            aria-labelledby="question-data-notice-title"
            id="question-data-notice"
          >
            <h3 id="question-data-notice-title">Before you submit</h3>
            <p>
              Live mode may send your question, public site context, and a
              pseudonymous safety identifier to OpenAI. Do not submit personal,
              confidential, controlled, or proprietary information. <code>store:false</code>{' '}
              does not promise zero abuse-monitoring retention.
            </p>
          </div>
          <label htmlFor="committee-question">Your question</label>
          <textarea
            id="committee-question"
            value={question}
            disabled={isBusy}
            onChange={(event) => {
              if (isBusy) return
              onQuestionChange(event.target.value)
              if (validationError) setValidationError('')
            }}
            aria-describedby="question-data-notice question-guidance question-count question-validation"
            aria-invalid={validationError ? 'true' : 'false'}
            rows={4}
          />
          <div className="question-meta">
            <span id="question-guidance">Plain language works best.</span>
            <span id="question-count" className={question.length > questionLimit ? 'text-alert' : undefined}>
              {question.length} / {questionLimit}
            </span>
          </div>
          <p className="form-error" id="question-validation">
            {validationError}
          </p>
          <button
            className="button button--primary"
            type="submit"
            disabled={isBusy}
            aria-label="Ask this question"
          >
            {isBusy ? 'Researching…' : 'Ask this question'}
          </button>
        </form>

        <div className="sample-questions">
          <p>Try a question</p>
          <div>
            {sampleQuestions.map((sample) => (
              <button
                type="button"
                key={sample}
                disabled={isBusy}
                onClick={() => chooseSample(sample)}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <p className="query-status" role="status" aria-live="polite" aria-atomic="true">
          {status}
        </p>

        {requestError ? <p className="query-error">{requestError}</p> : null}

        {answer ? (
          <article className="answer" aria-labelledby="answer-title">
            <header>
              <p className={`mode-label mode-label--${answer.response.mode}`}>
                {answer.response.mode === 'preview'
                  ? 'Deterministic preview mode'
                  : 'OpenAI-assisted mode'}
              </p>
              <h3 id="answer-title">Response from the public record</h3>
            </header>
            <div className="answer__question">
              <p>Question submitted</p>
              <blockquote>{answer.submittedQuestion}</blockquote>
            </div>
            <p className="answer__text">{answer.response.answer}</p>
            {answer.response.sources.length > 0 ? (
              <div className="answer__sources">
                <h4>Sources used</h4>
                <ol>
                  {answer.response.sources.map((source) => (
                    <li key={`${source.href}-${source.title}`}>
                      <a href={source.href} target="_blank" rel="noopener noreferrer">
                        {source.title} <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            <p className="answer__notice">{answer.response.notice}</p>
          </article>
        ) : null}
      </div>
    </section>
  )
}
