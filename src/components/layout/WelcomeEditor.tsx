import { useState } from 'react'
import { Pencil, Save, RotateCcw, X, Info } from 'lucide-react'

export interface WelcomeContent {
  greeting: string
  subtitle: string
  introNotice: string
}

export const DEFAULT_WELCOME_CONTENT: WelcomeContent = {
  greeting: "Let's build a language model",
  subtitle: "Unless you've been living under a rock, you probably noticed that AI is everywhere. In the mainstream, artificial intelligence has become synonymous with large language models, or LLMs. These are the systems that power chatbots, code assistants, and tools that generate text.",
  introNotice: "I believe that the best way to better understand a system — any system, really — is to build a small version yourself. This platform walks you through building a language model from scratch: choose a tokenizer and training data, watch the loss fall during pre-training, teach the model to answer questions, and end up chatting with something that you made.",
}

const STORAGE_KEY = 'qairu-edit-welcome'

export function loadWelcomeEdits(): WelcomeContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_WELCOME_CONTENT, ...parsed }
    }
  } catch (err) {
    console.error('Error loading welcome edits', err)
  }
  return DEFAULT_WELCOME_CONTENT
}

export function saveWelcomeEdits(content: WelcomeContent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  } catch (err) {
    console.error('Error saving welcome edits', err)
  }
}

export function clearWelcomeEdits() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('Error clearing welcome edits', err)
  }
}

export function hasWelcomeEdits(): boolean {
  return !!localStorage.getItem(STORAGE_KEY)
}

interface WelcomeEditorPanelProps {
  content: WelcomeContent
  onChange: (updated: WelcomeContent) => void
  onClose: () => void
}

export function WelcomeEditorPanel({ content, onChange, onClose }: WelcomeEditorPanelProps) {
  const [draft, setDraft] = useState<WelcomeContent>(() => ({ ...content }))
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    saveWelcomeEdits(draft)
    onChange(draft)
    setSaved(true)
  }

  const handleReset = () => {
    clearWelcomeEdits()
    onChange(DEFAULT_WELCOME_CONTENT)
    setDraft(DEFAULT_WELCOME_CONTENT)
    setSaved(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in" style={{ background: 'rgba(18, 16, 17, 0.75)' }}>
      <div
        className="ml-auto w-full max-w-xl h-full flex flex-col shadow-2xl"
        style={{ background: '#191d24', borderLeft: '1px solid #323d4d' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #323d4d' }}
        >
          <div className="flex items-center gap-2.5">
            <Pencil size={16} style={{ color: '#e8a488' }} />
            <span className="font-semibold text-sm text-[#f0ece8]">
              Editing Welcome Page
            </span>
            {saved && (
              <span
                className="text-xs px-2.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(124, 54, 31, 0.25)',
                  color: '#e8a488',
                  border: '1px solid rgba(124, 54, 31, 0.5)',
                }}
              >
                Saved locally
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:text-white transition-colors"
            style={{ color: '#7a8b9e' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Info banner */}
        <div
          className="mx-6 mt-4 px-4 py-3 rounded-xl flex gap-3 text-xs"
          style={{ background: '#121419', border: '1px solid #2b3543', color: '#b8c8d4' }}
        >
          <Info size={15} style={{ color: '#e8a488', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p>Edits to the welcome page are stored locally in browser storage.</p>
            <p className="mt-1" style={{ color: '#708396' }}>
              Permanent defaults are defined in{' '}
              <code style={{ fontFamily: 'monospace', color: '#e8a488', background: '#1c222b', padding: '1px 5px', borderRadius: 4 }}>
                src/components/layout/WelcomeEditor.tsx
              </code>
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7a8b9e] block mb-1.5">
              Greeting prefix
            </label>
            <input
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: '#121419', color: '#f0ece8', border: '1px solid #323d4d' }}
              value={draft.greeting}
              onChange={(e) => {
                setDraft((d) => ({ ...d, greeting: e.target.value }))
                setSaved(false)
              }}
              placeholder="e.g. Welcome back"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7a8b9e] block mb-1.5">
              Subtitle
            </label>
            <input
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: '#121419', color: '#f0ece8', border: '1px solid #323d4d' }}
              value={draft.subtitle}
              onChange={(e) => {
                setDraft((d) => ({ ...d, subtitle: e.target.value }))
                setSaved(false)
              }}
              placeholder="Course subtitle"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7a8b9e] block mb-1.5">
              Course intro message
            </label>
            <textarea
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-y"
              style={{
                background: '#121419',
                color: '#f0ece8',
                border: '1px solid #323d4d',
                minHeight: 120,
              }}
              value={draft.introNotice}
              onChange={(e) => {
                setDraft((d) => ({ ...d, introNotice: e.target.value }))
                setSaved(false)
              }}
              placeholder="Detailed introduction paragraph"
            />
          </div>
        </div>

        {/* Action bar */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid #323d4d' }}
        >
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg transition-colors border"
            style={{ color: '#8a9ba8', borderColor: '#323d4d' }}
          >
            <RotateCcw size={13} />
            Reset to original
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 text-xs px-5 py-2 rounded-lg font-semibold text-white transition-opacity"
            style={{ background: '#38160e' }}
          >
            <Save size={13} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
