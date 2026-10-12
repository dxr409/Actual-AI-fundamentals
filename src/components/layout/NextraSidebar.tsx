import React, { useState, useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore, useProgressStore, useUIStore } from '@/lib/store'
import {
  CHAPTERS,
  getChapterPartGroups,
  Chapter,
} from '@/content/chapters'
import {
  Sparkles,
  Network,
  ChevronRight,
  Check,
  Globe,
  LogOut,
  PanelLeftClose,
} from 'lucide-react'

export default function NextraSidebar() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const completed = useProgressStore((s) => s.completed)
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const partGroups = useMemo(() => getChapterPartGroups(), [])
  const doneCount = Object.values(completed).filter(Boolean).length
  const pct = Math.round((doneCount / CHAPTERS.length) * 100)

  // Detect current chapter
  const match = location.pathname.match(/\/chapter\/(\d+)/)
  const activeChapterId = match ? parseInt(match[1]) : null

  // Track folder expansion state
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    partGroups.forEach((g) => {
      initial[g.partNumber] = true
    })
    return initial
  })

  const toggleFolder = (partNumber: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [partNumber]: !prev[partNumber],
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-[calc(100vh-4rem)] sticky top-16 shrink-0 flex flex-col justify-between border-r border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-[#111111] transition-colors select-none">
      {/* Scrollable Tree Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Top Root Links */}
        <div className="space-y-1">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-wider px-2.5">
              Overview
            </span>
            <button
              onClick={toggleSidebar}
              className="hidden md:flex p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={14} />
            </button>
          </div>

          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-neutral-800/60'
              }`
            }
          >
            <Sparkles size={16} className="text-blue-500 flex-shrink-0" />
            <span>Introduction</span>
          </NavLink>

          <NavLink
            to="/graph"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-neutral-800/60'
              }`
            }
          >
            <Network size={16} className="text-sky-500 flex-shrink-0" />
            <span>Tree of Knowledge</span>
          </NavLink>
        </div>

        {/* Dynamic Part Groups (Nextra Folders) */}
        {partGroups.map((group) => {
          const isOpen = openFolders[group.partNumber] ?? true

          return (
            <div key={group.partNumber} className="space-y-1">
              {/* Folder Header button */}
              <button
                type="button"
                onClick={() => toggleFolder(group.partNumber)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer group"
              >
                <span className="truncate">{group.partTitle}</span>
                <ChevronRight
                  size={14}
                  className={`text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-transform duration-200 ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Collapsible Folder Children: Chapters stay, subsubtopics removed */}
              {isOpen && (
                <div className="space-y-0.5 ml-1 border-l border-gray-200 dark:border-neutral-800 pl-2">
                  {group.chapters.map((ch: Chapter) => {
                    const isActive = activeChapterId === ch.id
                    const isDone = !!completed[ch.id]

                    return (
                      <NavLink
                        key={ch.id}
                        to={`/chapter/${ch.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-neutral-800/60'
                        }`}
                      >
                        <span className="truncate">{ch.title}</span>
                        {isDone && (
                          <Check
                            size={13}
                            className="text-emerald-500 dark:text-emerald-400 flex-shrink-0"
                            strokeWidth={2.5}
                          />
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Sticky Bottom Progress & Settings */}
      <div className="p-4 border-t border-gray-200/80 dark:border-neutral-800 bg-gray-50/50 dark:bg-[#111111] space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
          <span>Course Progress</span>
          <span className="font-semibold text-gray-900 dark:text-gray-200">
            {pct}%
          </span>
        </div>

        {/* Ambient Progress Track */}
        <div className="h-1.5 w-full bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() =>
              i18n.changeLanguage(i18n.language === 'en' ? 'kk' : 'en')
            }
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Globe size={13} />
            <span className="uppercase">{i18n.language || 'en'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
