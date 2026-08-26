import { type FormEvent, useState } from 'react'

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
  onQuestionChange: (question: string) => void
}

function isAskResponse(value: unknown): value is AskResponse {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<AskResponse>
  return (
    typeof candidate.answer === 'string' &&
    (candidate.mode === 'preview' || candidate.mode === 'openai') &&
    Array.isArray(candidate.sources) &&
    candidate.sources.every(
      (source) =>
        source !== null &&
        typeof source === 'object' &&
        typeof source.title === 'string' &&
        typeof source.href === 'string'
    ) &&
    typeof candidate.notice === 'string'
  )
}

export default function AskCommittee({
  question,
  onQuestionChange
}: AskCommitteeProps) {
  const [status, setStatus] = useState('Ready for a question.')
  const [validationError, setValidationError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [answer, setAnswer] = useState<AskResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const chooseSample = (sample: string) => {
    onQuestionChange(sample)
    setValidationError('')
    setRequestError('')
    setStatus('Sample question ready to submit.')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
    setIsLoading(true)
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
        throw new Error('Ask response did not match the public response contract')
      }

      setAnswer(payload)
      setStatus('Answer ready. Sources and mode are shown below.')
    } catch {
      setRequestError(
        'The Ask service is not available in this interface-only prototype yet. The source-bounded API arrives in Task 3; no answer has been generated.'
      )
      setStatus('Request could not be completed. No answer was generated.')
    } finally {
      setIsLoading(false)
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

      <div className="committee-query__workspace">
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="committee-question">Your question</label>
          <textarea
            id="committee-question"
            value={question}
            onChange={(event) => {
              onQuestionChange(event.target.value)
              if (validationError) setValidationError('')
            }}
            aria-describedby="question-guidance question-count question-validation"
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
            disabled={isLoading}
            aria-label="Ask this question"
          >
            {isLoading ? 'Researching…' : 'Ask this question'}
          </button>
        </form>

        <div className="sample-questions">
          <p>Try a question</p>
          <div>
            {sampleQuestions.map((sample) => (
              <button type="button" key={sample} onClick={() => chooseSample(sample)}>
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
              <p className={`mode-label mode-label--${answer.mode}`}>
                {answer.mode === 'preview'
                  ? 'Deterministic preview mode'
                  : 'OpenAI-assisted mode'}
              </p>
              <h3 id="answer-title">Response from the public record</h3>
            </header>
            <p className="answer__text">{answer.answer}</p>
            {answer.sources.length > 0 ? (
              <div className="answer__sources">
                <h4>Sources used</h4>
                <ol>
                  {answer.sources.map((source) => (
                    <li key={`${source.href}-${source.title}`}>
                      <a href={source.href} target="_blank" rel="noopener noreferrer">
                        {source.title} <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            <p className="answer__notice">{answer.notice}</p>
          </article>
        ) : null}
      </div>
    </section>
  )
}
