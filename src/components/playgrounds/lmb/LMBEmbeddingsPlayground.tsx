import React, { useState, useMemo } from 'react'

interface WordEntry {
  word: string
  cluster: string
  x: number // [0..100]
  y: number // [0..100]
  vec: number[] // 6D interpretable dimensions: [animal, royalty, feminine, action, past_tense, food]
}

const WORDS: WordEntry[] = [
  { word: 'cat', cluster: 'Animals', x: 20, y: 24, vec: [0.92, -0.1, 0.1, 0.1, -0.2, -0.4] },
  { word: 'dog', cluster: 'Animals', x: 26, y: 30, vec: [0.90, -0.1, -0.1, 0.2, -0.2, -0.4] },
  { word: 'kitten', cluster: 'Animals', x: 15, y: 17, vec: [0.95, -0.2, 0.2, 0.1, -0.5, -0.3] },
  { word: 'puppy', cluster: 'Animals', x: 21, y: 22, vec: [0.93, -0.2, 0.0, 0.2, -0.5, -0.3] },
  { word: 'king', cluster: 'People & Royalty', x: 76, y: 22, vec: [-0.3, 0.95, -0.82, 0.0, 0.1, -0.2] },
  { word: 'queen', cluster: 'People & Royalty', x: 84, y: 34, vec: [-0.3, 0.94, 0.84, 0.0, 0.1, -0.2] },
  { word: 'man', cluster: 'People & Royalty', x: 64, y: 26, vec: [-0.2, 0.12, -0.85, 0.0, 0.0, -0.2] },
  { word: 'woman', cluster: 'People & Royalty', x: 72, y: 38, vec: [-0.2, 0.11, 0.83, 0.0, 0.0, -0.2] },
  { word: 'walk', cluster: 'Verbs', x: 24, y: 74, vec: [0.0, -0.2, 0.0, 0.88, -0.75, -0.3] },
  { word: 'walked', cluster: 'Verbs', x: 36, y: 82, vec: [0.0, -0.2, 0.0, 0.87, 0.82, -0.3] },
  { word: 'run', cluster: 'Verbs', x: 18, y: 66, vec: [0.1, -0.2, 0.0, 0.95, -0.74, -0.3] },
  { word: 'ran', cluster: 'Verbs', x: 30, y: 74, vec: [0.1, -0.2, 0.0, 0.94, 0.83, -0.3] },
  { word: 'apple', cluster: 'Food', x: 78, y: 76, vec: [-0.4, -0.3, 0.0, -0.4, -0.1, 0.94] },
  { word: 'banana', cluster: 'Food', x: 84, y: 82, vec: [-0.4, -0.3, 0.1, -0.4, -0.1, 0.92] },
]

const DIM_LABELS = ['Animal', 'Royalty', 'Gender (+F/-M)', 'Motion', 'Tense (+Past)', 'Food']

function cosineSim(a: number[], b: number[]): number {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9)
}

export function EmbeddingSpaceExplorer() {
  const [wordA, setWordA] = useState<string>('cat')
  const [wordB, setWordB] = useState<string>('dog')
  const [pickTurn, setPickTurn] = useState<'A' | 'B'>('B')

  const entryA = WORDS.find((w) => w.word === wordA) || WORDS[0]
  const entryB = WORDS.find((w) => w.word === wordB) || WORDS[1]
  const sim = useMemo(() => cosineSim(entryA.vec, entryB.vec), [entryA, entryB])

  const handlePointClick = (w: string) => {
    if (pickTurn === 'A') {
      setWordA(w)
      setPickTurn('B')
    } else {
      setWordB(w)
      setPickTurn('A')
    }
  }

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · 2D Embedding Space & Vector Inspector
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          Click any two tokens on the map to compare their learned coordinates
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 2D Scatter Canvas */}
        <div className="lg:col-span-7 p-3 rounded-xl bg-[#0f0f11] border border-white/10">
          <svg viewBox="0 0 100 100" className="w-full h-64 overflow-visible select-none">
            {/* Subtle Grid */}
            {[20, 40, 60, 80].map((g) => (
              <g key={g}>
                <line x1={g} y1={0} x2={g} y2={100} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
                <line x1={0} y1={g} x2={100} y2={g} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
              </g>
            ))}

            {/* Connection line between A and B */}
            <line
              x1={entryA.x}
              y1={entryA.y}
              x2={entryB.x}
              y2={entryB.y}
              stroke={sim > 0.5 ? '#10b981' : sim < 0 ? '#ef4444' : '#f6e9c7'}
              strokeWidth="0.7"
              strokeDasharray="1.5 1.5"
            />

            {/* Points */}
            {WORDS.map((item) => {
              const isA = item.word === wordA
              const isB = item.word === wordB
              return (
                <g
                  key={item.word}
                  onClick={() => handlePointClick(item.word)}
                  className="cursor-pointer"
                >
                  {(isA || isB) && (
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r={3.4}
                      fill="none"
                      stroke={isA ? '#f6e9c7' : '#10b981'}
                      strokeWidth="0.6"
                    />
                  )}
                  <circle
                    cx={item.x}
                    cy={item.y}
                    r={isA || isB ? 2.1 : 1.5}
                    fill={isA ? '#f6e9c7' : isB ? '#10b981' : '#d6d3d1'}
                  />
                  <text
                    x={item.x + 2.4}
                    y={item.y + 1}
                    fontSize="3.2"
                    fontFamily="monospace"
                    fill={isA ? '#f6e9c7' : isB ? '#10b981' : '#a8a29e'}
                    fontWeight={isA || isB ? 'bold' : 'normal'}
                  >
                    {item.word}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#a8a29e] pt-2 border-t border-white/5">
            <span>
              Token A: <strong className="text-[#f6e9c7]">"{wordA}"</strong> ({entryA.cluster})
            </span>
            <span>
              Token B: <strong className="text-[#10b981]">"{wordB}"</strong> ({entryB.cluster})
            </span>
          </div>
        </div>

        {/* Vector Feature Comparison */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-[#1b1a17] border border-white/10">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#a8a29e] uppercase tracking-wider">
                Cosine Similarity
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  sim >= 0.6
                    ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
                    : sim <= 0
                    ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40'
                    : 'bg-[#f6e9c7]/15 text-[#f6e9c7] border-[#f6e9c7]/40'
                }`}
              >
                {sim >= 0 ? `+${sim.toFixed(2)}` : sim.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2.5">
              {DIM_LABELS.map((label, idx) => {
                const vA = entryA.vec[idx]
                const vB = entryB.vec[idx]
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#a8a29e]">
                      <span>Dim {idx + 1}: {label}</span>
                      <span>
                        <span className="text-[#f6e9c7]">{vA.toFixed(2)}</span> vs{' '}
                        <span className="text-[#10b981]">{vB.toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="h-1.5 rounded-full bg-[#111113] overflow-hidden">
                        <div
                          className="h-full bg-[#f6e9c7]"
                          style={{ width: `${Math.min(100, Math.abs(vA) * 100)}%` }}
                        />
                      </div>
                      <div className="h-1.5 rounded-full bg-[#111113] overflow-hidden">
                        <div
                          className="h-full bg-[#10b981]"
                          style={{ width: `${Math.min(100, Math.abs(vB) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="mt-4 pt-2.5 border-t border-white/10 text-[11px] text-[#a8a29e] leading-relaxed">
            {sim >= 0.6
              ? `"${wordA}" and "${wordB}" share similar contexts in training text, pulling their embedding rows close together.`
              : `"${wordA}" and "${wordB}" appear in very different contexts, so gradient descent placed their vectors far apart.`}
          </p>
        </div>
      </div>
    </div>
  )
}

const ANALOGY_PRESETS = [
  { label: 'king − man + woman', a: 'king', b: 'man', c: 'woman', expected: 'queen' },
  { label: 'kitten − cat + dog', a: 'kitten', b: 'cat', c: 'dog', expected: 'puppy' },
  { label: 'walked − walk + run', a: 'walked', b: 'walk', c: 'run', expected: 'ran' },
]

export function EmbeddingVectorArithmetic() {
  const [presetIdx, setPresetIdx] = useState(0)
  const active = ANALOGY_PRESETS[presetIdx]

  const wA = WORDS.find((w) => w.word === active.a)!
  const wB = WORDS.find((w) => w.word === active.b)!
  const wC = WORDS.find((w) => w.word === active.c)!

  const resultVec = useMemo(
    () => wA.vec.map((v, i) => v - wB.vec[i] + wC.vec[i]),
    [wA, wB, wC]
  )

  const nearest = useMemo(() => {
    return WORDS.filter((w) => ![active.a, active.b, active.c].includes(w.word))
      .map((w) => ({
        word: w.word,
        sim: cosineSim(resultVec, w.vec),
        x: w.x,
        y: w.y,
      }))
      .sort((x, y) => y.sim - x.sim)
      .slice(0, 4)
  }, [resultVec, active])

  const targetX = wA.x - wB.x + wC.x
  const targetY = wA.y - wB.y + wC.y

  // Compute a tightly zoomed bounding box around the 4 active points so the vectors are large and easy to read
  const zoomedCoords = useMemo(() => {
    const rawPts = [
      { key: 'a', word: wA.word, x: wA.x, y: wA.y },
      { key: 'b', word: wB.word, x: wB.x, y: wB.y },
      { key: 'c', word: wC.word, x: wC.x, y: wC.y },
      { key: 'nearest', word: nearest[0].word, x: nearest[0].x, y: nearest[0].y },
      { key: 'target', word: 'target', x: targetX, y: targetY },
    ]
    const xs = rawPts.map((p) => p.x)
    const ys = rawPts.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const spanX = Math.max(maxX - minX, 8)
    const spanY = Math.max(maxY - minY, 8)

    // Map into [18..76] x [20..80] inside the 100x100 SVG canvas
    const project = (x: number, y: number) => ({
      px: 18 + ((x - minX) / spanX) * 56,
      py: 20 + ((y - minY) / spanY) * 58,
    })

    return {
      a: { ...wA, ...project(wA.x, wA.y) },
      b: { ...wB, ...project(wB.x, wB.y) },
      c: { ...wC, ...project(wC.x, wC.y) },
      nearest: { ...nearest[0], ...project(nearest[0].x, nearest[0].y) },
      target: project(targetX, targetY),
    }
  }, [wA, wB, wC, nearest, targetX, targetY])

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Vector Arithmetic (Directions in Embedding Space)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {ANALOGY_PRESETS.map((p, idx) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPresetIdx(idx)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                presetIdx === idx
                  ? 'bg-[#f6e9c7] text-[#1a1813] font-bold'
                  : 'bg-[#22211d] text-[#d6d3d1] hover:text-white border border-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Vector Parallelogram Diagram (Zoomed In) */}
        <div className="md:col-span-6 p-4 rounded-xl bg-[#0f0f11] border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#a8a29e] mb-2">
            <span>
              Parallelogram: <span className="text-[#f6e9c7]">{active.a}</span> −{' '}
              <span className="text-[#d6d3d1]">{active.b}</span> +{' '}
              <span className="text-[#f6e9c7]">{active.c}</span> ≈{' '}
              <span className="text-[#10b981] font-bold">{nearest[0]?.word}</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#f6e9c7]">
              Zoomed Local Subspace
            </span>
          </div>
          <svg viewBox="0 0 100 100" className="w-full h-60 overflow-visible select-none">
            <defs>
              <marker
                id="arrow-cream"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="4.5"
                markerHeight="4.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f6e9c7" />
              </marker>
              <marker
                id="arrow-muted"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="4.5"
                markerHeight="4.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#a8a29e" />
              </marker>
              <marker
                id="arrow-green"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Subtle Subspace Grid */}
            {[20, 40, 60, 80].map((g) => (
              <g key={g}>
                <line x1={g} y1={5} x2={g} y2={95} stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
                <line x1={5} y1={g} x2={95} y2={g} stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
              </g>
            ))}

            {/* Parallelogram shaded area */}
            <polygon
              points={`${zoomedCoords.b.px},${zoomedCoords.b.py} ${zoomedCoords.a.px},${zoomedCoords.a.py} ${zoomedCoords.target.px},${zoomedCoords.target.py} ${zoomedCoords.c.px},${zoomedCoords.c.py}`}
              fill="rgba(246, 233, 199, 0.06)"
              stroke="rgba(246, 233, 199, 0.15)"
              strokeWidth="0.5"
            />

            {/* Reference vector B -> A (a - b) */}
            <line
              x1={zoomedCoords.b.px}
              y1={zoomedCoords.b.py}
              x2={zoomedCoords.a.px}
              y2={zoomedCoords.a.py}
              stroke="#a8a29e"
              strokeWidth="1.5"
              strokeDasharray="2.5 1.5"
              markerEnd="url(#arrow-muted)"
            />

            {/* Parallel shift B -> C */}
            <line
              x1={zoomedCoords.b.px}
              y1={zoomedCoords.b.py}
              x2={zoomedCoords.c.px}
              y2={zoomedCoords.c.py}
              stroke="#f6e9c7"
              strokeWidth="1.4"
              strokeDasharray="2 2"
              markerEnd="url(#arrow-cream)"
            />

            {/* Applied shift vector C -> Target (c + (a - b)) */}
            <line
              x1={zoomedCoords.c.px}
              y1={zoomedCoords.c.py}
              x2={zoomedCoords.target.px}
              y2={zoomedCoords.target.py}
              stroke="#10b981"
              strokeWidth="2.1"
              markerEnd="url(#arrow-green)"
            />

            {[zoomedCoords.a, zoomedCoords.b, zoomedCoords.c].map((pt) => (
              <g key={pt.word}>
                <circle cx={pt.px} cy={pt.py} r={3.4} fill="#141416" stroke="#f6e9c7" strokeWidth="1.4" />
                <circle cx={pt.px} cy={pt.py} r={1.8} fill="#f6e9c7" />
                <text
                  x={pt.px + 4.2}
                  y={pt.py + 1.5}
                  fontSize="4.8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#fdfbf7"
                >
                  {pt.word}
                </text>
              </g>
            ))}

            {/* Nearest match in green */}
            <circle
              cx={zoomedCoords.nearest.px}
              cy={zoomedCoords.nearest.py}
              r={4.2}
              fill="rgba(16, 185, 129, 0.2)"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <circle cx={zoomedCoords.nearest.px} cy={zoomedCoords.nearest.py} r={2.2} fill="#10b981" />
            <text
              x={zoomedCoords.nearest.px + 4.8}
              y={zoomedCoords.nearest.py + 1.6}
              fontSize="5.2"
              fontFamily="monospace"
              fontWeight="bold"
              fill="#10b981"
            >
              {zoomedCoords.nearest.word}
            </text>
          </svg>
        </div>

        {/* Top Nearest Neighbors Ranking */}
        <div className="md:col-span-6 p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#a8a29e]">
            Closest Tokens to Computed Vector
          </div>
          {nearest.map((item, idx) => (
            <div key={item.word} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      idx === 0
                        ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                        : 'bg-[#141416] text-[#d6d3d1]'
                    }`}
                  >
                    #{idx + 1} "{item.word}"
                  </span>
                </span>
                <span className={idx === 0 ? 'text-[#10b981] font-bold' : 'text-[#f6e9c7]'}>
                  cosine = {item.sim.toFixed(3)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#111113] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(5, ((item.sim + 1) / 2) * 100)}%`,
                    backgroundColor: idx === 0 ? '#10b981' : '#f6e9c7',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LMBEmbeddingsPlayground() {
  return (
    <div className="space-y-6">
      <EmbeddingSpaceExplorer />
      <EmbeddingVectorArithmetic />
    </div>
  )
}
