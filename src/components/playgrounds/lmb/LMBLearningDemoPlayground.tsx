import React, { useState, useMemo } from 'react'
import { Play, RotateCcw, FastForward } from 'lucide-react'

const STEP_SNAPSHOTS = [
  {
    step: 0,
    loss: 3.30,
    valLoss: 3.31,
    beat: 'Initialized with random static',
    sample: 'xqz kjwvplm nrtb zqpxykc wv',
    topPairs: [
      { pair: 'xq', prob: 0.04 },
      { pair: 'zk', prob: 0.04 },
      { pair: 'th', prob: 0.04 },
      { pair: 'he', prob: 0.04 },
    ],
  },
  {
    step: 100,
    loss: 2.82,
    valLoss: 2.85,
    beat: 'Spaces & vowel frequencies discovered',
    sample: 't e a o i n s r h l d c u m',
    topPairs: [
      { pair: 'e ', prob: 0.18 },
      { pair: 't ', prob: 0.14 },
      { pair: 'th', prob: 0.11 },
      { pair: 'he', prob: 0.09 },
    ],
  },
  {
    step: 500,
    loss: 2.41,
    valLoss: 2.44,
    beat: 'Strong pairs (th, he, an, in) emerge',
    sample: 'the and hin the caton sathe',
    topPairs: [
      { pair: 'th', prob: 0.42 },
      { pair: 'he', prob: 0.38 },
      { pair: 'in', prob: 0.27 },
      { pair: 'an', prob: 0.24 },
    ],
  },
  {
    step: 2000,
    loss: 2.12,
    valLoss: 2.15,
    beat: 'Pronounceable word-like bursts',
    sample: 'the lithe cat sat on the mat',
    topPairs: [
      { pair: 'th', prob: 0.64 },
      { pair: 'he', prob: 0.59 },
      { pair: 'qu', prob: 0.88 },
      { pair: 'at', prob: 0.35 },
    ],
  },
  {
    step: 5000,
    loss: 1.98,
    valLoss: 2.01,
    beat: 'Settled against the 1-letter entropy floor (1.95)',
    sample: 'the little cat sat in the sun',
    topPairs: [
      { pair: 'qu', prob: 0.96 },
      { pair: 'th', prob: 0.74 },
      { pair: 'he', prob: 0.68 },
      { pair: 'at', prob: 0.44 },
    ],
  },
]

const FOUR_BEATS = [
  { name: '1. Forward', desc: 'Compute next-letter probabilities from current 729 weights' },
  { name: '2. Loss', desc: 'Score surprise (-ln p) against the true next letter' },
  { name: '3. Backward', desc: 'Backpropagate exact blame (gradient) to all 729 weights' },
  { name: '4. Step', desc: 'Nudge every weight slightly downhill' },
]

export function WatchModelLearnDemo() {
  const [snapIdx, setSnapIdx] = useState(0)
  const [beatIdx, setBeatIdx] = useState(0)

  const current = STEP_SNAPSHOTS[snapIdx]

  const advance = () => {
    setBeatIdx((b) => (b + 1) % 4)
    setSnapIdx((s) => Math.min(STEP_SNAPSHOTS.length - 1, s + 1))
  }

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Watch a Tiny 729-Weight Model Learn
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={snapIdx >= STEP_SNAPSHOTS.length - 1}
            onClick={advance}
            className="px-3 py-1 rounded-lg bg-[#f6e9c7] text-[#1a1813] text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Play size={12} />
            <span>Run Training Steps</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSnapIdx(0)
              setBeatIdx(0)
            }}
            className="px-2.5 py-1 rounded-lg bg-[#22211d] text-[#d6d3d1] border border-white/10 text-xs flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* 4-Beat Loop Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FOUR_BEATS.map((b, i) => {
            const active = i === beatIdx
            return (
              <div
                key={b.name}
                onClick={() => setBeatIdx(i)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#f6e9c7]/15 border-[#f6e9c7] text-[#fdfbf7]'
                    : 'bg-[#1b1a17] border-white/10 text-[#a8a29e]'
                }`}
              >
                <div className="text-xs font-mono font-bold text-[#f6e9c7]">{b.name}</div>
                <div className="text-[11px] leading-snug mt-0.5">{b.desc}</div>
              </div>
            )
          })}
        </div>

        {/* Step Scrubber */}
        <div className="flex flex-wrap gap-2">
          {STEP_SNAPSHOTS.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setSnapIdx(idx)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition-all cursor-pointer ${
                snapIdx === idx
                  ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] font-bold'
                  : 'bg-[#1b1a17] text-[#d6d3d1] border-white/10'
              }`}
            >
              Step {s.step} (loss {s.loss.toFixed(2)})
            </button>
          ))}
        </div>

        {/* 3 Panels: Loss Curve, Learned Pair Weights, Live Generated Text */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Panel 1: Loss & Entropy Floor */}
          <div className="p-3.5 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#a8a29e]">1. Cross-Entropy Loss</span>
              <span className="text-[#10b981] font-bold">{current.loss.toFixed(2)} nats</span>
            </div>
            <svg viewBox="0 0 220 110" className="w-full h-28 overflow-visible">
              {/* Entropy Floor dashed line at y=85 */}
              <line
                x1="15"
                y1="85"
                x2="205"
                y2="85"
                stroke="#f6e9c7"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text x="18" y="81" fontSize="7.5" fontFamily="monospace" fill="#f6e9c7">
                1-letter floor (1.95)
              </text>

              {/* Loss curve up to current step */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={STEP_SNAPSHOTS.slice(0, snapIdx + 1)
                  .map((s, i) => {
                    const x = 15 + (i / (STEP_SNAPSHOTS.length - 1)) * 190
                    const y = 15 + ((3.35 - s.loss) / 1.45) * 70
                    return `${x},${y}`
                  })
                  .join(' ')}
              />
            </svg>
            <div className="text-[11px] text-[#a8a29e]">{current.beat}</div>
          </div>

          {/* Panel 2: Emerging Pair Weights */}
          <div className="p-3.5 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2">
            <div className="text-xs font-mono text-[#a8a29e]">
              2. 27×27 Bigram Weights Organizing
            </div>
            <div className="space-y-2 pt-1">
              {current.topPairs.map((item) => (
                <div key={item.pair} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#fdfbf7]">
                      "{item.pair[0]}" → "{item.pair[1]}"
                    </span>
                    <span className="text-[#f6e9c7]">{Math.round(item.prob * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1b1a17] overflow-hidden">
                    <div
                      className="h-full bg-[#f6e9c7] transition-all duration-300"
                      style={{ width: `${Math.max(4, item.prob * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3: Live Sampled Text */}
          <div className="p-3.5 rounded-xl bg-[#0f0f11] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#a8a29e] mb-2">
                3. Sampled Output at Step {current.step}
              </div>
              <div className="p-3 rounded-lg bg-[#1b1a17] border border-white/10 font-mono text-xs text-[#fdfbf7] leading-relaxed">
                "{current.sample}"
              </div>
            </div>
            <div className="text-[11px] text-[#a8a29e] mt-3">
              Train loss: <strong className="text-[#10b981]">{current.loss.toFixed(2)}</strong> · Val
              loss: <strong className="text-[#f6e9c7]">{current.valLoss.toFixed(2)}</strong> (no
              overfitting)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CrossEntropyCliff() {
  const [probTrue, setProbTrue] = useState(0.75)
  const loss = -Math.log(Math.max(0.005, probTrue))

  // Generate curve points for -ln(p)
  const curvePoints = useMemo(() => {
    const pts: string[] = []
    for (let i = 1; i <= 100; i++) {
      const p = i / 100
      const l = -Math.log(p) // [0 .. 4.605]
      const x = 25 + p * 250
      const y = 125 - (l / 4.7) * 110
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [])

  const markerX = 25 + probTrue * 250
  const markerY = 125 - (Math.min(4.7, loss) / 4.7) * 110

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · The Price of a Prediction: Cross-Entropy Curve −ln(p)
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          Context: "the little cat" → True next word: <strong className="text-[#10b981]">"found"</strong>
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* SVG Curve */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0f0f11] border border-white/10">
          <svg viewBox="0 0 290 145" className="w-full h-44 overflow-visible">
            <line x1="25" y1="125" x2="275" y2="125" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="25" y1="15" x2="25" y2="125" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            <polyline fill="none" stroke="#f6e9c7" strokeWidth="2.2" points={curvePoints} />

            {/* Marker */}
            <line
              x1={markerX}
              y1={markerY}
              x2={markerX}
              y2={125}
              stroke={probTrue >= 0.5 ? '#10b981' : '#ef4444'}
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle
              cx={markerX}
              cy={markerY}
              r={5}
              fill={probTrue >= 0.5 ? '#10b981' : '#ef4444'}
            />

            <text x="28" y="138" fontSize="8" fontFamily="monospace" fill="#a8a29e">
              p = 0.01 (Cliff!)
            </text>
            <text x="220" y="138" fontSize="8" fontFamily="monospace" fill="#a8a29e">
              p = 1.00 (Loss 0)
            </text>
          </svg>
        </div>

        {/* Slider & Penalty Callout */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-[#d6d3d1]">Probability on True Word "found"</span>
              <span className="text-[#f6e9c7] font-bold">{(probTrue * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.99}
              step={0.01}
              value={probTrue}
              onChange={(e) => setProbTrue(parseFloat(e.target.value))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div
            className={`p-3.5 rounded-xl border font-mono ${
              loss < 0.5
                ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'
                : loss > 2.0
                ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
                : 'bg-[#f6e9c7]/10 border-[#f6e9c7]/40 text-[#f6e9c7]'
            }`}
          >
            <div className="text-[10px] uppercase opacity-80">Cross-Entropy Penalty: −ln(p)</div>
            <div className="text-xl font-bold mt-0.5">{loss.toFixed(3)} nats</div>
          </div>

          <p className="text-xs text-[#d6d3d1] leading-relaxed">
            {probTrue >= 0.7
              ? 'Near the right edge, the curve is nearly flat: pushing confidence from 85% to 95% barely changes the loss.'
              : probTrue <= 0.15
              ? 'Near zero, the curve turns into a vertical cliff! Being confidently wrong costs a massive penalty, forcing gradient descent to rescue neglected true words first.'
              : 'Moderate confidence gives a middling score. Drag left toward 1% to feel the logarithmic cliff.'}
          </p>
        </div>
      </div>
    </div>
  )
}

const FIVE_CANDIDATES = [
  { word: 'cat', targetProb: 0.45 },
  { word: 'dog', targetProb: 0.25 },
  { word: 'bird', targetProb: 0.15 },
  { word: 'house', targetProb: 0.10 },
  { word: 'star', targetProb: 0.05 },
]

export function ManualFiveKnobsTrainer() {
  const [knobs, setKnobs] = useState<number[]>([0.0, 0.0, 0.0, 0.0, 0.0])

  const stats = useMemo(() => {
    const maxK = Math.max(...knobs)
    const exps = knobs.map((k) => Math.exp(k - maxK))
    const sum = exps.reduce((a, b) => a + b, 0)
    const probs = exps.map((e) => e / sum)

    // Cross-entropy against corpus target distribution: - sum target_i * ln(p_i)
    let loss = 0
    let minPossibleLoss = 0
    for (let i = 0; i < FIVE_CANDIDATES.length; i++) {
      const t = FIVE_CANDIDATES[i].targetProb
      loss += -t * Math.log(Math.max(1e-9, probs[i]))
      minPossibleLoss += -t * Math.log(t)
    }

    return {
      probs,
      loss,
      minPossibleLoss,
      gap: loss - minPossibleLoss,
      solved: loss - minPossibleLoss <= 0.02,
    }
  }, [knobs])

  const stepWithGradient = () => {
    // Gradient of cross-entropy w.r.t. logits z_i is simply (p_i - target_i)
    const lr = 1.4
    setKnobs((prev) =>
      prev.map((k, i) => {
        const grad = stats.probs[i] - FIVE_CANDIDATES[i].targetProb
        return Math.max(-3, Math.min(3, k - lr * grad))
      })
    )
  }

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Train a 5-Knob Model by Hand
          </span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
            stats.solved
              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50'
              : 'bg-[#f6e9c7]/15 text-[#f6e9c7] border-[#f6e9c7]/40'
          }`}
        >
          {stats.solved
            ? `Solved! Loss ${stats.loss.toFixed(3)} (within 0.02 of ${stats.minPossibleLoss.toFixed(3)})`
            : `Loss: ${stats.loss.toFixed(3)} · Target Floor: ${stats.minPossibleLoss.toFixed(3)}`}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-[#d6d3d1]">
          Context: <code className="text-[#f6e9c7]">"the little ___"</code>. Turn the 5 logit knobs so
          your model's predicted probabilities match the true dataset frequencies (or click{' '}
          <strong className="text-[#f6e9c7]">Step All 5 with Gradient</strong> to see calculus do it
          at once).
        </p>

        <div className="space-y-3">
          {FIVE_CANDIDATES.map((cand, i) => {
            const p = stats.probs[i]
            const diff = Math.abs(p - cand.targetProb)
            const isClose = diff <= 0.035

            return (
              <div
                key={cand.word}
                className="p-3 rounded-xl bg-[#1b1a17] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-3 flex items-center justify-between sm:justify-start gap-2 font-mono text-xs">
                  <span className="font-bold text-[#fdfbf7] w-14">"{cand.word}"</span>
                  <span className="text-[#a8a29e]">knob: {knobs[i].toFixed(2)}</span>
                </div>

                <div className="sm:col-span-4">
                  <input
                    type="range"
                    min={-2.5}
                    max={2.5}
                    step={0.05}
                    value={knobs[i]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setKnobs((prev) => prev.map((v, idx) => (idx === i ? val : v)))
                    }}
                    className="w-full accent-[#f6e9c7] cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-5 flex items-center justify-between text-xs font-mono">
                  <span>
                    Model:{' '}
                    <strong className={isClose ? 'text-[#10b981]' : 'text-[#f6e9c7]'}>
                      {Math.round(p * 100)}%
                    </strong>
                  </span>
                  <span className="text-[#a8a29e]">
                    True Corpus: <strong className="text-[#fdfbf7]">{Math.round(cand.targetProb * 100)}%</strong>
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={stepWithGradient}
            className="px-3.5 py-2 rounded-xl bg-[#f6e9c7] text-[#1a1813] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FastForward size={13} />
            <span>Step All 5 Knobs with Gradient Descent</span>
          </button>
          <button
            type="button"
            onClick={() => setKnobs([0, 0, 0, 0, 0])}
            className="px-3 py-2 rounded-xl bg-[#1b1a17] text-[#d6d3d1] border border-white/10 text-xs cursor-pointer"
          >
            Reset Knobs
          </button>
        </div>
      </div>
    </div>
  )
}

export function GradientDescentLandscape() {
  const [lr, setLr] = useState(0.22)
  const [stepsCount, setStepsCount] = useState(10)

  // Optimum valley is at (m* = 1.4, b* = 0.6). Start at (m0 = -1.2, b0 = -1.0)
  const trajectory = useMemo(() => {
    const pts: { m: number; b: number; loss: number }[] = []
    let m = -1.2
    let b = -1.0
    for (let s = 0; s <= stepsCount; s++) {
      const dm = m - 1.4
      const db = b - 0.6
      // Anisotropic quadratic bowl: L(m, b) = 2.2 * dm^2 + 0.9 * db^2
      const loss = 2.2 * dm * dm + 0.9 * db * db
      pts.push({ m, b, loss })
      const gradM = 4.4 * dm
      const gradB = 1.8 * db
      m = m - lr * gradM
      b = b - lr * gradB
    }
    return pts
  }, [lr, stepsCount])

  const finalPt = trajectory[trajectory.length - 1]
  const isOvershooting = lr > 0.44

  // Map (m, b) in [-2.5..4.5, -2.5..3.5] to SVG (0..240, 0..160)
  const toContourSvg = (m: number, b: number) => {
    const cx = 140 + (m - 1.4) * 32
    const cy = 80 - (b - 0.6) * 32
    return `${Math.max(8, Math.min(232, cx)).toFixed(1)},${Math.max(8, Math.min(152, cy)).toFixed(1)}`
  }

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Find the Valley (Gradient Descent & Learning Rate η)
          </span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
            isOvershooting
              ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40'
              : finalPt.loss < 0.08
              ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
              : 'bg-[#f6e9c7]/15 text-[#f6e9c7] border-[#f6e9c7]/40'
          }`}
        >
          {isOvershooting
            ? 'Overshooting Valley Walls!'
            : finalPt.loss < 0.08
            ? 'Reached Valley Minimum!'
            : 'Stepping Downhill...'}
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* 2D Loss Contour Map */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0f0f11] border border-white/10">
          <div className="flex justify-between text-[11px] font-mono text-[#a8a29e] mb-2">
            <span>2D Loss Landscape (Slope m vs Intercept b)</span>
            <span>Final Loss: {Math.min(99.9, finalPt.loss).toFixed(3)}</span>
          </div>
          <svg viewBox="0 0 240 160" className="w-full h-44 overflow-visible">
            {/* Concentric elliptical loss contours centered at (140, 80) */}
            {[85, 62, 42, 24, 10].map((rx, idx) => (
              <ellipse
                key={rx}
                cx={140}
                cy={80}
                rx={rx * 0.75}
                ry={rx}
                fill="none"
                stroke="rgba(246, 233, 199, 0.16)"
                strokeWidth="1"
              />
            ))}

            {/* Optimum target star */}
            <circle cx={140} cy={80} r={4} fill="#10b981" />

            {/* Descent trajectory */}
            <polyline
              fill="none"
              stroke={isOvershooting ? '#ef4444' : '#f6e9c7'}
              strokeWidth="2"
              points={trajectory.map((pt) => toContourSvg(pt.m, pt.b)).join(' ')}
            />
            {trajectory.map((pt, i) => {
              const [sx, sy] = toContourSvg(pt.m, pt.b).split(',')
              return (
                <circle
                  key={i}
                  cx={sx}
                  cy={sy}
                  r={i === trajectory.length - 1 ? 4 : 2.2}
                  fill={
                    i === trajectory.length - 1
                      ? isOvershooting
                        ? '#ef4444'
                        : '#10b981'
                      : '#f6e9c7'
                  }
                />
              )
            })}
          </svg>
        </div>

        {/* Learning Rate Controls */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Learning Rate (Step Size η)</span>
              <span className="text-[#f6e9c7] font-bold">η = {lr.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.48}
              step={0.02}
              value={lr}
              onChange={(e) => setLr(parseFloat(e.target.value))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#a8a29e] mt-1">
              <span>0.02 (Too slow)</span>
              <span>0.22 (Sweet spot)</span>
              <span>0.48 (Overshoots!)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Number of Steps Taken</span>
              <span className="text-[#f6e9c7] font-bold">{stepsCount} steps</span>
            </div>
            <input
              type="range"
              min={1}
              max={16}
              step={1}
              value={stepsCount}
              onChange={(e) => setStepsCount(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <p className="text-xs text-[#d6d3d1] leading-relaxed">
            {lr < 0.08
              ? 'With a tiny learning rate, each step barely moves downhill — you need many more steps to reach the green valley.'
              : isOvershooting
              ? 'With a learning rate that is too large, each step leaps clean across the valley to the opposite slope, bouncing violently!'
              : 'A well-chosen learning rate takes bold steps on the steep outer slopes and settles smoothly into the valley bottom.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LMBLearningDemoPlayground() {
  return (
    <div className="space-y-6">
      <WatchModelLearnDemo />
      <CrossEntropyCliff />
      <ManualFiveKnobsTrainer />
      <GradientDescentLandscape />
    </div>
  )
}
