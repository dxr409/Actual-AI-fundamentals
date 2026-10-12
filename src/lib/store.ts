import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'instructor'
}

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'qairu-auth' }
  )
)

// ── Progress ──────────────────────────────────────────────────────────────────
interface ProgressState {
  completed: Record<number, boolean>
  markComplete: (id: number) => void
  reset: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      markComplete: (id) => set((s) => ({ completed: { ...s.completed, [id]: true } })),
      reset: () => set({ completed: {} }),
    }),
    { name: 'qairu-progress' }
  )
)

// ── UI ────────────────────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system'

interface UIState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  helperOpen: boolean
  toggleHelper: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  currentChapter: number
  setCurrentChapter: (id: number) => void
  activeSection: number
  setActiveSection: (idx: number) => void
}

function applyThemeClass(theme: ThemeMode) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.add('light')
      root.style.colorScheme = 'light'
    }
  } else {
    root.classList.add(theme)
    root.style.colorScheme = theme
  }
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyThemeClass(theme)
        set({ theme })
      },
      helperOpen: false,
      toggleHelper: () => set((s) => ({ helperOpen: !s.helperOpen })),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
      currentChapter: 1,
      setCurrentChapter: (id) => set({ currentChapter: id }),
      activeSection: 0,
      setActiveSection: (idx) => set({ activeSection: idx }),
    }),
    {
      name: 'qairu-ui',
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        theme: s.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeClass(state.theme)
        }
      },
    }
  )
)
