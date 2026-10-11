import React, { useState } from 'react'
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Lock,
  Unlock,
} from 'lucide-react'
import { TopicNode, BloomQuestion } from '@/lib/api'
import { useKnowledgeGraphStore } from '@/lib/knowledgeGraphStore'
import { useNavigate } from 'react-router-dom'

interface TopicQuizModalProps {
  topic: TopicNode
  onClose: () => void
}

const BLOOM_BADGES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  remember: {
    label: "Bloom L1 • Remember",
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.25)',
  },
  understand: {
    label: "Bloom L2 • Understand",
    color: '#bf5af2',
    bg: 'rgba(191, 90, 242, 0.12)',
    border: 'rgba(191, 90, 242, 0.25)',
  },
  apply: {
    label: "Bloom L3 • Apply",
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
}

export default function TopicQuizModal({ topic, onClose }: TopicQuizModalProps) {
  const navigate = useNavigate()
  const recordQuizScore = useKnowledgeGraphStore((s) => s.recordQuizScore)
  const nodes = useKnowledgeGraphStore((s) => s.nodes)

  const questions: BloomQuestion[] = topic.questions && topic.questions.length > 0
    ? topic.questions
    : [
        {
          id: `${topic.id}_fallback_q1`,
          bloom_level: 'understand',
          question: `What is the core role of ${topic.title} in the modern LLM stack?`,
          options: [
            topic.description,
            'A legacy technique superseded by static hash tables',
            'An unmonitored heuristic with no theoretical backing',
            'Exclusively used for image rasterization',
          ],
          correct_index: 0,
          explanation: topic.description,
          socratic_hint: 'Review the main definition and purpose of this topic.',
        },
      ]

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [unlockedTopics, setUnlockedTopics] = useState<string[]>([])

  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined)

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleSubmit = async () => {
    if (!allAnswered || submitted || submitting) return
    setSubmitting(true)

    // Calculate score
    let correctCount = 0
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_index) {
        correctCount++
      }
    })

    const scorePct = Math.round((correctCount / questions.length) * 100)

    try {
      const res = await recordQuizScore(topic.id, scorePct)
      setUnlockedTopics(res.newlyUnlocked || [])
    } finally {
      setSubmitted(true)
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setSelectedAnswers({})
    setSubmitted(false)
    setUnlockedTopics([])
  }

  // Scoring analysis
  const correctCount = questions.filter(
    (q, idx) => selectedAnswers[idx] === q.correct_index
  ).length
  const scorePct = Math.round((correctCount / questions.length) * 100)
  const isMastered = scorePct >= 70

  // Lookup unlocked topic names
  const unlockedNames = unlockedTopics
    .map((id) => nodes.find((n) => n.id === id)?.title)
    .filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#161618] border border-[rgba(255,255,255,0.12)] shadow-2xl overflow-hidden"
        style={{
          boxShadow: isMastered && submitted
            ? '0 0 50px rgba(16, 185, 129, 0.25), 0 20px 40px rgba(0,0,0,0.8)'
            : '0 20px 50px rgba(0,0,0,0.8)',
        }}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-[#1c1c20]">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{
                background:
                  topic.status === 'mastered'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(56, 189, 248, 0.15)',
                color:
                  topic.status === 'mastered' ? '#10b981' : '#38bdf8',
                border: `1px solid ${
                  topic.status === 'mastered'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(56, 189, 248, 0.3)'
                }`,
              }}
            >
              QZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {topic.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold bg-[#26262a] text-[#8e8e93]">
                  {topic.category}
                </span>
              </div>
              <p className="text-[11px] text-[#8e8e93]">
                Knowledge Check • 3 Bloom&apos;s Taxonomy Verification Questions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8e8e93] hover:text-white hover:bg-[#2c2c32] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Result Banner after submit */}
          {submitted && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isMastered
                  ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)]'
                  : 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {isMastered ? (
                    <div className="w-9 h-9 rounded-full bg-[#10b981]/20 text-[#10b981] flex items-center justify-center flex-shrink-0">
                      <Sparkles size={18} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={18} />
                    </div>
                  )}
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isMastered ? 'text-[#10b981]' : 'text-[#f59e0b]'
                      }`}
                    >
                      {isMastered
                        ? `Topic Mastered! Score: ${scorePct}% (${correctCount}/${questions.length})`
                        : `Review Recommended. Score: ${scorePct}% (${correctCount}/${questions.length})`}
                    </h4>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">
                      {isMastered
                        ? 'Your node now shines with vibrant emerald brightness in the Knowledge Tree!'
                        : 'Score below 70% threshold. Socratic hints below pinpoint areas to reinforce before retrying.'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-lg font-extrabold px-3 py-1 rounded-lg ${
                    isMastered
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                  }`}
                >
                  {scorePct}%
                </span>
              </div>

              {/* Unlocked Downstream Topics Notification */}
              {isMastered && unlockedNames.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-[rgba(16,185,129,0.2)] flex items-start gap-2 text-xs text-[#10b981]">
                  <Unlock size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Unlocked dependent topics: </span>
                    <span>{unlockedNames.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {questions.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx]
              const isCorrect = selectedOpt === q.correct_index
              const badge = BLOOM_BADGES[q.bloom_level] || BLOOM_BADGES.understand

              return (
                <div
                  key={q.id || qIdx}
                  className="p-4 rounded-xl bg-[#1a1a1e] border border-[rgba(255,255,255,0.06)] space-y-3"
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        color: badge.color,
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-[#71717a] font-mono">
                      Q{qIdx + 1} of {questions.length}
                    </span>
                  </div>

                  {/* Question text */}
                  <p className="text-[13px] font-semibold text-[#f4f4f5] leading-relaxed">
                    {q.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx
                      const isThisCorrect = optIdx === q.correct_index

                      let optStyle = 'border-[rgba(255,255,255,0.08)] bg-[#202024] text-[#d4d4d8] hover:border-[rgba(255,255,255,0.2)] hover:bg-[#25252a]'
                      if (submitted) {
                        if (isThisCorrect) {
                          optStyle = 'border-[#10b981] bg-[rgba(16,185,129,0.12)] text-[#10b981] font-medium'
                        } else if (isSelected && !isThisCorrect) {
                          optStyle = 'border-[#ef4444] bg-[rgba(239,68,68,0.12)] text-[#ef4444]'
                        } else {
                          optStyle = 'border-transparent bg-[#1e1e22] text-[#71717a] opacity-50'
                        }
                      } else if (isSelected) {
                        optStyle = 'border-[#38bdf8] bg-[rgba(56,189,248,0.12)] text-white font-medium ring-1 ring-[#38bdf8]'
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelect(qIdx, optIdx)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${optStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                                isSelected
                                  ? 'border-transparent bg-[#38bdf8] text-black'
                                  : 'border-[rgba(255,255,255,0.15)] text-[#8e8e93]'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </div>

                          {submitted && isThisCorrect && (
                            <CheckCircle2 size={14} className="text-[#10b981] flex-shrink-0" />
                          )}
                          {submitted && isSelected && !isThisCorrect && (
                            <AlertCircle size={14} className="text-[#ef4444] flex-shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Feedback Explanation / Socratic Hint after submit */}
                  {submitted && (
                    <div className="mt-3 p-3 rounded-xl bg-[#232328] border border-[rgba(255,255,255,0.06)] space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[#f2f2f7]">
                        <HelpCircle size={13} className="text-[#38bdf8]" />
                        <span>Analysis & Key Insight:</span>
                      </div>
                      <p className="text-[#a1a1aa] leading-relaxed">
                        {q.explanation}
                      </p>
                      {!isCorrect && q.socratic_hint && (
                        <div className="pt-1 text-[#f59e0b] flex items-start gap-1.5">
                          <span className="font-semibold flex-shrink-0">Socratic Hint:</span>
                          <span className="italic">{q.socratic_hint}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(255,255,255,0.08)] bg-[#1c1c20]">
          {/* Chapter study link if available */}
          {topic.chapter_link ? (
            <button
              onClick={() => {
                onClose()
                navigate(`/chapter/${topic.chapter_link}`)
              }}
              className="flex items-center gap-2 text-xs font-semibold text-[#8e8e93] hover:text-[#f2f2f7] transition-colors"
            >
              <BookOpen size={14} />
              <span>Review Chapter {topic.chapter_link}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {submitted ? (
              <>
                {!isMastered && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#f2f2f7] bg-[#2a2a30] hover:bg-[#34343c] transition-all"
                  >
                    <RotateCcw size={13} />
                    <span>Retry Quiz</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#10b981] hover:bg-[#059669] transition-all shadow-lg shadow-[#10b981]/20"
                >
                  <span>Continue</span>
                  <ArrowRight size={13} />
                </button>
              </>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  allAnswered && !submitting
                    ? 'bg-[#38bdf8] text-black hover:bg-[#0ea5e9] shadow-lg shadow-[#38bdf8]/20 cursor-pointer'
                    : 'bg-[#2a2a30] text-[#71717a] cursor-not-allowed opacity-60'
                }`}
              >
                <span>{submitting ? 'Evaluating...' : 'Submit Answers'}</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
