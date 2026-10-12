import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, useProgressStore } from '@/lib/store'
import { CHAPTERS } from '@/content/chapters'
import { ArrowRight, Pencil, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'
import {
  WelcomeContent,
  loadWelcomeEdits,
  hasWelcomeEdits,
  WelcomeEditorPanel,
} from './WelcomeEditor'
import CurriculumRoadmap from '@/components/textbook/CurriculumRoadmap'

export default function WelcomePage() {
  const user = useAuthStore((s) => s.user)
  const completed = useProgressStore((s) => s.completed)
  const doneCount = Object.values(completed).filter(Boolean).length
  const pct = Math.round((doneCount / CHAPTERS.length) * 100)
  const nextChapter = CHAPTERS.find((ch) => !completed[ch.id]) ?? CHAPTERS[CHAPTERS.length - 1]

  const [welcomeContent, setWelcomeContent] = useState<WelcomeContent>(loadWelcomeEdits)
  const [editorOpen, setEditorOpen] = useState(false)
  const edited = hasWelcomeEdits()

  return (
    <div className="w-full max-w-4xl mx-auto py-4 select-text animate-fade-in">
      {/* Nextra Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
        <span>Documentation</span>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200 font-semibold">Introduction</span>
      </div>

      {/* Top action bar with edit button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {edited && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              Edited locally
            </span>
          )}
        </div>
        <button
          onClick={() => setEditorOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-gray-200/80 dark:border-neutral-700"
        >
          <Pencil size={12} />
          <span>Edit page</span>
        </button>
      </div>

      {/* Greeting & Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
          Introduction
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          Welcome to <strong className="text-gray-900 dark:text-white">QAIRU AI Platform</strong>, {user?.name ? `${user.name}!` : 'student!'} This is an interactive textbook and learning laboratory designed to take you from the fundamental mathematics of prediction to training and aligning state-of-the-art Transformer architectures.
        </p>
        {welcomeContent.introNotice && (
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 text-sm text-blue-900 dark:text-blue-300 flex items-start gap-3">
            <Sparkles size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>{welcomeContent.introNotice}</div>
          </div>
        )}
      </div>

      {/* Progress & Overview Card (Nextra Style) */}
      <div className="p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#161618] shadow-xs mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Overall Learning Progress</span>
          <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {doneCount} of {CHAPTERS.length} chapters completed
        </p>
      </div>

      {/* Start / Continue Button */}
      <div className="mb-10">
        <Link
          to={`/chapter/${nextChapter.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
        >
          <span>{doneCount === 0 ? 'Start Chapter 1' : 'Continue Reading'}</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Dynamic Curriculum Roadmap */}
      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-gray-200 dark:border-neutral-800">
          Curriculum Overview
        </h2>
        <CurriculumRoadmap currentChapterId={nextChapter.id} />
      </div>

      {/* Nextra Signature Bottom Pagination */}
      <div className="mt-14 pt-8 border-t border-gray-200 dark:border-neutral-800 flex justify-end">
        <Link
          to={`/chapter/${nextChapter.id}`}
          className="flex flex-col items-end p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-[#161618] hover:bg-blue-50/20 dark:hover:bg-neutral-800/40 transition-all group text-right min-w-[220px]"
        >
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
            Next
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
            {nextChapter.title}
          </span>
        </Link>
      </div>

      {/* Welcome page editor modal */}
      {editorOpen && (
        <WelcomeEditorPanel
          content={welcomeContent}
          onChange={(updated) => setWelcomeContent(updated)}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}
