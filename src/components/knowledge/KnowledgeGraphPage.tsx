import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Network,
  Search,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react'
import { useKnowledgeGraphStore } from '@/lib/knowledgeGraphStore'
import ObsidianKnowledgeGraph from './ObsidianKnowledgeGraph'

export default function KnowledgeGraphPage() {
  const [searchParams] = useSearchParams()
  const nodes = useKnowledgeGraphStore((s) => s.nodes)
  const selectTopic = useKnowledgeGraphStore((s) => s.selectTopic)
  const fetchGraph = useKnowledgeGraphStore((s) => s.fetchGraph)
  const resetGraph = useKnowledgeGraphStore((s) => s.resetGraph)

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchGraph()
  }, [fetchGraph])

  // Handle URL param: /graph?topic=xyz
  useEffect(() => {
    const topicParam = searchParams.get('topic')
    if (topicParam) {
      const match = nodes.find(
        (n) =>
          n.id.toLowerCase() === topicParam.toLowerCase() ||
          n.title.toLowerCase().includes(topicParam.toLowerCase())
      )
      if (match) {
        selectTopic(match.id)
      }
    }
  }, [searchParams, nodes, selectTopic])

  const filteredNodes = searchQuery.trim()
    ? nodes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleReset = () => {
    if (window.confirm('Reset knowledge graph progression to initial state?')) {
      resetGraph()
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#101014] overflow-hidden">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-[rgba(255,255,255,0.08)] bg-[#161618] z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-[#38bdf8] shadow-sm">
            <Network size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Tree of Knowledge</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#26262c] text-[#8e8e93]">
                Obsidian Adaptive Graph
              </span>
            </h1>
            <p className="text-[11px] text-[#8e8e93]">
              Read lectures, complete Bloom&apos;s quizzes, and illuminate prerequisites.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8e8e93]"
            />
            <input
              type="text"
              placeholder="Find topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 md:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-[#202026] border border-[rgba(255,255,255,0.08)] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#38bdf8] transition-colors"
            />

            {/* Autocomplete Dropdown */}
            {filteredNodes.length > 0 && (
              <div className="absolute top-full mt-1.5 right-0 w-64 rounded-xl bg-[#1c1c22] border border-[rgba(255,255,255,0.12)] shadow-2xl p-1.5 space-y-1 z-50">
                {filteredNodes.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      selectTopic(n.id)
                      setSearchQuery('')
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#282832] cursor-pointer text-xs transition-colors"
                  >
                    <span className="text-white font-medium truncate">{n.title}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                        n.status === 'mastered'
                          ? 'text-[#10b981] bg-[#10b981]/15'
                          : n.status === 'locked'
                          ? 'text-[#71717a] bg-[#27272a]'
                          : 'text-[#38bdf8] bg-[#38bdf8]/15'
                      }`}
                    >
                      {n.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reset progression button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8e8e93] hover:text-white bg-[#202026] hover:bg-[#282830] border border-[rgba(255,255,255,0.08)] transition-all"
            title="Reset Graph Progression"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ── Main Graph View ── */}
      <div className="flex-1 w-full h-full relative">
        <ObsidianKnowledgeGraph />
      </div>
    </div>
  )
}
