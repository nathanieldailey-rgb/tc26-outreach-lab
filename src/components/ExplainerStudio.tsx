import { useEffect, useState } from 'react'

const videoBriefs = [
  {
    number: '01',
    title: 'One domain, many handoffs',
    duration: '90 seconds',
    audience: 'Public and policy audiences',
    description:
      'Follow one vehicle from ground support through airspace and into an orbital environment, making each coordination responsibility visible.'
  },
  {
    number: '02',
    title: 'What makes an orbital picture shared?',
    duration: '2 minutes',
    audience: 'Students and operational readers',
    description:
      'Separate precision, data fusion, and catalog access so a shared picture is not mistaken for a single database or a claim of perfect agreement.'
  },
  {
    number: '03',
    title: 'The traffic map grows outward',
    duration: '2 minutes',
    audience: 'Emerging-space practitioners',
    description:
      'Move from sub-orbital transit to near-Earth growth and Moon-to-Mars activity while keeping the differences among operating contexts explicit.'
  }
] as const

const storyboardFrames = [
  {
    marker: 'Observe',
    title: 'A shared domain comes into view',
    text:
      'Different participants first need a legible picture of what is moving, where uncertainty remains, and which information supports a decision.'
  },
  {
    marker: 'Relate',
    title: 'Individual tracks become a traffic picture',
    text:
      'Precision, identification, fusion, and catalog access are connected layers. None alone guarantees that every participant sees the same meaning.'
  },
  {
    marker: 'Coordinate',
    title: 'Knowledge moves toward operational action',
    text:
      'Warnings, collision avoidance, servicing, reentry, and spectrum concerns introduce different actions, timelines, and operational handoffs.'
  },
  {
    marker: 'Govern',
    title: 'Responsibilities have to remain visible',
    text:
      'Registration, technical rules, compliance, and capacity questions show that traffic management is institutional as well as technical.'
  },
  {
    marker: 'Explain',
    title: 'Public understanding closes the loop',
    text:
      'Outreach helps readers locate evidence, distinguish interpretation from findings, and enter the conversation without inventing consensus.'
  }
] as const

const frameDuration = 3_500
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function motionIsReduced(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(reducedMotionQuery).matches
  )
}

function useReducedMotionPreference(): boolean {
  const [isReduced, setIsReduced] = useState(motionIsReduced)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined

    const mediaQuery = window.matchMedia(reducedMotionQuery)
    const updatePreference = (event: MediaQueryListEvent) => {
      setIsReduced(event.matches)
    }

    setIsReduced(mediaQuery.matches)
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return isReduced
}

export default function ExplainerStudio() {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const prefersReducedMotion = useReducedMotionPreference()
  const finalFrame = storyboardFrames.length - 1
  const frame = storyboardFrames[currentFrame]

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return undefined

    const timer = window.setInterval(() => {
      setCurrentFrame((index) => {
        const nextFrame = Math.min(index + 1, finalFrame)
        if (nextFrame === finalFrame) setIsPlaying(false)
        return nextFrame
      })
    }, frameDuration)

    return () => window.clearInterval(timer)
  }, [finalFrame, isPlaying, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) setIsPlaying(false)
  }, [prefersReducedMotion])

  const moveToFrame = (index: number) => {
    setIsPlaying(false)
    setCurrentFrame(Math.min(Math.max(index, 0), finalFrame))
  }

  return (
    <section className="editorial-section explainer-studio" id="studio" aria-labelledby="studio-title">
      <div className="section-heading section-heading--split">
        <div>
          <p className="section-index">Explainer studio / 05</p>
          <h2 id="studio-title">Make the operating picture move</h2>
        </div>
        <p className="section-standfirst">
          Three production-ready briefs and one committee-demo storyboard translate the
          publication map without reproducing paper content.
        </p>
      </div>

      <ul className="video-briefs" aria-label="Explainer video briefs">
        {videoBriefs.map((brief) => (
          <li key={brief.number}>
            <article>
              <p className="video-briefs__number">Brief {brief.number}</p>
              <h3>{brief.title}</h3>
              <p>{brief.description}</p>
              <dl>
                <div>
                  <dt>Run time</dt>
                  <dd>{brief.duration}</dd>
                </div>
                <div>
                  <dt>For</dt>
                  <dd>{brief.audience}</dd>
                </div>
              </dl>
            </article>
          </li>
        ))}
      </ul>

      <div
        className="storyboard"
        role="group"
        aria-labelledby="storyboard-title"
        aria-describedby={
          prefersReducedMotion
            ? 'storyboard-instructions storyboard-motion-note'
            : 'storyboard-instructions'
        }
      >
        <div className="storyboard__copy">
          <p className="eyebrow">Interactive brief / outreach as infrastructure</p>
          <h3 id="storyboard-title">Interactive explainer storyboard</h3>
          <p id="storyboard-instructions">
            Play at your pace, move one frame at a time, or use the labeled timeline.
            Playback never starts automatically.
          </p>
        </div>

        {prefersReducedMotion ? (
          <p className="storyboard__motion-note" id="storyboard-motion-note">
            Reduced motion is on. Timed playback is unavailable; use Previous, Next, or
            the frame control below.
          </p>
        ) : null}

        <div className="storyboard__stage" aria-live="polite" aria-atomic="true">
          <div className="storyboard__orbit" aria-hidden="true">
            <span className="storyboard__planet" />
            <span className="storyboard__track storyboard__track--one" />
            <span className="storyboard__track storyboard__track--two" />
            {storyboardFrames.map((_, index) => (
              <span
                className={index <= currentFrame ? 'storyboard__node is-active' : 'storyboard__node'}
                key={index}
              />
            ))}
          </div>
          <div className="storyboard__frame">
            <p className="storyboard__count">
              Frame {currentFrame + 1} of {storyboardFrames.length}
            </p>
            <p className="storyboard__marker">{frame.marker}</p>
            <h4>{frame.title}</h4>
            <p>{frame.text}</p>
          </div>
        </div>

        <div className="storyboard__controls">
          <button
            className="button button--quiet"
            type="button"
            onClick={() => moveToFrame(currentFrame - 1)}
            disabled={currentFrame === 0}
          >
            <span aria-hidden="true">← </span>Previous frame
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => setIsPlaying((playing) => !playing)}
            disabled={currentFrame === finalFrame || prefersReducedMotion}
          >
            {isPlaying ? 'Pause storyboard' : 'Play storyboard'}
          </button>
          <button
            className="button button--quiet"
            type="button"
            onClick={() => moveToFrame(currentFrame + 1)}
            disabled={currentFrame === finalFrame}
          >
            Next frame<span aria-hidden="true"> →</span>
          </button>
        </div>

        <div className="storyboard__timeline">
          <label htmlFor="storyboard-frame">Storyboard frame</label>
          <input
            id="storyboard-frame"
            type="range"
            min="1"
            max={storyboardFrames.length}
            step="1"
            value={currentFrame + 1}
            aria-valuetext={`Frame ${currentFrame + 1} of ${storyboardFrames.length}: ${frame.title}`}
            onChange={(event) => moveToFrame(Number(event.target.value) - 1)}
          />
          <div aria-hidden="true">
            <span>01</span>
            <span>05</span>
          </div>
        </div>
      </div>
    </section>
  )
}
