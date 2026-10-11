import React, { useState } from 'react'
import UnderTheHood from './UnderTheHood'

type PartId = 'residual' | 'norm1' | 'attention' | 'add1' | 'norm2' | 'mlp' | 'add2'

interface PartInfo {
  name: string
  subtitle: string
  description: string
  color: string
}

const PARTS: Record<PartId, PartInfo> = {
  residual: {
    name: 'The residual highway',
    subtitle: 'Pass-through skip connection',
    description:
      'The vector rides this line straight through the whole block. Nothing on it ever replaces the vector; the sublayers only merge small adjustments into the traffic.',
    color: '#0a84ff',
  },
  norm1: {
    name: 'RMSNorm (Pre-Attention)',
    subtitle: 'Variance normalization',
    description:
      'Normalizes the scale of the token vectors before self-attention. This stabilizes gradient flow and allows stacking dozens or hundreds of layers without loss divergence.',
    color: '#8e8e93',
  },
  attention: {
    name: 'Attention (TALK)',
    subtitle: 'Context routing & query-key mixing',
    description:
      'Tokens exchange information with each other across the sequence. Each token decides which preceding words are relevant and aggregates their vector representations.',
    color: '#ff9f0a',
  },
  add1: {
    name: 'Residual Addition (+)',
    subtitle: 'Non-destructive feature merge',
    description:
      'Adds the attention output delta back onto the residual stream (x = x + Attention(x)). Preserves earlier representations while introducing new context.',
    color: '#ff9f0a',
  },
  norm2: {
    name: 'RMSNorm (Pre-MLP)',
    subtitle: 'Variance normalization',
    description:
      'Re-normalizes activations before feeding them into the multi-layer perceptron, ensuring stable layer inputs.',
    color: '#8e8e93',
  },
  mlp: {
    name: 'MLP (THINK)',
    subtitle: 'Feedforward network',
    description:
      'Processes each token individually with non-linear activations (SwiGLU or GELU). This is where factual knowledge and high-level abstract reasoning are stored.',
    color: '#bf5af2',
  },
  add2: {
    name: 'Residual Addition (+)',
    subtitle: 'Non-destructive feature merge',
    description:
      'Merges the MLP output back into the highway (x = x + MLP(x)), ready to be handed to the subsequent block.',
    color: '#bf5af2',
  },
}

export default function TransformerBlockPlayground() {
  const [viewMode, setViewMode] = useState<'single' | 'stack'>('single')
  const [selectedPart, setSelectedPart] = useState<PartId>('residual')

  const part = PARTS[selectedPart]

  return (
    <div
      className="rounded-2xl p-6 select-none"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Header with segmented control */}
      <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#f0ece8] mb-1 tracking-tight">
            Open up one block
          </h3>
          <p className="text-xs leading-relaxed text-[#a1a1a6] max-w-xl">
            Two sublayers, a normalization before each, and the residual highway running past both. Click any part
            for its one-line job description — then stack independently learned copies of that design and notice
            that's the whole model.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex p-1 rounded-xl bg-[#121214] border border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'single'
                ? 'bg-[#bf5af2] text-white shadow'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            One block
          </button>
          <button
            onClick={() => setViewMode('stack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'stack'
                ? 'bg-[#bf5af2] text-white shadow'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            The stack
          </button>
        </div>
      </div>

      {/* Interactive Architecture Diagram */}
      {viewMode === 'single' ? (
        <div
          className="p-6 rounded-2xl border mb-5 overflow-x-auto"
          style={{ background: '#111113', borderColor: 'rgba(255, 255, 255, 0.07)' }}
        >
          <svg viewBox="0 0 720 220" className="w-full min-w-[640px] h-auto">
            {/* ── Main Residual Highway (Blue) ── */}
            <line
              x1="40"
              y1="160"
              x2="670"
              y2="160"
              stroke="#0a84ff"
              strokeWidth="4"
              strokeLinecap="round"
              className="cursor-pointer"
              onClick={() => setSelectedPart('residual')}
            />
            {/* Highway Arrowhead */}
            <polygon points="670,154 684,160 670,166" fill="#0a84ff" />

            <text x="45" y="195" fill="#636366" fontSize="11" fontFamily="sans-serif">
              from the block before
            </text>
            <text x="635" y="195" fill="#636366" fontSize="11" fontFamily="sans-serif" textAnchor="end">
              to the next block
            </text>

            {/* ── First Branch: RMSNorm + Attention ── */}
            {/* Curve up to RMSNorm */}
            <path
              d="M 90 160 Q 140 160 140 95"
              fill="none"
              stroke="#ff9f0a"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <polygon points="137,96 140,86 143,96" fill="#ff9f0a" />

            {/* RMSNorm 1 Box */}
            <g className="cursor-pointer" onClick={() => setSelectedPart('norm1')}>
              <rect
                x="115"
                y="50"
                width="74"
                height="36"
                rx="8"
                fill={selectedPart === 'norm1' ? '#2c2c2e' : '#1c1c1e'}
                stroke={selectedPart === 'norm1' ? '#ffffff' : '#3a3a3c'}
                strokeWidth="1.5"
              />
              <text x="152" y="72" fill="#f2f2f7" fontSize="11" fontWeight="500" textAnchor="middle">
                RMSNorm
              </text>
            </g>

            {/* Connection from RMSNorm to Attention */}
            <line x1="190" y1="68" x2="216" y2="68" stroke="#ff9f0a" strokeWidth="2" strokeDasharray="3,3" />
            <polygon points="214,64 222,68 214,72" fill="#ff9f0a" />

            {/* Attention Box */}
            <g className="cursor-pointer" onClick={() => setSelectedPart('attention')}>
              <rect
                x="222"
                y="45"
                width="95"
                height="46"
                rx="10"
                fill={selectedPart === 'attention' ? '#331d05' : '#221405'}
                stroke={selectedPart === 'attention' ? '#ff9f0a' : '#774305'}
                strokeWidth="1.8"
              />
              <text x="269" y="67" fill="#ffffff" fontSize="12" fontWeight="600" textAnchor="middle">
                attention
              </text>
              <text x="269" y="81" fill="#ff9f0a" fontSize="9" fontWeight="700" letterSpacing="0.08em" textAnchor="middle">
                TALK
              </text>
            </g>

            {/* Curve down from Attention to Add 1 */}
            <path
              d="M 270 91 Q 270 160 350 160"
              fill="none"
              stroke="#ff9f0a"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            {/* Add 1 Circle */}
            <g className="cursor-pointer" onClick={() => setSelectedPart('add1')}>
              <circle
                cx="350"
                cy="160"
                r="11"
                fill="#2b1704"
                stroke={selectedPart === 'add1' ? '#ffffff' : '#ff9f0a'}
                strokeWidth="2"
              />
              <text x="350" y="164" fill="#ff9f0a" fontSize="14" fontWeight="bold" textAnchor="middle">
                +
              </text>
            </g>

            {/* ── Second Branch: RMSNorm + MLP ── */}
            {/* Curve up to RMSNorm 2 */}
            <path
              d="M 390 160 Q 440 160 440 95"
              fill="none"
              stroke="#bf5af2"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <polygon points="437,96 440,86 443,96" fill="#bf5af2" />

            {/* RMSNorm 2 Box */}
            <g className="cursor-pointer" onClick={() => setSelectedPart('norm2')}>
              <rect
                x="415"
                y="50"
                width="74"
                height="36"
                rx="8"
                fill={selectedPart === 'norm2' ? '#2c2c2e' : '#1c1c1e'}
                stroke={selectedPart === 'norm2' ? '#ffffff' : '#3a3a3c'}
                strokeWidth="1.5"
              />
              <text x="452" y="72" fill="#f2f2f7" fontSize="11" fontWeight="500" textAnchor="middle">
                RMSNorm
              </text>
            </g>

            {/* Connection from RMSNorm 2 to MLP */}
            <line x1="490" y1="68" x2="516" y2="68" stroke="#bf5af2" strokeWidth="2" strokeDasharray="3,3" />
            <polygon points="514,64 522,68 514,72" fill="#bf5af2" />

            {/* MLP Box */}
            <g className="cursor-pointer" onClick={() => setSelectedPart('mlp')}>
              <rect
                x="522"
                y="45"
                width="84"
                height="46"
                rx="10"
                fill={selectedPart === 'mlp' ? '#2e0f3d' : '#1d0729'}
                stroke={selectedPart === 'mlp' ? '#bf5af2' : '#6f2394'}
                strokeWidth="1.8"
              />
              <text x="564" y="67" fill="#ffffff" fontSize="12" fontWeight="600" textAnchor="middle">
                MLP
              </text>
              <text x="564" y="81" fill="#bf5af2" fontSize="9" fontWeight="700" letterSpacing="0.08em" textAnchor="middle">
                THINK
              </text>
            </g>

            {/* Curve down from MLP to Add 2 */}
            <path
              d="M 564 91 Q 564 160 625 160"
              fill="none"
              stroke="#bf5af2"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            {/* Add 2 Circle */}
            <g className="cursor-pointer" onClick={() => setSelectedPart('add2')}>
              <circle
                cx="625"
                cy="160"
                r="11"
                fill="#250833"
                stroke={selectedPart === 'add2' ? '#ffffff' : '#bf5af2'}
                strokeWidth="2"
              />
              <text x="625" y="164" fill="#bf5af2" fontSize="14" fontWeight="bold" textAnchor="middle">
                +
              </text>
            </g>
          </svg>
        </div>
      ) : (
        /* The Stack Visualization */
        <div
          className="p-6 rounded-2xl border mb-5 flex flex-col items-center gap-2"
          style={{ background: '#111113', borderColor: 'rgba(255, 255, 255, 0.07)' }}
        >
          <div className="w-full max-w-sm space-y-2 py-2">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl border"
                style={{
                  background: '#19191d',
                  borderColor: idx === 0 ? '#bf5af2' : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono text-xs text-[#8e8e93]">
                    L{idx + 1}
                  </span>
                  <span className="text-xs font-medium text-[#f2f2f7]">
                    Transformer Block {idx + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#2b1704] text-[#ff9f0a]">Attn</span>
                  <span className="text-[#636366]">+</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#250833] text-[#bf5af2]">MLP</span>
                </div>
              </div>
            ))}
          </div>
          <span className="text-xs text-[#8e8e93] mt-2">
            Output of Block N flows directly as input to Block N+1 via the residual highway.
          </span>
        </div>
      )}

      {/* Selected Part Details Card */}
      <div
        className="p-4 rounded-xl border transition-all"
        style={{ background: '#121214', borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
            Selected Part
          </span>
          <span className="text-xs font-mono text-[#8e8e93]">{part.subtitle}</span>
        </div>
        <h4 className="text-sm font-semibold mb-1" style={{ color: part.color }}>
          {part.name}
        </h4>
        <p className="text-xs leading-relaxed text-[#c7c7cc]">{part.description}</p>
      </div>

      {/* Under the hood collapsible component */}
      <UnderTheHood
        id="transformer-block"
        title="Under the hood"
        explanation="The full PyTorch forward pass for a modern Pre-LN transformer block:"
        defaultCode={`import torch
import torch.nn as nn

class TransformerBlock(nn.Module):
    def __init__(self, dim, num_heads):
        super().__init__()
        self.norm1 = RMSNorm(dim)
        self.attn = MultiHeadAttention(dim, num_heads)
        self.norm2 = RMSNorm(dim)
        self.mlp = SwiGLUMLP(dim, hidden_dim=int(dim * 8 / 3))

    def forward(self, x):
        # 1. Residual skip connection over Self-Attention (TALK)
        x = x + self.attn(self.norm1(x))
        
        # 2. Residual skip connection over Feedforward MLP (THINK)
        x = x + self.mlp(self.norm2(x))
        return x`}
      />
    </div>
  )
}
