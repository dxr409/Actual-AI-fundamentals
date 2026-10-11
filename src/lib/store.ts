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
interface UIState {
  helperOpen: boolean
  toggleHelper: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  currentChapter: number
  setCurrentChapter: (id: number) => void
  activeSection: number
  setActiveSection: (idx: number) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      helperOpen: false,
      toggleHelper: () => set((s) => ({ helperOpen: !s.helperOpen })),
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      currentChapter: 1,
      setCurrentChapter: (id) => set({ currentChapter: id }),
      activeSection: 0,
      setActiveSection: (idx) => set({ activeSection: idx }),
    }),
    {
      name: 'qairu-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
