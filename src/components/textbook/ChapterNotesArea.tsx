import React, { useState, useEffect } from 'react'
import { FileText, Check, RotateCcw } from 'lucide-react'

interface ChapterNotesAreaProps {
  chapterId: number
}

const DEFAULT_CH1_NOTES = `Notes on Training & N-grams:
1. Language models do not "know" meaning natively; they learn the statistical frequency of which characters/tokens follow given prefixes.
2. In our Kazakh names generator, observing 'алт' points strongly toward 'айыз', while 'бек' connects to 'үнбанай'.
3. Sparsity problem: If a 3-character combination never appeared in the training set, a pure n-gram model assigns it 0% probability unless smoothed.`

export default function ChapterNotesArea({ chapterId }: ChapterNotesAreaProps) {
  const storageKey = `qairu-notes-chapter-${chapterId}`
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem(storageKey) ?? (chapterId === 1 ? DEFAULT_CH1_NOTES : '')
  })
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    localStorage.setItem(storageKey, notes)
    setIsSaved(true)
    const t = setTimeout(() => setIsSaved(false), 2000)
    return () => clearTimeout(t)
  }, [notes, storageKey])

  const handleReset = () => {
    if (chapterId === 1) {
      setNotes(DEFAULT_CH1_NOTES)
    } else {
      setNotes('')
    }
  }

  return (
    <div
      className="mt-8 rounded-2xl p-6 select-none transition-all"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(255, 255, 255, 0.07)]">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-[#bf5af2]" />
          <span className="text-sm font-semibold text-[#f0ece8]">
            Notes & Takeaways
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="text-[11px] text-[#30d158] flex items-center gap-1 font-mono">
              <Check size={12} strokeWidth={3} /> Saved locally
            </span>
          )}
          <button
            onClick={handleReset}
            className="text-[11px] text-[#8e8e93] hover:text-[#f2f2f7] flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to default template"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your personal notes, experiments, or thoughts about this chapter here..."
        rows={6}
        className="w-full bg-[#111113] text-[#e5e5ea] text-xs font-mono p-4 rounded-xl border border-[rgba(255,255,255,0.06)] focus:border-[#bf5af2] focus:outline-none resize-y leading-relaxed transition-colors"
      />

      <div className="mt-2 flex items-center justify-between text-[11px] text-[#636366]">
        <span>Auto-saved to browser storage</span>
        <span>{notes.trim().split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  )
}
