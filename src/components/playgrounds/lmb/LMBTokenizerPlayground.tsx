import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

const PRESET_PHRASES = [
  { label: 'Cat & Mat', text: 'the cat sat on the mat' },
  { label: 'Morphology (-ing)', text: 'training a tokenizer is learning patterns' },
  { label: 'Rare Word Split', text: 'unbelievably small transformers' },
]

interface MergeStep {
  step: number
  mergedPair: [string, string] | null
  newToken: string | null
  pairCount: number
  tokens: string[]
  vocabSize: number
}

function computeBPESteps(rawText: string, maxSteps = 8): MergeStep[] {
  // Represent spaces visibly with · at start of words
  const words = rawText.trim().split(/\s+/).filter(Boolean)
  let currentTokens: string[] = []
  words.forEach((w, idx) => {
    const prefix = idx === 0 ? '' : '·'
    const chars = (prefix + w).split('')
    currentTokens.push(...chars)
  })

  const baseVocab = new Set(currentTokens).size
  const steps: MergeStep[] = [
    {
      step: 0,
      mergedPair: null,
      newToken: null,
      pairCount: 0,
      tokens: [...currentTokens],
      vocabSize: baseVocab,
    },
  ]

  for (let s = 1; s <= maxSteps; s++) {
    // Count adjacent pairs within same word (don't merge across leading · of next word)
    const counts: Record<string, { pair: [string, string]; count: number }> = {}
    for (let i = 0; i < currentTokens.length - 1; i++) {
      const a = currentTokens[i]
      const b = currentTokens[i + 1]
      if (b.startsWith('·')) continue
      const key = `${a}|||${b}`
      if (!counts[key]) counts[key] = { pair: [a, b], count: 0 }
      counts[key].count++
    }

    const best = Object.values(counts).sort((x, y) => y.count - x.count)[0]
    if (!best || best.count < 1) break

    const [left, right] = best.pair
    const merged = left + right
    const nextTokens: string[] = []
    let i = 0
    while (i < currentTokens.length) {
      if (
        i < currentTokens.length - 1 &&
        currentTokens[i] === left &&
        currentTokens[i + 1] === right
      ) {
        nextTokens.push(merged)
        i += 2
      } else {
        nextTokens.push(currentTokens[i])
        i += 1
      }
    }

    currentTokens = nextTokens
    steps.push({
      step: s,
      mergedPair: [left, right],
      newToken: merged,
      pairCount: best.count,
      tokens: [...currentTokens],
      vocabSize: baseVocab + s,
    })
  }

  return steps
}

function tokenToId(tok: string): number {
  let h = 2166136261
  for (let i = 0; i < tok.length; i++) {
    h ^= tok.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return 256 + (Math.abs(h) % 9744)
}

export function BPEMergeTokenizer() {
  const [text, setText] = useState(PRESET_PHRASES[0].text)
  const [stepIdx, setStepIdx] = useState(3)
  const [showIds, setShowIds] = useState(false)

  const steps = useMemo(() => computeBPESteps(text, 8), [text])
  const clampedStep = Math.min(stepIdx, steps.length - 1)
  const current = steps[clampedStep]
  const initialCount = steps[0]?.tokens.length || 1
  const compressionPct = Math.round((1 - current.tokens.length / initialCount) * 100)

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Byte-Pair Encoding (BPE) Merge Machine
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {PRESET_PHRASES.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setText(p.text)
                setStepIdx(3)
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                text === p.text
                  ? 'bg-[#f6e9c7] text-[#1a1813] font-semibold'
                  : 'bg-[#22211d] text-[#d6d3d1] hover:text-white border border-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Input Box */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setStepIdx(0)
            }}
            placeholder="Type any sentence to tokenize..."
            className="flex-1 rounded-xl bg-[#1c1b18] border border-white/10 px-3.5 py-2 text-xs font-mono text-[#fdfbf7] focus:outline-none focus:border-[#f6e9c7]/60"
          />
          <button
            type="button"
            onClick={() => setShowIds((v) => !v)}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              showIds
                ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] font-bold'
                : 'bg-[#1b1a17] text-[#d6d3d1] border-white/10 hover:text-white'
            }`}
          >
            {showIds ? 'Showing Integer IDs' : 'Show Token IDs'}
          </button>
        </div>

        {/* Step Controls & Rule Banner */}
        <div className="p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={clampedStep === 0}
                onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                className="p-1.5 rounded-lg bg-[#141416] border border-white/10 text-[#fdfbf7] disabled:opacity-35 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-mono font-bold text-[#f6e9c7]">
                Merge Step {clampedStep} / {steps.length - 1}
              </span>
              <button
                type="button"
                disabled={clampedStep >= steps.length - 1}
                onClick={() => setStepIdx((s) => Math.min(steps.length - 1, s + 1))}
                className="p-1.5 rounded-lg bg-[#141416] border border-white/10 text-[#fdfbf7] disabled:opacity-35 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => setStepIdx(0)}
                className="p-1.5 rounded-lg bg-[#141416] border border-white/10 text-[#a8a29e] hover:text-white cursor-pointer"
                title="Reset to raw characters"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-[#a8a29e]">
                Sequence Length:{' '}
                <strong className="text-[#fdfbf7]">{current.tokens.length}</strong> tokens
                {compressionPct > 0 && (
                  <span className="text-[#10b981] ml-1">(-{compressionPct}%)</span>
                )}
              </span>
              <span className="text-[#a8a29e]">
                Vocab Size: <strong className="text-[#f6e9c7]">{current.vocabSize}</strong>
              </span>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(1, steps.length - 1)}
            value={clampedStep}
            onChange={(e) => setStepIdx(parseInt(e.target.value, 10))}
            className="w-full accent-[#f6e9c7] cursor-pointer"
          />

          {/* Current Merge Rule Callout */}
          <div className="text-xs font-mono px-3 py-2 rounded-lg bg-[#121214] border border-white/5 flex items-center justify-between">
            {current.mergedPair ? (
              <span>
                Most frequent pair:{' '}
                <span className="px-1.5 py-0.5 rounded bg-[#25231e] text-[#f6e9c7]">
                  "{current.mergedPair[0]}"
                </span>{' '}
                +{' '}
                <span className="px-1.5 py-0.5 rounded bg-[#25231e] text-[#f6e9c7]">
                  "{current.mergedPair[1]}"
                </span>{' '}
                → minted new token{' '}
                <span className="px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold">
                  "{current.newToken}"
                </span>
              </span>
            ) : (
              <span className="text-[#a8a29e]">
                Step 0: Raw character pieces before any BPE merges. Drag the slider right to merge frequent pairs.
              </span>
            )}
            {current.pairCount > 0 && (
              <span className="text-[#10b981] font-bold">×{current.pairCount} merged</span>
            )}
          </div>
        </div>

        {/* Live Token Stream */}
        <div className="p-4 rounded-xl bg-[#0f0f11] border border-white/10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#a8a29e] mb-2.5">
            Resulting Token Sequence ({current.tokens.length} pieces) — Newly merged token in{' '}
            <span className="text-[#10b981]">green</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {current.tokens.map((tok, i) => {
              const isNew = current.newToken === tok
              const isMultiChar = tok.replace('·', '').length > 1
              return (
                <div
                  key={i}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-xs border transition-all flex flex-col items-center ${
                    isNew
                      ? 'bg-[#10b981]/20 border-[#10b981]/60 text-[#10b981] font-bold shadow-xs'
                      : isMultiChar
                      ? 'bg-[#f6e9c7]/15 border-[#f6e9c7]/40 text-[#f6e9c7]'
                      : 'bg-[#1c1b18] border-white/10 text-[#d6d3d1]'
                  }`}
                >
                  <span>{tok}</span>
                  {showIds && (
                    <span className="text-[9px] text-[#a8a29e] mt-0.5 border-t border-white/10 pt-0.5 w-full text-center">
                      #{tokenToId(tok)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LMBTokenizerPlayground() {
  return <BPEMergeTokenizer />
}
