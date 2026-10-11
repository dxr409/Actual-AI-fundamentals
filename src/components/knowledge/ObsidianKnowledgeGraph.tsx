import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Layers,
  HelpCircle,
  Filter,
} from 'lucide-react'
import { TopicNode, GraphEdge } from '@/lib/api'
import { useKnowledgeGraphStore } from '@/lib/knowledgeGraphStore'
import { useNavigate } from 'react-router-dom'
import TopicQuizModal from './TopicQuizModal'

interface ObsidianKnowledgeGraphProps {
  onSelectTopic?: (topic: TopicNode) => void
}

const CATEGORY_COLORS: Record<string, { label: string; accent: string; bg: string }> = {
  core: { label: 'Core Hub', accent: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
  theory: { label: 'Foundations', accent: '#bf5af2', bg: 'rgba(191, 90, 242, 0.15)' },
  architecture: { label: 'Architectures', accent: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  training: { label: 'Training & SFT', accent: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  systems: { label: 'Agents & RAG', accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
}

export default function ObsidianKnowledgeGraph({ onSelectTopic }: ObsidianKnowledgeGraphProps) {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const nodes = useKnowledgeGraphStore((s) => s.nodes)
  const edges = useKnowledgeGraphStore((s) => s.edges)
  const selectedTopicId = useKnowledgeGraphStore((s) => s.selectedTopicId)
  const selectTopic = useKnowledgeGraphStore((s) => s.selectTopic)
  const isQuizOpen = useKnowledgeGraphStore((s) => s.isQuizOpen)
  const activeQuizTopic = useKnowledgeGraphStore((s) => s.activeQuizTopic)
  const openQuiz = useKnowledgeGraphStore((s) => s.openQuiz)
  const closeQuiz = useKnowledgeGraphStore((s) => s.closeQuiz)

  // Pan & Zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1.0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all')

  const selectedNode = nodes.find((n) => n.id === selectedTopicId) || null

  // Setup initial canvas dimensions & center transform
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Zoom helpers
  const handleZoom = (delta: number) => {
    setTransform((prev) => {
      const newScale = Math.min(2.5, Math.max(0.4, prev.scale + delta))
      return { ...prev, scale: newScale }
    })
  }

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1.0 })
  }

  // Mouse event coordinates relative to graph world
  const getWorldCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const screenX = (clientX - rect.left) * dpr
      const screenY = (clientY - rect.top) * dpr
      const centerX = canvas.width / 2 + transform.x * dpr
      const centerY = canvas.height / 2 + transform.y * dpr

      const worldX = (screenX - centerX) / (transform.scale * dpr)
      const worldY = (screenY - centerY) / (transform.scale * dpr)
      return { x: worldX, y: worldY }
    },
    [transform]
  )

  // Find node under cursor
  const findNodeAtPos = useCallback(
    (clientX: number, clientY: number): TopicNode | null => {
      const { x, y } = getWorldCoordinates(clientX, clientY)
      for (const node of nodes) {
        const radius = node.category === 'core' ? 32 : 24
        const dist = Math.hypot(node.x - x, node.y - y)
        if (dist <= radius) {
          return node
        }
      }
      return null
    },
    [nodes, getWorldCoordinates]
  )

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const clicked = findNodeAtPos(e.clientX, e.clientY)
    if (clicked) {
      selectTopic(clicked.id)
      if (onSelectTopic) onSelectTopic(clicked)
      return
    }
    setIsDragging(true)
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const node = findNodeAtPos(e.clientX, e.clientY)
    setHoveredNodeId(node ? node.id : null)

    if (isDragging) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08
    setTransform((prev) => {
      const newScale = Math.min(2.5, Math.max(0.4, prev.scale + zoomFactor))
      return { ...prev, scale: newScale }
    })
  }

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.width
    const height = canvas.height

    ctx.save()
    ctx.clearRect(0, 0, width, height)

    // Background fill
    ctx.fillStyle = '#101014'
    ctx.fillRect(0, 0, width, height)

    // Subtle grid dots
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
    const gridSpacing = 40 * transform.scale * dpr
    const startX = ((transform.x * dpr) % gridSpacing) - gridSpacing
    const startY = ((transform.y * dpr) % gridSpacing) - gridSpacing
    for (let x = startX; x < width + gridSpacing; x += gridSpacing) {
      for (let y = startY; y < height + gridSpacing; y += gridSpacing) {
        ctx.fillRect(x, y, 1.5 * dpr, 1.5 * dpr)
      }
    }
    ctx.restore()

    // Setup viewport transform
    const centerX = width / 2 + transform.x * dpr
    const centerY = height / 2 + transform.y * dpr

    ctx.translate(centerX, centerY)
    ctx.scale(transform.scale * dpr, transform.scale * dpr)

    // 1. Draw Edges
    edges.forEach((edge) => {
      const src = nodes.find((n) => n.id === edge.source)
      const tgt = nodes.find((n) => n.id === edge.target)
      if (!src || !tgt) return

      const isTargetUnlocked = tgt.status !== 'locked'
      const isSrcMastered = src.status === 'mastered'
      const isConnectedToHovered =
        hoveredNodeId === edge.source || hoveredNodeId === edge.target
      const isConnectedToSelected =
        selectedTopicId === edge.source || selectedTopicId === edge.target

      ctx.save()
      ctx.beginPath()

      // Subtle curve for visual elegance
      const midX = (src.x + tgt.x) / 2
      const midY = (src.y + tgt.y) / 2
      const dx = tgt.x - src.x
      const dy = tgt.y - src.y
      const dist = Math.hypot(dx, dy)
      // Slight curve offset perpendicular to line
      const curvature = dist * 0.05
      const cpX = midX - (dy / dist) * curvature
      const cpY = midY + (dx / dist) * curvature

      ctx.moveTo(src.x, src.y)
      ctx.quadraticCurveTo(cpX, cpY, tgt.x, tgt.y)

      if (isConnectedToSelected || isConnectedToHovered) {
        ctx.strokeStyle = isTargetUnlocked ? '#38bdf8' : 'rgba(148, 163, 184, 0.5)'
        ctx.lineWidth = 2.5
        ctx.shadowColor = isTargetUnlocked ? 'rgba(56, 189, 248, 0.6)' : 'transparent'
        ctx.shadowBlur = 8
      } else if (isTargetUnlocked && isSrcMastered) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)'
        ctx.lineWidth = 1.6
      } else if (isTargetUnlocked) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'
        ctx.lineWidth = 1.4
      } else {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.18)'
        ctx.lineWidth = 1.0
        ctx.setLineDash([4, 4])
      }

      ctx.stroke()
      ctx.restore()
    })

    // 2. Draw Nodes
    nodes.forEach((node) => {
      const isSelected = selectedTopicId === node.id
      const isHovered = hoveredNodeId === node.id
      const isCore = node.category === 'core'
      const radius = isCore ? 24 : 16

      // Category matching
      const matchesFilter =
        activeCategoryFilter === 'all' || node.category === activeCategoryFilter

      ctx.save()

      if (!matchesFilter) {
        ctx.globalAlpha = 0.25
      }

      // Determine glow and fill colors
      let glow = 'rgba(56, 189, 248, 0.5)'
      let fillColor = '#38bdf8'
      let strokeColor = '#0284c7'

      if (node.status === 'mastered') {
        glow = `rgba(16, 185, 129, ${node.brightness})`
        fillColor = '#10b981'
        strokeColor = '#059669'
      } else if (node.status === 'needs_review') {
        glow = `rgba(245, 158, 11, ${node.brightness})`
        fillColor = '#f59e0b'
        strokeColor = '#d97706'
      } else if (node.status === 'locked') {
        glow = 'transparent'
        fillColor = '#27272a'
        strokeColor = '#3f3f46'
      }

      // Outer glow for active nodes
      if (node.status !== 'locked') {
        ctx.shadowColor = glow
        ctx.shadowBlur = Math.max(12, 28 * node.brightness)
      }

      // Selected ring animation indicator
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + 7, 0, Math.PI * 2)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.shadowColor = '#ffffff'
        ctx.shadowBlur = 12
        ctx.stroke()
      } else if (isHovered) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Core Hub decorative outer ring
      if (isCore) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, radius + 5, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Main node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = fillColor
      ctx.fill()
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      // Node label
      ctx.save()
      if (!matchesFilter) {
        ctx.globalAlpha = 0.25
      }

      ctx.font = isCore ? 'bold 12px system-ui, -apple-system, sans-serif' : '11px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      if (node.status === 'locked') {
        ctx.fillStyle = '#71717a'
        ctx.fillText(`🔒 ${node.title}`, node.x, node.y + radius + 7)
      } else if (node.status === 'mastered') {
        ctx.fillStyle = '#f4f4f5'
        ctx.fillText(`★ ${node.title}`, node.x, node.y + radius + 7)
      } else {
        ctx.fillStyle = '#e4e4e7'
        ctx.fillText(node.title, node.x, node.y + radius + 7)
      }

      // Small score indicator below title if attempted
      if (node.status !== 'locked' && node.mastery_score > 0) {
        ctx.font = 'bold 9px system-ui, sans-serif'
        ctx.fillStyle = node.status === 'mastered' ? '#10b981' : '#f59e0b'
        ctx.fillText(`${node.mastery_score}%`, node.x, node.y + radius + 22)
      }

      ctx.restore()
    })

    ctx.restore()
  }, [
    nodes,
    edges,
    transform,
    selectedTopicId,
    hoveredNodeId,
    activeCategoryFilter,
  ])

  // Aggregate stats
  const masteredCount = nodes.filter((n) => n.status === 'mastered').length
  const reviewCount = nodes.filter((n) => n.status === 'needs_review').length
  const unlockedCount = nodes.filter((n) => n.status === 'unlocked').length
  const lockedCount = nodes.filter((n) => n.status === 'locked').length
  const totalMasteryPct = Math.round((masteredCount / nodes.length) * 100)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex overflow-hidden select-none bg-[#101014]"
    >
      {/* ── Interactive Canvas ── */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-full block ${
          hoveredNodeId ? 'cursor-pointer' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      />

      {/* ── Top Bar: Progress & Filter Pills ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Overall Constellation Progress */}
        <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-2xl bg-[#18181c]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs font-bold text-white tracking-tight">
              Tree Mastery: {totalMasteryPct}%
            </span>
          </div>

          <div className="h-3 w-[1px] bg-[rgba(255,255,255,0.1)]" />

          <div className="flex items-center gap-2.5 text-[11px] text-[#a1a1aa]">
            <span className="flex items-center gap-1 text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              {masteredCount} Mastered
            </span>
            <span className="flex items-center gap-1 text-[#f59e0b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              {reviewCount} Review
            </span>
            <span className="flex items-center gap-1 text-[#38bdf8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              {unlockedCount} Available
            </span>
            <span className="flex items-center gap-1 text-[#71717a]">
              <Lock size={11} />
              {lockedCount} Locked
            </span>
          </div>
        </div>

        {/* Right: Category Filter Pills */}
        <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#18181c]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-lg pointer-events-auto">
          {['all', 'theory', 'architecture', 'training', 'systems'].map((cat) => {
            const isActive = activeCategoryFilter === cat
            const catLabel =
              cat === 'all'
                ? 'All Nodes'
                : CATEGORY_COLORS[cat]?.label || cat

            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2a2a32] text-white shadow-sm'
                    : 'text-[#8e8e93] hover:text-[#f2f2f7] hover:bg-[#202026]'
                }`}
              >
                {catLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Zoom Controls HUD (Bottom Left) ── */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-[#18181c]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-xl">
        <button
          onClick={() => handleZoom(0.2)}
          className="p-2 rounded-xl text-[#8e8e93] hover:text-white hover:bg-[#26262e] transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className="p-2 rounded-xl text-[#8e8e93] hover:text-white hover:bg-[#26262e] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl text-[#8e8e93] hover:text-white hover:bg-[#26262e] transition-colors"
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* ── Node Inspector Drawer / Card (Bottom Right / Side Panel) ── */}
      {selectedNode && (
        <div className="absolute bottom-6 right-6 z-20 w-80 md:w-96 rounded-2xl bg-[#18181c]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] shadow-2xl p-5 space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    color: CATEGORY_COLORS[selectedNode.category]?.accent || '#38bdf8',
                    background: CATEGORY_COLORS[selectedNode.category]?.bg || 'rgba(56, 189, 248, 0.1)',
                  }}
                >
                  {CATEGORY_COLORS[selectedNode.category]?.label || selectedNode.category}
                </span>

                {/* Status pill */}
                {selectedNode.status === 'mastered' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Mastered
                  </span>
                )}
                {selectedNode.status === 'needs_review' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 flex items-center gap-1">
                    <AlertCircle size={10} /> Needs Review
                  </span>
                )}
                {selectedNode.status === 'unlocked' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 flex items-center gap-1">
                    <Unlock size={10} /> Available
                  </span>
                )}
                {selectedNode.status === 'locked' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3f3f46]/30 text-[#a1a1aa] border border-[#3f3f46] flex items-center gap-1">
                    <Lock size={10} /> Locked
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-white tracking-tight">
                {selectedNode.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            {selectedNode.description}
          </p>

          {/* Mastery / Brightness Bar */}
          <div className="p-3 rounded-xl bg-[#202026] border border-[rgba(255,255,255,0.06)] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8e8e93] font-medium">Node Mastery & Glow</span>
              <span className="font-bold text-white">
                {selectedNode.mastery_score}% ({Math.round(selectedNode.brightness * 100)}% Glow)
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#2c2c34] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(5, selectedNode.mastery_score)}%`,
                  background:
                    selectedNode.status === 'mastered'
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : selectedNode.status === 'needs_review'
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : selectedNode.status === 'unlocked'
                      ? '#38bdf8'
                      : '#52525b',
                }}
              />
            </div>
          </div>

          {/* Prerequisites */}
          {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-wider">
                Prerequisites Required
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.prerequisites.map((prereqId) => {
                  const pNode = nodes.find((n) => n.id === prereqId)
                  const isDone = pNode?.status === 'mastered'
                  return (
                    <span
                      key={prereqId}
                      onClick={() => selectTopic(prereqId)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
                        isDone
                          ? 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] text-[#10b981]'
                          : 'border-[rgba(255,255,255,0.08)] bg-[#202026] text-[#a1a1aa] hover:border-[rgba(255,255,255,0.2)]'
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={11} /> : <Lock size={11} />}
                      <span>{pNode?.title || prereqId}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            {selectedNode.status === 'locked' ? (
              <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#26262e] border border-[rgba(255,255,255,0.05)] text-xs text-[#71717a]">
                <Lock size={13} />
                <span>Complete prerequisites to unlock</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openQuiz(selectedNode)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-[#38bdf8] hover:bg-[#0ea5e9] transition-all shadow-lg shadow-[#38bdf8]/20"
                >
                  <Sparkles size={14} />
                  <span>
                    {selectedNode.status === 'mastered' ? 'Retake Quiz' : 'Take Validation Quiz'}
                  </span>
                </button>

                {selectedNode.chapter_link && (
                  <button
                    onClick={() => navigate(`/chapter/${selectedNode.chapter_link}`)}
                    className="flex items-center justify-center gap-1.5 p-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-[#26262e] hover:bg-[#32323c] border border-[rgba(255,255,255,0.08)] transition-colors"
                    title={`Read Chapter ${selectedNode.chapter_link}`}
                  >
                    <BookOpen size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Quiz Modal ── */}
      {isQuizOpen && activeQuizTopic && (
        <TopicQuizModal topic={activeQuizTopic} onClose={closeQuiz} />
      )}
    </div>
  )
}
