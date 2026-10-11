import React, { useState, useMemo } from 'react'
import { RotateCcw } from 'lucide-react'

const DEFAULT_CORPUS = `The little cat found a red ball. The little cat pushed the ball.
The little dog found the red ball. The little dog chased the ball.
The little bird saw the blue sky. The little bird flew into the sky.
The little cat saw the little bird. The little dog saw the little cat.
The red ball rolled down the hill. The blue sky turned pink at night.
Every little friend wanted to play. Every little friend ran home at night.`

export default function TrainingTextWindow() {
  const [corpus, setCorpus] = useState(() => {
    try {
      const saved = localStorage.getItem('qairu-training-text')
      if (saved !== null) return saved
    } catch {}
    return DEFAULT_CORPUS
  })

  const wordCount = useMemo(() => {
    const trimmed = corpus.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }, [corpus])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setCorpus(val)
    try {
      localStorage.setItem('qairu-training-text', val)
    } catch {}
  }

  const handleReset = () => {
    setCorpus(DEFAULT_CORPUS)
    try {
      localStorage.removeItem('qairu-training-text')
    } catch {}
  }

  const isCustom = corpus !== DEFAULT_CORPUS

  return (
    <div
      className="rounded-2xl overflow-hidden my-8 select-none transition-all"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Window Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}
      >
        <span className="text-sm font-semibold text-[#f0ece8] tracking-tight">
          Training text
        </span>

        {isCustom && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-[#8e8e93] hover:text-[#f2f2f7] transition-colors cursor-pointer"
            title="Reset to default sample text"
          >
            <RotateCcw size={12} />
            <span>Reset sample</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5">
        {/* Top Labels Row */}
        <div className="flex items-end justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93]">
            Training Corpus
          </span>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] block">
              Words Total
            </span>
            <span className="text-xl font-bold font-mono text-[#2997ff] leading-none mt-1 block">
              {wordCount}
            </span>
          </div>
        </div>

        {/* Editable Text Box */}
        <div
          className="rounded-xl border p-3.5 transition-all"
          style={{
            background: '#101012',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <textarea
            value={corpus}
            onChange={handleChange}
            rows={8}
            placeholder="Write or paste your own training text here..."
            className="w-full bg-transparent font-mono text-xs sm:text-[13px] text-[#f2f2f7] leading-relaxed resize-y focus:outline-none scrollbar-thin"
            style={{
              fontFamily: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
              lineHeight: 1.65,
            }}
          />
        </div>
      </div>
    </div>
  )
}
