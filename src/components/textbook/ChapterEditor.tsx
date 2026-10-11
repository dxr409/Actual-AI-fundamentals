import React, { useState, useEffect } from 'react'
import { Pencil, Save, RotateCcw, X, Info, Copy, Check, Plus, Trash2 } from 'lucide-react'

const STORAGE_KEY = (id: number) => `qairu-edit-ch${id}`

export function loadEdits(chapterId: number, defaultSections: { title: string; body: string }[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(chapterId))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as { title: string; body: string }[]
      }
    }
  } catch (err) {
    console.error('Error loading edits for chapter', chapterId, err)
  }
  return defaultSections
}

export function saveEdits(chapterId: number, sections: { title: string; body: string }[]) {
  try {
    localStorage.setItem(STORAGE_KEY(chapterId), JSON.stringify(sections))
  } catch (err) {
    console.error('Error saving edits for chapter', chapterId, err)
  }
}

export function clearEdits(chapterId: number) {
  try {
    localStorage.removeItem(STORAGE_KEY(chapterId))
  } catch (err) {
    console.error('Error clearing edits for chapter', chapterId, err)
  }
}

export function hasEdits(chapterId: number) {
  return !!localStorage.getItem(STORAGE_KEY(chapterId))
}

interface EditorPanelProps {
  chapterId: number
  sections: { title: string; body: string }[]
  activeSectionIndex?: number
  onChange: (sections: { title: string; body: string }[]) => void
  onClose: () => void
}

export function EditorPanel({
  chapterId,
  sections,
  activeSectionIndex = 0,
  onChange,
  onClose,
}: EditorPanelProps) {
  const [draft, setDraft] = useState(() => sections.map((s) => ({ ...s })))
  const [selectedSubtopic, setSelectedSubtopic] = useState(
    Math.min(activeSectionIndex, Math.max(0, sections.length - 1))
  )
  const [saved, setSaved] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    setDraft(sections.map((s) => ({ ...s })))
    setSaved(false)
  }, [chapterId, sections])

  const update = (field: 'title' | 'body', value: string) => {
    setDraft((prev) =>
      prev.map((s, idx) => (idx === selectedSubtopic ? { ...s, [field]: value } : s))
    )
    setSaved(false)
  }

  const addSubtopic = () => {
    const newTopic = {
      title: `New Section ${draft.length + 1}`,
      body: `<p>Add your section content here.</p>`,
    }
    setDraft((prev) => [...prev, newTopic])
    setSelectedSubtopic(draft.length)
    setSaved(false)
  }

  const removeSubtopic = (idx: number) => {
    if (draft.length <= 1) return
    setDraft((prev) => prev.filter((_, i) => i !== idx))
    setSelectedSubtopic((prev) => Math.max(0, prev - 1))
    setSaved(false)
  }

  const handleSave = () => {
    saveEdits(chapterId, draft)
    onChange(draft)
    setSaved(true)
  }

  const handleReset = () => {
    clearEdits(chapterId)
    window.location.reload()
  }

  const handleCopyTS = () => {
    const code = `export const ch${chapterId} = {\n  id: ${chapterId},\n  sections: ${JSON.stringify(
      draft,
      null,
      2
    )},\n}\n`
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2200)
  }

  const currentSection = draft[selectedSubtopic] || draft[0]

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in" style={{ background: 'rgba(10, 10, 12, 0.78)' }}>
      <div
        className="ml-auto w-full max-w-2xl h-full flex flex-col shadow-2xl"
        style={{ background: '#161618', borderLeft: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        {/* Editor header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <div className="flex items-center gap-2.5">
            <Pencil size={15} style={{ color: '#bf5af2' }} />
            <span className="font-bold text-sm text-[#f2f2f7]">
              Editing Chapter {chapterId}
            </span>
            {saved && (
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  background: 'rgba(48, 209, 88, 0.15)',
                  color: '#30d158',
                  border: '1px solid rgba(48, 209, 88, 0.3)',
                }}
              >
                Saved locally
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8e8e93] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Persistence Info Banner */}
        <div
          className="mx-6 mt-4 p-3.5 rounded-xl flex items-start justify-between gap-3 text-xs"
          style={{ background: '#101012', border: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
          <div className="flex gap-2.5">
            <Info size={15} style={{ color: '#bf5af2', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="font-medium text-[#f2f2f7]">
                Edits are saved locally in your app storage.
              </p>
              <p className="mt-0.5 text-[#8e8e93]">
                Your changes persist across app restarts on this machine. To make them permanent for all students, copy the code into <code className="text-[#bf5af2]">src/content/chapters/ch{chapterId}.ts</code>.
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyTS}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#222226] text-[#e5e5ea] hover:bg-[#2c2c30] border border-[rgba(255,255,255,0.08)] flex-shrink-0 transition-all font-mono text-[11px]"
            title="Copy TypeScript file code to clipboard"
          >
            {copiedCode ? <Check size={12} className="text-[#30d158]" /> : <Copy size={12} />}
            <span>{copiedCode ? 'Copied' : 'Copy code'}</span>
          </button>
        </div>

        {/* Subtopic Switcher Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
              Sub-topics in this chapter
            </span>
            <button
              onClick={addSubtopic}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#bf5af2] hover:text-[#d946ef] transition-colors"
            >
              <Plus size={13} />
              <span>Add Sub-topic</span>
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {draft.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSubtopic(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedSubtopic === idx
                    ? 'bg-[#bf5af2] text-white font-semibold shadow'
                    : 'bg-[#1e1e22] text-[#8e8e93] hover:text-[#f2f2f7]'
                }`}
              >
                <span>{idx + 1}. {s.title || 'Untitled'}</span>
                {draft.length > 1 && selectedSubtopic === idx && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSubtopic(idx)
                    }}
                    className="hover:text-red-300 p-0.5"
                    title="Delete this subtopic"
                  >
                    <Trash2 size={11} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Subtopic Editor Body */}
        {currentSection && (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] block mb-1.5">
                Sub-topic {selectedSubtopic + 1} Title
              </label>
              <input
                className="w-full rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none"
                style={{
                  background: '#101012',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                value={currentSection.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] block mb-1.5">
                Sub-topic Body (HTML & Markdown formatting supported)
              </label>
              <textarea
                className="w-full flex-1 rounded-xl p-3.5 text-xs font-mono focus:outline-none resize-y"
                style={{
                  background: '#101012',
                  color: '#e5e5ea',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minHeight: 280,
                  lineHeight: 1.65,
                }}
                value={currentSection.body}
                onChange={(e) => update('body', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl transition-colors border text-[#8e8e93] hover:text-[#ff453a] border-[rgba(255,255,255,0.08)] hover:border-[#ff453a]"
          >
            <RotateCcw size={12} />
            <span>Reset Chapter</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-xs px-5 py-2.5 rounded-xl font-semibold text-white transition-all shadow-lg hover:opacity-90 cursor-pointer"
            style={{ background: '#bf5af2' }}
          >
            <Save size={13} />
            <span>Save All Sub-topics</span>
          </button>
        </div>
      </div>
    </div>
  )
}
