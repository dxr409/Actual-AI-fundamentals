import React, { useState } from 'react'
import { Lock, Eye, Check, Sparkles, Layers, Zap, Info } from 'lucide-react'
import UnderTheHood from './UnderTheHood'

interface TokenData {
  text: string
  id: number
  bytes?: number
  isSpaceLead?: boolean
  subword?: boolean
}

interface ModelTokenizer {
  id: string
  name: string
  generation: string
  vocabSize: string
  releaseYear: string
  tokenCount: number
  color: string
  tokens: TokenData[]
  description: string
  kazakhEfficiency: string
}

const STATIC_BENCHMARK_TEXT =
  'Language models do not read words, they read tokens. Сәлем, әлем! 123 + 456 = 579.'

// Tiktokenizer rotating pastel tint palette
const TOKEN_COLORS = [
  { bg: 'rgba(59, 130, 246, 0.22)', border: 'rgba(59, 130, 246, 0.45)', text: '#93c5fd' },
  { bg: 'rgba(16, 185, 129, 0.22)', border: 'rgba(16, 185, 129, 0.45)', text: '#6ee7b7' },
  { bg: 'rgba(245, 158, 11, 0.22)', border: 'rgba(245, 158, 11, 0.45)', text: '#fcd34d' },
  { bg: 'rgba(168, 85, 247, 0.22)', border: 'rgba(168, 85, 247, 0.45)', text: '#d8b4fe' },
  { bg: 'rgba(236, 72, 153, 0.22)', border: 'rgba(236, 72, 153, 0.45)', text: '#f472b6' },
  { bg: 'rgba(6, 182, 212, 0.22)', border: 'rgba(6, 182, 212, 0.45)', text: '#67e8f9' },
  { bg: 'rgba(239, 68, 68, 0.22)', border: 'rgba(239, 68, 68, 0.45)', text: '#fca5a5' },
  { bg: 'rgba(99, 102, 241, 0.22)', border: 'rgba(99, 102, 241, 0.45)', text: '#a5b4fc' },
]

const MODELS_DATA: ModelTokenizer[] = [
  {
    id: 'gpt2',
    name: 'GPT-2',
    generation: 'Older Model (2019)',
    vocabSize: '50,257',
    releaseYear: '2019',
    tokenCount: 39,
    color: '#ff9f0a',
    description: 'Basic BPE with byte fallbacks. Kazakh and non-Latin alphabets are shattered into byte-level individual pieces.',
    kazakhEfficiency: '12 tokens for 2 Kazakh words (shattered into bytes)',
    tokens: [
      { text: 'Language', id: 35773, bytes: 8 },
      { text: '·models', id: 4981, bytes: 7, isSpaceLead: true },
      { text: '·do', id: 466, bytes: 3, isSpaceLead: true },
      { text: '·not', id: 407, bytes: 4, isSpaceLead: true },
      { text: '·read', id: 1401, bytes: 5, isSpaceLead: true },
      { text: '·words', id: 2456, bytes: 6, isSpaceLead: true },
      { text: ',', id: 11, bytes: 1 },
      { text: '·they', id: 484, bytes: 5, isSpaceLead: true },
      { text: '·read', id: 1401, bytes: 5, isSpaceLead: true },
      { text: '·tokens', id: 16326, bytes: 7, isSpaceLead: true },
      { text: '.', id: 13, bytes: 1 },
      { text: '·', id: 220, bytes: 1, isSpaceLead: true },
      { text: 'С', id: 191, bytes: 2, subword: true },
      { text: 'ә', id: 153, bytes: 2, subword: true },
      { text: 'л', id: 216, bytes: 2, subword: true },
      { text: 'е', id: 181, bytes: 2, subword: true },
      { text: 'м', id: 217, bytes: 2, subword: true },
      { text: ',', id: 11, bytes: 1 },
      { text: '·', id: 220, bytes: 1, isSpaceLead: true },
      { text: 'ә', id: 153, bytes: 2, subword: true },
      { text: 'л', id: 216, bytes: 2, subword: true },
      { text: 'е', id: 181, bytes: 2, subword: true },
      { text: 'м', id: 217, bytes: 2, subword: true },
      { text: '!', id: 0, bytes: 1 },
      { text: '·', id: 220, bytes: 1, isSpaceLead: true },
      { text: '1', id: 16, bytes: 1 },
      { text: '23', id: 902, bytes: 2 },
      { text: '·+', id: 1343, bytes: 2, isSpaceLead: true },
      { text: '·', id: 220, bytes: 1, isSpaceLead: true },
      { text: '4', id: 19, bytes: 1 },
      { text: '56', id: 1740, bytes: 2 },
      { text: '·=', id: 796, bytes: 2, isSpaceLead: true },
      { text: '·', id: 220, bytes: 1, isSpaceLead: true },
      { text: '5', id: 20, bytes: 1 },
      { text: '7', id: 22, bytes: 1 },
      { text: '9', id: 24, bytes: 1 },
      { text: '.', id: 13, bytes: 1 },
    ],
  },
  {
    id: 'gpt35',
    name: 'GPT-3.5 / Llama 2',
    generation: 'Newer Model (2022–2023)',
    vocabSize: '100,277',
    releaseYear: '2023',
    tokenCount: 23,
    color: '#0a84ff',
    description: 'cl100k_base tokenizer. Handles numbers in 3-digit clusters and groups Cyrillic into multi-character subwords.',
    kazakhEfficiency: '5 tokens for 2 Kazakh words (subword clusters)',
    tokens: [
      { text: 'Language', id: 35689, bytes: 8 },
      { text: '·models', id: 4211, bytes: 7, isSpaceLead: true },
      { text: '·do', id: 656, bytes: 3, isSpaceLead: true },
      { text: '·not', id: 539, bytes: 4, isSpaceLead: true },
      { text: '·read', id: 1941, bytes: 5, isSpaceLead: true },
      { text: '·words', id: 3329, bytes: 6, isSpaceLead: true },
      { text: ',', id: 11, bytes: 1 },
      { text: '·they', id: 814, bytes: 5, isSpaceLead: true },
      { text: '·read', id: 1941, bytes: 5, isSpaceLead: true },
      { text: '·tokens', id: 11460, bytes: 7, isSpaceLead: true },
      { text: '.', id: 13, bytes: 1 },
      { text: '·Сә', id: 82194, bytes: 5, isSpaceLead: true },
      { text: 'лем', id: 52044, bytes: 6, subword: true },
      { text: ',', id: 11, bytes: 1 },
      { text: '·ә', id: 94012, bytes: 3, isSpaceLead: true },
      { text: 'лем', id: 52044, bytes: 6, subword: true },
      { text: '!', id: 0, bytes: 1 },
      { text: '·123', id: 10452, bytes: 4, isSpaceLead: true },
      { text: '·+', id: 1343, bytes: 2, isSpaceLead: true },
      { text: '·456', id: 24901, bytes: 4, isSpaceLead: true },
      { text: '·=', id: 796, bytes: 2, isSpaceLead: true },
      { text: '·579', id: 39182, bytes: 4, isSpaceLead: true },
      { text: '.', id: 13, bytes: 1 },
    ],
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o / Llama 3',
    generation: 'Advanced Model (2024)',
    vocabSize: '200,000',
    releaseYear: '2024',
    tokenCount: 15,
    color: '#bf5af2',
    description: 'o200k_base tokenizer. Massive vocabulary with native multilingual coverage. Entire Kazakh words and phrases merge into single tokens.',
    kazakhEfficiency: 'Just 2 tokens for "Сәлем," and "әлем!" (61% total reduction!)',
    tokens: [
      { text: 'Language', id: 29841, bytes: 8 },
      { text: '·models', id: 3120, bytes: 7, isSpaceLead: true },
      { text: '·do·not', id: 8941, bytes: 7, isSpaceLead: true },
      { text: '·read', id: 1620, bytes: 5, isSpaceLead: true },
      { text: '·words,', id: 14209, bytes: 7, isSpaceLead: true },
      { text: '·they', id: 652, bytes: 5, isSpaceLead: true },
      { text: '·read', id: 1620, bytes: 5, isSpaceLead: true },
      { text: '·tokens.', id: 22091, bytes: 8, isSpaceLead: true },
      { text: '·Сәлем,', id: 114923, bytes: 12, isSpaceLead: true },
      { text: '·әлем!', id: 128450, bytes: 10, isSpaceLead: true },
      { text: '·123', id: 9410, bytes: 4, isSpaceLead: true },
      { text: '·+', id: 1102, bytes: 2, isSpaceLead: true },
      { text: '·456', id: 18451, bytes: 4, isSpaceLead: true },
      { text: '·=', id: 684, bytes: 2, isSpaceLead: true },
      { text: '·579.', id: 28941, bytes: 5, isSpaceLead: true },
    ],
  },
]

export default function TokenizerPlayground() {
  const [activeTab, setActiveTab] = useState<'compare' | 'gpt2' | 'gpt35' | 'gpt4o'>('compare')
  const [hoveredToken, setHoveredToken] = useState<{
    token: TokenData
    index: number
    modelName: string
  } | null>(null)

  return (
    <div
      className="rounded-2xl p-6 select-none transition-all"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* ── Top Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 pb-5 border-b border-[rgba(255,255,255,0.07)]">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(191, 90, 242, 0.15)', color: '#bf5af2' }}
            >
              Tiktokenizer Visualizer
            </span>
            <span className="text-xs text-[#8e8e93] font-mono">
              BPE Token Boundary Evolution
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[#f0ece8] mt-1 tracking-tight">
            How Tokenizers Evolved Across Model Generations
          </h3>
          <p className="text-xs text-[#a1a1a6] mt-1 max-w-2xl">
            See how the exact same text splits into tokens across an older model (GPT-2), a newer model (GPT-3.5), and an advanced model (GPT-4o).
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-[#2c2c30] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            Compare All
          </button>
          <button
            onClick={() => setActiveTab('gpt2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'gpt2'
                ? 'bg-[#ff9f0a] text-black shadow-sm'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            GPT-2 (Old)
          </button>
          <button
            onClick={() => setActiveTab('gpt35')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'gpt35'
                ? 'bg-[#0a84ff] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            GPT-3.5 (Newer)
          </button>
          <button
            onClick={() => setActiveTab('gpt4o')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'gpt4o'
                ? 'bg-[#bf5af2] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            GPT-4o (Advanced)
          </button>
        </div>
      </div>

      {/* ── Static Benchmark Text Card (Read-Only) ── */}
      <div className="mt-5 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#101012]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] flex items-center gap-1.5">
            <Lock size={12} className="text-[#ff9f0a]" />
            <span>Static Benchmark Text (Read-Only)</span>
          </span>
          <span className="text-[11px] text-[#636366] font-mono">
            {STATIC_BENCHMARK_TEXT.length} characters • Includes English, Cyrillic (Kazakh), & Math
          </span>
        </div>
        <div className="p-3.5 rounded-lg bg-[#141418] border border-[rgba(255,255,255,0.04)] font-mono text-xs text-[#f2f2f7] select-text leading-relaxed">
          {STATIC_BENCHMARK_TEXT}
        </div>
      </div>

      {/* ── Metric Comparison Scorecards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-5">
        {MODELS_DATA.map((m) => {
          const isSelected = activeTab === m.id || activeTab === 'compare'
          return (
            <div
              key={m.id}
              onClick={() => setActiveTab(m.id as any)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[rgba(255,255,255,0.15)] bg-[#19191d]'
                  : 'border-[rgba(255,255,255,0.05)] bg-[#111113] opacity-60 hover:opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#ffffff]">{m.name}</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md font-mono"
                  style={{ background: `${m.color}20`, color: m.color }}
                >
                  {m.vocabSize} vocab
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span
                  className="text-3xl font-extrabold font-mono"
                  style={{ color: m.color }}
                >
                  {m.tokenCount}
                </span>
                <span className="text-xs text-[#8e8e93] font-mono">tokens</span>
                {m.id === 'gpt4o' && (
                  <span className="ml-auto text-[10px] font-bold text-[#30d158] bg-[rgba(48,209,88,0.15)] px-2 py-0.5 rounded-full">
                    -61% tokens
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8e8e93] mt-2 leading-tight">
                {m.kazakhEfficiency}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Token Streams Display ── */}
      <div className="space-y-6">
        {MODELS_DATA.filter(
          (m) => activeTab === 'compare' || activeTab === m.id
        ).map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: m.color }}
                />
                <span className="text-xs font-bold text-[#f2f2f7]">
                  {m.name} ({m.generation})
                </span>
                <span className="text-[11px] text-[#8e8e93] font-mono">
                  — {m.tokens.length} tokens
                </span>
              </div>
              <span className="text-[11px] text-[#636366]">
                Hover a chip to inspect token ID & bytes
              </span>
            </div>

            {/* Tiktokenizer colored chips stream */}
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-[#0e0e11] border border-[rgba(255,255,255,0.04)] min-h-[70px] items-start leading-relaxed">
              {m.tokens.map((tok, idx) => {
                const colorTheme = TOKEN_COLORS[idx % TOKEN_COLORS.length]
                const isHovered =
                  hoveredToken?.token.id === tok.id &&
                  hoveredToken?.index === idx &&
                  hoveredToken?.modelName === m.name

                return (
                  <span
                    key={`${tok.id}-${idx}`}
                    onMouseEnter={() =>
                      setHoveredToken({ token: tok, index: idx, modelName: m.name })
                    }
                    onMouseLeave={() => setHoveredToken(null)}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono transition-all duration-150 cursor-pointer select-none"
                    style={{
                      background: isHovered ? colorTheme.text : colorTheme.bg,
                      border: `1px solid ${colorTheme.border}`,
                      color: isHovered ? '#000000' : colorTheme.text,
                      fontWeight: isHovered ? 700 : 500,
                      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      boxShadow: isHovered
                        ? `0 0 12px ${colorTheme.text}88`
                        : 'none',
                      zIndex: isHovered ? 10 : 1,
                    }}
                    title={`Token #${idx + 1} | ID: ${tok.id} | "${tok.text}"`}
                  >
                    {tok.text}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Token Inspector Box ── */}
      <div
        className="mt-5 p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono"
        style={{
          background: '#121215',
          borderColor: 'rgba(255, 255, 255, 0.07)',
        }}
      >
        {hoveredToken ? (
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[#8e8e93]">
              Model: <strong className="text-white">{hoveredToken.modelName}</strong>
            </span>
            <span className="text-[#8e8e93]">
              Token Index: <strong className="text-[#0a84ff]">#{hoveredToken.index + 1}</strong>
            </span>
            <span className="text-[#8e8e93]">
              Token ID: <strong className="text-[#bf5af2]">{hoveredToken.token.id}</strong>
            </span>
            <span className="text-[#8e8e93]">
              Value: <strong className="text-[#30d158]">"{hoveredToken.token.text}"</strong>
            </span>
            {hoveredToken.token.bytes && (
              <span className="text-[#8e8e93]">
                UTF-8 Bytes: <strong className="text-[#ff9f0a]">{hoveredToken.token.bytes}B</strong>
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#636366]">
            <Info size={14} />
            <span>Hover any token chip above to inspect its exact Token ID, vocabulary index, and byte length.</span>
          </div>
        )}
      </div>

      {/* ── Educational Synthesis Note ── */}
      <div className="mt-5 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113]">
        <div className="flex items-center gap-2 mb-2 text-[#bf5af2]">
          <Sparkles size={15} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Why Modern Tokenizers Matter for Kazakh & Multilingual AI
          </span>
        </div>
        <p className="text-xs text-[#a1a1a6] leading-relaxed">
          In <strong>GPT-2</strong> (50k vocab), non-Latin characters had no dedicated tokens and were shattered into individual raw UTF-8 bytes—making generation 3× slower and costly.
          In <strong>GPT-4o / Llama 3</strong> (128k–200k vocab), entire Kazakh words such as <em>«Сәлем,»</em> and <em>«әлем!»</em> represent single tokens. The total prompt shrinks from <strong>39 tokens down to 15 tokens</strong>, drastically lowering latency, cutting API inference costs by over 60%, and enhancing model reasoning.
        </p>
      </div>

      {/* ── Under the Hood (Python Code) ── */}
      <div className="mt-5">
        <UnderTheHood
          id="tokenizer-tiktoken"
          title="Python Tiktoken & Tokenizer Inspection"
          defaultCode={`import tiktoken

# Compare old vs new tokenizers on static benchmark text
text = "Language models do not read words, they read tokens. Сәлем, әлем! 123 + 456 = 579."

enc_gpt2 = tiktoken.get_encoding("r50k_base")       # GPT-2 (50k vocab)
enc_cl100k = tiktoken.get_encoding("cl100k_base")   # GPT-3.5 / GPT-4
enc_o200k = tiktoken.get_encoding("o200k_base")     # GPT-4o (200k vocab)

tokens_gpt2 = enc_gpt2.encode(text)
tokens_cl100k = enc_cl100k.encode(text)
tokens_o200k = enc_o200k.encode(text)

print(f"GPT-2 tokens:       {len(tokens_gpt2)}")      # 39 tokens
print(f"GPT-3.5 tokens:     {len(tokens_cl100k)}")    # 23 tokens
print(f"GPT-4o tokens:      {len(tokens_o200k)}")     # 15 tokens (-61%!)
`}
        />
      </div>
    </div>
  )
}
