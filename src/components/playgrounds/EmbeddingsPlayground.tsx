import React, { useState, useRef, useMemo } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Info, Sparkles } from 'lucide-react'
import UnderTheHood from './UnderTheHood'

interface EmbeddingWord {
  word: string
  x: number // -1 to 1 normalized PCA coordinates
  y: number // -1 to 1 normalized PCA coordinates
  category: 'animals' | 'food' | 'colors' | 'numbers' | 'places' | 'family'
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; shortLabel: string; color: string; badgeBg: string }
> = {
  animals: {
    label: 'Animals',
    shortLabel: 'anim...',
    color: '#0a84ff',
    badgeBg: 'rgba(10, 132, 255, 0.18)',
  },
  family: {
    label: 'Family & Royalty',
    shortLabel: 'famil...',
    color: '#bf5af2',
    badgeBg: 'rgba(191, 90, 242, 0.18)',
  },
  places: {
    label: 'Places',
    shortLabel: 'places',
    color: '#ff9f0a',
    badgeBg: 'rgba(255, 159, 10, 0.18)',
  },
  colors: {
    label: 'Colors',
    shortLabel: 'colors',
    color: '#22d3ee',
    badgeBg: 'rgba(34, 211, 238, 0.18)',
  },
  numbers: {
    label: 'Numbers',
    shortLabel: 'num...',
    color: '#818cf8',
    badgeBg: 'rgba(129, 140, 248, 0.18)',
  },
  food: {
    label: 'Food',
    shortLabel: 'food',
    color: '#d4a373',
    badgeBg: 'rgba(212, 163, 115, 0.18)',
  },
}

// Exactly 43 words matching the PCA screenshot
const EMBEDDING_WORDS: EmbeddingWord[] = [
  // ── Animals (10) ──
  { word: 'fish', x: -0.73, y: 0.38, category: 'animals' },
  { word: 'cow', x: -0.63, y: 0.06, category: 'animals' },
  { word: 'mouse', x: -0.52, y: -0.12, category: 'animals' },
  { word: 'lion', x: -0.36, y: -0.12, category: 'animals' },
  { word: 'rabbit', x: -0.84, y: -0.26, category: 'animals' },
  { word: 'cat', x: -0.63, y: -0.34, category: 'animals' },
  { word: 'dog', x: -0.54, y: -0.30, category: 'animals' },
  { word: 'horse', x: -0.32, y: -0.04, category: 'animals' },
  { word: 'bear', x: -0.27, y: -0.05, category: 'animals' },
  { word: 'bird', x: -0.41, y: 0.15, category: 'animals' },

  // ── Food (6) ──
  { word: 'coffee', x: -0.53, y: 0.39, category: 'food' },
  { word: 'tea', x: -0.48, y: 0.32, category: 'food' },
  { word: 'cheese', x: -0.66, y: 0.28, category: 'food' },
  { word: 'banana', x: -0.64, y: 0.24, category: 'food' },
  { word: 'bread', x: -0.56, y: 0.22, category: 'food' },
  { word: 'apple', x: -0.42, y: 0.14, category: 'food' },

  // ── Colors (6) ──
  { word: 'yellow', x: -0.45, y: 0.35, category: 'colors' },
  { word: 'red', x: -0.24, y: 0.37, category: 'colors' },
  { word: 'blue', x: -0.34, y: 0.29, category: 'colors' },
  { word: 'green', x: -0.31, y: 0.25, category: 'colors' },
  { word: 'white', x: -0.17, y: 0.11, category: 'colors' },
  { word: 'black', x: -0.22, y: 0.07, category: 'colors' },

  // ── Numbers (6) ──
  { word: 'one', x: 0.25, y: 0.17, category: 'numbers' },
  { word: 'two', x: 0.40, y: 0.47, category: 'numbers' },
  { word: 'three', x: 0.43, y: 0.49, category: 'numbers' },
  { word: 'four', x: 0.37, y: 0.51, category: 'numbers' },
  { word: 'five', x: 0.42, y: 0.53, category: 'numbers' },
  { word: 'six', x: 0.35, y: 0.48, category: 'numbers' },

  // ── Places (7) ──
  { word: 'tokyo', x: 0.49, y: 0.57, category: 'places' },
  { word: 'france', x: 0.50, y: 0.51, category: 'places' },
  { word: 'italy', x: 0.51, y: 0.45, category: 'places' },
  { word: 'berlin', x: 0.69, y: 0.41, category: 'places' },
  { word: 'paris', x: 0.63, y: 0.37, category: 'places' },
  { word: 'london', x: 0.47, y: 0.28, category: 'places' },
  { word: 'rome', x: 0.74, y: 0.19, category: 'places' },

  // ── Family / Royalty (8) ──
  { word: 'man', x: 0.24, y: -0.29, category: 'family' },
  { word: 'king', x: 0.38, y: -0.30, category: 'family' },
  { word: 'prince', x: 0.51, y: -0.26, category: 'family' },
  { word: 'queen', x: 0.27, y: -0.37, category: 'family' },
  { word: 'woman', x: 0.23, y: -0.43, category: 'family' },
  { word: 'princess', x: 0.41, y: -0.46, category: 'family' },
  { word: 'girl', x: 0.15, y: -0.52, category: 'family' },
  { word: 'boy', x: 0.12, y: -0.56, category: 'family' },
]

export default function EmbeddingsPlayground() {
  const [zoom, setZoom] = useState<number>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [hoveredWord, setHoveredWord] = useState<EmbeddingWord | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z * 1.25))
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z / 1.25))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setActiveCategory(null)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  // Map normalized coordinates [-1, 1] to container SVG dimensions [width, height]
  const svgWidth = 760
  const svgHeight = 440

  const toSvgCoords = (nx: number, ny: number) => {
    // Invert Y so positive Y is upper half
    const cx = svgWidth / 2
    const cy = svgHeight / 2
    const scaleX = (svgWidth / 2) * 0.88 * zoom
    const scaleY = (svgHeight / 2) * 0.84 * zoom

    return {
      x: cx + nx * scaleX + pan.x,
      y: cy - ny * scaleY + pan.y,
    }
  }

  const wordsToRender = useMemo(() => {
    return EMBEDDING_WORDS.map((w) => ({
      ...w,
      coords: toSvgCoords(w.x, w.y),
      config: CATEGORY_CONFIG[w.category],
      isDimmed: activeCategory !== null && activeCategory !== w.category,
      isHovered: hoveredWord?.word === w.word,
    }))
  }, [zoom, pan, activeCategory, hoveredWord])

  return (
    <div
      className="rounded-2xl overflow-hidden select-none transition-all"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* ── Top Header ── */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}
      >
        <span className="text-sm font-semibold text-[#f0ece8] tracking-tight">
          A flat map of the space
        </span>
        <span className="text-xs font-mono text-[#8e8e93]">
          PCA projection
        </span>
      </div>

      {/* ── Sub-header: 2D Embedding Map & Word Count ── */}
      <div className="px-6 pt-5 pb-3 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] block">
            2D EMBEDDING MAP
          </span>
          <p className="text-xs text-[#a1a1a6] mt-0.5">
            A 50-dimensional space flattened into a quiet map of nearby meanings.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] block">
            WORDS
          </span>
          <span className="text-2xl font-bold font-mono text-[#0a84ff]">
            43
          </span>
        </div>
      </div>

      {/* ── Main Map Canvas Container ── */}
      <div className="px-6 pb-4">
        <div
          className="relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] cursor-grab active:cursor-grabbing"
          style={{ background: '#0e0e11', height: `${svgHeight}px` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoom / Pan Controls Pill (Top Right) */}
          <div
            className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1 px-2 py-1.5 rounded-xl border border-[rgba(255,255,255,0.1)] shadow-lg"
            style={{ background: 'rgba(26, 26, 30, 0.85)', backdropFilter: 'blur(8px)' }}
          >
            <button
              onClick={handleZoomOut}
              className="p-1 text-[#8e8e93] hover:text-[#ffffff] transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-[#8e8e93] hover:text-[#ffffff] transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={handleReset}
              className="p-1 text-[#8e8e93] hover:text-[#ffffff] transition-colors cursor-pointer"
              title="Reset view"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* SVG Map Layer */}
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Subtle Grid Lines matching screenshot */}
            <defs>
              <pattern
                id="subtle-grid"
                width={svgWidth / 4}
                height={svgHeight / 4}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${svgWidth / 4} 0 L 0 0 0 ${svgHeight / 4}`}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#subtle-grid)" />

            {/* Central Axis crosshairs */}
            <line
              x1={svgWidth / 2 + pan.x}
              y1={0}
              x2={svgWidth / 2 + pan.x}
              y2={svgHeight}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
            <line
              x1={0}
              y1={svgHeight / 2 + pan.y}
              x2={svgWidth}
              y2={svgHeight / 2 + pan.y}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />

            {/* Words & Cluster Points */}
            {wordsToRender.map((w) => {
              const { x, y } = w.coords
              const isHovered = w.isHovered
              const isDimmed = w.isDimmed

              // Compute pill badge width based on word length
              const badgeWidth = Math.max(38, w.word.length * 8.2 + 16)
              const badgeHeight = 20

              return (
                <g
                  key={w.word}
                  transform={`translate(${x}, ${y})`}
                  className="transition-opacity duration-200 cursor-pointer"
                  style={{
                    opacity: isDimmed ? 0.18 : 1,
                    zIndex: isHovered ? 50 : 1,
                  }}
                  onMouseEnter={() => setHoveredWord(w)}
                  onMouseLeave={() => setHoveredWord(null)}
                >
                  {/* Outer glow ring on hover */}
                  {isHovered && (
                    <circle
                      cx={0}
                      cy={0}
                      r={10}
                      fill={w.config.color}
                      opacity={0.35}
                    />
                  )}

                  {/* Word anchor dot */}
                  <circle
                    cx={0}
                    cy={0}
                    r={isHovered ? 5 : 3.5}
                    fill={w.config.color}
                  />

                  {/* Translucent pill badge with word text */}
                  <g transform={`translate(8, -10)`}>
                    <rect
                      x={0}
                      y={0}
                      width={badgeWidth}
                      height={badgeHeight}
                      rx={6}
                      fill={isHovered ? 'rgba(30, 30, 36, 0.95)' : 'rgba(24, 24, 28, 0.72)'}
                      stroke={
                        isHovered
                          ? w.config.color
                          : 'rgba(255, 255, 255, 0.12)'
                      }
                      strokeWidth={isHovered ? 1.5 : 1}
                    />
                    <text
                      x={badgeWidth / 2}
                      y={13.5}
                      textAnchor="middle"
                      fill={isHovered ? '#ffffff' : '#e5e5ea'}
                      fontSize={11}
                      fontFamily="monospace"
                      fontWeight={isHovered ? 700 : 500}
                    >
                      {w.word}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>

          {/* Active Word Tooltip overlay */}
          {hoveredWord && (
            <div
              className="absolute bottom-3 left-4 pointer-events-none px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs font-mono flex items-center gap-2.5 shadow-lg"
              style={{ background: 'rgba(18, 18, 22, 0.9)', backdropFilter: 'blur(8px)' }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: CATEGORY_CONFIG[hoveredWord.category].color }}
              />
              <span className="text-white font-bold">"{hoveredWord.word}"</span>
              <span className="text-[#8e8e93]">
                Category: <strong className="text-[#f2f2f7] capitalize">{hoveredWord.category}</strong>
              </span>
              <span className="text-[#8e8e93]">
                PCA coords: ({hoveredWord.x.toFixed(2)}, {hoveredWord.y.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {/* ── Bottom Controls & Category Pills Bar ── */}
        <div className="mt-3.5 flex items-center justify-between flex-wrap gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(CATEGORY_CONFIG).map(([catKey, conf]) => {
              const isActive = activeCategory === catKey
              return (
                <button
                  key={catKey}
                  onClick={() =>
                    setActiveCategory(activeCategory === catKey ? null : catKey)
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                    isActive
                      ? 'border-[rgba(255,255,255,0.3)] text-white shadow'
                      : 'border-[rgba(255,255,255,0.06)] text-[#8e8e93] hover:text-[#f2f2f7]'
                  }`}
                  style={{
                    background: isActive ? conf.badgeBg : '#1c1c1f',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: conf.color }}
                  />
                  <span>{conf.shortLabel}</span>
                </button>
              )
            })}
          </div>

          <span className="text-xs text-[#8e8e93] font-mono">
            43 words from 50D to 2D with PCA
          </span>
        </div>
      </div>

      {/* ── Footer Quote matching screenshot ── */}
      <div
        className="px-6 py-4 border-t border-[rgba(255,255,255,0.07)] text-xs text-[#a1a1a6] leading-relaxed"
        style={{ background: '#121214' }}
      >
        Animals, colors, numbers, places, and people settle into their own regions. The model was never told these categories.
      </div>

      {/* ── Under The Hood Python Code ── */}
      <div className="p-6 pt-0 mt-4">
        <UnderTheHood
          id="embeddings-pca"
          title="Python: 50D Word Embeddings to 2D PCA"
          defaultCode={`import numpy as np
from sklearn.decomposition import PCA

# 1. Load 50-dimensional vectors for 43 words (e.g. GloVe or word2vec)
# embeddings.shape -> (43, 50)
pca = PCA(n_components=2)
reduced_2d = pca.fit_transform(embeddings_50d)

# 2. Compute explained variance ratio
print(f"Variance explained: {pca.explained_variance_ratio_.sum():.1%}")

# Words with similar contextual co-occurrences cluster together naturally
# in 2D space without any supervisory category labels!
`}
        />
      </div>
    </div>
  )
}
