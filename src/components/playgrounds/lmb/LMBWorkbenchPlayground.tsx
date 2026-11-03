import React, { useState, useMemo } from 'react'
import { Play, RotateCcw, Eye, Check, AlertTriangle } from 'lucide-react'

export type WorkbenchMode =
  | 'wb-project-setup'
  | 'wb-base-models'
  | 'wb-pretraining-data'
  | 'wb-pretraining-run'
  | 'wb-sampling'
  | 'wb-finetuning-data'
  | 'wb-sft-run'
  | 'wb-chat-xray'

// ── Ch 9: Project Setup ──
export function WorkbenchProjectSetup() {
  const [nLayer, setNLayer] = useState(8)
  const [nEmbd, setNEmbd] = useState(256)
  const [vocab, setVocab] = useState(10000)
  const [checkpointSaved, setCheckpointSaved] = useState(false)
  const [lockedShape, setLockedShape] = useState({ nLayer: 8, nEmbd: 256, vocab: 10000 })

  const hidden = 64 * Math.floor((Math.floor((8 * nEmbd) / 3) + 63) / 64)
  const totalParams = vocab * nEmbd + nLayer * (4 * nEmbd * nEmbd + 3 * nEmbd * hidden)

  const shapeMatchesCheckpoint =
    !checkpointSaved ||
    (lockedShape.nLayer === nLayer &&
      lockedShape.nEmbd === nEmbd &&
      lockedShape.vocab === vocab)

  const specialTokens = [
    { token: '<|system|>', id: vocab - 4, role: 'Opens system instructions' },
    { token: '<|user|>', id: vocab - 3, role: 'Opens user prompt turn' },
    { token: '<|assistant|>', id: vocab - 2, role: 'Cue for assistant reply (graded in SFT)' },
    { token: '<|end|>', id: vocab - 1, role: 'Clean end-of-turn stop boundary' },
  ]

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive Workbench · Project Setup & Reserved Special Chat Tokens
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setCheckpointSaved(true)
            setLockedShape({ nLayer, nEmbd, vocab })
          }}
          className="px-3 py-1 rounded-lg bg-[#f6e9c7] text-[#1a1813] text-xs font-bold cursor-pointer"
        >
          {checkpointSaved ? 'Update Saved Checkpoint Shape' : 'Initialize Checkpoint on Disk'}
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#f6e9c7]">1. Starting Model Shape</span>
            <span className="text-xs font-mono text-[#d6d3d1]">
              {(totalParams / 1e6).toFixed(2)}M parameters
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Transformer Blocks (Depth)</span>
              <span className="text-[#f6e9c7]">{nLayer} blocks</span>
            </div>
            <input
              type="range"
              min={4}
              max={16}
              step={2}
              value={nLayer}
              onChange={(e) => setNLayer(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Vector Width (d_model)</span>
              <span className="text-[#f6e9c7]">{nEmbd}d</span>
            </div>
            <input
              type="range"
              min={128}
              max={512}
              step={64}
              value={nEmbd}
              onChange={(e) => setNEmbd(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Tokenizer Vocabulary Size</span>
              <span className="text-[#f6e9c7]">{vocab.toLocaleString()} tokens</span>
            </div>
            <input
              type="range"
              min={4096}
              max={16384}
              step={2048}
              value={vocab}
              onChange={(e) => setVocab(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              shapeMatchesCheckpoint
                ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'
                : 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]'
            }`}
          >
            {shapeMatchesCheckpoint ? <Check size={14} /> : <AlertTriangle size={14} />}
            <span>
              {shapeMatchesCheckpoint
                ? checkpointSaved
                  ? 'Checkpoint shape matches saved weights on disk — ready to resume!'
                  : 'No checkpoint written yet — you can freely adjust dimensions.'
                : `Shape mismatch! Saved checkpoint expects (${lockedShape.nLayer}L, ${lockedShape.nEmbd}d, ${lockedShape.vocab} vocab).`}
            </span>
          </div>
        </div>

        <div className="lg:col-span-6 p-4 rounded-xl bg-[#0f0f11] border border-white/10 space-y-3">
          <div className="text-xs font-bold text-[#f6e9c7]">
            2. Reserved Special Chat Tokens (Protected IDs)
          </div>
          <p className="text-xs text-[#a8a29e]">
            Ordinary BPE text merges can never produce these IDs. Later stages use them to frame
            turns cleanly:
          </p>
          <div className="space-y-2">
            {specialTokens.map((st) => (
              <div
                key={st.token}
                className="p-2.5 rounded-lg bg-[#1b1a17] border border-white/10 flex items-center justify-between font-mono text-xs"
              >
                <span className="text-[#f6e9c7] font-bold">{st.token}</span>
                <span className="text-[#a8a29e] text-[11px]">{st.role}</span>
                <span className="px-2 py-0.5 rounded bg-[#121214] text-[#10b981] font-bold">
                  ID #{st.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ch 10: Base Models Catalog ──
const BASE_CATALOG = [
  {
    id: 'smollm2',
    name: 'SmolLM2 135M (Recommended)',
    params: '135M',
    ram: '1.1 GB',
    vocab: '49,152 (English)',
    sample:
      'Prompt: "Once upon a time, a curious robot" → "built a small brass telescope on the roof of the workshop to watch the passing comets."',
    verdict: 'Fast on one Mac, writes fluent English right out of the box.',
  },
  {
    id: 'supra50m',
    name: 'Supra 50M (Low-Memory Fast Path)',
    params: '50M',
    ram: '420 MB',
    vocab: '32,000 (English)',
    sample:
      'Prompt: "Once upon a time, a curious robot" → "walked into the yard and saw a red ball on the grass near the door."',
    verdict: 'Shortest context and lowest memory footprint; weaker world knowledge.',
  },
  {
    id: 'qwen500m',
    name: 'Qwen2.5 0.5B (Multilingual)',
    params: '490M',
    ram: '3.4 GB',
    vocab: '151,936 (Multilingual)',
    sample:
      'Prompt: "Once upon a time, a curious robot" → "discovered an ancient library where books were written in dozens of human languages."',
    verdict: 'Large multilingual vocabulary; heavier memory and slower steps.',
  },
]

export function WorkbenchBaseModels() {
  const [selectedId, setSelectedId] = useState('smollm2')
  const active = BASE_CATALOG.find((m) => m.id === selectedId) || BASE_CATALOG[0]

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive Workbench · Open-Source Base Model Catalog
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          Importing a base model skips pre-training & goes straight to SFT
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BASE_CATALOG.map((m) => {
            const isSel = m.id === selectedId
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] shadow-md'
                    : 'bg-[#1b1a17] text-[#fdfbf7] border-white/10 hover:border-[#f6e9c7]/40'
                }`}
              >
                <div className="text-xs font-bold">{m.name}</div>
                <div
                  className={`text-[11px] font-mono mt-1 ${
                    isSel ? 'text-[#1a1813]/80' : 'text-[#a8a29e]'
                  }`}
                >
                  {m.params} params · {m.ram} RAM
                </div>
              </button>
            )
          })}
        </div>

        <div className="p-4 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2.5 font-mono text-xs">
          <div className="flex flex-wrap justify-between gap-2 text-[#a8a29e]">
            <span>Vocabulary: <strong className="text-[#f6e9c7]">{active.vocab}</strong></span>
            <span className="text-[#10b981] font-bold">Pre-trained on billions of tokens</span>
          </div>
          <div className="p-3 rounded-lg bg-[#1b1a17] border border-white/10 text-[#fdfbf7] leading-relaxed">
            {active.sample}
          </div>
          <div className="text-[11px] text-[#d6d3d1] font-sans">{active.verdict}</div>
        </div>
      </div>
    </div>
  )
}

// ── Ch 11: Pre-training Data ──
const PRETRAIN_CORPORA = [
  {
    id: 'tinystories',
    name: 'TinyStories 2',
    tokens: '470M tokens',
    style: 'Simple, coherent short stories using a core vocabulary',
    excerpt:
      'Lily had a little yellow bucket. She took it to the garden to collect smooth pebbles for her frog.',
  },
  {
    id: 'cosmopedia',
    name: 'Cosmopedia-100k',
    tokens: '195M tokens',
    style: 'Synthetic textbooks, blog posts, and how-to articles across diverse subjects',
    excerpt:
      'Photosynthesis converts solar radiation into chemical energy stored within carbohydrate molecules.',
  },
]

export function WorkbenchPretrainingData() {
  const [corpusId, setCorpusId] = useState('tinystories')
  const [plannedSteps, setPlannedSteps] = useState(20000)
  const active = PRETRAIN_CORPORA.find((c) => c.id === corpusId) || PRETRAIN_CORPORA[0]
  const tokensSeen = (plannedSteps * 32 * 512) / 1e6 // batch 32 * context 512

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive Workbench · Pre-Training Corpus & Token Budget
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRETRAIN_CORPORA.map((c) => {
            const isSel = c.id === corpusId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCorpusId(c.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7]'
                    : 'bg-[#1b1a17] text-[#fdfbf7] border-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">{c.name}</span>
                  <span className="text-[11px] font-mono">{c.tokens}</span>
                </div>
                <div
                  className={`text-[11px] mt-1 ${
                    isSel ? 'text-[#1a1813]/80' : 'text-[#a8a29e]'
                  }`}
                >
                  {c.style}
                </div>
              </button>
            )
          })}
        </div>

        <div className="p-4 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2">
          <div className="text-[11px] font-mono text-[#a8a29e]">Corpus Document Preview:</div>
          <p className="text-xs font-mono text-[#fdfbf7]">"{active.excerpt}"</p>
        </div>

        <div className="p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span>Planned Training Steps (Batch 32 × 512 tokens)</span>
            <span className="text-[#f6e9c7] font-bold">
              {plannedSteps.toLocaleString()} steps (~{tokensSeen.toFixed(0)}M tokens seen)
            </span>
          </div>
          <input
            type="range"
            min={2000}
            max={30000}
            step={2000}
            value={plannedSteps}
            onChange={(e) => setPlannedSteps(parseInt(e.target.value, 10))}
            className="w-full accent-[#f6e9c7] cursor-pointer"
          />
          <div className="text-[11px] font-mono text-[#10b981]">
            tokens/parameter ratio on 9M model: {(tokensSeen / 9).toFixed(1)}× (Chinchilla rule of
            thumb = 20×)
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ch 12: Pre-Training Run ──
export function WorkbenchPretrainingRun() {
  const [step, setStep] = useState(4000)

  // Compute scheduled LR: linear warmup 0..200 to 5e-4, then cosine decay to 5e-5 at 20000
  const lr = useMemo(() => {
    const peak = 5e-4
    const minLr = 5e-5
    if (step < 200) return peak * (step / 200)
    const progress = Math.min(1, (step - 200) / (20000 - 200))
    return minLr + 0.5 * (peak - minLr) * (1 + Math.cos(Math.PI * progress))
  }, [step])

  const trainLoss = 8.8 * Math.exp(-step / 1200) + 2.15 * Math.exp(-step / 14000) + 1.45
  const valLoss = trainLoss + 0.06
  const gradNorm = step < 200 ? 1.45 : 0.42 + 0.25 * Math.exp(-step / 4000)

  const sampleText =
    step < 500
      ? 'the the and a to in of the was'
      : step < 3000
      ? 'Once upon a time there was a little girl who liked the big park.'
      : 'Once upon a time, a little fox named Pip found a shiny red acorn under the old oak tree.'

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive Workbench · Pre-Training Telemetry & LR Schedule
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          Step {step.toLocaleString()} / 20,000
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="p-4 rounded-xl bg-[#1b1a17] border border-white/10">
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span>Scrub Pre-Training Timeline (Warmup → Cosine Decay)</span>
            <span className="text-[#f6e9c7] font-bold">Step {step.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={50}
            max={20000}
            step={50}
            value={step}
            onChange={(e) => setStep(parseInt(e.target.value, 10))}
            className="w-full accent-[#f6e9c7] cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#0f0f11] border border-white/10">
            <div className="text-[10px] text-[#a8a29e]">Train Loss</div>
            <div className="text-base font-bold text-[#10b981] mt-0.5">{trainLoss.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0f0f11] border border-white/10">
            <div className="text-[10px] text-[#a8a29e]">Validation Loss</div>
            <div className="text-base font-bold text-[#f6e9c7] mt-0.5">{valLoss.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0f0f11] border border-white/10">
            <div className="text-[10px] text-[#a8a29e]">Scheduled LR</div>
            <div className="text-base font-bold text-[#fdfbf7] mt-0.5">{lr.toExponential(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0f0f11] border border-white/10">
            <div className="text-[10px] text-[#a8a29e]">Grad Norm (Clip 1.0)</div>
            <div
              className={`text-base font-bold mt-0.5 ${
                gradNorm > 1.0 ? 'text-[#ef4444]' : 'text-[#10b981]'
              }`}
            >
              {gradNorm.toFixed(2)} {gradNorm > 1.0 ? '(Clipped!)' : ''}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f0f11] border border-white/10 font-mono text-xs space-y-1">
          <div className="text-[10px] text-[#a8a29e] uppercase">
            Checkpoint Sample at Step {step.toLocaleString()}:
          </div>
          <div className="text-[#fdfbf7]">"{sampleText}"</div>
        </div>
      </div>
    </div>
  )
}

// ── Ch 13: Sampling (Min-p, Top-k, Top-p, Temperature) ──
const RAW_NEXT_CANDIDATES = [
  { tok: 'stream', logit: 3.2 },
  { tok: 'river', logit: 2.5 },
  { tok: 'forest', logit: 1.9 },
  { tok: 'meadow', logit: 1.2 },
  { tok: 'garden', logit: 0.6 },
  { tok: 'spaceship', logit: -0.9 },
]

export function WorkbenchSampling() {
  const [temperature, setTemperature] = useState(0.8)
  const [minP, setMinP] = useState(0.1)
  const [topK, setTopK] = useState(6)

  const candidates = useMemo(() => {
    const scaled = RAW_NEXT_CANDIDATES.map((c) => c.logit / Math.max(0.1, temperature))
    const maxL = Math.max(...scaled)
    const exps = scaled.map((s) => Math.exp(s - maxL))
    const sum = exps.reduce((a, b) => a + b, 0)
    const probs = exps.map((e) => e / sum)

    const topProb = probs[0]
    const cutoff = topProb * minP

    const withStatus = RAW_NEXT_CANDIDATES.map((c, idx) => {
      const p = probs[idx]
      const keptByK = idx < topK
      const keptByMinP = p >= cutoff
      const kept = keptByK && keptByMinP
      return { ...c, rawProb: p, kept, cutoff }
    })

    const keptSum = withStatus.reduce((acc, c) => acc + (c.kept ? c.rawProb : 0), 0)
    return {
      cutoff,
      items: withStatus.map((c) => ({
        ...c,
        finalProb: c.kept && keptSum > 0 ? c.rawProb / keptSum : 0,
      })),
    }
  }, [temperature, minP, topK])

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive Workbench · Sampling Filters (Temperature, Min-p & Top-k)
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          Moving min-p cutoff = {(candidates.cutoff * 100).toFixed(1)}%
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Temperature</span>
              <span className="text-[#f6e9c7] font-bold">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.8}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Min-p (Fraction of Top Token)</span>
              <span className="text-[#f6e9c7] font-bold">{minP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={0.5}
              step={0.05}
              value={minP}
              onChange={(e) => setMinP(parseFloat(e.target.value))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Top-k Limit</span>
              <span className="text-[#f6e9c7] font-bold">k = {topK}</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>
        </div>

        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2.5">
          <div className="text-xs font-mono text-[#a8a29e] mb-2">
            Prompt: <span className="text-[#d6d3d1]">"The little fox trotted down to the "</span>
          </div>
          {candidates.items.map((item) => (
            <div
              key={item.tok}
              className={`p-2.5 rounded-xl border font-mono text-xs ${
                item.kept
                  ? 'bg-[#1b1a17] border-white/10 text-[#fdfbf7]'
                  : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444] opacity-70'
              }`}
            >
              <div className="flex justify-between mb-1">
                <span className="font-bold">"{item.tok}"</span>
                <span>
                  {item.kept ? (
                    <span className="text-[#10b981] font-bold">
                      Kept → {(item.finalProb * 100).toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[#ef4444]">
                      Filtered out (raw {(item.rawProb * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#111113] overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${item.kept ? item.finalProb * 100 : item.rawProb * 100}%`,
                    backgroundColor: item.kept ? '#10b981' : '#ef4444',
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

// ── Ch 14: Fine-Tuning Data Mixer ──
export function WorkbenchFinetuningData() {
  const [voiceShare, setVoiceShare] = useState(40) // % share for small custom voice dataset (400 rows)
  const smallRows = 400
  const catalogRows = 12000

  // Scarcest source caps total so big set doesn't drown small set
  const totalMixedRows = Math.min(
    catalogRows + smallRows,
    Math.round(smallRows / Math.max(0.05, voiceShare / 100))
  )
  const sampledCatalogRows = Math.max(0, totalMixedRows - smallRows)

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive Workbench · SFT Dataset Mixer (Scarcest-Source Cap)
          </span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-6 p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-3">
          <div className="flex justify-between text-xs font-mono">
            <span>Custom Voice / Chat Share</span>
            <span className="text-[#f6e9c7] font-bold">
              {voiceShare}% Voice / {100 - voiceShare}% General Assistant
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={voiceShare}
            onChange={(e) => setVoiceShare(parseInt(e.target.value, 10))}
            className="w-full accent-[#f6e9c7] cursor-pointer"
          />
          <p className="text-xs text-[#a8a29e] leading-relaxed">
            Because your custom voice dataset has only <strong>{smallRows} rows</strong> while the
            general catalog has <strong>{catalogRows.toLocaleString()} rows</strong>, the mixer caps
            total rows so the large catalog is sampled down instead of drowning out your voice.
          </p>
        </div>

        <div className="md:col-span-6 p-4 rounded-xl bg-[#0f0f11] border border-white/10 font-mono text-xs space-y-2.5">
          <div className="flex justify-between">
            <span className="text-[#a8a29e]">Custom Voice Rows Included:</span>
            <span className="text-[#10b981] font-bold">{smallRows} rows (100% used)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#a8a29e]">General Catalog Rows Sampled:</span>
            <span className="text-[#f6e9c7] font-bold">{sampledCatalogRows} rows</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-[#fdfbf7] font-bold">Resulting Mixed .jsonl:</span>
            <span className="text-[#f6e9c7] font-bold">{totalMixedRows} total conversations</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ch 15: Supervised Fine-Tuning Run & Before/After ──
const SFT_COMPARISON_PROMPTS = [
  {
    prompt: 'Explain why leaves turn orange in autumn.',
    baseReply:
      'Explain why leaves turn orange in autumn. Question 2: Explain why snow falls in winter. Question 3: Describe the water cycle in three sentences.',
    sftReply:
      'In autumn, trees stop making green chlorophyll as daylight shortens, revealing the yellow and orange pigments already inside the leaves.<|end|>',
  },
  {
    prompt: 'Rewrite this sentence more simply: "The feline slumbered upon the hearth."',
    baseReply:
      'The feline slumbered upon the hearth and dreamed of chasing mice through the tall meadow grass.',
    sftReply: 'The cat slept on the fireplace floor.<|end|>',
  },
]

export function WorkbenchSFTRun() {
  const [promptIdx, setPromptIdx] = useState(0)
  const item = SFT_COMPARISON_PROMPTS[promptIdx]

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive Workbench · Before & After SFT Checkpoint Comparator
          </span>
        </div>
        <div className="flex gap-1.5">
          {SFT_COMPARISON_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPromptIdx(idx)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer ${
                promptIdx === idx
                  ? 'bg-[#f6e9c7] text-[#1a1813] font-bold'
                  : 'bg-[#22211d] text-[#d6d3d1] border border-white/10'
              }`}
            >
              Prompt {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="p-3 rounded-xl bg-[#1b1a17] border border-white/10 font-mono text-xs">
          <span className="text-[#a8a29e]">User Prompt: </span>
          <span className="text-[#fdfbf7] font-bold">"{item.prompt}"</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/35 space-y-2">
            <div className="text-xs font-mono font-bold text-[#ef4444]">
              Before (Pre-Trained Base Checkpoint)
            </div>
            <p className="text-xs font-mono text-[#fdfbf7] leading-relaxed">"{item.baseReply}"</p>
            <div className="text-[11px] text-[#a8a29e]">
              Continues the pattern of an exam sheet or story instead of answering.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/45 space-y-2">
            <div className="text-xs font-mono font-bold text-[#10b981]">
              After (Supervised Fine-Tuned Checkpoint)
            </div>
            <p className="text-xs font-mono text-[#fdfbf7] leading-relaxed">"{item.sftReply}"</p>
            <div className="text-[11px] text-[#10b981]">
              Answers directly in the assistant turn and emits &lt;|end|&gt; cleanly.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ch 16: Chat Shell, Raw Transcript & Token X-Ray ──
const XRAY_TOKENS = [
  {
    tok: 'Stars',
    prob: 0.68,
    alts: [
      { tok: 'Stars', p: 0.68 },
      { tok: 'They', p: 0.21 },
      { tok: 'Light', p: 0.11 },
    ],
  },
  {
    tok: 'twinkle',
    prob: 0.84,
    alts: [
      { tok: 'twinkle', p: 0.84 },
      { tok: 'shine', p: 0.12 },
      { tok: 'glow', p: 0.04 },
    ],
  },
  {
    tok: 'because',
    prob: 0.91,
    alts: [
      { tok: 'because', p: 0.91 },
      { tok: 'when', p: 0.09 },
    ],
  },
  {
    tok: 'starlight',
    prob: 0.46,
    alts: [
      { tok: 'starlight', p: 0.46 },
      { tok: 'their', p: 0.34 },
      { tok: 'the', p: 0.2 },
    ],
  },
  {
    tok: 'bends',
    prob: 0.58,
    alts: [
      { tok: 'bends', p: 0.58 },
      { tok: 'passes', p: 0.29 },
      { tok: 'travels', p: 0.13 },
    ],
  },
  {
    tok: 'through',
    prob: 0.88,
    alts: [
      { tok: 'through', p: 0.88 },
      { tok: 'across', p: 0.12 },
    ],
  },
  {
    tok: 'moving',
    prob: 0.52,
    alts: [
      { tok: 'moving', p: 0.52 },
      { tok: 'Earth', p: 0.31 },
      { tok: 'warm', p: 0.17 },
    ],
  },
  {
    tok: 'air.',
    prob: 0.79,
    alts: [
      { tok: 'air.', p: 0.79 },
      { tok: 'layers.', p: 0.21 },
    ],
  },
  {
    tok: '<|end|>',
    prob: 0.94,
    alts: [
      { tok: '<|end|>', p: 0.94 },
      { tok: 'It', p: 0.06 },
    ],
  },
]

export function WorkbenchChatXRay() {
  const [showTranscript, setShowTranscript] = useState(true)
  const [xrayOn, setXrayOn] = useState(true)
  const [selectedTokIdx, setSelectedTokIdx] = useState(3)

  const activeTok = XRAY_TOKENS[selectedTokIdx]

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive Workbench · Chat Shell, Raw Transcript & Token X-Ray
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setXrayOn((v) => !v)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
              xrayOn
                ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] font-bold'
                : 'bg-[#22211d] text-[#d6d3d1] border-white/10'
            }`}
          >
            Token X-Ray: {xrayOn ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
              showTranscript
                ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] font-bold'
                : 'bg-[#22211d] text-[#d6d3d1] border-white/10'
            }`}
          >
            Raw Transcript Sheet: {showTranscript ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chat Bubble & Token X-Ray */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-3 rounded-xl bg-[#1b1a17] border border-white/10 text-xs">
            <span className="font-mono text-[#a8a29e]">User: </span>
            <span className="text-[#fdfbf7]">Why do stars twinkle at night?</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0f0f11] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#f6e9c7] font-bold">Assistant Reply (Click any token):</span>
              <span className="text-[#10b981] font-bold">Verdict: Ended cleanly (&lt;|end|&gt;)</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {XRAY_TOKENS.map((t, i) => {
                const isSel = i === selectedTokIdx
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedTokIdx(i)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-xs border transition-all cursor-pointer ${
                      isSel
                        ? 'ring-2 ring-[#f6e9c7] bg-[#f6e9c7] text-[#1a1813] font-bold'
                        : 'text-[#fdfbf7]'
                    }`}
                    style={
                      !isSel && xrayOn
                        ? {
                            backgroundColor: `rgba(16, 185, 129, ${0.1 + t.prob * 0.35})`,
                            borderColor: `rgba(16, 185, 129, ${0.3 + t.prob * 0.4})`,
                          }
                        : !isSel
                        ? { backgroundColor: '#1b1a17', borderColor: 'rgba(255,255,255,0.08)' }
                        : undefined
                    }
                  >
                    <span>{t.tok}</span>
                    {xrayOn && (
                      <span className="ml-1 text-[10px] opacity-80">
                        {Math.round(t.prob * 100)}%
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {xrayOn && (
              <div className="p-3 rounded-lg bg-[#1b1a17] border border-white/10 font-mono text-xs space-y-1.5">
                <div className="text-[11px] text-[#a8a29e]">
                  Post-Filter Candidates at Step {selectedTokIdx + 1} (picked{' '}
                  <strong className="text-[#10b981]">"{activeTok.tok}"</strong>):
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeTok.alts.map((alt, idx) => (
                    <span
                      key={alt.tok}
                      className={`px-2 py-0.5 rounded border ${
                        idx === 0
                          ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981] font-bold'
                          : 'bg-[#121214] border-white/10 text-[#d6d3d1]'
                      }`}
                    >
                      "{alt.tok}": {Math.round(alt.p * 100)}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Raw Flattened Transcript Sheet */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#0b0b0d] border border-white/10 font-mono text-xs space-y-2">
          <div className="text-[11px] text-[#f6e9c7] font-bold uppercase tracking-wider">
            What the Model Actually Reads (Flattened String)
          </div>
          {showTranscript ? (
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-[#d6d3d1] bg-[#141416] p-3 rounded-lg border border-white/5">
{`<|system|>
You are a helpful, concise assistant.<|end|>
<|user|>
Why do stars twinkle at night?<|end|>
<|assistant|>
Stars twinkle because starlight bends through moving air.<|end|>`}
            </pre>
          ) : (
            <div className="text-xs text-[#a8a29e] py-6 text-center">
              Transcript sheet hidden. Toggle "Raw Transcript Sheet: ON" above to inspect the special tokens.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LMBWorkbenchPlayground({
  mode = 'wb-project-setup',
}: {
  mode?: WorkbenchMode
}) {
  switch (mode) {
    case 'wb-project-setup':
      return <WorkbenchProjectSetup />
    case 'wb-base-models':
      return <WorkbenchBaseModels />
    case 'wb-pretraining-data':
      return <WorkbenchPretrainingData />
    case 'wb-pretraining-run':
      return <WorkbenchPretrainingRun />
    case 'wb-sampling':
      return <WorkbenchSampling />
    case 'wb-finetuning-data':
      return <WorkbenchFinetuningData />
    case 'wb-sft-run':
      return <WorkbenchSFTRun />
    case 'wb-chat-xray':
      return <WorkbenchChatXRay />
    default:
      return <WorkbenchProjectSetup />
  }
}
