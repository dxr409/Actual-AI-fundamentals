import { Link } from 'react-router-dom'
import { useProgressStore } from '@/lib/store'
import { getChapterPartGroups, Chapter } from '@/content/chapters'
import { Check, ArrowRight } from 'lucide-react'

interface CurriculumRoadmapProps {
  currentChapterId?: number
  className?: string
}

export default function CurriculumRoadmap({ currentChapterId = 1, className = '' }: CurriculumRoadmapProps) {
  const completed = useProgressStore((s) => s.completed)
  const partGroups = getChapterPartGroups()

  return (
    <div
      className={`rounded-2xl p-7 my-8 select-none transition-all ${className}`}
      style={{
        background: '#15181e',
        border: '1px solid #28303d',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
      }}
    >
      <div className="space-y-10">
        {partGroups.map((group) => (
          <div key={group.partNumber}>
            {/* Part header */}
            <div className="mb-3">
              <span
                className="text-[11px] font-bold tracking-[0.18em] uppercase"
                style={{ color: '#8898a9' }}
              >
                {group.partNumber}
              </span>
              <h2
                className="text-2xl font-serif font-medium mt-1 mb-3 text-[#f0ece8]"
                style={{ letterSpacing: '-0.3px' }}
              >
                {group.partTitle}
              </h2>
              {/* Divider line under header */}
              <div style={{ height: 1, background: '#252d3a' }} />
            </div>

            {/* Chapter rows */}
            <div className="space-y-1 mt-3">
              {group.chapters.map((ch: Chapter) => {
                const isCurrent = ch.id === currentChapterId
                const isDone = !!completed[ch.id]

                return (
                  <Link
                    key={ch.id}
                    to={`/chapter/${ch.id}`}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 no-underline"
                    style={{
                      background: isCurrent ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(192, 132, 252, 0.28)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.035)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    {/* Left: number & title */}
                    <div className="flex items-center gap-4 min-w-0">
                      <span
                        className="font-mono text-xs w-6 text-right flex-shrink-0 tabular-nums"
                        style={{ color: isCurrent ? '#c084fc' : '#65778a' }}
                      >
                        {ch.id}
                      </span>
                      <span
                        className="text-sm font-medium transition-colors truncate"
                        style={{
                          color: isCurrent ? '#ffffff' : '#cfd9e4',
                          fontWeight: isCurrent ? 600 : 450,
                        }}
                      >
                        {ch.title}
                      </span>
                    </div>

                    {/* Right indicator */}
                    <div className="flex items-center gap-2 pl-3 flex-shrink-0">
                      {isCurrent ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{
                              background: '#c084fc',
                              boxShadow: '0 0 8px #c084fc',
                            }}
                          />
                          <ArrowRight size={13} style={{ color: '#c084fc' }} />
                        </div>
                      ) : isDone ? (
                        <Check size={14} style={{ color: '#94a3b8' }} strokeWidth={2.5} />
                      ) : (
                        <span className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
