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
} from 'lucide-react'
import { TopicNode } from '@/lib/api'
import { useKnowledgeGraphStore } from '@/lib/knowledgeGraphStore'
import { useNavigate } from 'react-router-dom'
import TopicQuizModal from './TopicQuizModal'

interface ObsidianKnowledgeGraphProps {
  onSelectTopic?: (topic: TopicNode) => void
}

interface SimNode {
  x: number
  y: number
  vx: number
  vy: number
  anchorX: number
  anchorY: number
}

const CATEGORY_COLORS: Record<string, { label: string; accent: string; bg: string }> = {
  core: { label: 'Core Hub', accent: '#fdfbf7', bg: 'rgba(253, 251, 247, 0.14)' },
  theory: { label: 'Foundations', accent: '#f6e9c7', bg: 'rgba(246, 233, 199, 0.14)' },
  architecture: { label: 'How Models Work', accent: '#ede3cb', bg: 'rgba(237, 227, 203, 0.14)' },
  training: { label: 'Training & SFT', accent: '#e5dec9', bg: 'rgba(229, 222, 201, 0.14)' },
  systems: { label: 'Build Your Model', accent: '#dcd5c2', bg: 'rgba(220, 213, 194, 0.14)' },
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

  // Pan & Zoom state (default scale 0.92 fits the entire graph comfortably)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.92 })
  const [isPanning, setIsPanning] = useState(false)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all')

  // Refs for physics loop so requestAnimationFrame always reads latest state without restarting
  const simRef = useRef<Record<string, SimNode>>({})
  const transformRef = useRef(transform)
  const draggedNodeRef = useRef<string | null>(null)
  const hoveredNodeRef = useRef<string | null>(null)
  const selectedTopicRef = useRef<string | null>(selectedTopicId)
  const filterRef = useRef<string>(activeCategoryFilter)
  const panStartRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    transformRef.current = transform
  }, [transform])

  useEffect(() => {
    draggedNodeRef.current = draggedNodeId
  }, [draggedNodeId])

  useEffect(() => {
    hoveredNodeRef.current = hoveredNodeId
  }, [hoveredNodeId])

  useEffect(() => {
    selectedTopicRef.current = selectedTopicId
  }, [selectedTopicId])

  useEffect(() => {
    filterRef.current = activeCategoryFilter
  }, [activeCategoryFilter])

  // Initialize or sync physics nodes with an Obsidian-style initial bloom from center
  useEffect(() => {
    const map = simRef.current
    nodes.forEach((n) => {
      if (!map[n.id]) {
        map[n.id] = {
          x: n.x * 0.45,
          y: n.y * 0.45,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          anchorX: n.x * 0.85,
          anchorY: n.y * 0.85,
        }
      } else {
        map[n.id].anchorX = n.x * 0.85
        map[n.id].anchorY = n.y * 0.85
      }
    })
  }, [nodes])

  const selectedNode = nodes.find((n) => n.id === selectedTopicId) || null

  // Setup responsive canvas dimensions using ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
      }
    }

    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(container)
    window.addEventListener('resize', updateSize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // Zoom helpers
  const handleZoom = (delta: number) => {
    setTransform((prev) => {
      const newScale = Math.min(2.5, Math.max(0.45, prev.scale + delta))
      return { ...prev, scale: newScale }
    })
  }

  const handleResetView = () => {
    // Re-energize physics gently and recenter
    Object.values(simRef.current).forEach((s) => {
      s.x = s.anchorX * 0.65
      s.y = s.anchorY * 0.65
      s.vx = 0
      s.vy = 0
    })
    setTransform({ x: 0, y: 0, scale: 0.92 })
  }

  // Convert screen coordinates to world coordinates
  const getWorldCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const t = transformRef.current
    const screenX = (clientX - rect.left) * dpr
    const screenY = (clientY - rect.top) * dpr
    const centerX = canvas.width / 2 + t.x * dpr
    const centerY = canvas.height / 2 + t.y * dpr

    const worldX = (screenX - centerX) / (t.scale * dpr)
    const worldY = (screenY - centerY) / (t.scale * dpr)
    return { x: worldX, y: worldY }
  }, [])

  // Find node under cursor using live simulated coordinates
  const findNodeAtPos = useCallback(
    (clientX: number, clientY: number): TopicNode | null => {
      const { x, y } = getWorldCoordinates(clientX, clientY)
      const sim = simRef.current
      for (const node of nodes) {
        const pos = sim[node.id] || { x: node.x, y: node.y }
        const radius = node.category === 'core' ? 30 : 22
        const dist = Math.hypot(pos.x - x, pos.y - y)
        if (dist <= radius) {
          return node
        }
      }
      return null
    },
    [nodes, getWorldCoordinates]
  )

  // Mouse handlers: drag individual nodes (Obsidian spring physics) or pan canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const clicked = findNodeAtPos(e.clientX, e.clientY)
    if (clicked) {
      selectTopic(clicked.id)
      if (onSelectTopic) onSelectTopic(clicked)
      setDraggedNodeId(clicked.id)
      return
    }
    setIsPanning(true)
    panStartRef.current = {
      x: e.clientX - transformRef.current.x,
      y: e.clientY - transformRef.current.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeRef.current) {
      const world = getWorldCoordinates(e.clientX, e.clientY)
      const simNode = simRef.current[draggedNodeRef.current]
      if (simNode) {
        simNode.x = world.x
        simNode.y = world.y
        simNode.vx = 0
        simNode.vy = 0
      }
      return
    }

    const node = findNodeAtPos(e.clientX, e.clientY)
    setHoveredNodeId(node ? node.id : null)

    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      }))
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggedNodeId(null)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 0.07 : -0.07
    setTransform((prev) => {
      const newScale = Math.min(2.5, Math.max(0.45, prev.scale + zoomFactor))
      return { ...prev, scale: newScale }
    })
  }

  // Continuous Obsidian Force-Directed Physics + Canvas Render Loop
  useEffect(() => {
    let rafId: number
    let tick = 0

    const stepAndRender = () => {
      tick += 1
      const canvas = canvasRef.current
      if (!canvas) {
        rafId = requestAnimationFrame(stepAndRender)
        return
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        rafId = requestAnimationFrame(stepAndRender)
        return
      }

      const sim = simRef.current
      const draggedId = draggedNodeRef.current

      // ── 1. OBSIDIAN FORCE-DIRECTED PHYSICS STEP ──
      // (a) Gentle anchor + center gravity + subtle ambient float
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const s = sim[n.id]
        if (!s || n.id === draggedId) continue

        // Pull gently toward structural anchor and center gravity (0, 0)
        const anchorStiffness = draggedId ? 0.012 : 0.032
        s.vx += (s.anchorX - s.x) * anchorStiffness
        s.vy += (s.anchorY - s.y) * anchorStiffness

        // Center gravity
        s.vx += -s.x * 0.0025
        s.vy += -s.y * 0.0025

        // Subtle organic breathing motion so the graph feels alive
        s.vx += Math.sin(tick * 0.02 + i * 1.3) * 0.025
        s.vy += Math.cos(tick * 0.018 + i * 1.7) * 0.025
      }

      // (b) Pairwise Coulomb node repulsion (prevents overlapping)
      for (let i = 0; i < nodes.length; i++) {
        const sA = sim[nodes[i].id]
        if (!sA) continue
        for (let j = i + 1; j < nodes.length; j++) {
          const sB = sim[nodes[j].id]
          if (!sB) continue
          const dx = sB.x - sA.x
          const dy = sB.y - sA.y
          const distSq = dx * dx + dy * dy + 80
          const dist = Math.sqrt(distSq)
          if (dist < 260) {
            const repulse = 1900 / distSq
            const fx = (dx / dist) * repulse
            const fy = (dy / dist) * repulse
            if (nodes[i].id !== draggedId) {
              sA.vx -= fx
              sA.vy -= fy
            }
            if (nodes[j].id !== draggedId) {
              sB.vx += fx
              sB.vy += fy
            }
          }
        }
      }

      // (c) Hooke's law spring forces along edges (pulling a node pulls its connected neighbors!)
      for (let eIdx = 0; eIdx < edges.length; eIdx++) {
        const edge = edges[eIdx]
        const sSrc = sim[edge.source]
        const sTgt = sim[edge.target]
        if (!sSrc || !sTgt) continue

        const dx = sTgt.x - sSrc.x
        const dy = sTgt.y - sSrc.y
        const dist = Math.hypot(dx, dy) || 1
        const idealLen = Math.hypot(sTgt.anchorX - sSrc.anchorX, sTgt.anchorY - sSrc.anchorY) || 160
        const diff = dist - idealLen
        const springK =
          draggedId === edge.source || draggedId === edge.target ? 0.045 : 0.018
        const fx = (dx / dist) * diff * springK
        const fy = (dy / dist) * diff * springK

        if (edge.source !== draggedId) {
          sSrc.vx += fx
          sSrc.vy += fy
        }
        if (edge.target !== draggedId) {
          sTgt.vx -= fx
          sTgt.vy -= fy
        }
      }

      // (d) Integrate velocities with smooth velocity damping
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const s = sim[n.id]
        if (!s || n.id === draggedId) continue
        s.vx *= 0.82
        s.vy *= 0.82
        s.x += s.vx
        s.y += s.vy
      }

      // ── 2. RENDER GRAPH ON CANVAS ──
      const dpr = window.devicePixelRatio || 1
      const width = canvas.width
      const height = canvas.height
      const t = transformRef.current
      const hovId = hoveredNodeRef.current
      const selId = selectedTopicRef.current
      const activeFilter = filterRef.current

      ctx.save()
      ctx.clearRect(0, 0, width, height)

      // Background fill
      ctx.fillStyle = '#111113'
      ctx.fillRect(0, 0, width, height)

      // Subtle grid dots
      ctx.save()
      ctx.fillStyle = 'rgba(246, 233, 199, 0.04)'
      const gridSpacing = Math.max(18, 40 * t.scale * dpr)
      const startX = ((t.x * dpr) % gridSpacing) - gridSpacing
      const startY = ((t.y * dpr) % gridSpacing) - gridSpacing
      for (let x = startX; x < width + gridSpacing; x += gridSpacing) {
        for (let y = startY; y < height + gridSpacing; y += gridSpacing) {
          ctx.fillRect(x, y, 1.5 * dpr, 1.5 * dpr)
        }
      }
      ctx.restore()

      // Setup viewport transform
      const centerX = width / 2 + t.x * dpr
      const centerY = height / 2 + t.y * dpr

      ctx.translate(centerX, centerY)
      ctx.scale(t.scale * dpr, t.scale * dpr)

      // Draw Edges with animated flow particles
      edges.forEach((edge, idx) => {
        const srcNode = nodes.find((n) => n.id === edge.source)
        const tgtNode = nodes.find((n) => n.id === edge.target)
        const src = sim[edge.source]
        const tgt = sim[edge.target]
        if (!srcNode || !tgtNode || !src || !tgt) return

        const isTargetUnlocked = tgtNode.status !== 'locked'
        const isSrcMastered = srcNode.status === 'mastered'
        const isConnectedToHovered = hovId === edge.source || hovId === edge.target
        const isConnectedToSelected = selId === edge.source || selId === edge.target
        const isConnectedToDragged =
          draggedId === edge.source || draggedId === edge.target

        ctx.save()
        ctx.beginPath()

        const midX = (src.x + tgt.x) / 2
        const midY = (src.y + tgt.y) / 2
        const dx = tgt.x - src.x
        const dy = tgt.y - src.y
        const dist = Math.hypot(dx, dy) || 1
        const curvature = dist * 0.05
        const cpX = midX - (dy / dist) * curvature
        const cpY = midY + (dx / dist) * curvature

        ctx.moveTo(src.x, src.y)
        ctx.quadraticCurveTo(cpX, cpY, tgt.x, tgt.y)

        if (isConnectedToDragged || isConnectedToSelected || isConnectedToHovered) {
          ctx.strokeStyle = isTargetUnlocked ? '#f6e9c7' : 'rgba(214, 211, 209, 0.5)'
          ctx.lineWidth = 2.4
          ctx.shadowColor = isTargetUnlocked ? 'rgba(246, 233, 199, 0.55)' : 'transparent'
          ctx.shadowBlur = 8
        } else if (isTargetUnlocked && isSrcMastered) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)'
          ctx.lineWidth = 1.7
        } else if (isTargetUnlocked) {
          ctx.strokeStyle = 'rgba(246, 233, 199, 0.34)'
          ctx.lineWidth = 1.5
        } else {
          ctx.strokeStyle = 'rgba(168, 162, 158, 0.18)'
          ctx.lineWidth = 1.1
          ctx.setLineDash([4, 4])
        }

        ctx.stroke()

        // Animated flow particle along active / unlocked connections
        if (isTargetUnlocked || isConnectedToSelected || isConnectedToHovered) {
          const u = ((tick * 0.006 + idx * 0.19) % 1)
          const inv = 1 - u
          const px = inv * inv * src.x + 2 * inv * u * cpX + u * u * tgt.x
          const py = inv * inv * src.y + 2 * inv * u * cpY + u * u * tgt.y
          ctx.beginPath()
          ctx.arc(px, py, 2.2, 0, Math.PI * 2)
          ctx.fillStyle = isSrcMastered ? '#10b981' : '#f6e9c7'
          ctx.fill()
        }

        ctx.restore()
      })

      // Draw Nodes
      nodes.forEach((node) => {
        const pos = sim[node.id] || { x: node.x, y: node.y }
        const isSelected = selId === node.id
        const isHovered = hovId === node.id
        const isDragged = draggedId === node.id
        const isCore = node.category === 'core'
        const radius = isCore ? 23 : 15.5

        const matchesFilter =
          activeFilter === 'all' || node.category === activeFilter

        ctx.save()

        if (!matchesFilter) {
          ctx.globalAlpha = 0.25
        }

        let glow = 'rgba(246, 233, 199, 0.45)'
        let fillColor = '#f6e9c7'
        let strokeColor = '#d6c49e'

        if (node.status === 'mastered') {
          glow = `rgba(16, 185, 129, ${node.brightness})`
          fillColor = '#10b981'
          strokeColor = '#059669'
        } else if (node.status === 'needs_review') {
          glow = `rgba(239, 68, 68, ${node.brightness})`
          fillColor = '#ef4444'
          strokeColor = '#dc2626'
        } else if (node.status === 'locked') {
          glow = 'transparent'
          fillColor = '#26262a'
          strokeColor = '#3f3f46'
        }

        if (node.status !== 'locked') {
          ctx.shadowColor = glow
          ctx.shadowBlur = Math.max(12, 24 * node.brightness)
        }

        if (isSelected || isDragged) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, radius + 7, 0, Math.PI * 2)
          ctx.strokeStyle = '#fdfbf7'
          ctx.lineWidth = 2
          ctx.shadowColor = '#fdfbf7'
          ctx.shadowBlur = 12
          ctx.stroke()
        } else if (isHovered) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, radius + 4, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(246, 233, 199, 0.55)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        if (isCore) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, radius + 5, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(246, 233, 199, 0.4)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
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

        ctx.font = isCore
          ? 'bold 12px system-ui, -apple-system, sans-serif'
          : '11px system-ui, -apple-system, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        if (node.status === 'locked') {
          ctx.fillStyle = '#71717a'
          ctx.fillText(node.title, pos.x, pos.y + radius + 7)
        } else if (node.status === 'mastered') {
          ctx.fillStyle = '#fdfbf7'
          ctx.fillText(`★ ${node.title}`, pos.x, pos.y + radius + 7)
        } else {
          ctx.fillStyle = '#e7e5e4'
          ctx.fillText(node.title, pos.x, pos.y + radius + 7)
        }

        if (node.status !== 'locked' && node.mastery_score > 0) {
          ctx.font = 'bold 9px system-ui, sans-serif'
          ctx.fillStyle = node.status === 'mastered' ? '#10b981' : '#ef4444'
          ctx.fillText(`${node.mastery_score}%`, pos.x, pos.y + radius + 22)
        }

        ctx.restore()
      })

      ctx.restore()
      rafId = requestAnimationFrame(stepAndRender)
    }

    rafId = requestAnimationFrame(stepAndRender)
    return () => cancelAnimationFrame(rafId)
  }, [nodes, edges])

  const masteredCount = nodes.filter((n) => n.status === 'mastered').length
  const reviewCount = nodes.filter((n) => n.status === 'needs_review').length
  const unlockedCount = nodes.filter((n) => n.status === 'unlocked').length
  const lockedCount = nodes.filter((n) => n.status === 'locked').length
  const totalMasteryPct = Math.round((masteredCount / nodes.length) * 100)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex overflow-hidden select-none bg-[#111113]"
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
          draggedNodeId
            ? 'cursor-grabbing'
            : hoveredNodeId
            ? 'cursor-grab'
            : isPanning
            ? 'cursor-grabbing'
            : 'cursor-default'
        }`}
      />

      {/* ── Top Bar: Progress & Filter Pills ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-2xl bg-[#18181b]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
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
            <span className="flex items-center gap-1 text-[#ef4444]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
              {reviewCount} Review
            </span>
            <span className="flex items-center gap-1 text-[#f6e9c7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f6e9c7]" />
              {unlockedCount} Available
            </span>
            <span className="flex items-center gap-1 text-[#71717a]">
              <Lock size={11} />
              {lockedCount} Locked
            </span>
          </div>
        </div>

        {/* Right: Category Filter Pills */}
        <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#18181b]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-lg pointer-events-auto">
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
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f6e9c7] text-[#1a1813] shadow-sm'
                    : 'text-[#a8a29e] hover:text-[#fdfbf7] hover:bg-[#222226]'
                }`}
              >
                {catLabel}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Zoom Controls HUD (Bottom Left) ── */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-[#18181b]/90 backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-xl">
        <button
          onClick={() => handleZoom(0.18)}
          className="p-2 rounded-xl text-[#a8a29e] hover:text-white hover:bg-[#26262c] transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => handleZoom(-0.18)}
          className="p-2 rounded-xl text-[#a8a29e] hover:text-white hover:bg-[#26262c] transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl text-[#a8a29e] hover:text-white hover:bg-[#26262c] transition-colors cursor-pointer"
          title="Reset View & Physics"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* ── Node Inspector Drawer / Card (Bottom Right) ── */}
      {selectedNode && (
        <div className="absolute bottom-6 right-6 z-20 w-80 md:w-96 rounded-2xl bg-[#18181b]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] shadow-2xl p-5 space-y-4 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    color: CATEGORY_COLORS[selectedNode.category]?.accent || '#f6e9c7',
                    background: CATEGORY_COLORS[selectedNode.category]?.bg || 'rgba(246, 233, 199, 0.14)',
                  }}
                >
                  {CATEGORY_COLORS[selectedNode.category]?.label || selectedNode.category}
                </span>

                {selectedNode.status === 'mastered' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Mastered
                  </span>
                )}
                {selectedNode.status === 'needs_review' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 flex items-center gap-1">
                    <AlertCircle size={10} /> Needs Review
                  </span>
                )}
                {selectedNode.status === 'unlocked' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f6e9c7]/15 text-[#f6e9c7] border border-[#f6e9c7]/30 flex items-center gap-1">
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

          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            {selectedNode.description}
          </p>

          <div className="p-3 rounded-xl bg-[#202024] border border-[rgba(255,255,255,0.06)] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#a8a29e] font-medium">Node Mastery</span>
              <span className="font-bold text-white">
                {selectedNode.mastery_score}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#2c2c32] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(5, selectedNode.mastery_score)}%`,
                  background:
                    selectedNode.status === 'mastered'
                      ? '#10b981'
                      : selectedNode.status === 'needs_review'
                      ? '#ef4444'
                      : selectedNode.status === 'unlocked'
                      ? '#f6e9c7'
                      : '#52525b',
                }}
              />
            </div>
          </div>

          {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#a8a29e] uppercase tracking-wider">
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
                          : 'border-[rgba(255,255,255,0.08)] bg-[#202024] text-[#d6d3d1] hover:border-[rgba(246,233,199,0.3)]'
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

          <div className="pt-2 flex items-center gap-2">
            {selectedNode.status === 'locked' ? (
              <div className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#242429] border border-[rgba(255,255,255,0.05)] text-xs text-[#71717a]">
                <Lock size={13} />
                <span>Complete prerequisites to unlock</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => openQuiz(selectedNode)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-[#1a1813] bg-[#f6e9c7] hover:bg-[#ebd6a1] transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>
                    {selectedNode.status === 'mastered' ? 'Retake Quiz' : 'Take Validation Quiz'}
                  </span>
                </button>

                {selectedNode.chapter_link && (
                  <button
                    onClick={() => navigate(`/chapter/${selectedNode.chapter_link}`)}
                    className="flex items-center justify-center gap-1.5 p-2.5 px-3 rounded-xl text-xs font-semibold text-[#fdfbf7] bg-[#242429] hover:bg-[#2e2e36] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                    title="Open Linked Chapter"
                  >
                    <BookOpen size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isQuizOpen && activeQuizTopic && (
        <TopicQuizModal topic={activeQuizTopic} onClose={closeQuiz} />
      )}
    </div>
  )
}
