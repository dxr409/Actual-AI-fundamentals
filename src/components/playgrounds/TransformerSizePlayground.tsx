import React, { useState, useMemo } from 'react'
import UnderTheHood from './UnderTheHood'

export default function TransformerSizePlayground() {
  const [layers, setLayers] = useState(8)
  const [width, setWidth] = useState(256)
  const [heads, setHeads] = useState(4)
  const [context, setContext] = useState(512)
  const [preset, setPreset] = useState('default')

  const handlePreset = (val: string) => {
    setPreset(val)
    if (val === 'default') {
      setLayers(8); setWidth(256); setHeads(4); setContext(512)
    } else if (val === 'tiny') {
      setLayers(4); setWidth(128); setHeads(2); setContext(256)
    } else if (val === 'gpt2') {
      setLayers(12); setWidth(768); setHeads(12); setContext(1024)
    } else if (val === 'llama-mini') {
      setLayers(16); setWidth(512); setHeads(8); setContext(2048)
    }
  }

  const headDim = Math.round(width / heads)

  // Calculations
  const vocabSize = 10000
  const stats = useMemo(() => {
    // 1. Embeddings: vocab_size * width
    const embeddingParams = vocabSize * width

    // 2. Attention per block: Q, K, V + Out proj = 4 * width * width
    const attnParamsPerBlock = 4 * width * width

    // 3. MLP per block (SwiGLU: 3 projections of hidden_dim = 8/3 * width)
    const hiddenDim = Math.round((8 / 3) * width)
    const mlpParamsPerBlock = 3 * width * hiddenDim

    const totalBlockParams = (attnParamsPerBlock + mlpParamsPerBlock) * layers
    const totalParams = embeddingParams + totalBlockParams

    const embPct = Math.round((embeddingParams / totalParams) * 100)
    const attnPct = Math.round(((attnParamsPerBlock * layers) / totalParams) * 100)
    const mlpPct = Math.max(1, 100 - embPct - attnPct)

    // Memory footprint (BF16 = 2 bytes per param)
    const diskMB = Math.round((totalParams * 2) / (1024 * 1024))
    const adamwMB = Math.round((totalParams * 6) / (1024 * 1024))

    // Work per pass relative to default (layers * width^2 + layers * context^2)
    const defaultCompute = 8 * (256 * 256 + 512 * 512 * 0.1)
    const currentCompute = layers * (width * width + context * context * 0.1)
    const workRatio = (currentCompute / defaultCompute).toFixed(1)

    return {
      totalParams,
      paramsFormatted:
        totalParams >= 1_000_000_000
          ? (totalParams / 1_000_000_000).toFixed(1) + 'B'
          : (totalParams / 1_000_000).toFixed(1) + 'M',
      embPct,
      attnPct,
      mlpPct,
      diskMB,
      adamwMB,
      workRatio,
    }
  }, [layers, width, heads, context])

  return (
    <div
      className="rounded-2xl p-6 select-none"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      <h3 className="text-base font-semibold text-[#f0ece8] mb-1 tracking-tight">
        The size sandbox
      </h3>
      <p className="text-xs leading-relaxed text-[#a1a1a6] mb-6 max-w-2xl">
        Transformer blocks, width, attention heads, and context length, with a live parameter count.
      </p>

      {/* Preset Row */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
          Preset
        </span>
        <select
          value={preset}
          onChange={(e) => handlePreset(e.target.value)}
          className="text-xs bg-[#222226] text-[#f2f2f7] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="default">Default</option>
          <option value="tiny">Tiny (1.5M)</option>
          <option value="llama-mini">Llama Mini (35M)</option>
          <option value="gpt2">GPT-2 Small (124M)</option>
          {preset === 'custom' && <option value="custom">Custom</option>}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Column */}
        <div className="space-y-4">
          {/* Blocks */}
          <div className="p-3 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-[#c7c7cc]">Transformer blocks</span>
              <span className="font-mono text-xs font-semibold text-[#f2f2f7]">{layers}</span>
            </div>
            <input
              type="range"
              min="1"
              max="32"
              value={layers}
              onChange={(e) => { setLayers(parseInt(e.target.value)); setPreset('custom') }}
              className="w-full accent-[#bf5af2] cursor-pointer"
            />
          </div>

          {/* Width */}
          <div className="p-3 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-[#c7c7cc]">Width</span>
              <span className="font-mono text-xs font-semibold text-[#f2f2f7]">{width}</span>
            </div>
            <input
              type="range"
              min="64"
              max="1024"
              step="64"
              value={width}
              onChange={(e) => { setWidth(parseInt(e.target.value)); setPreset('custom') }}
              className="w-full accent-[#bf5af2] cursor-pointer"
            />
          </div>

          {/* Heads */}
          <div className="p-3 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-[#c7c7cc]">Attention heads</span>
              <span className="font-mono text-xs font-semibold text-[#f2f2f7]">{heads}</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={heads}
              onChange={(e) => { setHeads(parseInt(e.target.value)); setPreset('custom') }}
              className="w-full accent-[#bf5af2] cursor-pointer"
            />
            <p className="text-[11px] text-[#8e8e93] mt-2 flex items-center gap-1">
              <span>✓ {headDim} numbers per head — heads split the width without changing the total.</span>
            </p>
          </div>

          {/* Context */}
          <div className="p-3 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-[#c7c7cc]">Context length</span>
              <span className="font-mono text-xs font-semibold text-[#f2f2f7]">{context}</span>
            </div>
            <input
              type="range"
              min="128"
              max="4096"
              step="128"
              value={context}
              onChange={(e) => { setContext(parseInt(e.target.value)); setPreset('custom') }}
              className="w-full accent-[#bf5af2] cursor-pointer"
            />
            <p className="text-[11px] text-[#8e8e93] mt-2">
              Attention compares every token with every earlier one, so this slider makes work grow quadratically.
            </p>
          </div>
        </div>

        {/* Right Output Column */}
        <div className="space-y-4">
          {/* Parameter Count Card */}
          <div
            className="p-5 rounded-xl border"
            style={{
              background: '#19131d',
              borderColor: 'rgba(191, 90, 242, 0.25)',
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#bf5af2] block mb-1">
              Parameter Count
            </span>
            <div className="text-3xl font-bold font-mono text-[#f2f2f7]">
              {stats.paramsFormatted}
            </div>
            <span className="text-xs text-[#8e8e93] block mt-1">learned numbers</span>
          </div>

          {/* Where they live Breakdown */}
          <div className="p-4 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.07)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93] block mb-3">
              Where they live
            </span>
            {/* Segmented bar */}
            <div className="h-3 rounded-full flex overflow-hidden gap-0.5 mb-3 bg-[#1c1c1e]">
              <div style={{ width: `${stats.embPct}%`, background: '#0a84ff' }} />
              <div style={{ width: `${stats.attnPct}%`, background: '#ff9f0a' }} />
              <div style={{ width: `${stats.mlpPct}%`, background: '#bf5af2' }} />
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#f2f2f7]">
                <span className="w-2 h-2 rounded-full bg-[#0a84ff]" />
                Embeddings {stats.embPct}%
              </span>
              <span className="flex items-center gap-1.5 text-[#f2f2f7]">
                <span className="w-2 h-2 rounded-full bg-[#ff9f0a]" />
                Attention {stats.attnPct}%
              </span>
              <span className="flex items-center gap-1.5 text-[#f2f2f7]">
                <span className="w-2 h-2 rounded-full bg-[#bf5af2]" />
                MLP {stats.mlpPct}%
              </span>
            </div>
          </div>

          {/* Memory & Work footprint row */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)] text-center">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e8e93] block">
                Weights on Disk
              </span>
              <span className="text-sm font-semibold font-mono text-[#f2f2f7] mt-1 block">
                {stats.diskMB} MB
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e8e93] block">
                Weights + AdamW
              </span>
              <span className="text-sm font-semibold font-mono text-[#f2f2f7] mt-1 block">
                {stats.adamwMB} MB
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8e8e93] block">
                Work per pass
              </span>
              <span className="text-sm font-semibold font-mono text-[#f2f2f7] mt-1 block">
                {stats.workRatio}x default
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#636366] mt-5 leading-relaxed">
        Counted with tied output-head arithmetic and a 10,000-token vocabulary. BF16 weights use 2 bytes per parameter.
        During training, the weights and AdamW's two BF16 running averages use about 6 bytes per parameter; gradients
        add another 2 bytes while they are computed. Activations and framework temporaries depend on the batch and context
        length, so peak memory will be higher.
      </p>

      {/* Under the hood collapsible code section */}
      <UnderTheHood
        id="model-size-calc"
        title="Under the hood"
        explanation="Calculate the exact parameter count and VRAM allocation for any transformer architecture:"
        defaultCode={`def compute_transformer_params(layers, width, vocab_size=10000):
    # 1. Token Embeddings (tied with lm_head)
    embeddings = vocab_size * width
    
    # 2. Attention (Q, K, V projections + Output projection)
    attention_per_layer = 4 * (width * width)
    
    # 3. Feedforward MLP (SwiGLU: gate, up, down projections)
    hidden_dim = int(width * 8 / 3)
    mlp_per_layer = 3 * (width * hidden_dim)
    
    # Total
    block_params = (attention_per_layer + mlp_per_layer) * layers
    total = embeddings + block_params
    
    memory_bf16_bytes = total * 2
    memory_adamw_bytes = total * 6  # weights + momentum + variance
    return total, memory_bf16_bytes, memory_adamw_bytes`}
      />
    </div>
  )
}
