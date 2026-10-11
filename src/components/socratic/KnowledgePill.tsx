import React from 'react'
import { Brain, CheckCircle2 } from 'lucide-react'
import { useKnowledgeStore } from '@/lib/knowledgeStore'
import { useUIStore } from '@/lib/store'

export default function KnowledgePill() {
  const gaps = useKnowledgeStore((s) => s.gaps)
  const setActiveHelperTab = useKnowledgeStore((s) => s.setActiveHelperTab)
  const toggleHelper = useUIStore((s) => s.toggleHelper)
  const helperOpen = useUIStore((s) => s.helperOpen)

  const totalGaps = gaps.length
  const masteredCount = gaps.filter((g) => g.status === 'mastered').length

  const handleClick = () => {
    setActiveHelperTab('knowledge')
    if (!helperOpen) {
      toggleHelper()
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1e1e22] hover:bg-[#28282e] border border-[rgba(255,255,255,0.08)] transition-all cursor-pointer text-[#e5e5ea] hover:text-white group"
      title="View your Knowledge Map & diagnosed gaps"
    >
      <div className="w-4 h-4 rounded-md flex items-center justify-center bg-[rgba(191,90,242,0.18)] text-[#bf5af2] group-hover:scale-105 transition-transform">
        <Brain size={11} />
      </div>

      {totalGaps > 0 ? (
        <span className="font-mono text-[11px] flex items-center gap-1">
          <span className="text-[#f2f2f7]">{totalGaps} Gaps</span>
          <span className="text-[#636366]">•</span>
          <span className="text-[#30d158] flex items-center gap-0.5">
            <CheckCircle2 size={10} strokeWidth={2.5} />
            {masteredCount}
          </span>
        </span>
      ) : (
        <span className="text-[11px] text-[#8e8e93]">Knowledge Map</span>
      )}
    </button>
  )
}
