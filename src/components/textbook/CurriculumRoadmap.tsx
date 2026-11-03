import { Link } from 'react-router-dom'
import { useProgressStore } from '@/lib/store'
import { CHAPTERS, getChapterPartGroups, Chapter } from '@/content/chapters'
import { Check, ArrowRight } from 'lucide-react'

interface CurriculumRoadmapProps {
  currentChapterId?: number
  className?: string
}

export default function CurriculumRoadmap({ currentChapterId = 17, className = '' }: CurriculumRoadmapProps) {
  const completed = useProgressStore((s) => s.completed)
  const partGroups = getChapterPartGroups()

  return (
    <div
      className={`rounded-2xl p-7 my-8 select-none transition-all ${className}`}
      style={{
        background: '#151518',
        border: '1px solid rgba(255, 255, 255, 0.08)',
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
                style={{ color: '#a8a29e' }}
              >
                {group.partNumber}
              </span>
              <h2
                className="text-2xl font-serif font-medium mt-1 mb-3 text-[#fdfbf7]"
                style={{ letterSpacing: '-0.3px' }}
              >
                {group.partTitle}
              </h2>
              <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
            </div>

            {/* Chapter rows */}
            <div className="space-y-1 mt-3">
              {group.chapters.map((ch: Chapter) => {
                const isCurrent = ch.id === currentChapterId
                const isDone = !!completed[ch.id]
                const displayOrder = CHAPTERS.findIndex((c) => c.id === ch.id) + 1

                return (
                  <Link
                    key={ch.id}
                    to={`/chapter/${ch.id}`}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 no-underline"
                    style={{
                      background: isCurrent ? 'rgba(246, 233, 199, 0.08)' : 'transparent',
                      border: isCurrent ? '1px solid rgba(246, 233, 199, 0.28)' : '1px solid transparent',
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
                    <div className="flex items-center gap-4 min-w-0">
                      <span
                        className="font-mono text-xs w-6 text-right flex-shrink-0 tabular-nums"
                        style={{ color: isCurrent ? '#f6e9c7' : '#78716c' }}
                      >
                        {displayOrder}
                      </span>
                      <span
                        className="text-sm font-medium transition-colors truncate"
                        style={{
                          color: isCurrent ? '#fdfbf7' : '#d6d3d1',
                          fontWeight: isCurrent ? 600 : 450,
                        }}
                      >
                        {ch.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-3 flex-shrink-0">
                      {isCurrent ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{
                              background: '#f6e9c7',
                              boxShadow: '0 0 8px rgba(246, 233, 199, 0.6)',
                            }}
                          />
                          <ArrowRight size={13} style={{ color: '#f6e9c7' }} />
                        </div>
                      ) : isDone ? (
                        <Check size={14} style={{ color: '#10b981' }} strokeWidth={2.5} />
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
