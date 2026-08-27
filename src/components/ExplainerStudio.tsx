import { useEffect, useState } from 'react'

const videoBriefs = [
  {
    number: '01',
    title: 'Outreach Is Part of the Safety Architecture',
    duration: '75 seconds',
    audience: 'Students, public communicators, policy staff, and new operators',
    description:
      'Show how shared understanding and feedback affect the quality of space-traffic decisions. This first concept is represented by the interactive storyboard below.'
  },
  {
    number: '02',
    title: 'Reentry Does Not End at an Orbital Boundary',
    duration: '80 seconds',
    audience: 'Public-safety officials, regulators, journalists, and interested residents',
    description:
      'Show why reentry connects orbital knowledge with terrestrial coordination while distinguishing known facts, uncertainty, and the next update.'
  },
  {
    number: '03',
    title: 'Traffic Management Beyond Earth Orbit',
    duration: '75 seconds',
    audience: 'Program leaders, emerging-space practitioners, educators, and the public',
    description:
      'Introduce the coordination questions that grow as missions move from Earth orbit toward the Moon and Mars.'
  }
] as const

const storyboardFrames = [
  {
    marker: 'Share',
    title: 'One environment. Many decisions.',
    text:
      'Space traffic management is a coordination problem shared by people with different roles, responsibilities, and information.'
  },
  {
    marker: 'Translate',
    title: 'Evidence becomes meaning, then action',
    text:
      'A warning works only when its meaning survives the handoffs from sensors to operators, and from specialists to decision makers and the public.'
  },
  {
    marker: 'Listen',
    title: 'Outreach is a feedback loop',
    text:
      'Questions and misunderstandings reveal where terms, assumptions, and procedures need clarification; outreach is more than broadcasting.'
  },
  {
    marker: 'Source',
    title: 'Send readers to the full work',
    text:
      'Good outreach identifies its sources and guides readers to the committee publication record instead of replacing the technical papers.'
  },
  {
    marker: 'Invite',
    title: 'Ask. Read. Contribute.',
    text:
      'A stronger traffic community can understand the evidence, question interpretations, and help improve what comes next.'
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
          Three concepts total: one interactive storyboard plus two additional briefs.
          The storyboard represents the first Outreach concept; it is not a fourth idea.
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
          <p className="eyebrow">
            Concept 1 · interactive storyboard / Outreach Is Part of the Safety Architecture
          </p>
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
