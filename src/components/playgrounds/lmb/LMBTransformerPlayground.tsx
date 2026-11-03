import React, { useState } from 'react'

const PIPELINE_STAGES = [
  {
    id: 'embed',
    step: 'Stage 1',
    title: 'Tokenize & Embed',
    shape: '(T = 4 tokens, d_model = 256)',
    shapePreserved: true,
    desc: 'Text "the little cat sat" is split into 4 token IDs [279, 2314, 3815, 4902]. Each ID selects its row in the embedding table, turning 4 integers into a 4 × 256 matrix of floats.',
    preview: [
      { tok: 'the (#279)', vec: '[+0.14, -0.42, +0.81, ..., +0.09]' },
      { tok: 'little (#2314)', vec: '[-0.31, +0.64, +0.12, ..., -0.55]' },
      { tok: 'cat (#3815)', vec: '[+0.88, +0.19, -0.27, ..., +0.41]' },
      { tok: 'sat (#4902)', vec: '[+0.05, -0.73, +0.44, ..., +0.62]' },
    ],
  },
  {
    id: 'blocks',
    step: 'Stage 2',
    title: 'Run N Transformer Blocks',
    shape: '(T = 4 tokens, d_model = 256) — UNCHANGED',
    shapePreserved: true,
    desc: 'The 4 × 256 sequence flows through N repeated blocks (8 blocks in our default model). Inside each block, tokens exchange context via Attention and refine their vectors via the MLP. Notice the tensor shape coming out is identical to the tensor shape going in!',
    preview: [
      { tok: 'the (refined)', vec: '[+0.19, -0.38, +0.77, ..., +0.12]' },
      { tok: 'little (refined)', vec: '[-0.12, +0.71, +0.34, ..., -0.29]' },
      { tok: 'cat (with "little")', vec: '[+0.94, +0.48, -0.11, ..., +0.73]' },
      { tok: 'sat (ready to predict)', vec: '[+0.62, -0.41, +0.89, ..., +1.14]' },
    ],
  },
  {
    id: 'norm',
    step: 'Stage 3',
    title: 'Final RMSNorm',
    shape: '(T = 4 tokens, d_model = 256) — UNCHANGED',
    shapePreserved: true,
    desc: 'After the last block finishes, one final RMSNorm rescales each token vector to unit root-mean-square magnitude so logits stay well-behaved before scoring.',
    preview: [
      { tok: 'sat (final normalized)', vec: '[+0.48, -0.32, +0.69, ..., +0.88]  (RMS = 1.00)' },
    ],
  },
  {
    id: 'head',
    step: 'Stage 4',
    title: 'Tied Output Head (Logits)',
    shape: '(T = 4 tokens, vocab_size = 10,000)',
    shapePreserved: false,
    desc: 'The final 256-dim vector at position 4 ("sat") is multiplied against all 10,000 rows of the tied embedding table, producing one raw score (logit) for every token in the vocabulary.',
    preview: [
      { tok: '"on" (#318)', vec: 'logit = +4.62' },
      { tok: '"down" (#1204)', vec: 'logit = +3.85' },
      { tok: '"quietly" (#6412)', vec: 'logit = +3.10' },
      { tok: '"banana" (#8911)', vec: 'logit = -5.40' },
    ],
  },
  {
    id: 'softmax',
    step: 'Stage 5',
    title: 'Softmax (Turn Scores into Odds)',
    shape: '(vocab_size = 10,000 probabilities summing to 1.0)',
    shapePreserved: false,
    desc: 'Softmax exponentiates and normalizes the 10,000 logits into valid probabilities that add up to 100%. We are back at next-token odds!',
    preview: [
      { tok: '"on"', vec: '48.4% probability' },
      { tok: '"down"', vec: '22.4% probability' },
      { tok: '"quietly"', vec: '10.6% probability' },
      { tok: 'all 9,997 other tokens', vec: '18.6% combined' },
    ],
  },
]

export function TransformerPipelineStages() {
  const [activeIdx, setActiveIdx] = useState(0)
  const stage = PIPELINE_STAGES[activeIdx]

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · From Text to Probabilities (5-Stage Pipeline)
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          Input: "the little cat sat"
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Stepper Pipeline Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PIPELINE_STAGES.map((s, idx) => {
            const active = idx === activeIdx
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] shadow-sm'
                    : 'bg-[#1b1a17] text-[#d6d3d1] border-white/10 hover:border-[#f6e9c7]/40'
                }`}
              >
                <div
                  className={`text-[10px] font-mono uppercase ${
                    active ? 'text-[#1a1813]/70 font-bold' : 'text-[#a8a29e]'
                  }`}
                >
                  {s.step}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">{s.title}</div>
              </button>
            )
          })}
        </div>

        {/* Stage Inspector Card */}
        <div className="p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-[#fdfbf7]">
              {stage.step}: {stage.title}
            </h4>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                stage.shapePreserved
                  ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
                  : 'bg-[#f6e9c7]/15 text-[#f6e9c7] border-[#f6e9c7]/40'
              }`}
            >
              Tensor Shape: {stage.shape}
            </span>
          </div>

          <p className="text-xs text-[#d6d3d1] leading-relaxed">{stage.desc}</p>

          <div className="p-3 rounded-xl bg-[#0f0f11] border border-white/5 space-y-1.5 font-mono text-xs">
            {stage.preview.map((row) => (
              <div
                key={row.tok}
                className="flex flex-wrap items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0"
              >
                <span className="text-[#f6e9c7] font-semibold">{row.tok}</span>
                <span className="text-[#d6d3d1]">{row.vec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const MAP_TOKENS = ['The', 'cat', 'chased', 'its', 'tail', '.']

const HEAD_MAPS: {
  name: string
  role: string
  matrix: number[][]
}[] = [
  {
    name: 'Head 1: Previous-Token Head',
    role: 'Looks predominantly one step backward to track local word order and bigrams.',
    matrix: [
      [1.0, 0, 0, 0, 0, 0],
      [0.82, 0.18, 0, 0, 0, 0],
      [0.08, 0.78, 0.14, 0, 0, 0],
      [0.04, 0.1, 0.76, 0.1, 0, 0],
      [0.02, 0.06, 0.08, 0.74, 0.1, 0],
      [0.02, 0.04, 0.06, 0.08, 0.72, 0.08],
    ],
  },
  {
    name: 'Head 2: Pronoun & Entity Resolver',
    role: 'Connects possessive pronouns ("its") and body parts ("tail") directly back to the subject noun ("cat").',
    matrix: [
      [1.0, 0, 0, 0, 0, 0],
      [0.25, 0.75, 0, 0, 0, 0],
      [0.12, 0.68, 0.2, 0, 0, 0],
      [0.06, 0.74, 0.1, 0.1, 0, 0], // "its" -> "cat" (74%)
      [0.05, 0.52, 0.12, 0.21, 0.1, 0], // "tail" -> "cat" (52%)
      [0.1, 0.45, 0.25, 0.05, 0.1, 0.05],
    ],
  },
  {
    name: 'Head 3: Action-Clause Integrator',
    role: 'Gathers the main verb ("chased") and object ("tail") when reaching the sentence boundary.',
    matrix: [
      [1.0, 0, 0, 0, 0, 0],
      [0.4, 0.6, 0, 0, 0, 0],
      [0.15, 0.35, 0.5, 0, 0, 0],
      [0.1, 0.25, 0.45, 0.2, 0, 0],
      [0.05, 0.2, 0.48, 0.12, 0.15, 0],
      [0.05, 0.22, 0.38, 0.05, 0.25, 0.05],
    ],
  },
]

export function AttentionMatrixExplorer() {
  const [headIdx, setHeadIdx] = useState(1)
  const [selectedRow, setSelectedRow] = useState(3) // default on "its"
  const activeHead = HEAD_MAPS[headIdx]

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · The Attention Map (Multi-Head Causal Heatmap)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {HEAD_MAPS.map((h, i) => (
            <button
              key={h.name}
              type="button"
              onClick={() => setHeadIdx(i)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                headIdx === i
                  ? 'bg-[#f6e9c7] text-[#1a1813] font-bold'
                  : 'bg-[#22211d] text-[#d6d3d1] border border-white/10'
              }`}
            >
              Head {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Causal Heatmap Matrix */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0f0f11] border border-white/10 overflow-x-auto">
          <div className="text-[11px] font-mono text-[#a8a29e] mb-3">
            Rows = <strong className="text-[#fdfbf7]">Query position</strong> (looking backward) ·
            Columns = <strong className="text-[#f6e9c7]">Key position</strong> (attended to)
          </div>

          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="p-1.5 text-left text-[10px] text-[#a8a29e]">Query \ Key</th>
                {MAP_TOKENS.map((t, j) => (
                  <th key={j} className="p-1.5 text-center text-[#f6e9c7] font-bold">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MAP_TOKENS.map((rowTok, i) => {
                const isSelectedRow = i === selectedRow
                const rowWeights = activeHead.matrix[i]
                const maxWeightInRow = Math.max(...rowWeights.slice(0, i + 1))

                return (
                  <tr
                    key={i}
                    onClick={() => setSelectedRow(i)}
                    className={`cursor-pointer transition-colors ${
                      isSelectedRow ? 'bg-[#f6e9c7]/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="p-1.5 font-bold text-[#fdfbf7] border-r border-white/10">
                      {rowTok}
                    </td>
                    {MAP_TOKENS.map((_, j) => {
                      const isMasked = j > i
                      const w = rowWeights[j] || 0
                      const isRowPeak = !isMasked && w === maxWeightInRow && w > 0.3

                      return (
                        <td key={j} className="p-1 text-center">
                          {isMasked ? (
                            <div
                              className="py-2 rounded bg-[#ef4444]/10 border border-[#ef4444]/25 text-[#ef4444] text-[10px]"
                              title="Causal mask: future token blocked (-∞)"
                            >
                              mask
                            </div>
                          ) : (
                            <div
                              className="py-2 rounded font-mono text-[11px] transition-all border"
                              style={{
                                backgroundColor: isRowPeak
                                  ? `rgba(16, 185, 129, ${0.18 + w * 0.45})`
                                  : `rgba(246, 233, 199, ${0.06 + w * 0.55})`,
                                borderColor: isRowPeak
                                  ? 'rgba(16, 185, 129, 0.65)'
                                  : isSelectedRow
                                  ? 'rgba(246, 233, 199, 0.35)'
                                  : 'rgba(255,255,255,0.06)',
                                color: w > 0.55 && !isRowPeak ? '#1a1813' : '#fdfbf7',
                                fontWeight: isRowPeak || w > 0.4 ? 700 : 400,
                              }}
                            >
                              {Math.round(w * 100)}%
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Row Breakdown */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-3">
          <div className="text-xs font-bold text-[#f6e9c7]">{activeHead.name}</div>
          <p className="text-xs text-[#d6d3d1] leading-relaxed">{activeHead.role}</p>

          <div className="pt-2 border-t border-white/10">
            <div className="text-[11px] font-mono text-[#a8a29e] mb-2">
              Incoming Context Blend for Query Token{' '}
              <strong className="text-[#fdfbf7]">"{MAP_TOKENS[selectedRow]}"</strong> (pos {selectedRow + 1}):
            </div>
            <div className="space-y-2">
              {MAP_TOKENS.map((tok, j) => {
                const isMasked = j > selectedRow
                const w = activeHead.matrix[selectedRow][j] || 0
                return (
                  <div key={j} className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-16 text-[#fdfbf7] font-semibold">"{tok}"</span>
                    {isMasked ? (
                      <span className="text-[11px] text-[#ef4444]">
                        Blocked by Causal Mask (-∞ → 0%)
                      </span>
                    ) : (
                      <>
                        <div className="flex-1 h-2 rounded-full bg-[#111113] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(3, w * 100)}%`,
                              backgroundColor: w >= 0.45 ? '#10b981' : '#f6e9c7',
                            }}
                          />
                        </div>
                        <span className="w-10 text-right text-[#f6e9c7]">
                          {Math.round(w * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LMBTransformerPlayground() {
  return (
    <div className="space-y-6">
      <TransformerPipelineStages />
      <AttentionMatrixExplorer />
    </div>
  )
}
