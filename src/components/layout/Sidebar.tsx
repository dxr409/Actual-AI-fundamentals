import React, { useMemo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore, useProgressStore, useUIStore } from '@/lib/store'
import {
  CHAPTERS,
  getChapterPartGroups,
  getChapterLiveSections,
  Chapter,
} from '@/content/chapters'
import {
  Sparkles,
  BookHeart,
  SlidersHorizontal,
  LogOut,
  ChevronDown,
  Check,
  Globe,
  Layers,
  Network,
} from 'lucide-react'



// macOS Dark Sidebar Tokens
const BG = '#161618'
const BORDER = 'rgba(255, 255, 255, 0.08)'

const CHAPTER_ICONS: Record<number, string> = {
  1: '💬',  // What is a language model?
  2: '🔤',  // Tokenization
  3: '⚗️',  // Embeddings
  4: '🥞',  // Anatomy of a Transformer
  5: '📊',  // Training data
  6: '📈',  // How models learn
  7: '🎭',  // How models learn behavior
  8: '🎯',  // Fine-tuning
  9: '📁',  // Project setup
  10: '⚙️', // Base models
  11: '🗄️', // Pre-training data
  12: '🧠', // Pre-training
  13: '🎲', // Sampling
  14: '📝', // Fine-tuning data
  15: '🎓', // Supervised fine-tuning
  16: '💬', // Chat with your model
}

interface SidebarProps {
  width: number
  collapsed: boolean
  panelW: number
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const completed = useProgressStore((s) => s.completed)
  const activeSection = useUIStore((s) => s.activeSection)
  const setActiveSection = useUIStore((s) => s.setActiveSection)

  const doneCount = Object.values(completed).filter(Boolean).length
  const pct = Math.round((doneCount / CHAPTERS.length) * 100)
  const partGroups = getChapterPartGroups()

  // Active chapter detection
  const match = location.pathname.match(/\/chapter\/(\d+)/)
  const activeChapterId = match ? parseInt(match[1]) : null

  // Live sub-topics from chapter content (including any local user edits!)
  const activeChapterSections = useMemo(() => {
    if (!activeChapterId) return []
    return getChapterLiveSections(activeChapterId)
  }, [activeChapterId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSubtopicClick = (idx: number) => {
    setActiveSection(idx)
    const el = document.getElementById(`section-${idx}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{
        background: BG,
        borderRight: `1px solid ${BORDER}`,
        width: '100%',
      }}
    >
      {/* ── Top Model Card ── */}
      <div className="p-3 border-b border-[rgba(255,255,255,0.08)]">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1e1e22] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#2c2c32] border border-[rgba(255,255,255,0.08)] flex-shrink-0 shadow-sm">
                <Layers size={14} className="text-[#f2f2f7]" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#ffffff] tracking-tight truncate">
                  My First Model
                </p>
                <p className="text-[11px] font-medium text-[#8e8e93] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a]" />
                  <span>Not trained yet</span>
                </p>
              </div>
            </div>
            <ChevronDown size={14} className="text-[#8e8e93] flex-shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2c2c32] border border-[rgba(255,255,255,0.08)]">
              <Layers size={16} className="text-[#f2f2f7]" />
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation Tree ── */}
      <nav className="flex-1 px-2.5 py-3 overflow-y-auto overflow-x-hidden space-y-4">
        {/* Welcome Link */}
        <NavLink
          to="/"
          end
          title={collapsed ? 'Welcome' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${
              isActive
                ? 'bg-[#2a2a30] text-[#ffffff] shadow-sm'
                : 'text-[#e5e5ea] hover:bg-[#202024] hover:text-[#ffffff]'
            }`
          }
        >
          <Sparkles size={15} style={{ color: '#bf5af2', flexShrink: 0 }} />
          {!collapsed && <span>Welcome</span>}
        </NavLink>

        {/* Tree of Knowledge Link */}
        <NavLink
          to="/graph"
          title={collapsed ? 'Tree of Knowledge' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${
              isActive
                ? 'bg-[#2a2a30] text-[#ffffff] shadow-sm'
                : 'text-[#e5e5ea] hover:bg-[#202024] hover:text-[#ffffff]'
            }`
          }
        >
          <Network size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
          {!collapsed && <span>Tree of Knowledge</span>}
        </NavLink>



        {/* Dynamic Part Groups */}
        {partGroups.map((group) => (
          <div key={group.partNumber} className="space-y-1">
            {!collapsed && (
              <p className="text-[11px] font-bold text-[#8e8e93] uppercase tracking-[0.08em] px-3 py-1">
                {group.partTitle}
              </p>
            )}

            {group.chapters.map((ch: Chapter) => {
              const isActive = activeChapterId === ch.id
              const isDone = !!completed[ch.id]
              const iconEmoji = CHAPTER_ICONS[ch.id] || '📄'

              return (
                <div key={ch.id} className="space-y-0.5">
                  <NavLink
                    to={`/chapter/${ch.id}`}
                    title={collapsed ? ch.title : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                      isActive
                        ? 'bg-[#2a2a30] text-[#ffffff] shadow-sm'
                        : 'text-[#e5e5ea] hover:bg-[#202024] hover:text-[#ffffff]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm flex-shrink-0">{iconEmoji}</span>
                      {!collapsed && (
                        <span className="truncate tracking-tight">{ch.title}</span>
                      )}
                    </div>

                    {!collapsed && isDone && (
                      <Check size={13} className="text-[#30d158] flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </NavLink>

                  {/* ── Subtopics under currently active chapter ── */}
                  {!collapsed && isActive && activeChapterSections.length > 0 && (
                    <div className="pl-6 pr-2 py-1.5 space-y-1 border-l border-[rgba(255,255,255,0.08)] ml-5 mt-1">
                      {activeChapterSections.map((sec, idx) => {
                        const isSubActive = activeSection === idx
                        return (
                          <div
                            key={idx}
                            onClick={() => handleSubtopicClick(idx)}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] cursor-pointer transition-all duration-150 ${
                              isSubActive
                                ? 'bg-[rgba(191,90,242,0.18)] text-[#ffffff] font-semibold'
                                : 'text-[#8e8e93] font-medium hover:text-[#f2f2f7] hover:bg-[rgba(255,255,255,0.04)]'
                            }`}
                          >
                            {/* Purple indicator dot for active subtopic */}
                            {isSubActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#bf5af2] flex-shrink-0 shadow-[0_0_6px_#bf5af2]" />
                            )}
                            <span className="truncate">{sec.title}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* Acknowledgements */}
        <NavLink
          to="/acknowledgements"
          title={collapsed ? 'Acknowledgements' : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${
              isActive
                ? 'bg-[#2a2a30] text-[#ffffff]'
                : 'text-[#8e8e93] hover:bg-[#202024] hover:text-[#ffffff]'
            }`
          }
        >
          <BookHeart size={15} style={{ color: '#ff2d55', flexShrink: 0 }} />
          {!collapsed && <span>Acknowledgements</span>}
        </NavLink>
      </nav>

      {/* ── Footer Progress Bar & Settings ── */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.08)] space-y-2">
        {!collapsed ? (
          <div>
            <div className="flex items-center justify-between text-xs text-[#8e8e93] mb-1.5">
              <span className="font-bold text-[#f2f2f7]">Progress {pct}%</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'kk' : 'en')}
                  className="text-[#8e8e93] hover:text-[#f2f2f7] transition-colors p-1"
                  title="Switch language"
                >
                  <Globe size={13} />
                </button>
                <button
                  onClick={handleLogout}
                  className="text-[#8e8e93] hover:text-[#ff453a] transition-colors p-1"
                  title="Log out"
                >
                  <LogOut size={13} />
                </button>
                <SlidersHorizontal size={13} className="text-[#8e8e93]" />
              </div>
            </div>

            {/* Ambient Progress Bar */}
            <div className="h-1.5 rounded-full bg-[#26262a] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #bf5af2, #ff2d55)',
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-6 h-1.5 rounded-full bg-[#26262a] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: '#bf5af2' }}
              />
            </div>
            <button onClick={handleLogout} className="text-[#8e8e93] hover:text-[#ff453a] p-1">
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
