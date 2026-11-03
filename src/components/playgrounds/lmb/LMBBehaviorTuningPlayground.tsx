import React, { useState, useMemo } from 'react'
import { Play, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'

const SFT_EXCHANGE_TOKENS = [
  { tok: '<|user|>', masked: true },
  { tok: 'Why', masked: true },
  { tok: 'is', masked: true },
  { tok: 'the', masked: true },
  { tok: 'sky', masked: true },
  { tok: 'blue?', masked: true },
  { tok: '<|assistant|>', masked: true },
  { tok: 'Sunlight', masked: false },
  { tok: 'scatters', masked: false },
  { tok: 'short', masked: false },
  { tok: 'blue', masked: false },
  { tok: 'wavelengths.', masked: false },
  { tok: '<|end|>', masked: false },
]

export function SFTByExampleLab() {
  const [sftStep, setSftStep] = useState(0)

  // Logits for [Base Continuation, Helpful Assistant Reply]
  const baseLogit = 1.4 - sftStep * 0.45
  const assistantLogit = -0.6 + sftStep * 0.65

  const probs = useMemo(() => {
    const m = Math.max(baseLogit, assistantLogit)
    const eBase = Math.exp(baseLogit - m)
    const eAsst = Math.exp(assistantLogit - m)
    const sum = eBase + eAsst
    return {
      base: eBase / sum,
      assistant: eAsst / sum,
      loss: -Math.log(eAsst / sum),
    }
  }, [baseLogit, assistantLogit])

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Fine-Tune by Example (SFT & Prompt Loss Masking)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={sftStep >= 6}
            onClick={() => setSftStep((s) => Math.min(6, s + 1))}
            className="px-3 py-1 rounded-lg bg-[#f6e9c7] text-[#1a1813] text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Play size={12} />
            <span>Run 1 SFT Update (Step {sftStep}/6)</span>
          </button>
          <button
            type="button"
            onClick={() => setSftStep(0)}
            className="px-2.5 py-1 rounded-lg bg-[#22211d] text-[#d6d3d1] border border-white/10 text-xs flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Loss Mask Visualization */}
        <div className="p-4 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono">
            <span className="text-[#a8a29e]">
              1. SFT Loss Mask: We let the model read the prompt, but grade it{' '}
              <strong className="text-[#10b981]">only on the assistant's reply</strong>
            </span>
            <span className="text-[#a8a29e]">
              □ mask=0 (ungraded context) · <span className="text-[#10b981]">■ mask=1 (graded target)</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SFT_EXCHANGE_TOKENS.map((item, i) => (
              <div
                key={i}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs border ${
                  item.masked
                    ? 'bg-[#18181b] border-white/10 text-[#a8a29e]'
                    : 'bg-[#10b981]/15 border-[#10b981]/50 text-[#10b981] font-bold'
                }`}
              >
                <div>{item.tok}</div>
                <div className="text-[9px] opacity-75">
                  {item.masked ? 'mask=0' : 'mask=1'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Behavior Shift */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base-style continuation */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              probs.base > probs.assistant
                ? 'bg-[#ef4444]/10 border-[#ef4444]/40'
                : 'bg-[#1b1a17] border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#a8a29e] uppercase">Base-Model Habit (Pattern Mimicry)</span>
              <span className="font-bold text-[#ef4444]">
                {(probs.base * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs font-mono text-[#fdfbf7] mb-3">
              "Question 2: Why is the grass green? Question 3: Why are clouds white?"
            </p>
            <div className="h-2 w-full rounded-full bg-[#111113] overflow-hidden">
              <div
                className="h-full bg-[#ef4444] transition-all duration-300"
                style={{ width: `${probs.base * 100}%` }}
              />
            </div>
          </div>

          {/* Desired Assistant Reply */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              probs.assistant >= probs.base
                ? 'bg-[#10b981]/10 border-[#10b981]/50'
                : 'bg-[#1b1a17] border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-[#10b981] uppercase font-bold">
                Target Assistant Reply (Graded)
              </span>
              <span className="font-bold text-[#10b981]">
                {(probs.assistant * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs font-mono text-[#fdfbf7] mb-3">
              "Sunlight scatters short blue wavelengths.&lt;|end|&gt;"
            </p>
            <div className="h-2 w-full rounded-full bg-[#111113] overflow-hidden">
              <div
                className="h-full bg-[#10b981] transition-all duration-300"
                style={{ width: `${probs.assistant * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#a8a29e] pt-1">
          <span>
            Assistant Cross-Entropy Loss:{' '}
            <strong className={probs.loss < 0.35 ? 'text-[#10b981]' : 'text-[#f6e9c7]'}>
              {probs.loss.toFixed(3)} nats
            </strong>
          </span>
          <span>
            {probs.assistant > probs.base
              ? 'Preference flipped! Model now answers as an assistant.'
              : 'Untuned base model still prefers continuing with more questions.'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function DPOPreferenceLab() {
  const [beta, setBeta] = useState(2.0)
  const [dpoSteps, setDpoSteps] = useState(2)

  // Frozen reference logprobs (per-token length-normalized)
  const refChosen = -1.45
  const refRejected = -1.40

  // Policy logprobs shift with DPO updates
  const polChosen = refChosen + dpoSteps * 0.22
  const polRejected = refRejected - dpoSteps * 0.25

  const chosenGap = polChosen - refChosen
  const rejectedGap = polRejected - refRejected
  const margin = chosenGap - rejectedGap

  // -log(sigmoid(beta * margin)) = log(1 + exp(-beta * margin))
  const dpoLoss = Math.log(1 + Math.exp(-beta * margin))
  const prefProb = 1 / (1 + Math.exp(-beta * margin))

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Direct Preference Optimization (DPO) Margin Explorer
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          Policy vs Frozen Reference Model
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Side-by-Side Chosen vs Rejected */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#10b981] font-bold">
                <ThumbsUp size={13} />
                <span>Chosen Reply (Human Preferred)</span>
              </span>
              <span className="text-[#10b981] font-bold">
                Δ = {chosenGap >= 0 ? `+${chosenGap.toFixed(2)}` : chosenGap.toFixed(2)}
              </span>
            </div>
            <p className="text-xs font-mono text-[#fdfbf7]">
              "The little fox waited quietly by the oak tree until the storm passed."
            </p>
            <div className="text-[11px] font-mono text-[#a8a29e] pt-1 border-t border-white/10 flex justify-between">
              <span>Policy logprob: {polChosen.toFixed(2)}</span>
              <span>Frozen Ref: {refChosen.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#ef4444] font-bold">
                <ThumbsDown size={13} />
                <span>Rejected Reply (Repetitive / Flat)</span>
              </span>
              <span className="text-[#ef4444] font-bold">
                Δ = {rejectedGap >= 0 ? `+${rejectedGap.toFixed(2)}` : rejectedGap.toFixed(2)}
              </span>
            </div>
            <p className="text-xs font-mono text-[#fdfbf7]">
              "The fox went to the tree and the tree was very big and very big."
            </p>
            <div className="text-[11px] font-mono text-[#a8a29e] pt-1 border-t border-white/10 flex justify-between">
              <span>Policy logprob: {polRejected.toFixed(2)}</span>
              <span>Frozen Ref: {refRejected.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Sliders & DPO Loss Readout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-[#1b1a17] border border-white/10">
          <div className="md:col-span-7 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#d6d3d1]">DPO Training Updates Applied</span>
                <span className="text-[#f6e9c7] font-bold">Step {dpoSteps}</span>
              </div>
              <input
                type="range"
                min={0}
                max={6}
                step={1}
                value={dpoSteps}
                onChange={(e) => setDpoSteps(parseInt(e.target.value, 10))}
                className="w-full accent-[#f6e9c7] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#d6d3d1]">Reference Anchor Strength (β)</span>
                <span className="text-[#f6e9c7] font-bold">β = {beta.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={4.0}
                step={0.5}
                value={beta}
                onChange={(e) => setBeta(parseFloat(e.target.value))}
                className="w-full accent-[#f6e9c7] cursor-pointer"
              />
            </div>
          </div>

          <div className="md:col-span-5 p-3.5 rounded-xl bg-[#0f0f11] border border-white/10 font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#a8a29e]">Gap (Δchosen − Δrejected):</span>
              <span className="text-[#f6e9c7] font-bold">+{margin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#a8a29e]">Policy Prefers Chosen:</span>
              <span className="text-[#10b981] font-bold">{(prefProb * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-white/10">
              <span className="text-[#a8a29e]">DPO Loss −log σ(β·Δ):</span>
              <span className="text-[#fdfbf7] font-bold">{dpoLoss.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LMBBehaviorTuningPlayground() {
  return (
    <div className="space-y-6">
      <SFTByExampleLab />
      <DPOPreferenceLab />
    </div>
  )
}
