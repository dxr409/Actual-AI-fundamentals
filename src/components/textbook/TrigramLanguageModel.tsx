import React, { useState, useMemo } from 'react'
import { RotateCcw, Pencil, Eye, Sparkles, BarChart2, Check, ArrowRight } from 'lucide-react'
import UnderTheHood from '@/components/playgrounds/UnderTheHood'

const STORY_PRESET = `The little cat found a red ball. The little cat pushed the ball.
The little dog found the red ball. The little dog chased the ball.
The little bird saw the blue sky. The little bird flew into the sky.
The little cat saw the little bird. The little dog saw the little cat.
The red ball rolled down the hill. The blue sky turned pink at night.
Every little friend wanted to play. Every little friend ran home at night.`

const KAZAKH_NAMES_PRESET = `Alibek Nurbolat Aibek Serikbay Bolatbek Zhanarys
Alisher Sanzhar Nurbek Dias Bekzat Arman
Kuanysh Temirbolat Alikhan Daniyar Yerbolat Aigerim
Aruzhan Asylbek Bagdat Beibarys Dinmukhamed Galymzhan
Madina Madiyar Mansur Maksat Mukhammed Nurlan
Olzhas Rustem Samat Sanzhar Talgar Temirlan`

export interface TrigramMatch {
  trigram: string
  count: number
  percentage: number
  nextChars: { char: string; count: number; prob: number }[]
}

export default function TrigramLanguageModel() {
  const [corpus, setCorpus] = useState(() => {
    try {
      const saved = localStorage.getItem('qairu-training-text')
      if (saved !== null) return saved
    } catch {}
    return KAZAKH_NAMES_PRESET
  })

  const [hoveredTrigram, setHoveredTrigram] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activePreset, setActivePreset] = useState<'story' | 'kazakh' | 'custom'>('kazakh')

  const wordCount = useMemo(() => {
    const trimmed = corpus.trim()
    if (!trimmed) return 0
    return trimmed.split(/\s+/).length
  }, [corpus])

  // Compute top 5 most common 3-character sequences (case-insensitive for better learning insight)
  const topTrigrams: TrigramMatch[] = useMemo(() => {
    if (!corpus || corpus.length < 3) return []

    const counts: Record<string, { count: number; nexts: Record<string, number> }> = {}
    const lower = corpus.toLowerCase()

    for (let i = 0; i <= lower.length - 3; i++) {
      // Avoid trigrams that are solely whitespace
      const tri = lower.slice(i, i + 3)
      if (tri.trim().length === 0) continue

      const nextChar = i + 3 < lower.length ? lower[i + 3] : '⟨EOS⟩'

      if (!counts[tri]) {
        counts[tri] = { count: 0, nexts: {} }
      }
      counts[tri].count += 1
      counts[tri].nexts[nextChar] = (counts[tri].nexts[nextChar] || 0) + 1
    }

    const totalTrigrams = Object.values(counts).reduce((acc, cur) => acc + cur.count, 0)
    if (totalTrigrams === 0) return []

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)

    return sorted.map(([trigram, data]) => {
      const nextSorted = Object.entries(data.nexts)
        .map(([char, c]) => ({
          char: char === ' ' ? '␣' : char,
          count: c,
          prob: Math.round((c / data.count) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)

      return {
        trigram,
        count: data.count,
        percentage: Math.round((data.count / totalTrigrams) * 100),
        nextChars: nextSorted,
      }
    })
  }, [corpus])

  const handleCorpusChange = (val: string) => {
    setCorpus(val)
    setActivePreset('custom')
    try {
      localStorage.setItem('qairu-training-text', val)
    } catch {}
  }

  const loadPreset = (preset: 'story' | 'kazakh') => {
    const text = preset === 'story' ? STORY_PRESET : KAZAKH_NAMES_PRESET
    setCorpus(text)
    setActivePreset(preset)
    try {
      localStorage.setItem('qairu-training-text', text)
    } catch {}
  }

  const handleReset = () => {
    loadPreset('story')
  }

  // Tiktokenizer-style highlighted text renderer
  const renderHighlightedText = () => {
    if (!hoveredTrigram) {
      return (
        <span className="font-mono text-xs sm:text-[13px] text-[#f2f2f7] whitespace-pre-wrap leading-relaxed">
          {corpus}
        </span>
      )
    }

    const lowerCorpus = corpus.toLowerCase()
    const target = hoveredTrigram.toLowerCase()
    const parts: React.ReactNode[] = []
    let lastIdx = 0

    let matchIdx = lowerCorpus.indexOf(target, lastIdx)
    while (matchIdx !== -1) {
      // Normal preceding text
      if (matchIdx > lastIdx) {
        parts.push(
          <span key={`text-${lastIdx}`} className="text-[#a1a1a6]">
            {corpus.slice(lastIdx, matchIdx)}
          </span>
        )
      }

      // Glowing Tiktokenizer-style highlight
      parts.push(
        <mark
          key={`match-${matchIdx}`}
          className="inline-block px-1 py-0.2 rounded font-bold transition-all duration-150"
          style={{
            background: 'rgba(191, 90, 242, 0.38)',
            border: '1px solid #bf5af2',
            boxShadow: '0 0 10px rgba(191, 90, 242, 0.75), 0 0 2px #bf5af2',
            color: '#ffffff',
          }}
        >
          {corpus.slice(matchIdx, matchIdx + target.length)}
        </mark>
      )

      lastIdx = matchIdx + target.length
      matchIdx = lowerCorpus.indexOf(target, lastIdx)
    }

    if (lastIdx < corpus.length) {
      parts.push(
        <span key={`text-${lastIdx}`} className="text-[#a1a1a6]">
          {corpus.slice(lastIdx)}
        </span>
      )
    }

    return (
      <span className="font-mono text-xs sm:text-[13px] whitespace-pre-wrap leading-relaxed">
        {parts}
      </span>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden my-8 select-none transition-all"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* ── Top Header ── */}
      <div
        className="px-5 py-3.5 flex items-center justify-between flex-wrap gap-2"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#f0ece8] tracking-tight">
            Training text
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(191,90,242,0.15)] text-[#bf5af2] border border-[rgba(191,90,242,0.3)]">
            Interactive Trigram Explorer
          </span>
        </div>

        {/* Preset & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.06)] text-[11px]">
            <button
              onClick={() => loadPreset('kazakh')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activePreset === 'kazakh'
                  ? 'bg-[#26262a] text-white font-medium shadow'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
              title="Kazakh names dataset (checks 'bek', 'bay', 'ali'...)"
            >
              Kazakh Names
            </button>
            <button
              onClick={() => loadPreset('story')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activePreset === 'story'
                  ? 'bg-[#26262a] text-white font-medium shadow'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Story
            </button>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg text-[#8e8e93] hover:text-white hover:bg-[#222226] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
          >
            {isEditing ? <Eye size={12} /> : <Pencil size={12} />}
            <span>{isEditing ? 'Highlight View' : 'Edit Text'}</span>
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="p-5 space-y-5">
        {/* Top Labels Row */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] block">
              Training Corpus
            </span>
            <span className="text-[11px] text-[#636366] mt-0.5 block">
              {isEditing ? 'Type or paste custom text below:' : 'Hover over any top-5 trigram below to light it up:'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] block">
              Words Total
            </span>
            <span className="text-xl font-bold font-mono text-[#2997ff] leading-none mt-1 block">
              {wordCount}
            </span>
          </div>
        </div>

        {/* ── Text Box Area (Tiktokenizer glowing render OR Editable textarea) ── */}
        <div
          className="rounded-xl border p-4 transition-all min-h-[170px]"
          style={{
            background: '#101012',
            borderColor: hoveredTrigram
              ? 'rgba(191, 90, 242, 0.4)'
              : 'rgba(255, 255, 255, 0.08)',
          }}
        >
          {isEditing ? (
            <textarea
              value={corpus}
              onChange={(e) => handleCorpusChange(e.target.value)}
              rows={7}
              placeholder="Write or paste your training text here..."
              className="w-full bg-transparent font-mono text-xs sm:text-[13px] text-[#f2f2f7] leading-relaxed resize-y focus:outline-none scrollbar-thin"
              style={{
                fontFamily: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
                lineHeight: 1.65,
              }}
            />
          ) : (
            <div
              className="cursor-text select-text overflow-x-auto"
              style={{
                fontFamily: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
                lineHeight: 1.65,
              }}
            >
              {renderHighlightedText()}
            </div>
          )}
        </div>

        {/* ── Top-5 Trigrams Section (Tiktokenizer lighting controller) ── */}
        <div
          className="p-4 rounded-xl border bg-[#121214] border-[rgba(255,255,255,0.07)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: '#bf5af2' }} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f2f2f7]">
                Top-5 Most Common Trigrams (3-Letter Context)
              </span>
            </div>
            <span className="text-[11px] text-[#8e8e93]">
              Hover a combination to light up in corpus
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {topTrigrams.map((item, idx) => {
              const isHovered = hoveredTrigram === item.trigram
              return (
                <div
                  key={item.trigram}
                  onMouseEnter={() => setHoveredTrigram(item.trigram)}
                  onMouseLeave={() => setHoveredTrigram(null)}
                  className="p-3 rounded-xl border cursor-pointer transition-all duration-150"
                  style={{
                    background: isHovered ? 'rgba(191, 90, 242, 0.2)' : '#18181c',
                    borderColor: isHovered ? '#bf5af2' : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: isHovered ? '0 0 14px rgba(191, 90, 242, 0.35)' : 'none',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#8e8e93]">
                      #{idx + 1}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: 'rgba(255, 159, 10, 0.15)', color: '#ff9f0a' }}
                    >
                      {item.count}x
                    </span>
                  </div>

                  {/* Trigram Pill */}
                  <div className="font-mono text-sm font-bold text-center py-1 rounded bg-[#0d0d0f] border border-[rgba(255,255,255,0.06)] text-[#ffffff] mb-2">
                    "{item.trigram}"
                  </div>

                  {/* Following char predictions */}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-[#636366] block">
                      Next char:
                    </span>
                    {item.nextChars.map((nc, nidx) => (
                      <div
                        key={nidx}
                        className="flex items-center justify-between text-[10px] font-mono text-[#a1a1a6]"
                      >
                        <span className="text-[#bf5af2] font-semibold">'{nc.char}'</span>
                        <span>{nc.prob}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {hoveredTrigram && (
            <div className="mt-3 p-2 rounded-lg bg-[#0d0d0f] border border-[rgba(191,90,242,0.3)] flex items-center justify-between text-xs font-mono">
              <span className="text-[#a1a1a6]">
                Inspecting: <strong className="text-white">"{hoveredTrigram}"</strong>
              </span>
              <span className="text-[#bf5af2] font-semibold">
                Glowing across {topTrigrams.find((t) => t.trigram === hoveredTrigram)?.count} locations in text
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Under the Hood: N-gram Transition Matrix (Inspired by user heatmap) ── */}
      <div className="px-5 pb-5">
        <UnderTheHood
          id="trigram-language-model"
          title="Under the hood: Counting transition matrices"
          explanation="How an n-gram model trains: it counts occurrences of every 3-character prefix and computes conditional probability tables P(char | c1, c2, c3):"
          defaultCode={`from collections import defaultdict, Counter

def train_trigram_model(corpus: str):
    """
    Builds conditional probability table P(next_char | c1, c2, c3)
    matching the transition frequency matrix.
    """
    transitions = defaultdict(Counter)
    text = corpus.lower()
    
    # 1. Count occurrences of 3-letter contexts followed by next char
    for i in range(len(text) - 3):
        prefix = text[i:i+3]       # e.g. "ali", "bek", "the"
        next_char = text[i+3]      # next character
        transitions[prefix][next_char] += 1
        
    # 2. Normalize raw counts into probabilities (like the heatmap matrix)
    probabilities = {}
    for prefix, next_counts in transitions.items():
        total = sum(next_counts.values())
        probabilities[prefix] = {char: count / total for char, count in next_counts.items()}
        
    return probabilities`}
        >
          <div className="p-3 rounded-xl bg-[#0d0d0f] border border-[rgba(255,255,255,0.06)] mb-3 text-xs font-mono leading-relaxed text-[#a1a1a6]">
            <p className="text-white font-semibold mb-1">Mathematical Formula:</p>
            <p>P(c₄ | c₁, c₂, c₃) = Count(c₁c₂c₃c₄) / Count(c₁c₂c₃)</p>
            <p className="text-[11px] text-[#8e8e93] mt-2">
              In a Kazakh names dataset, after learning <code>"ali"</code>, the model computes high probability for <code>"b"</code> (Alibek), <code>"s"</code> (Alisher), or <code>"k"</code> (Alikhan).
            </p>
          </div>
        </UnderTheHood>
      </div>
    </div>
  )
}
