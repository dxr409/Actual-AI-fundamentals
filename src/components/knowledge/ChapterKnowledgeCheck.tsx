import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Network,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Unlock,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { useKnowledgeGraphStore } from '@/lib/knowledgeGraphStore'
import { useProgressStore } from '@/lib/store'
import TopicQuizModal from './TopicQuizModal'

const CHAPTER_TOPIC_MAP: Record<number, string> = {
  // Part II: Foundations
  101: 'llm_core',
  102: 'nlp_rnn',
  103: 'rag_systems',
  104: 'math_foundations',
  // Part III: How models work
  105: 'attention_mechanism',
  106: 'mlp',
  107: 'transformer_arch',
  108: 'pretraining',
  109: 'backpropagation',
  110: 'gradient_descent',
  111: 'rlhf_alignment',
  // Part IV: Build your model
  9: 'transformer_arch',
  10: 'llm_core',
  11: 'pretraining',
  12: 'gradient_descent',
  13: 'tool_calling',
  14: 'sft_lora',
  15: 'sft_lora',
  16: 'autonomous_agents',
}

export default function ChapterKnowledgeCheck({ chapterId }: { chapterId: number }) {
  const navigate = useNavigate()
  const topicId = CHAPTER_TOPIC_MAP[chapterId]
  const nodes = useKnowledgeGraphStore((s) => s.nodes)
  const markComplete = useProgressStore((s) => s.markComplete)

  const [modalOpen, setModalOpen] = useState(false)

  if (!topicId) return null

  const topic = nodes.find((n) => n.id === topicId)
  if (!topic) return null

  const isMastered = topic.status === 'mastered'
  const isReview = topic.status === 'needs_review'
  const isUnlocked = topic.status === 'unlocked'
  const isLocked = topic.status === 'locked'

  return (
    <div className="mt-14 p-5 rounded-2xl bg-[#161618] border border-[rgba(255,255,255,0.09)] shadow-xl space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center border"
            style={{
              background: isMastered
                ? 'rgba(16, 185, 129, 0.15)'
                : isReview
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(246, 233, 199, 0.14)',
              borderColor: isMastered
                ? 'rgba(16, 185, 129, 0.3)'
                : isReview
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(246, 233, 199, 0.3)',
              color: isMastered ? '#10b981' : isReview ? '#ef4444' : '#f6e9c7',
            }}
          >
            <Network size={15} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight uppercase">
              Tree of Knowledge • Validation
            </h4>
            <p className="text-[11px] text-[#8e8e93]">
              Linked Node: <span className="font-semibold text-[#f6e9c7]">{topic.title}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/graph?topic=${topic.id}`)}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#a8a29e] hover:text-[#f6e9c7] transition-colors cursor-pointer"
        >
          <span>Open in Graph</span>
          <ExternalLink size={11} />
        </button>
      </div>

      {/* ── Status Card ── */}
      <div className="p-3.5 rounded-xl bg-[#1c1c1f] border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {isMastered && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
                <CheckCircle2 size={11} /> Node Mastered ({topic.mastery_score}%)
              </span>
            )}
            {isReview && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 flex items-center gap-1">
                <AlertCircle size={11} /> Review Needed ({topic.mastery_score}%)
              </span>
            )}
            {isUnlocked && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f6e9c7]/15 text-[#f6e9c7] border border-[#f6e9c7]/30 flex items-center gap-1">
                <Unlock size={11} /> Ready to Test
              </span>
            )}
            {isLocked && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#3f3f46]/30 text-[#a1a1aa] border border-[#3f3f46] flex items-center gap-1">
                <Lock size={11} /> Prerequisites Locked
              </span>
            )}
            <span className="text-[10px] uppercase font-semibold text-[#71717a]">
              {topic.category}
            </span>
          </div>

          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            {isMastered
              ? 'You have demonstrated mastery of this concept. Downstream nodes have been illuminated.'
              : isReview
              ? 'Your previous quiz score was below 70%. Retest to illuminate this node.'
              : isUnlocked
              ? "Complete the 3-question Bloom's taxonomy check to illuminate this node and unlock dependent topics."
              : 'Complete prior prerequisites in the Tree of Knowledge to unlock this verification.'}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isLocked ? (
            <button
              onClick={() => navigate('/graph')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#a8a29e] bg-[#27272c] hover:text-white transition-colors cursor-pointer"
            >
              <Lock size={12} />
              <span>View Prerequisites</span>
            </button>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#1a1813] bg-[#f6e9c7] hover:bg-[#ebd6a1] shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles size={13} />
              <span>{isMastered ? 'Retake Quiz' : 'Take Validation Quiz'}</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      {modalOpen && (
        <TopicQuizModal
          topic={topic}
          onClose={() => {
            setModalOpen(false)
            const updatedTopic = useKnowledgeGraphStore.getState().nodes.find((n) => n.id === topicId)
            if (updatedTopic?.status === 'mastered') {
              markComplete(chapterId)
            }
          }}
        />
      )}
    </div>
  )
}
