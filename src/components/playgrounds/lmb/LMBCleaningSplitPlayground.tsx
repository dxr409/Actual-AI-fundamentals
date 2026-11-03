import React, { useState, useMemo } from 'react'

interface RawChunk {
  id: number
  raw: string
  cleaned: string
  category: 'clean' | 'html' | 'encoding' | 'boilerplate' | 'duplicate'
}

const RAW_CORPUS_CHUNKS: RawChunk[] = [
  {
    id: 1,
    raw: '<nav class="top-bar">Home | Login | Subscribe | Privacy Policy</nav>',
    cleaned: '',
    category: 'boilerplate',
  },
  {
    id: 2,
    raw: '<div class="story"><p>Once upon a time, a little fox lived near the quiet woods.</p></div>',
    cleaned: 'Once upon a time, a little fox lived near the quiet woods.',
    category: 'html',
  },
  {
    id: 3,
    raw: 'She didnâ€™t mind the rain, because the moss smelled sweet — and the stream sang.',
    cleaned: "She didn't mind the rain, because the moss smelled sweet — and the stream sang.",
    category: 'encoding',
  },
  {
    id: 4,
    raw: 'She didnâ€™t mind the rain, because the moss smelled sweet — and the stream sang.',
    cleaned: "She didn't mind the rain, because the moss smelled sweet — and the stream sang.",
    category: 'duplicate',
  },
  {
    id: 5,
    raw: '[Accept All Cookies] We use 427 tracking partners to personalize ads on this page.',
    cleaned: '',
    category: 'boilerplate',
  },
  {
    id: 6,
    raw: 'Every morning the fox trotted down to the water to watch the silver fish.',
    cleaned: 'Every morning the fox trotted down to the water to watch the silver fish.',
    category: 'clean',
  },
]

export function DataCleaningDiff() {
  const [stripHtml, setStripHtml] = useState(true)
  const [fixEncoding, setFixEncoding] = useState(true)
  const [filterBoilerplate, setFilterBoilerplate] = useState(true)
  const [deduplicate, setDeduplicate] = useState(true)

  const processed = useMemo(() => {
    return RAW_CORPUS_CHUNKS.map((chunk) => {
      if (chunk.category === 'boilerplate' && filterBoilerplate) {
        return { ...chunk, status: 'removed' as const, output: '' }
      }
      if (chunk.category === 'duplicate' && deduplicate) {
        return { ...chunk, status: 'removed' as const, output: '' }
      }

      let text = chunk.raw
      let modified = false

      if (chunk.category === 'html' && stripHtml) {
        text = chunk.cleaned
        modified = true
      }
      if ((chunk.category === 'encoding' || chunk.category === 'duplicate') && fixEncoding) {
        text = text.replace(/â€™/g, "'")
        modified = true
      }

      return {
        ...chunk,
        status: modified ? ('repaired' as const) : ('kept' as const),
        output: text,
      }
    })
  }, [stripHtml, fixEncoding, filterBoilerplate, deduplicate])

  const activeFiltersCount = [stripHtml, fixEncoding, filterBoilerplate, deduplicate].filter(
    Boolean
  ).length

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Corpus Cleaning Diff (Quality Beats Quantity)
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          {activeFiltersCount}/4 cleaning passes enabled
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Toggleable Cleaning Passes */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Strip HTML Tags', val: stripHtml, set: setStripHtml },
            { label: "Fix UTF-8 Mojibake (â€™ → ')", val: fixEncoding, set: setFixEncoding },
            { label: 'Drop Nav & Cookie Banners', val: filterBoilerplate, set: setFilterBoilerplate },
            { label: 'Deduplicate Repeated Passages', val: deduplicate, set: setDeduplicate },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => item.set(!item.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-2 ${
                item.val
                  ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] font-bold'
                  : 'bg-[#1b1a17] text-[#a8a29e] border-white/10'
              }`}
            >
              <span>{item.val ? '✓' : '○'}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Side-by-Side Diff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Raw Web Crawl */}
          <div className="p-3.5 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#a8a29e] pb-1 border-b border-white/10">
              Raw Web Crawl Input
            </div>
            {processed.map((row) => (
              <div
                key={row.id}
                className={`p-2 rounded-lg text-xs font-mono leading-relaxed border ${
                  row.status === 'removed'
                    ? 'bg-[#ef4444]/10 border-[#ef4444]/35 text-[#ef4444] line-through'
                    : row.status === 'repaired'
                    ? 'bg-[#f6e9c7]/10 border-[#f6e9c7]/35 text-[#f6e9c7]'
                    : 'bg-[#1b1a17] border-white/5 text-[#d6d3d1]'
                }`}
              >
                {row.raw}
              </div>
            ))}
          </div>

          {/* Cleaned Training Output */}
          <div className="p-3.5 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#10b981] pb-1 border-b border-white/10">
              Cleaned Corpus Written to Disk
            </div>
            {processed
              .filter((r) => r.status !== 'removed')
              .map((row) => (
                <div
                  key={row.id}
                  className={`p-2 rounded-lg text-xs font-mono leading-relaxed border ${
                    row.status === 'repaired'
                      ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#fdfbf7]'
                      : 'bg-[#1b1a17] border-white/5 text-[#fdfbf7]'
                  }`}
                >
                  {row.output}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const STREAM_TOKENS = [
  { tok: 'Once', id: 1920 },
  { tok: 'upon', id: 2401 },
  { tok: 'a', id: 257 },
  { tok: 'time', id: 640 },
  { tok: 'the', id: 262 },
  { tok: 'little', id: 1310 },
  { tok: 'fox', id: 21831 },
  { tok: 'trotted', id: 40192 },
  { tok: 'down', id: 866 },
  { tok: 'to', id: 284 },
  { tok: 'the', id: 262 },
  { tok: 'silver', id: 8465 },
  { tok: 'stream', id: 6930 },
  { tok: '.', id: 13 },
  { tok: 'She', id: 1375 },
  { tok: 'watched', id: 7342 },
  { tok: 'the', id: 262 },
  { tok: 'fish', id: 5916 },
  { tok: 'swim', id: 14902 },
  { tok: '.', id: 13 },
]

export function TrainValSplitPacker() {
  const [valPercent, setValPercent] = useState(15)
  const [windowStart, setWindowStart] = useState(4)
  const blockSize = 5

  const splitIndex = Math.max(
    blockSize + 2,
    Math.round(STREAM_TOKENS.length * (1 - valPercent / 100))
  )

  const maxStart = Math.max(0, splitIndex - blockSize - 1)
  const clampedStart = Math.min(windowStart, maxStart)

  const contextSlice = STREAM_TOKENS.slice(clampedStart, clampedStart + blockSize)
  const targetSlice = STREAM_TOKENS.slice(clampedStart + 1, clampedStart + 1 + blockSize)

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Train / Validation Split & Shift-by-One Batch Sampler
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          block_size = {blockSize} tokens
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-[#1b1a17] border border-white/10">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Window Offset (i) in train.npy</span>
              <span className="text-[#f6e9c7] font-bold">i = {clampedStart}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxStart}
              value={clampedStart}
              onChange={(e) => setWindowStart(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#1b1a17] border border-white/10">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#d6d3d1]">Held-Out Validation Slice</span>
              <span className="text-[#f6e9c7] font-bold">
                {100 - valPercent}% Train / {valPercent}% Val
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={valPercent}
              onChange={(e) => setValPercent(parseInt(e.target.value, 10))}
              className="w-full accent-[#f6e9c7] cursor-pointer"
            />
          </div>
        </div>

        {/* Full Token Stream with Train vs Val Boundary */}
        <div className="p-4 rounded-xl bg-[#0f0f11] border border-white/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono">
            <span className="text-[#a8a29e]">
              Encoded Token Array (<code className="text-[#f6e9c7]">uint16</code>) — Click any training token to move window <code className="text-[#f6e9c7]">i</code>
            </span>
            <span className="text-[#a8a29e]">
              <span className="text-[#f6e9c7]">■ train.npy</span> ·{' '}
              <span className="text-[#a8a29e]">□ val.npy (held back)</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STREAM_TOKENS.map((item, idx) => {
              const isVal = idx >= splitIndex
              const inX = idx >= clampedStart && idx < clampedStart + blockSize
              const inY = idx >= clampedStart + 1 && idx < clampedStart + 1 + blockSize

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isVal}
                  onClick={() => setWindowStart(Math.min(idx, maxStart))}
                  className={`px-2 py-1 rounded-lg font-mono text-xs border transition-all ${
                    isVal
                      ? 'bg-[#161618] border-dashed border-white/15 text-[#78716c] cursor-not-allowed'
                      : inX && inY
                      ? 'bg-[#f6e9c7] text-[#1a1813] border-[#10b981] font-bold cursor-pointer'
                      : inX
                      ? 'bg-[#f6e9c7]/25 text-[#f6e9c7] border-[#f6e9c7]/60 font-bold cursor-pointer'
                      : inY
                      ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/60 font-bold cursor-pointer'
                      : 'bg-[#1c1b18] text-[#d6d3d1] border-white/10 hover:border-white/30 cursor-pointer'
                  }`}
                >
                  <div>{item.tok}</div>
                  <div className="text-[9px] opacity-75">#{item.id}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Shift-by-One Alignment Table */}
        <div className="p-4 rounded-xl bg-[#1b1a17] border border-white/10 space-y-2">
          <div className="text-xs font-bold text-[#f6e9c7]">
            Self-Labeled Prediction Exercise: <code>y = train[i + 1 : i + 1 + block_size]</code>
          </div>
          <div className="grid grid-cols-5 gap-2 pt-1 font-mono text-xs">
            {contextSlice.map((cx, k) => {
              const tg = targetSlice[k]
              return (
                <div
                  key={k}
                  className="p-2.5 rounded-xl bg-[#121214] border border-white/10 text-center space-y-1"
                >
                  <div className="text-[10px] text-[#a8a29e]">Pos {k + 1}</div>
                  <div className="text-[#f6e9c7] font-bold">x: "{cx.tok}"</div>
                  <div className="text-[10px] text-[#a8a29e]">↓ predicts ↓</div>
                  <div className="px-1.5 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-bold">
                    y: "{tg.tok}"
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LMBCleaningSplitPlayground() {
  return (
    <div className="space-y-6">
      <DataCleaningDiff />
      <TrainValSplitPacker />
    </div>
  )
}
