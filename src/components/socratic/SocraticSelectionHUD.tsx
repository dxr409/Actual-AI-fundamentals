import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  HelpCircle,
  X,
  CheckCircle2,
  RotateCcw,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { diagnoseSelection, SocraticDiagnostic } from '@/lib/socraticEngine'
import { useKnowledgeStore } from '@/lib/knowledgeStore'
import { useUIStore } from '@/lib/store'

interface SocraticSelectionHUDProps {
  chapterId: number
  children: React.ReactNode
}

interface SelectionCoords {
  // Floating '?' button
  btnX: number
  btnY: number
  btnPlacement: 'top' | 'bottom'

  // Anchored diagnostic micro-card (guaranteed inside viewport)
  cardWidth: number
  cardLeft: number
  cardTop?: number
  cardBottom?: number
  cardMaxHeight: number
  cardPlacement: 'top' | 'bottom'
}

export default function SocraticSelectionHUD({ chapterId, children }: SocraticSelectionHUDProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const [selectedText, setSelectedText] = useState('')
  const [contextSentence, setContextSentence] = useState('')
  const [isMath, setIsMath] = useState(false)
  const [hudCoords, setHudCoords] = useState<SelectionCoords | null>(null)
  const [isCardOpen, setIsCardOpen] = useState(false)
  const [activeTier, setActiveTier] = useState<1 | 2 | 3>(1)
  const [diagnostic, setDiagnostic] = useState<SocraticDiagnostic | null>(null)
  const [showSocraticAnswer, setShowSocraticAnswer] = useState(false)
  const [customQuestion, setCustomQuestion] = useState('')
  const [feedbackSaved, setFeedbackSaved] = useState<'mastered' | 'review' | null>(null)

  const recordGap = useKnowledgeStore((s) => s.recordGap)
  const updateStatus = useKnowledgeStore((s) => s.updateStatus)
  const setAiPromptDraft = useKnowledgeStore((s) => s.setAiPromptDraft)
  const setActiveHelperTab = useKnowledgeStore((s) => s.setActiveHelperTab)
  const toggleHelper = useUIStore((s) => s.toggleHelper)
  const helperOpen = useUIStore((s) => s.helperOpen)

  // Clean math extraction from KaTeX or MathJax if present
  const extractCleanSelection = (sel: Selection): { text: string; isMathNode: boolean } => {
    if (!sel.rangeCount) return { text: sel.toString(), isMathNode: false }
    const range = sel.getRangeAt(0)
    const container = range.commonAncestorContainer
    const parentElem = container.nodeType === Node.ELEMENT_NODE
      ? (container as Element)
      : container.parentElement

    if (!parentElem) return { text: sel.toString(), isMathNode: false }

    // Check if inside KaTeX
    const katexElem = parentElem.closest('.katex')
    if (katexElem) {
      const annotation = katexElem.querySelector('annotation[encoding="application/x-tex"]')
      if (annotation && annotation.textContent) {
        return { text: annotation.textContent.trim(), isMathNode: true }
      }
      return { text: katexElem.textContent?.trim() || sel.toString(), isMathNode: true }
    }

    const raw = sel.toString().trim()
    const isMathPattern = /[\^_{}\\\/+=*∂ℒλθ]/.test(raw) || raw === 'Wᵀ' || raw === 'Kᵀ' || raw === 'W_2^T'
    return { text: raw, isMathNode: isMathPattern }
  }

  // Calculate coordinates that are strictly guaranteed to stay 100% inside the viewport
  const computeGuaranteedCoords = useCallback((rect: DOMRect): SelectionCoords => {
    const winW = window.innerWidth
    const winH = window.innerHeight
    const midX = rect.left + rect.width / 2

    // ── 1. Button Coords ──
    const btnX = Math.min(Math.max(midX, 60), winW - 60)
    const btnIsTop = rect.top >= 44
    const btnY = btnIsTop ? rect.top - 6 : rect.bottom + 6
    const btnPlacement: 'top' | 'bottom' = btnIsTop ? 'top' : 'bottom'

    // ── 2. Card Coords ──
    const CARD_WIDTH = Math.min(380, winW - 24)
    // Center card horizontally on selection, strictly clamped between 12px and (winW - CARD_WIDTH - 12px)
    const cardLeft = Math.max(12, Math.min(winW - CARD_WIDTH - 12, midX - CARD_WIDTH / 2))

    // Vertical available space
    const spaceBelow = winH - rect.bottom - 16
    const spaceAbove = rect.top - 16

    let cardPlacement: 'top' | 'bottom' = 'bottom'
    let cardTop: number | undefined = undefined
    let cardBottom: number | undefined = undefined
    let cardMaxHeight = 440

    // Prefer placing below if space is adequate (>= 320px) OR if there is more space below than above
    if (spaceBelow >= 320 || spaceBelow >= spaceAbove) {
      cardPlacement = 'bottom'
      cardTop = Math.max(12, rect.bottom + 8)
      cardMaxHeight = Math.min(480, Math.max(220, winH - cardTop - 12))
    } else {
      cardPlacement = 'top'
      cardBottom = Math.max(12, winH - rect.top + 8)
      cardMaxHeight = Math.min(480, Math.max(220, rect.top - 20))
    }

    return {
      btnX,
      btnY,
      btnPlacement,
      cardWidth: CARD_WIDTH,
      cardLeft,
      cardTop,
      cardBottom,
      cardMaxHeight,
      cardPlacement,
    }
  }, [])

  // Update selection coordinates and trigger HUD
  const checkSelection = useCallback(() => {
    // If card is already open, don't dismiss on small inner clicks
    if (isCardOpen) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setHudCoords(null)
      setSelectedText('')
      return
    }

    const { text: cleanText, isMathNode } = extractCleanSelection(selection)
    if (!cleanText || cleanText.length < 1 || cleanText.length > 300) {
      setHudCoords(null)
      return
    }

    // Check if selection is within our textbook container
    const range = selection.getRangeAt(0)
    if (containerRef.current && !containerRef.current.contains(range.commonAncestorContainer)) {
      return
    }

    // Ignore selections inside inputs or textareas
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return
    }

    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return

    // Extract surrounding sentence
    const parentBlock =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as Element)
        : range.commonAncestorContainer.parentElement
    const sentence = parentBlock?.textContent?.slice(0, 180) || cleanText

    setSelectedText(cleanText)
    setIsMath(isMathNode)
    setContextSentence(sentence)

    const diag = diagnoseSelection(cleanText, sentence)
    setDiagnostic(diag)

    // Compute guaranteed safe viewport coordinates
    setHudCoords(computeGuaranteedCoords(rect))
  }, [computeGuaranteedCoords, isCardOpen])

  // Attach selection listeners (mouseup, touchend, keyup, scroll)
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null

    const handleSelectionChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        checkSelection()
      }, 120)
    }

    const handleImmediate = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      setTimeout(checkSelection, 20)
    }

    // Live reposition on scroll so both button and open card stay clamped in viewport
    const handleScroll = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        if (!isCardOpen) setHudCoords(null)
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (rect.width > 0) {
        // If selection scrolled completely out of view, dismiss card
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          if (!isCardOpen) setHudCoords(null)
          return
        }
        setHudCoords(computeGuaranteedCoords(rect))
      }
    }

    document.addEventListener('mouseup', handleImmediate)
    document.addEventListener('touchend', handleImmediate)
    document.addEventListener('keyup', handleImmediate)
    document.addEventListener('selectionchange', handleSelectionChange)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      document.removeEventListener('mouseup', handleImmediate)
      document.removeEventListener('touchend', handleImmediate)
      document.removeEventListener('keyup', handleImmediate)
      document.removeEventListener('selectionchange', handleSelectionChange)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [checkSelection, computeGuaranteedCoords, isCardOpen])

  // Click outside to dismiss open card
  useEffect(() => {
    if (!isCardOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsCardOpen(false)
        setHudCoords(null)
        setSelectedText('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isCardOpen])

  // Open the diagnostic card
  const handleOpenCard = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCardOpen(true)
    setShowSocraticAnswer(false)
    setFeedbackSaved(null)

    // Re-verify coordinates at moment of opening
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const rect = selection.getRangeAt(0).getBoundingClientRect()
      if (rect.width > 0) {
        setHudCoords(computeGuaranteedCoords(rect))
      }
    }

    // Automatically register the gap in "review" status
    if (diagnostic) {
      const activeTierInfo = diagnostic.tiers[activeTier]
      recordGap({
        chapterId,
        selectedText,
        displayLabel: diagnostic.displayLabel,
        isMath,
        contextSentence,
        tier: activeTier,
        question: activeTierInfo.question,
        explanation: activeTierInfo.explanation,
        socraticHint: activeTierInfo.socraticAnswer,
        status: 'review',
      })
    }
  }

  const handleCloseCard = () => {
    setIsCardOpen(false)
    setHudCoords(null)
    setSelectedText('')
    window.getSelection()?.removeAllRanges()
  }

  // Self-assessment feedback
  const handleAssessment = (status: 'mastered' | 'review') => {
    if (!diagnostic) return
    const activeTierInfo = diagnostic.tiers[activeTier]
    const gapId = recordGap({
      chapterId,
      selectedText,
      displayLabel: diagnostic.displayLabel,
      isMath,
      contextSentence,
      tier: activeTier,
      question: activeTierInfo.question,
      explanation: activeTierInfo.explanation,
      socraticHint: activeTierInfo.socraticAnswer,
      status,
    })
    updateStatus(gapId, status)
    setFeedbackSaved(status)
  }

  // Ask AI in Helper Widget
  const handleAskAI = (promptText?: string) => {
    const questionToAsk =
      promptText ||
      customQuestion ||
      (diagnostic ? diagnostic.tiers[activeTier].question : `Explain "${selectedText}" in Chapter ${chapterId}`)

    setAiPromptDraft(questionToAsk)
    setActiveHelperTab('chat')
    if (!helperOpen) {
      toggleHelper()
    }
    handleCloseCard()
  }

  return (
    <div ref={containerRef} className="relative select-text">
      {children}

      {/* ── Floating '?' Trigger Button (Always Inside Viewport) ── */}
      {hudCoords && !isCardOpen && (
        <div
          className="fixed z-[9999] pointer-events-auto transition-transform duration-100 animate-fade-in"
          style={{
            left: `${hudCoords.btnX}px`,
            top: `${hudCoords.btnY}px`,
            transform: hudCoords.btnPlacement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
          }}
        >
          <button
            onClick={handleOpenCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-2xl cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{
              background: '#bf5af2',
              boxShadow: '0 4px 20px rgba(191, 90, 242, 0.5), 0 0 10px rgba(191, 90, 242, 0.3)',
            }}
            title="Diagnose knowledge gap"
          >
            <HelpCircle size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-semibold tracking-wide">Explain</span>
          </button>
        </div>
      )}

      {/* ── Anchored Diagnostic Micro-Card (Guaranteed 100% Inside Viewport) ── */}
      {hudCoords && isCardOpen && diagnostic && (
        <div
          ref={cardRef}
          className="fixed z-[9999] rounded-2xl p-4 select-none shadow-2xl transition-all duration-150 border flex flex-col animate-fade-in"
          style={{
            width: `${hudCoords.cardWidth}px`,
            maxWidth: 'calc(100vw - 24px)',
            left: `${hudCoords.cardLeft}px`,
            top: hudCoords.cardTop !== undefined ? `${hudCoords.cardTop}px` : undefined,
            bottom: hudCoords.cardBottom !== undefined ? `${hudCoords.cardBottom}px` : undefined,
            maxHeight: `${hudCoords.cardMaxHeight}px`,
            background: '#18181c',
            borderColor: 'rgba(191, 90, 242, 0.45)',
            boxShadow: '0 16px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(191, 90, 242, 0.25)',
          }}
        >
          {/* Card Top Header - Always visible at top of card */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[rgba(255,255,255,0.08)] flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold truncate max-w-[200px]"
                style={{
                  background: isMath ? 'rgba(10, 132, 255, 0.2)' : 'rgba(191, 90, 242, 0.2)',
                  color: isMath ? '#70baff' : '#e085ff',
                  border: isMath ? '1px solid rgba(10, 132, 255, 0.35)' : '1px solid rgba(191, 90, 242, 0.35)',
                }}
              >
                {diagnostic.displayLabel}
              </span>
              <span className="text-[10px] text-[#8e8e93] font-medium uppercase tracking-wider">
                Socratic HUD
              </span>
            </div>

            <button
              onClick={handleCloseCard}
              className="p-1 rounded-md text-[#8e8e93] hover:text-white hover:bg-[#28282e] transition-colors cursor-pointer flex-shrink-0"
              title="Close"
            >
              <X size={15} />
            </button>
          </div>

          {/* Three-Tier Segmented Tabs - Always visible */}
          <div className="grid grid-cols-3 gap-1 p-1 my-2.5 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.06)] text-[11px] flex-shrink-0">
            <button
              onClick={() => {
                setActiveTier(1)
                setShowSocraticAnswer(false)
              }}
              className={`py-1.5 px-1.5 rounded-lg font-semibold transition-all cursor-pointer text-center truncate ${
                activeTier === 1
                  ? 'bg-[#2a2a30] text-white shadow-sm'
                  : 'text-[#8e8e93] hover:text-[#f2f2f7]'
              }`}
            >
              1. Definition
            </button>
            <button
              onClick={() => {
                setActiveTier(2)
                setShowSocraticAnswer(false)
              }}
              className={`py-1.5 px-1.5 rounded-lg font-semibold transition-all cursor-pointer text-center truncate ${
                activeTier === 2
                  ? 'bg-[#2a2a30] text-white shadow-sm'
                  : 'text-[#8e8e93] hover:text-[#f2f2f7]'
              }`}
            >
              2. Why?
            </button>
            <button
              onClick={() => {
                setActiveTier(3)
                setShowSocraticAnswer(false)
              }}
              className={`py-1.5 px-1.5 rounded-lg font-semibold transition-all cursor-pointer text-center truncate ${
                activeTier === 3
                  ? 'bg-[#bf5af2] text-white shadow-sm'
                  : 'text-[#8e8e93] hover:text-[#f2f2f7]'
              }`}
            >
              3. Socratic
            </button>
          </div>

          {/* Active Tier Content Area - Scrollable if content is long */}
          <div className="flex-1 overflow-y-auto min-h-0 p-3 rounded-xl bg-[#121214] border border-[rgba(255,255,255,0.06)] space-y-2.5 scrollbar-thin">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#bf5af2] block">
                {diagnostic.tiers[activeTier].subtitle}
              </span>
              <h4 className="text-xs font-semibold text-[#f2f2f7] mt-0.5 leading-snug">
                {diagnostic.tiers[activeTier].question}
              </h4>
            </div>

            <p className="text-xs text-[#a1a1a6] leading-relaxed">
              {diagnostic.tiers[activeTier].explanation}
            </p>

            {/* Tier 3 Special: Socratic Prompt & Self-Assessment */}
            {activeTier === 3 && (
              <div className="mt-2 pt-2.5 border-t border-[rgba(255,255,255,0.06)] space-y-2">
                {diagnostic.tiers[3].socraticPrompt && (
                  <div className="p-2.5 rounded-lg bg-[#19191d] border border-[rgba(255,255,255,0.04)] text-[11px] text-[#d1d1d6]">
                    <span className="font-semibold text-[#ff9f0a] block mb-0.5">
                      💡 Thinking Cue:
                    </span>
                    {diagnostic.tiers[3].socraticPrompt}
                  </div>
                )}

                {/* Socratic Answer Toggle */}
                {diagnostic.tiers[3].socraticAnswer && (
                  <div>
                    <button
                      onClick={() => setShowSocraticAnswer(!showSocraticAnswer)}
                      className="text-[11px] font-semibold text-[#bf5af2] hover:text-[#d946ef] flex items-center gap-1 cursor-pointer"
                    >
                      {showSocraticAnswer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      <span>{showSocraticAnswer ? 'Hide answer' : 'Reveal answer & test yourself'}</span>
                    </button>

                    {showSocraticAnswer && (
                      <div className="mt-1.5 p-2 rounded-lg bg-[rgba(191,90,242,0.1)] border border-[rgba(191,90,242,0.25)] text-xs text-[#f2f2f7] animate-fade-in">
                        {diagnostic.tiers[3].socraticAnswer}
                      </div>
                    )}
                  </div>
                )}

                {/* Self-assessment buttons */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#8e8e93] uppercase font-bold tracking-wider">
                    Did you get it?
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAssessment('mastered')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        feedbackSaved === 'mastered'
                          ? 'bg-[#30d158] text-black font-bold'
                          : 'bg-[#222226] text-[#30d158] hover:bg-[#28282e] border border-[rgba(48,209,88,0.3)]'
                      }`}
                    >
                      <CheckCircle2 size={11} />
                      <span>{feedbackSaved === 'mastered' ? 'Mastered!' : 'Mastered'}</span>
                    </button>

                    <button
                      onClick={() => handleAssessment('review')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        feedbackSaved === 'review'
                          ? 'bg-[#ff9f0a] text-black font-bold'
                          : 'bg-[#222226] text-[#ff9f0a] hover:bg-[#28282e] border border-[rgba(255,159,10,0.3)]'
                      }`}
                    >
                      <RotateCcw size={11} />
                      <span>{feedbackSaved === 'review' ? 'Saved' : 'Review later'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Question & AI Action Bar - Always visible at bottom */}
          <div className="mt-2.5 pt-2 border-t border-[rgba(255,255,255,0.08)] flex items-center gap-1.5 flex-shrink-0">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask custom question..."
              className="flex-1 bg-[#121214] text-[#f2f2f7] text-xs px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] focus:border-[#bf5af2] focus:outline-none placeholder-[#636366]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskAI()
              }}
            />
            <button
              onClick={() => handleAskAI()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2a2a30] text-[#bf5af2] hover:bg-[#34343c] hover:text-white border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer flex-shrink-0"
              title="Ask AI Assistant about this concept"
            >
              <Bot size={13} />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
