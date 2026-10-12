import React from 'react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/lib/store'
import { CHAPTERS, getChapterLiveSections } from '@/content/chapters'
import { MessageSquare, Edit3 } from 'lucide-react'

interface NextraTOCProps {
  onEditPage?: () => void
}

export default function NextraTOC({ onEditPage }: NextraTOCProps) {
  const location = useLocation()
  const activeSection = useUIStore((s) => s.activeSection)
  const setActiveSection = useUIStore((s) => s.setActiveSection)

  // Detect current chapter
  const match = location.pathname.match(/\/chapter\/(\d+)/)
  const currentChapterId = match ? parseInt(match[1]) : null
  const currentChapter = currentChapterId
    ? CHAPTERS.find((c) => c.id === currentChapterId)
    : null

  const sections = currentChapterId
    ? getChapterLiveSections(currentChapterId)
    : []

  if (!currentChapter || sections.length === 0) {
    return null
  }

  const handleScrollToSection = (idx: number) => {
    setActiveSection(idx)
    const el = document.getElementById(`section-${idx}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-5 py-6 text-sm transition-colors"
    >
      <p className="mb-3 font-semibold text-xs tracking-wider uppercase text-gray-500 dark:text-gray-400">
        On This Page
      </p>

      {/* Heading Anchor Links */}
      <ul className="space-y-2 border-l border-gray-200 dark:border-neutral-800 pl-3">
        {sections.map((sec, idx) => {
          const isActive = activeSection === idx

          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleScrollToSection(idx)}
                className={`text-left text-xs transition-colors cursor-pointer block leading-snug truncate w-full ${
                  isActive
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                title={sec.title}
              >
                {sec.title}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Nextra Standard Feedback / Edit Links */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-800 space-y-2.5">
        <a
          href="https://github.com/shuding/nextra-docs-template/issues"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <MessageSquare size={13} />
          <span>Question? Give us feedback →</span>
        </a>

        {onEditPage && (
          <button
            type="button"
            onClick={onEditPage}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer text-left"
          >
            <Edit3 size={13} />
            <span>Edit this page</span>
          </button>
        )}
      </div>
    </nav>
  )
}
