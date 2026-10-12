import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUIStore, useAuthStore, ThemeMode } from '@/lib/store'
import { CHAPTERS } from '@/content/chapters'
import {
  Search,
  Moon,
  Sun,
  Laptop,
  Menu,
  X,
  Bot,
  PanelLeft,
} from 'lucide-react'
import PomodoroTimer from './PomodoroTimer'

export default function NextraNavbar() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const helperOpen = useUIStore((s) => s.helperOpen)
  const toggleHelper = useUIStore((s) => s.toggleHelper)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu)
  const logout = useAuthStore((s) => s.logout)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = searchRef.current?.querySelector('input')
        input?.focus()
      }
      if (e.key === 'Escape') {
        setSearchFocused(false)
        setThemeDropdownOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter search results
  const searchResults = searchQuery.trim()
    ? CHAPTERS.filter(
        (ch) =>
          ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ch.partTitle.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : []

  const handleSelectResult = (chId: number) => {
    setSearchQuery('')
    setSearchFocused(false)
    navigate(`/chapter/${chId}`)
  }

  const isDocsActive =
    location.pathname === '/' || location.pathname.startsWith('/chapter/')

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-[#111111]/85 border-b border-gray-200/80 dark:border-neutral-800 transition-colors">
      <div className="w-full h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle, Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-2.5">
          {/* Mobile hamburger menu */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft size={18} />
          </button>

          {/* Brand Logo without 'Docs' badge */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-base sm:text-lg tracking-tight text-gray-900 dark:text-white hover:opacity-90 transition-opacity ml-1"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-blue-500/20">
              Q
            </div>
            <span>QAIRU</span>
          </Link>
        </div>

        {/* Center: Top Nav Links without Knowledge Tree */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              isDocsActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            Documentation
          </Link>
          <Link
            to="/progress"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              location.pathname === '/progress'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            Progress
          </Link>
          <Link
            to="/acknowledgements"
            className={`px-3 py-1.5 rounded-md transition-colors ${
              location.pathname === '/acknowledgements'
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            About
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-neutral-800/60 transition-colors flex items-center gap-1"
          >
            Contact ↗
          </a>
        </nav>

        {/* Right: Search + Pomodoro + Theme + AI Helper */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nextra Search Input with 'Search...' placeholder */}
          <div ref={searchRef} className="relative w-36 sm:w-60">
            <div className="relative flex items-center">
              <Search
                size={15}
                className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search..."
                className="w-full pl-9 pr-12 py-1.5 text-sm bg-gray-100/80 dark:bg-white/[0.07] border border-transparent dark:border-neutral-800 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition-all"
              />
              <kbd className="hidden sm:inline-flex absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded shadow-xs pointer-events-none">
                ⌘K
              </kbd>
            </div>

            {/* Quick Search Dropdown */}
            {searchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#18181a] border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleSelectResult(ch.id)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-start gap-2.5 transition-colors cursor-pointer"
                      >
                        <div className="mt-0.5 w-5 h-5 rounded bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0">
                          {ch.id}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {ch.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {ch.partTitle} • {ch.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
                    No matching chapters found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pomodoro Timer */}
          <div className="hidden md:block">
            <PomodoroTimer />
          </div>

          {/* Theme Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen((v) => !v)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Change theme"
            >
              {theme === 'light' ? (
                <Sun size={18} />
              ) : theme === 'dark' ? (
                <Moon size={18} />
              ) : (
                <Laptop size={18} />
              )}
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-[#18181a] border border-gray-200 dark:border-neutral-800 rounded-xl shadow-lg py-1 z-50">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setTheme(mode)
                      setThemeDropdownOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs capitalize transition-colors cursor-pointer ${
                      theme === mode
                        ? 'text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-500/10'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {mode === 'light' && <Sun size={14} />}
                    {mode === 'dark' && <Moon size={14} />}
                    {mode === 'system' && <Laptop size={14} />}
                    <span>{mode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Helper Toggle Button */}
          <button
            onClick={toggleHelper}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              helperOpen
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800'
            }`}
            title="Toggle AI Tutor"
          >
            <Bot size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
