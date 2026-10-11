import React, { useState, useEffect } from 'react'
import { Wrench, ChevronDown, ChevronRight, Copy, Check, Pencil, Save, RotateCcw } from 'lucide-react'

interface UnderTheHoodProps {
  id: string // unique key for this snippet e.g. "tokenizer", "transformer-block"
  title?: string
  defaultCode?: string
  language?: string
  explanation?: string
  children?: React.ReactNode
}

export default function UnderTheHood({
  id,
  title = 'Under the hood',
  defaultCode = `# Paste or edit your Python code here\n`,
  language = 'python',
  explanation,
  children,
}: UnderTheHoodProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState(() => {
    try {
      const saved = localStorage.getItem(`qairu-code-${id}`)
      if (saved !== null) return saved
    } catch {}
    return defaultCode
  })
  const [isEditing, setIsEditing] = useState(false)
  const [draftCode, setDraftCode] = useState(code)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setDraftCode(code)
  }, [code])

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    setCode(draftCode)
    try {
      localStorage.setItem(`qairu-code-${id}`, draftCode)
    } catch {}
    setIsEditing(false)
  }

  const handleReset = () => {
    setCode(defaultCode)
    setDraftCode(defaultCode)
    try {
      localStorage.removeItem(`qairu-code-${id}`)
    } catch {}
    setIsEditing(false)
  }

  return (
    <div className="mt-6 transition-all duration-200">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer select-none text-left"
        style={{
          background: '#19191c',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#e5e5ea',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#222226'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#19191c'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <Wrench size={15} style={{ color: '#8e8e93' }} />
          <span className="text-sm font-medium tracking-tight">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown size={15} style={{ color: '#8e8e93' }} />
        ) : (
          <ChevronRight size={15} style={{ color: '#8e8e93' }} />
        )}
      </button>

      {/* Expanded Content Drawer */}
      {isOpen && (
        <div
          className="mt-2 rounded-xl p-5 animate-fade-in"
          style={{
            background: '#161618',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          {explanation && (
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#c7c7cc' }}>
              {explanation}
            </p>
          )}

          {children}

          {/* Code Section */}
          <div className="mt-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-t-lg bg-[#111113] border border-b-0 border-[rgba(255,255,255,0.08)]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#8e8e93]">
                {language}
              </span>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors text-[#8e8e93] hover:text-[#f2f2f7]"
                      title="Paste or edit code"
                    >
                      <Pencil size={12} />
                      <span>Edit code</span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors text-[#8e8e93] hover:text-[#f2f2f7]"
                    >
                      {copied ? <Check size={12} style={{ color: '#30d158' }} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded text-[#ff453a] hover:bg-[#ff453a20]"
                    >
                      <RotateCcw size={12} />
                      <span>Reset</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[#bf5af2] text-white font-medium"
                    >
                      <Save size={12} />
                      <span>Save</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value)}
                className="w-full p-4 font-mono text-xs rounded-b-lg border border-[rgba(255,255,255,0.08)] focus:outline-none resize-y"
                style={{
                  background: '#0d0d0f',
                  color: '#f2f2f7',
                  minHeight: 220,
                  lineHeight: 1.6,
                }}
                placeholder="Paste your Python code here..."
              />
            ) : (
              <pre
                className="p-4 rounded-b-lg overflow-x-auto font-mono text-xs border border-[rgba(255,255,255,0.08)]"
                style={{
                  background: '#0d0d0f',
                  color: '#e5e5ea',
                  lineHeight: 1.6,
                }}
              >
                <code>{code}</code>
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
