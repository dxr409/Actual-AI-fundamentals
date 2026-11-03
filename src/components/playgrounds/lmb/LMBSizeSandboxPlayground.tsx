import React, { useState, useMemo } from 'react'

interface ScalePreset {
  name: string
  nLayer: number
  nEmbd: number
  nHead: number
  contextLen: number
  vocabSize: number
}

const SCALE_PRESETS: ScalePreset[] = [
  {
    name: 'Tiny 9M (This App Default)',
    nLayer: 8,
    nEmbd: 256,
    nHead: 8,
    contextLen: 512,
    vocabSize: 10000,
  },
  {
    name: 'GPT-2 Small (1999/2019 Classic)',
    nLayer: 12,
    nEmbd: 768,
    nHead: 12,
    contextLen: 1024,
    vocabSize: 50257,
  },
  {
    name: '7B Class Open Model',
    nLayer: 32,
    nEmbd: 4096,
    nHead: 32,
    contextLen: 8192,
    vocabSize: 32000,
  },
  {
    name: 'GPT-3 175B Scale',
    nLayer: 96,
    nEmbd: 12288,
    nHead: 96,
    contextLen: 2048,
    vocabSize: 50257,
  },
]

function formatCount(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return `${n}`
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${(bytes / 1e3).toFixed(0)} KB`
}

export function ModelSizeSandbox() {
  const [nLayer, setNLayer] = useState(8)
  const [nEmbd, setNEmbd] = useState(256)
  const [nHead, setNHead] = useState(8)
  const [contextLen, setContextLen] = useState(512)
  const [vocabSize, setVocabSize] = useState(10000)

  const stats = useMemo(() => {
    const hidden = 64 * Math.floor((Math.floor((8 * nEmbd) / 3) + 63) / 64)
    const attnPerBlock = 4 * nEmbd * nEmbd
    const mlpPerBlock = 3 * nEmbd * hidden
    const normPerBlock = 2 * nEmbd

    const totalAttn = nLayer * attnPerBlock
    const totalMlp = nLayer * mlpPerBlock
    const totalNorm = nLayer * normPerBlock + nEmbd
    const emb = vocabSize * nEmbd // Tied output head adds 0 extra params!
    const total = emb + totalAttn + totalMlp + totalNorm

    // Memory in BF16 (2 bytes/param) and full training with AdamW + activations (~8 bytes/param)
    const bf16WeightsBytes = total * 2
    const trainingRamBytes = total * 8 + nLayer * contextLen * nEmbd * 4
    const chinchillaTokens = total * 20

    return {
      hidden,
      emb,
      totalAttn,
      totalMlp,
      total,
      embPct: (emb / total) * 100,
      attnPct: (totalAttn / total) * 100,
      mlpPct: (totalMlp / total) * 100,
      bf16WeightsBytes,
      trainingRamBytes,
      chinchillaTokens,
      fitsOnLaptop: trainingRamBytes <= 16 * 1e9,
    }
  }, [nLayer, nEmbd, nHead, contextLen, vocabSize])

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · The Size Sandbox (Hyperparameters & Parameter Arithmetic)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {SCALE_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setNLayer(p.nLayer)
                setNEmbd(p.nEmbd)
                setNHead(p.nHead)
                setContextLen(p.contextLen)
                setVocabSize(p.vocabSize)
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                nLayer === p.nLayer && nEmbd === p.nEmbd
                  ? 'bg-[#f6e9c7] text-[#1a1813] font-bold'
                  : 'bg-[#22211d] text-[#d6d3d1] border border-white/10 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders */}
        <div className="lg:col-span-6 space-y-3.5 p-4 rounded-xl bg-[#1b1a17] border border-white/10">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Transformer Blocks (Layers)</span>
              <span className="text-[#f6e9c7] font-bold">{nLayer} layers</span>
            </div>
            <input
              type="range"
              min={2}
              max={96}
              step={2}
              value={nLayer}
              onChange={(e) => setNLayer(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Vector Width (d_model)</span>
              <span className="text-[#f6e9c7] font-bold">
                {nEmbd} (MLP hidden = {stats.hidden})
              </span>
            </div>
            <input
              type="range"
              min={128}
              max={12288}
              step={128}
              value={nEmbd}
              onChange={(e) => setNEmbd(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Attention Heads</span>
              <span className="text-[#f6e9c7] font-bold">
                {nHead} heads ({Math.max(1, Math.round(nEmbd / nHead))}d per head)
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={96}
              step={2}
              value={nHead}
              onChange={(e) => setNHead(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Context Length</span>
              <span className="text-[#f6e9c7] font-bold">{contextLen.toLocaleString()} tokens</span>
            </div>
            <input
              type="range"
              min={256}
              max={8192}
              step={256}
              value={contextLen}
              onChange={(e) => setContextLen(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Vocabulary Size (Tied Head)</span>
              <span className="text-[#f6e9c7] font-bold">{vocabSize.toLocaleString()} tokens</span>
            </div>
            <input
              type="range"
              min={4000}
              max={64000}
              step={2000}
              value={vocabSize}
              onChange={(e) => setVocabSize(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>
        </div>

        {/* Live Breakdown & Hardware Budget */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-[#0f0f11] border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="text-[11px] font-mono uppercase text-[#a8a29e]">
                  Total Learned Parameters
                </div>
                <div className="text-2xl font-bold font-mono text-[#f6e9c7]">
                  {formatCount(stats.total)}
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                  stats.fitsOnLaptop
                    ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
                    : 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40'
                }`}
              >
                {stats.fitsOnLaptop ? 'Fits on 1 Laptop' : 'Needs GPU Cluster'}
              </span>
            </div>

            {/* Stacked Parameter Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#1c1b18] border border-white/10 mb-3">
              <div
                style={{ width: `${stats.embPct}%`, backgroundColor: '#fdfbf7' }}
                title="Embeddings (Tied)"
              />
              <div
                style={{ width: `${stats.attnPct}%`, backgroundColor: '#f6e9c7' }}
                title="Multi-Head Attention"
              />
              <div
                style={{ width: `${stats.mlpPct}%`, backgroundColor: '#a8a29e' }}
                title="SwiGLU MLP"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#1b1a17] border border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#a8a29e]">
                  <span className="w-2 h-2 rounded-full bg-[#fdfbf7]" />
                  <span>Embeddings</span>
                </div>
                <div className="font-bold text-[#fdfbf7] mt-0.5">{formatCount(stats.emb)}</div>
                <div className="text-[10px] text-[#a8a29e]">{stats.embPct.toFixed(1)}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1b1a17] border border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#a8a29e]">
                  <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
                  <span>Attention</span>
                </div>
                <div className="font-bold text-[#f6e9c7] mt-0.5">{formatCount(stats.totalAttn)}</div>
                <div className="text-[10px] text-[#a8a29e]">{stats.attnPct.toFixed(1)}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1b1a17] border border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] text-[#a8a29e]">
                  <span className="w-2 h-2 rounded-full bg-[#a8a29e]" />
                  <span>SwiGLU MLP</span>
                </div>
                <div className="font-bold text-[#d6d3d1] mt-0.5">{formatCount(stats.totalMlp)}</div>
                <div className="text-[10px] text-[#a8a29e]">{stats.mlpPct.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <div className="text-[10px] text-[#a8a29e]">BF16 Checkpoint / Training RAM</div>
              <div className="text-[#fdfbf7] font-bold mt-0.5">
                {formatBytes(stats.bf16WeightsBytes)} / {formatBytes(stats.trainingRamBytes)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#a8a29e]">Chinchilla Optimal Data (20×)</div>
              <div className="text-[#f6e9c7] font-bold mt-0.5">
                ~{formatCount(stats.chinchillaTokens)} tokens
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LMBSizeSandboxPlayground() {
  return <ModelSizeSandbox />
}
