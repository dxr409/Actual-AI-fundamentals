import React, { useState, useMemo } from 'react'
import { Play, RotateCcw } from 'lucide-react'

export function ActivationFunctionLab() {
  const [mode, setMode] = useState<'silu' | 'relu' | 'linear'>('silu')
  const [trainedProgress, setTrainedProgress] = useState<number>(1.0) // 0 = initial, 1 = trained

  // Sample x in [-1, 1], target y = 0.65 * sin(2.8 * x) + 0.2 * x^2 - 0.1
  const points = useMemo(() => {
    const xs: number[] = []
    for (let i = 0; i <= 40; i++) {
      xs.push(-1 + (2 * i) / 40)
    }

    return xs.map((x) => {
      const target = 0.55 * Math.sin(2.8 * x) + 0.25 * x * x - 0.12
      // Initial untrained guess is nearly flat line
      const initY = 0.1 * x
      let convergedY = 0
      if (mode === 'linear') {
        // Best linear fit collapses to a straight line!
        convergedY = 0.36 * x - 0.03
      } else if (mode === 'relu') {
        // Piecewise linear approximation
        const h1 = Math.max(0, 1.4 * x + 0.6)
        const h2 = Math.max(0, -1.5 * x - 0.15)
        const h3 = Math.max(0, 1.6 * x - 0.35)
        convergedY = 0.52 * h1 - 0.62 * h2 - 0.35 * h3 - 0.22
      } else {
        // Smooth SiLU 2-layer fit closely tracks the target curve
        convergedY = target * 0.96 + 0.02 * Math.cos(4 * x)
      }

      const pred = initY * (1 - trainedProgress) + convergedY * trainedProgress
      return { x, target, pred }
    })
  }, [mode, trainedProgress])

  const mse = useMemo(() => {
    const sum = points.reduce((acc, p) => acc + Math.pow(p.pred - p.target, 2), 0)
    return sum / points.length
  }, [points])

  const toSvg = (x: number, y: number) => {
    const sx = ((x + 1) / 2) * 260 + 20
    const sy = 75 - y * 65
    return `${sx.toFixed(1)},${sy.toFixed(1)}`
  }

  const targetPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvg(p.x, p.target)}`).join(' ')
  const predPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvg(p.x, p.pred)}`).join(' ')

  const isCollapsed = mode === 'linear' && trainedProgress > 0.3

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Why the Activation Function Matters
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { id: 'silu', label: 'With SiLU (SwiGLU Kink)' },
            { id: 'relu', label: 'With ReLU (Sharp Hinge)' },
            { id: 'linear', label: 'No Activation (Linear Collapse)' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setMode(opt.id as 'silu' | 'relu' | 'linear')
                setTrainedProgress(1.0)
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                mode === opt.id
                  ? 'bg-[#f6e9c7] text-[#1a1813] font-bold'
                  : 'bg-[#22211d] text-[#d6d3d1] border border-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Curve Plot */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-[#0f0f11] border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono mb-2">
            <span className="text-[#a8a29e]">
              Dashed = <strong className="text-[#f6e9c7]">Target Curve</strong> · Solid ={' '}
              <strong className={isCollapsed ? 'text-[#ef4444]' : 'text-[#10b981]'}>
                2-Layer MLP Output
              </strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                mse < 0.03
                  ? 'bg-[#10b981]/15 text-[#10b981]'
                  : 'bg-[#ef4444]/15 text-[#ef4444]'
              }`}
            >
              Loss (MSE): {mse.toFixed(4)}
            </span>
          </div>

          <svg viewBox="0 0 300 150" className="w-full h-44 overflow-visible">
            <line x1="20" y1="75" x2="280" y2="75" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="150" y1="10" x2="150" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Target Curve (dashed warm cream) */}
            <path
              d={targetPath}
              fill="none"
              stroke="#f6e9c7"
              strokeWidth="2"
              strokeDasharray="4 3"
              opacity="0.75"
            />

            {/* Network Prediction Curve */}
            <path
              d={predPath}
              fill="none"
              stroke={isCollapsed ? '#ef4444' : '#10b981'}
              strokeWidth="2.8"
            />
          </svg>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[11px] font-mono text-[#a8a29e]">Training Progress:</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={trainedProgress}
                onChange={(e) => setTrainedProgress(parseFloat(e.target.value))}
                className="flex-1 accent-[#f6e9c7] cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={() => setTrainedProgress(trainedProgress < 1 ? 1 : 0)}
              className="px-3 py-1 rounded-lg bg-[#f6e9c7] text-[#1a1813] text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {trainedProgress < 1 ? <Play size={12} /> : <RotateCcw size={12} />}
              <span>{trainedProgress < 1 ? 'Train to Convergence' : 'Reset Weights'}</span>
            </button>
          </div>
        </div>

        {/* Mathematical Explanation */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-3">
          <div className="text-xs font-bold text-[#f6e9c7]">
            {mode === 'linear'
              ? 'Why Two Linear Layers Collapse Into One'
              : mode === 'relu'
              ? 'ReLU: Folding Space with Sharp Hinges'
              : 'SiLU / SwiGLU: Smooth Gated Nonlinearity'}
          </div>
          <p className="text-xs text-[#d6d3d1] leading-relaxed">
            {mode === 'linear'
              ? 'Without an activation function between W₁ and W₂, multiplying by W₁ and then multiplying by W₂ is just W₂(W₁x) = (W₂W₁)x = W_combined · x. No matter how many linear layers you stack, the network can only ever draw a straight line!'
              : mode === 'relu'
              ? 'Applying max(0, z) between the two matrices prevents the matrices from multiplying together. Each hidden unit creates a "hinge" at a different spot, allowing the second layer to bend and stitch them into curves.'
              : 'Modern transformers (like LLaMA and our model) use SiLU: z · σ(z) inside a gated SwiGLU MLP. It squashes negative numbers smoothly while letting positive activations pass, giving clean gradients everywhere.'}
          </p>
          <div className="p-2.5 rounded-lg bg-[#121214] border border-white/5 font-mono text-[11px] text-[#fdfbf7]">
            {mode === 'linear' ? (
              <span className="text-[#ef4444]">y = W₂ · (W₁ · x) = (W₂W₁) · x  (Collapsed!)</span>
            ) : mode === 'relu' ? (
              <span className="text-[#10b981]">y = W₂ · max(0, W₁ · x + b₁)</span>
            ) : (
              <span className="text-[#10b981]">y = W_down · (SiLU(W_gate · x) ⊙ W_up · x)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface BlockStation {
  id: string
  name: string
  short: string
  code: string
  role: string
  sampleVec: number[]
}

const BLOCK_STATIONS: BlockStation[] = [
  {
    id: 'ln1',
    name: '1. Pre-Attention RMSNorm',
    short: 'RMSNorm 1',
    code: 'h = self.ln_1(x)',
    role: 'Rescales each token vector by its root-mean-square magnitude so numbers entering attention stay in a healthy, stable range.',
    sampleVec: [0.64, -1.12, 0.88, 1.05],
  },
  {
    id: 'attn',
    name: '2. Multi-Head Causal Attention ("Talk")',
    short: 'Attention',
    code: 'attn_out = self.attn(h)',
    role: 'The only place where tokens talk to earlier tokens. Computes Q, K, V projections, applies RoPE positions and causal mask, and returns a context update.',
    sampleVec: [0.28, 0.45, -0.19, 0.34],
  },
  {
    id: 'res1',
    name: '3. First Residual Highway Merge (+)',
    short: 'x = x + attn',
    code: 'x = x + attn_out',
    role: 'Instead of replacing the token vector, merges the attention update directly onto the main highway x. Preserves gradient flow from top to bottom.',
    sampleVec: [1.18, -0.95, 1.01, 1.64],
  },
  {
    id: 'ln2',
    name: '4. Pre-MLP RMSNorm',
    short: 'RMSNorm 2',
    code: 'h = self.ln_2(x)',
    role: 'Normalizes the updated highway vector again before feeding it into the position-wise feed-forward network.',
    sampleVec: [0.96, -0.77, 0.82, 1.33],
  },
  {
    id: 'mlp',
    name: '5. SwiGLU Feed-Forward MLP ("Think")',
    short: 'SwiGLU MLP',
    code: 'mlp_out = self.down(silu(self.gate(h)) * self.up(h))',
    role: 'Each token sits alone and digests what it just heard. Expands width d → 8d/3, applies gated SiLU nonlinearity, and projects back to width d. Holds ~2/3 of block parameters.',
    sampleVec: [-0.14, 0.52, 0.31, -0.22],
  },
  {
    id: 'res2',
    name: '6. Second Residual Highway Merge (+)',
    short: 'x = x + mlp',
    code: 'x = x + mlp_out',
    role: 'Adds the MLP refinement onto the residual highway. The output vector has the exact same shape (d_model) and is ready for the next Transformer block.',
    sampleVec: [1.04, -0.43, 1.32, 1.42],
  },
]

export function TransformerBlockInspector() {
  const [selectedId, setSelectedId] = useState<string>('res1')
  const [residualEnabled, setResidualEnabled] = useState(true)
  const [normEnabled, setNormEnabled] = useState(true)

  const active = BLOCK_STATIONS.find((s) => s.id === selectedId) || BLOCK_STATIONS[0]

  // Simulate signal health across 24 layers
  const signalHealth = useMemo(() => {
    if (residualEnabled && normEnabled) {
      return { status: 'Healthy (1.02× RMS across 24 layers)', ok: true }
    }
    if (!residualEnabled) {
      return { status: 'Vanished! (0.0001× gradient after 24 layers — untrainable)', ok: false }
    }
    return { status: 'Exploded! (8,420× activation drift without RMSNorm)', ok: false }
  }, [residualEnabled, normEnabled])

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Open Up One Transformer Block
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setResidualEnabled((v) => !v)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
              residualEnabled
                ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40 font-bold'
                : 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40 font-bold'
            }`}
          >
            Residual Highway: {residualEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => setNormEnabled((v) => !v)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all cursor-pointer ${
              normEnabled
                ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40 font-bold'
                : 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40 font-bold'
            }`}
          >
            RMSNorm: {normEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Interactive Highway Diagram */}
        <div className="p-4 rounded-xl bg-[#0f0f11] border border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono mb-3">
            <span className="text-[#a8a29e]">
              Click any station along the block to inspect its job:
            </span>
            <span className={signalHealth.ok ? 'text-[#10b981] font-bold' : 'text-[#ef4444] font-bold'}>
              Deep Stack Signal: {signalHealth.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {BLOCK_STATIONS.map((st) => {
              const isSelected = st.id === selectedId
              const isDisabled =
                (!residualEnabled && (st.id === 'res1' || st.id === 'res2')) ||
                (!normEnabled && (st.id === 'ln1' || st.id === 'ln2'))

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedId(st.id)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isDisabled
                      ? 'bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444] line-through'
                      : isSelected
                      ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] font-bold shadow-md'
                      : 'bg-[#1b1a17] text-[#fdfbf7] border-white/10 hover:border-[#f6e9c7]/40'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">{st.short}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-[#1a1813]/80' : 'text-[#a8a29e]'
                    }`}
                  >
                    {st.id.startsWith('res')
                      ? 'Highway +'
                      : st.id.startsWith('ln')
                      ? 'Rescale'
                      : 'Sublayer'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Station Detail Panel */}
        <div className="p-4 rounded-xl bg-[#1b1a17] border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#f6e9c7]">{active.name}</span>
            </div>
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{active.role}</p>
            <div className="inline-block px-3 py-1.5 rounded-lg bg-[#111113] border border-white/10 font-mono text-xs text-[#fdfbf7]">
              {active.code}
            </div>
          </div>

          <div className="md:col-span-4 p-3 rounded-xl bg-[#121214] border border-white/5 font-mono text-xs space-y-1.5">
            <div className="text-[10px] text-[#a8a29e] uppercase">Sample Token Vector Slice</div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {active.sampleVec.map((v, i) => (
                <div
                  key={i}
                  className="p-1.5 rounded bg-[#1b1a17] border border-white/10 text-center text-[#f6e9c7]"
                >
                  {v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LMBBlockPlayground() {
  return (
    <div className="space-y-6">
      <ActivationFunctionLab />
      <TransformerBlockInspector />
    </div>
  )
}
