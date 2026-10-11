import React, { useState, useMemo } from 'react'
import UnderTheHood from './UnderTheHood'

export default function LossPlayground() {
  // Truth probability (0.005 to 0.99)
  const [prob, setProb] = useState(0.02)
  const [preset, setPreset] = useState('wrong')

  // Calculate cross entropy loss: -ln(p)
  const loss = useMemo(() => {
    const clamped = Math.max(0.001, Math.min(0.999, prob))
    return -Math.log(clamped)
  }, [prob])

  const handlePresetChange = (val: string) => {
    setPreset(val)
    if (val === 'wrong') setProb(0.02)
    else if (val === 'right') setProb(0.92)
    else if (val === 'half') setProb(0.5)
    else if (val === 'cliff') setProb(0.005)
  }

  // Calculate competitor probabilities so sum is 1
  const competitorProbs = useMemo(() => {
    const remaining = 1 - prob
    return [
      { word: 'found', p: prob, isTarget: true },
      { word: 'ran',    p: remaining * 0.40, isTarget: false },
      { word: 'saw',    p: remaining * 0.30, isTarget: false },
      { word: 'slept',  p: remaining * 0.20, isTarget: false },
      { word: 'banana', p: remaining * 0.10, isTarget: false },
    ]
  }, [prob])

  // SVG coordinate transformation for loss curve: -ln(p)
  const svgWidth = 240
  const svgHeight = 160
  const pad = { left: 24, right: 12, top: 12, bottom: 24 }
  const innerW = svgWidth - pad.left - pad.right
  const innerH = svgHeight - pad.top - pad.bottom

  // Curve points: p from 0.01 to 0.99, loss from 0 to 5
  const maxL = 5.0
  const curvePoints = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 60; i++) {
      const p = 0.006 + (i / 60) * 0.984
      const l = Math.min(maxL, -Math.log(p))
      const x = pad.left + p * innerW
      const y = pad.top + innerH - (l / maxL) * innerH
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [innerW, innerH])

  const dotX = pad.left + Math.max(0.006, Math.min(0.99, prob)) * innerW
  const dotY = pad.top + innerH - (Math.min(maxL, loss) / maxL) * innerH

  return (
    <div
      className="rounded-2xl p-6 select-none"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Title & Description */}
      <h3 className="text-base font-semibold text-[#f0ece8] mb-2 tracking-tight">
        The price of a prediction
      </h3>
      <p className="text-xs leading-relaxed text-[#a1a1a6] mb-6 max-w-2xl">
        The model is predicting the word after <em>"the little cat"</em>, and the true next word (in this text)
        turns out to be <strong>"found"</strong>. Drag the slider to decide how much probability the model
        puts on the truth, then compare a small nudge near 90% with one near 2%. The cliff near zero is the lesson:
      </p>

      {/* Truth Probability Slider Section */}
      <div className="p-4 rounded-xl mb-4 border" style={{ background: '#111113', borderColor: 'rgba(255, 255, 255, 0.07)' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
            Truth Probability
          </span>
          <span
            className="text-xs font-mono font-medium px-2 py-0.5 rounded"
            style={{ background: 'rgba(255, 159, 10, 0.15)', color: '#ff9f0a' }}
          >
            loss {loss.toFixed(2)}
          </span>
        </div>

        <div className="text-2xl font-bold font-mono text-[#f2f2f7] mb-3">
          {(prob * 100).toFixed(1)}%
        </div>

        <input
          type="range"
          min="0.002"
          max="0.99"
          step="0.002"
          value={prob}
          onChange={(e) => {
            setProb(parseFloat(e.target.value))
            setPreset('custom')
          }}
          className="w-full accent-[#bf5af2] cursor-pointer"
        />
      </div>

      {/* Preset Selector */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
          Preset
        </span>
        <select
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="text-xs bg-[#222226] text-[#f2f2f7] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 focus:outline-none"
        >
          <option value="wrong">Confident and wrong</option>
          <option value="right">Certain and right</option>
          <option value="half">Even split (50%)</option>
          <option value="cliff">The near-zero cliff</option>
          {preset === 'custom' && <option value="custom">Custom</option>}
        </select>
      </div>

      {/* Compare Two Nudges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
            Compare Two Nudges
          </span>
          <div className="flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1c1c1e] text-[#8e8e93] border border-[rgba(255,255,255,0.06)]">
              90% → 95% already right
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1c1c1e] text-[#8e8e93] border border-[rgba(255,255,255,0.06)]">
              2% → 0.5% almost ruled out
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)]">
            <span className="text-[11px] text-[#8e8e93] block mb-1">already right</span>
            <p className="font-mono text-xs text-[#cfcfd4] mb-0.5">90.0% → 95.0%</p>
            <p className="font-mono text-xs text-[#8e8e93] mb-1">loss 0.11 → 0.05</p>
            <span className="text-xs font-mono font-semibold text-[#64dfdf]">-0.05 loss</span>
          </div>

          <div className="p-3 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)]">
            <span className="text-[11px] text-[#8e8e93] block mb-1">almost ruled out</span>
            <p className="font-mono text-xs text-[#cfcfd4] mb-0.5">2.0% → 0.5%</p>
            <p className="font-mono text-xs text-[#8e8e93] mb-1">loss 3.91 → 5.30</p>
            <span className="text-xs font-mono font-semibold text-[#ff9f0a]">+1.39 loss</span>
          </div>
        </div>
      </div>

      {/* Distribution & Graph Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Probability Bars */}
        <div className="p-4 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93] block mb-3">
            Probability Distribution
          </span>
          <div className="space-y-2">
            {competitorProbs.map((item) => (
              <div key={item.word} className="flex items-center gap-2">
                <span
                  className="w-14 text-center font-mono text-[11px] px-1.5 py-0.5 rounded"
                  style={{
                    background: item.isTarget ? '#0a84ff' : '#212529',
                    color: item.isTarget ? '#ffffff' : '#8e8e93',
                    fontWeight: item.isTarget ? 600 : 400,
                  }}
                >
                  {item.word}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#1c1c1e] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${Math.min(100, item.p * 100)}%`,
                      background: item.isTarget ? '#0a84ff' : '#48484a',
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] text-[#8e8e93] w-12 text-right">
                  {(item.p * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-[#636366] block mt-3 font-mono">
            where the model puts its probability
          </span>
        </div>

        {/* SVG Loss Curve */}
        <div className="p-4 rounded-xl border bg-[#111113] border-[rgba(255,255,255,0.06)] flex flex-col justify-between">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
            {/* Grid & Axes lines */}
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={svgHeight - pad.bottom} stroke="#2c2c2e" strokeWidth="1" />
            <line x1={pad.left} y1={svgHeight - pad.bottom} x2={svgWidth - pad.right} y2={svgHeight - pad.bottom} stroke="#2c2c2e" strokeWidth="1" />

            {/* Axis ticks */}
            <text x={pad.left + 0.2 * innerW} y={svgHeight - 8} fontSize="9" fill="#8e8e93" textAnchor="middle" fontFamily="monospace">0.2</text>
            <text x={pad.left + 0.4 * innerW} y={svgHeight - 8} fontSize="9" fill="#8e8e93" textAnchor="middle" fontFamily="monospace">0.4</text>
            <text x={pad.left + 0.6 * innerW} y={svgHeight - 8} fontSize="9" fill="#8e8e93" textAnchor="middle" fontFamily="monospace">0.6</text>
            <text x={pad.left + 0.8 * innerW} y={svgHeight - 8} fontSize="9" fill="#8e8e93" textAnchor="middle" fontFamily="monospace">0.8</text>

            <text x={svgWidth - pad.right} y={pad.top + innerH - (4 / maxL) * innerH} fontSize="9" fill="#bf5af2" textAnchor="end" fontFamily="monospace">4</text>
            <text x={svgWidth - pad.right} y={pad.top + innerH - (2 / maxL) * innerH} fontSize="9" fill="#bf5af2" textAnchor="end" fontFamily="monospace">2</text>
            <text x={svgWidth - pad.right} y={svgHeight - pad.bottom} fontSize="9" fill="#bf5af2" textAnchor="end" fontFamily="monospace">0</text>

            {/* Loss curve path */}
            <polyline points={curvePoints} fill="none" stroke="#0a84ff" strokeWidth="2" strokeLinecap="round" />

            {/* Vertical drop line to current dot */}
            <line x1={dotX} y1={dotY} x2={dotX} y2={svgHeight - pad.bottom} stroke="#bf5af2" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />

            {/* Active glowing dot */}
            <circle cx={dotX} cy={dotY} r="4.5" fill="#64dfdf" stroke="#ffffff" strokeWidth="1.5" />
          </svg>

          <span className="text-[10px] text-[#636366] font-mono block mt-1">
            L = -ln(p) as p → 0
          </span>
        </div>
      </div>

      {/* Equation Footer */}
      <div className="p-3 rounded-lg bg-[#0d0d0f] border border-[rgba(255,255,255,0.05)] text-center font-mono text-xs text-[#a1a1a6]">
        loss = -ln({prob.toFixed(3)}) = <span className="text-[#ff9f0a] font-bold">{loss.toFixed(2)}</span> · certain and wrong: the cliff
      </div>

      {/* Under the hood collapsible code section */}
      <UnderTheHood
        id="loss-function"
        title="Under the hood"
        explanation="Cross-entropy loss measures the divergence between the predicted probability distribution and the ground truth one-hot vector."
        defaultCode={`import torch
import torch.nn.functional as F

def cross_entropy_loss(logits, target_token_id):
    """
    logits: [vocab_size] unnormalized scores from the model head
    target_token_id: integer ID of the true next word
    """
    # Softmax turns raw logits into probabilities that sum to 1
    probs = F.softmax(logits, dim=-1)
    
    # We only care about the probability assigned to the true target
    target_prob = probs[target_token_id]
    
    # Loss is the negative natural log of that probability
    loss = -torch.log(target_prob)
    return loss`}
      />
    </div>
  )
}
