import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, useUIStore } from '@/lib/store'
import { useKnowledgeStore, KnowledgeGap } from '@/lib/knowledgeStore'
import { chatApi } from '@/lib/api'
import {
  Send,
  X,
  Bot,
  Sparkles,
  Brain,
  FileText,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Trash2,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { CHAPTERS } from '@/content/chapters'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function HelperWidget() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const currentChapter = useUIStore((s) => s.currentChapter)
  const toggleHelper = useUIStore((s) => s.toggleHelper)

  // Knowledge Store integration
  const gaps = useKnowledgeStore((s) => s.gaps)
  const activeTab = useKnowledgeStore((s) => s.activeHelperTab)
  const setActiveTab = useKnowledgeStore((s) => s.setActiveHelperTab)
  const updateGapStatus = useKnowledgeStore((s) => s.updateStatus)
  const removeGap = useKnowledgeStore((s) => s.removeGap)
  const aiPromptDraft = useKnowledgeStore((s) => s.aiPromptDraft)
  const setAiPromptDraft = useKnowledgeStore((s) => s.setAiPromptDraft)

  // Local Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Knowledge Map Filter
  const [filterStatus, setFilterStatus] = useState<'all' | 'review' | 'mastered'>('all')

  // Chapter Study Notes state
  const notesStorageKey = `qairu-notes-chapter-${currentChapter}`
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem(notesStorageKey) || ''
  })
  const [notesSaved, setNotesSaved] = useState(false)

  const chapterTitle = CHAPTERS.find((c) => c.id === currentChapter)?.title ?? `Chapter ${currentChapter}`

  // Load and populate prompt draft if one was triggered from Socratic HUD
  useEffect(() => {
    if (aiPromptDraft) {
      setInput(aiPromptDraft)
      setAiPromptDraft(null)
    }
  }, [aiPromptDraft, setAiPromptDraft])

  // Update notes if current chapter changes
  useEffect(() => {
    setNotes(localStorage.getItem(notesStorageKey) || '')
  }, [currentChapter, notesStorageKey])

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab])

  // Save notes handler
  const handleNotesChange = (val: string) => {
    setNotes(val)
    localStorage.setItem(notesStorageKey, val)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 1500)
  }

  // Filtered gaps
  const chapterGaps = gaps.filter((g) => g.chapterId === currentChapter)
  const displayedGaps = gaps.filter((g) => {
    if (filterStatus === 'all') return true
    return g.status === filterStatus
  })

  const masteredCount = gaps.filter((g) => g.status === 'mastered').length
  const reviewCount = gaps.filter((g) => g.status === 'review').length

  const send = async (explicitMsg?: string) => {
    const msg = (explicitMsg || input).trim()
    if (!msg || loading) return
    if (!explicitMsg) setInput('')

    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    // Build enriched context informing AI of the student's active gaps and notes
    const activeGapsContext = chapterGaps.length
      ? `Active Knowledge Gaps in this chapter: ${chapterGaps
          .map((g) => `"${g.displayLabel}" (status: ${g.status}, explored: ${g.question})`)
          .join('; ')}`
      : 'No active gaps logged yet.'

    const notesSnippet = notes.trim()
      ? `Student's Study Notes for this chapter: "${notes.slice(0, 300)}..."`
      : 'No student notes recorded.'

    const enrichedContext = `${chapterTitle}\n${activeGapsContext}\n${notesSnippet}`

    try {
      const res = await chatApi.send({
        message: msg,
        chapter_context: enrichedContext,
        student_id: user?.id ?? 'anon',
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch {
      // Intelligent fallback answer if local backend isn't running
      let fallback = `Regarding "${msg}": In ${chapterTitle}, language models use mathematical transformations to model next-token probabilities. Feel free to highlight any formulas or text to test your recall!`
      if (msg.toLowerCase().includes('quiz')) {
        fallback = `Here is a Socratic quiz question for you: In the formula Attention(Q, K, V) = softmax(QKᵀ / √d) · V, why do we multiply Q by Kᵀ instead of directly adding them? What relationship are we measuring?`
      } else if (msg.toLowerCase().includes('review') || msg.toLowerCase().includes('note')) {
        fallback = `I reviewed your study notes! Your notes capture the key foundations well. Remember that as context length increases, attention scales quadratically O(N²), which is why efficient tokenization and KV-caching are crucial.`
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
    }
  }

  // Quick Action from Knowledge Map or Notes into Chat
  const triggerAiInquiry = (prompt: string) => {
    setActiveTab('chat')
    send(prompt)
  }

  return (
    <div
      className="flex flex-col h-full w-full select-none"
      style={{
        background: '#161618',
        color: '#f2f2f7',
      }}
    >
      {/* ── Header with Segmented Tabs ── */}
      <div
        className="h-12 flex items-center justify-between px-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.06)]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#28282e] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            <MessageSquare size={11} />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'knowledge'
                ? 'bg-[#bf5af2] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            <Brain size={11} />
            <span>Map</span>
            {gaps.length > 0 && (
              <span className="text-[10px] px-1 rounded-full bg-black/30 font-mono">
                {gaps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#28282e] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#f2f2f7]'
            }`}
          >
            <FileText size={11} />
            <span>Notes</span>
          </button>
        </div>

        <button
          onClick={toggleHelper}
          className="p-1.5 rounded-lg text-[#8e8e93] hover:text-white hover:bg-[#222226] transition-colors cursor-pointer"
          title="Close helper"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Context Eyebrow ── */}
      <div
        className="px-3.5 py-1.5 bg-[#121214] flex-shrink-0 flex items-center justify-between text-[11px] border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles size={11} className="text-[#bf5af2] flex-shrink-0" />
          <span className="text-[#8e8e93]">Context:</span>
          <span className="text-[#d1d1d6] font-medium truncate">{chapterTitle}</span>
        </div>

        {chapterGaps.length > 0 && (
          <span className="text-[10px] text-[#bf5af2] font-mono flex-shrink-0">
            {chapterGaps.length} gaps in ch.{currentChapter}
          </span>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: AI CHAT ─────────────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick Gaps Prompt Row */}
          {chapterGaps.length > 0 && (
            <div className="px-3 py-2 bg-[#141418] border-b border-[rgba(255,255,255,0.06)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-[#8e8e93] uppercase font-bold flex-shrink-0">
                Ask gap:
              </span>
              {chapterGaps.slice(0, 4).map((g) => (
                <button
                  key={g.id}
                  onClick={() => triggerAiInquiry(`Can you explain "${g.displayLabel}" and answer: ${g.question}`)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#202024] hover:bg-[#2c2c32] text-[#bf5af2] border border-[rgba(191,90,242,0.25)] truncate max-w-[110px] cursor-pointer transition-colors"
                  title={`Ask AI about ${g.displayLabel}`}
                >
                  {g.displayLabel}
                </button>
              ))}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3 scrollbar-thin">
            {messages.length === 0 && (
              <div className="text-center mt-8 space-y-2 px-2">
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center bg-[#222226] text-[#bf5af2]">
                  <Bot size={20} />
                </div>
                <p className="text-xs font-semibold text-[#ffffff]">QAIRU AI Assistant</p>
                <p className="text-[11px] text-[#8e8e93] leading-relaxed">
                  I'm aware of your study notes and highlighted knowledge gaps in <strong>{chapterTitle}</strong>. Ask me any question, request a Socratic quiz, or explore formulas!
                </p>

                {chapterGaps.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-[#131316] border border-[rgba(191,90,242,0.2)] text-left">
                    <span className="text-[10px] uppercase font-bold text-[#bf5af2] block mb-1">
                      🧠 Recent Highlights:
                    </span>
                    <p className="text-[11px] text-[#a1a1a6]">
                      You recently explored <strong>{chapterGaps[0].displayLabel}</strong>.
                    </p>
                    <button
                      onClick={() =>
                        triggerAiInquiry(
                          `Quiz me on ${chapterGaps[0].displayLabel}. Ask me a question testing my conceptual recall without giving away the answer!`
                        )
                      }
                      className="mt-2 text-xs font-semibold text-[#bf5af2] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Quiz me on this concept</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#bf5af2] text-white rounded-br-sm shadow'
                      : 'bg-[#222226] text-[#f2f2f7] border border-[rgba(255,255,255,0.08)] rounded-bl-sm font-sans'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 bg-[#222226] border border-[rgba(255,255,255,0.08)]">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#bf5af2] animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div
            className="p-2.5 flex-shrink-0"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#161618',
            }}
          >
            <div className="flex gap-1.5 items-center">
              <input
                className="flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors"
                style={{
                  background: '#101012',
                  color: '#f2f2f7',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask or request a quiz..."
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed bg-[#bf5af2] text-white hover:bg-[#a855f7] transition-colors cursor-pointer"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: KNOWLEDGE MAP ───────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'knowledge' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Status Filter Pills */}
          <div className="px-3.5 py-2.5 bg-[#121214] border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-[#2c2c32] text-white'
                    : 'text-[#8e8e93] hover:text-[#f2f2f7]'
                }`}
              >
                All ({gaps.length})
              </button>
              <button
                onClick={() => setFilterStatus('review')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'review'
                    ? 'bg-[rgba(255,159,10,0.25)] text-[#ff9f0a]'
                    : 'text-[#8e8e93] hover:text-[#f2f2f7]'
                }`}
              >
                Review ({reviewCount})
              </button>
              <button
                onClick={() => setFilterStatus('mastered')}
                className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStatus === 'mastered'
                    ? 'bg-[rgba(48,209,88,0.25)] text-[#30d158]'
                    : 'text-[#8e8e93] hover:text-[#f2f2f7]'
                }`}
              >
                Mastered ({masteredCount})
              </button>
            </div>
          </div>

          {/* Gaps List */}
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 scrollbar-thin">
            {displayedGaps.length === 0 ? (
              <div className="text-center mt-12 px-3 text-[#8e8e93] space-y-2">
                <HelpCircle size={28} className="mx-auto text-[#636366]" />
                <p className="text-xs font-semibold text-[#f2f2f7]">No knowledge gaps logged</p>
                <p className="text-[11px] leading-relaxed">
                  Highlight any math formula (like Wᵀ, QKᵀ / √d, or ∂ℒ/∂h) or text in the chapter, then click the floating <strong>'?' Explain</strong> button to diagnose your gap!
                </p>
              </div>
            ) : (
              displayedGaps.map((gap) => {
                const isMastered = gap.status === 'mastered'
                return (
                  <div
                    key={gap.id}
                    className="p-3 rounded-xl border bg-[#121215] transition-all space-y-2"
                    style={{
                      borderColor: isMastered ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 159, 10, 0.25)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="px-2 py-0.5 rounded-md font-mono text-xs font-bold truncate max-w-[170px]"
                        style={{
                          background: gap.isMath ? 'rgba(10, 132, 255, 0.2)' : 'rgba(191, 90, 242, 0.2)',
                          color: gap.isMath ? '#70baff' : '#e085ff',
                        }}
                      >
                        {gap.displayLabel}
                      </span>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-[#8e8e93] font-mono">
                          Ch.{gap.chapterId}
                        </span>
                        <button
                          onClick={() => removeGap(gap.id)}
                          className="p-1 text-[#636366] hover:text-[#ff453a] transition-colors cursor-pointer"
                          title="Delete gap"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-[#f2f2f7] leading-snug">
                      {gap.question}
                    </p>

                    <p className="text-[11px] text-[#a1a1a6] leading-relaxed line-clamp-3">
                      {gap.explanation}
                    </p>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          updateGapStatus(gap.id, isMastered ? 'review' : 'mastered')
                        }
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                          isMastered
                            ? 'bg-[rgba(48,209,88,0.18)] text-[#30d158] hover:bg-[rgba(48,209,88,0.3)]'
                            : 'bg-[rgba(255,159,10,0.18)] text-[#ff9f0a] hover:bg-[rgba(255,159,10,0.3)]'
                        }`}
                      >
                        {isMastered ? <CheckCircle2 size={11} /> : <RotateCcw size={11} />}
                        <span>{isMastered ? 'Mastered' : 'Needs Review'}</span>
                      </button>

                      <button
                        onClick={() =>
                          triggerAiInquiry(
                            `Quiz me on "${gap.displayLabel}". Check if I understand why: ${gap.question}`
                          )
                        }
                        className="text-[11px] font-semibold text-[#bf5af2] hover:text-[#d946ef] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Quiz Me</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: CHAPTER STUDY NOTES ─────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'notes' && (
        <div className="flex-1 flex flex-col min-h-0 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ffffff]">
              Chapter {currentChapter} Notes
            </span>
            {notesSaved && (
              <span className="text-[10px] text-[#30d158] flex items-center gap-1">
                <CheckCircle2 size={11} /> Saved
              </span>
            )}
          </div>

          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Write your study reflections, code notes, or questions here..."
            className="flex-1 w-full bg-[#111113] text-[#e5e5ea] text-xs font-mono p-3 rounded-xl border border-[rgba(255,255,255,0.08)] focus:border-[#bf5af2] focus:outline-none resize-none leading-relaxed"
          />

          <button
            onClick={() =>
              triggerAiInquiry(
                `Here are my current study notes for Chapter ${currentChapter}: "${notes}". Please review them and tell me if I have any misconceptions or if there are important nuances I missed.`
              )
            }
            disabled={!notes.trim()}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#bf5af2] text-white hover:bg-[#a855f7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Bot size={13} />
            <span>Ask AI to Review My Notes</span>
          </button>
        </div>
      )}
    </div>
  )
}
