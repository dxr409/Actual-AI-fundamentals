import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import HelperWidget from '@/components/helper/HelperWidget'
import PomodoroTimer from './PomodoroTimer'
import { useUIStore } from '@/lib/store'
import { CHAPTERS } from '@/content/chapters'
import { ChevronLeft, ChevronRight, Bot, PanelLeft } from 'lucide-react'
import KnowledgePill from '@/components/socratic/KnowledgePill'

const PANEL_W = 232
const HELPER_PANEL_W = 320
const COLLAPSED_W = 54

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const helperOpen = useUIStore((s) => s.helperOpen)
  const toggleHelper = useUIStore((s) => s.toggleHelper)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  const sidebarW = sidebarCollapsed ? COLLAPSED_W : PANEL_W

  // Determine current chapter from route
  const match = location.pathname.match(/\/chapter\/(\d+)/)
  const currentChapterId = match ? parseInt(match[1]) : null
  const currentChapter = currentChapterId ? CHAPTERS.find((c) => c.id === currentChapterId) : null

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#121214' }}>
      {/* Left: macOS Collapsible Sidebar */}
      <div
        className="flex-shrink-0 h-full overflow-hidden"
        style={{
          width: sidebarW,
          transition: 'width 240ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Sidebar width={sidebarW} collapsed={sidebarCollapsed} panelW={PANEL_W} />
      </div>

      {/* Center: Main Content Area + macOS Top Bar */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden" style={{ background: '#121214' }}>
        {/* macOS Title Bar / Header */}
        <header
          className="h-11 flex items-center justify-between px-4 border-b flex-shrink-0 select-none"
          style={{
            background: '#141416',
            borderColor: 'rgba(255, 255, 255, 0.07)',
          }}
        >
          {/* Left: Sidebar Toggle, History Nav & Clean Breadcrumbs (without '1 of 16') */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[#8e8e93] hover:text-white hover:bg-[#222226] transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <PanelLeft size={15} />
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="p-1 rounded text-[#8e8e93] hover:text-white hover:bg-[#222226] transition-colors cursor-pointer"
                title="Go back"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => navigate(1)}
                className="p-1 rounded text-[#8e8e93] hover:text-white hover:bg-[#222226] transition-colors cursor-pointer"
                title="Go forward"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Breadcrumb Trail: Clean without '1 of 16' */}
            {currentChapter ? (
              <div className="flex items-center gap-1.5 text-xs text-[#8e8e93] truncate ml-1">
                <span>{currentChapter.partTitle}</span>
                <span className="text-[#48484a]">›</span>
                <span className="text-[#f2f2f7] font-medium truncate">{currentChapter.title}</span>
              </div>
            ) : (
              <span className="text-xs text-[#8e8e93] font-medium ml-1">Welcome</span>
            )}
          </div>

          {/* Right: Knowledge Pill, Pomodoro Timer & AI Helper */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Knowledge Map Status Pill */}
            <KnowledgePill />

            {/* Small Pomodoro Timer widget */}
            <PomodoroTimer />

            {/* AI Helper Bot Button */}
            <button
              onClick={toggleHelper}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                helperOpen
                  ? 'text-[#bf5af2] bg-[rgba(191,90,242,0.15)]'
                  : 'text-[#8e8e93] hover:text-white hover:bg-[#222226]'
              }`}
              title="Toggle AI Helper"
            >
              <Bot size={16} />
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto min-w-0 select-text">
          <Outlet />
        </main>
      </div>

      {/* Right: AI Helper & Knowledge Map Panel */}
      <div
        className="flex-shrink-0 h-full overflow-hidden flex flex-col"
        style={{
          width: helperOpen ? HELPER_PANEL_W : 0,
          background: '#161618',
          transition: 'width 240ms cubic-bezier(0.4, 0, 0.2, 1)',
          borderLeft: helperOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
        }}
      >
        {helperOpen && <HelperWidget />}
      </div>
    </div>
  )
}
