import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NextraNavbar from './NextraNavbar'
import NextraSidebar from './NextraSidebar'
import NextraTOC from './NextraTOC'
import HelperWidget from '@/components/helper/HelperWidget'
import { useUIStore } from '@/lib/store'
import { X } from 'lucide-react'

export default function AppShell() {
  const location = useLocation()
  const helperOpen = useUIStore((s) => s.helperOpen)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useUIStore((s) => s.setMobileMenuOpen)

  const isChapter = location.pathname.startsWith('/chapter/')

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 transition-colors">
      {/* ── Nextra Sticky Top Navbar (Edge-to-Edge) ── */}
      <NextraNavbar />

      {/* ── Main Container: Sidebar + Article Content + TOC (Edge-to-Edge, No Outer Side Gaps) ── */}
      <div className="flex-1 w-full flex">
        {/* Desktop Left Sidebar (Collapsible with smooth transition) */}
        <div
          className={`hidden md:block transition-all duration-200 ease-in-out shrink-0 ${
            sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'
          }`}
        >
          <NextraSidebar />
        </div>

        {/* Mobile Left Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Content */}
            <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#111111] h-full shadow-2xl flex flex-col z-50">
              <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="font-bold text-sm tracking-tight">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <NextraSidebar />
              </div>
            </div>
          </div>
        )}

        {/* Center Article Content */}
        <main className="flex-1 min-w-0 px-6 sm:px-10 lg:px-16 py-8 flex flex-col justify-between">
          <div className="w-full max-w-4xl mx-auto">
            <Outlet />
          </div>

          {/* Nextra Standard Footer */}
          <footer className="mt-20 pt-8 border-t border-gray-200/80 dark:border-neutral-800 text-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>QAIRU AI Platform</span>
              <span>MIT License • Interactive AI Education</span>
            </div>
          </footer>
        </main>

        {/* Right Desktop Table of Contents (for Chapter Pages, No Changes) */}
        {isChapter && (
          <div className="hidden xl:block shrink-0">
            <NextraTOC />
          </div>
        )}

        {/* Right AI Helper Slide-over Panel */}
        {helperOpen && (
          <aside className="w-80 shrink-0 border-l border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-[#161618] h-[calc(100vh-4rem)] sticky top-16 overflow-hidden flex flex-col z-20 shadow-lg">
            <HelperWidget />
          </aside>
        )}
      </div>
    </div>
  )
}
