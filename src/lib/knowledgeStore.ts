import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface KnowledgeGap {
  id: string
  chapterId: number
  selectedText: string
  displayLabel: string
  isMath: boolean
  contextSentence: string
  tier: 1 | 2 | 3
  question: string
  explanation: string
  socraticHint?: string
  status: 'review' | 'mastered'
  timestamp: number
}

interface KnowledgeState {
  gaps: KnowledgeGap[]
  activeHelperTab: 'chat' | 'knowledge' | 'notes'
  aiPromptDraft: string | null
  setActiveHelperTab: (tab: 'chat' | 'knowledge' | 'notes') => void
  setAiPromptDraft: (draft: string | null) => void
  recordGap: (gap: Omit<KnowledgeGap, 'id' | 'timestamp' | 'status'> & { status?: 'review' | 'mastered' }) => string
  updateStatus: (id: string, status: 'review' | 'mastered') => void
  removeGap: (id: string) => void
  clearGaps: (chapterId?: number) => void
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      gaps: [],
      activeHelperTab: 'chat',
      aiPromptDraft: null,

      setActiveHelperTab: (tab) => set({ activeHelperTab: tab }),
      setAiPromptDraft: (draft) => set({ aiPromptDraft: draft }),

      recordGap: (gapData) => {
        const existing = get().gaps.find(
          (g) =>
            g.chapterId === gapData.chapterId &&
            g.selectedText.trim().toLowerCase() === gapData.selectedText.trim().toLowerCase()
        )

        if (existing) {
          // Update existing gap tier, question, explanation
          set((state) => ({
            gaps: state.gaps.map((g) =>
              g.id === existing.id
                ? {
                    ...g,
                    tier: gapData.tier,
                    question: gapData.question,
                    explanation: gapData.explanation,
                    socraticHint: gapData.socraticHint,
                    status: gapData.status ?? g.status,
                    timestamp: Date.now(),
                  }
                : g
            ),
          }))
          return existing.id
        }

        const id = `gap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const newGap: KnowledgeGap = {
          id,
          chapterId: gapData.chapterId,
          selectedText: gapData.selectedText,
          displayLabel: gapData.displayLabel || gapData.selectedText,
          isMath: gapData.isMath ?? false,
          contextSentence: gapData.contextSentence,
          tier: gapData.tier,
          question: gapData.question,
          explanation: gapData.explanation,
          socraticHint: gapData.socraticHint,
          status: gapData.status ?? 'review',
          timestamp: Date.now(),
        }

        set((state) => ({
          gaps: [newGap, ...state.gaps],
        }))
        return id
      },

      updateStatus: (id, status) => {
        set((state) => ({
          gaps: state.gaps.map((g) => (g.id === id ? { ...g, status } : g)),
        }))
      },

      removeGap: (id) => {
        set((state) => ({
          gaps: state.gaps.filter((g) => g.id !== id),
        }))
      },

      clearGaps: (chapterId) => {
        set((state) => ({
          gaps: chapterId ? state.gaps.filter((g) => g.chapterId !== chapterId) : [],
        }))
      },
    }),
    {
      name: 'qairu-knowledge-map',
    }
  )
)
