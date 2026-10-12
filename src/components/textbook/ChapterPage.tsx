import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProgressStore, useUIStore } from '@/lib/store'
import { CHAPTERS, Chapter, getChapterDefaultSections } from '@/content/chapters'
import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, Hash } from 'lucide-react'

// Interactive Playgrounds
import NggramPlayground from '@/components/playgrounds/NggramPlayground'
import TokenizerPlayground from '@/components/playgrounds/TokenizerPlayground'
import EmbeddingsPlayground from '@/components/playgrounds/EmbeddingsPlayground'
import TransformerBlockPlayground from '@/components/playgrounds/TransformerBlockPlayground'
import TransformerSizePlayground from '@/components/playgrounds/TransformerSizePlayground'
import LossPlayground from '@/components/playgrounds/LossPlayground'
import { EditorPanel, loadEdits, hasEdits } from './ChapterEditor'
import TrigramLanguageModel from './TrigramLanguageModel'
import ModelTrainingWindow from './ModelTrainingWindow'
import ChapterNotesArea from './ChapterNotesArea'
import SocraticSelectionHUD from '@/components/socratic/SocraticSelectionHUD'
import ChapterKnowledgeCheck from '@/components/knowledge/ChapterKnowledgeCheck'

function getChapterContent(id: number, meta?: Chapter) {
  return {
    sections: getChapterDefaultSections(id),
  }
}

function PlaygroundRouter({ type }: { type: string }) {
  if (type === 'tokenizer')           return <TokenizerPlayground />
  if (type === 'attention')           return <TransformerBlockPlayground />
  if (type === 'transformer-block')   return <TransformerBlockPlayground />
  if (type === 'size')                return <TransformerSizePlayground />
  if (type === 'loss')                return <LossPlayground />
  if (type === 'embeddings')          return <EmbeddingsPlayground />
  if (type === 'ngram')               return <NggramPlayground />
  return null
}

export default function ChapterPage() {
  const { id } = useParams<{ id: string }>()
  const chapterId = Number(id) || 1
  const { t } = useTranslation()
  const navigate = useNavigate()
  const markComplete = useProgressStore((s) => s.markComplete)
  const completed = useProgressStore((s) => s.completed)
  const setCurrentChapter = useUIStore((s) => s.setCurrentChapter)
  const activeSection = useUIStore((s) => s.activeSection)
  const setActiveSection = useUIStore((s) => s.setActiveSection)

  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  const baseContent = getChapterContent(chapterId, chapter)

  // Local state for this chapter's sections (isolated by chapterId)
  const [sections, setSections] = useState(() => loadEdits(chapterId, baseContent.sections))
  const [editorOpen, setEditorOpen] = useState(false)

  // Re-sync when navigating to another chapter
  useEffect(() => {
    const raw = getChapterContent(chapterId, chapter)
    setSections(loadEdits(chapterId, raw.sections))
    setEditorOpen(false)
    setCurrentChapter(chapterId)
    setActiveSection(0)
  }, [chapterId])

  // Scroll observer to update active subtopic in sidebar as student scrolls
  useEffect(() => {
    const sectionElements = sections.map((_, i) => document.getElementById(`section-${i}`))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexStr = entry.target.id.replace('section-', '')
            const idx = parseInt(indexStr)
            if (!isNaN(idx)) {
              setActiveSection(idx)
            }
          }
        })
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1,
      }
    )

    sectionElements.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  const prevCh = CHAPTERS.find((c) => c.id === chapterId - 1)
  const nextCh = CHAPTERS.find((c) => c.id === chapterId + 1)
  const isDone = !!completed[chapterId]
  const edited = hasEdits(chapterId)

  if (!chapter) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Chapter not found.
      </div>
    )
  }

  const handleComplete = () => {
    markComplete(chapterId)
    if (nextCh) navigate(`/chapter/${nextCh.id}`)
  }

  const playgroundType =
    chapter.playgroundType ||
    (chapterId === 4 ? 'attention' : chapterId === 5 ? 'size' : chapterId === 6 ? 'loss' : null)

  return (
    <div className="w-full max-w-4xl mx-auto py-4 select-text">
      {/* Nextra Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          Documentation
        </Link>
        <span>/</span>
        <span className="text-gray-400 dark:text-neutral-500">{chapter.partTitle}</span>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200 font-semibold truncate">
          {chapter.title}
        </span>
      </div>

      {/* Chapter Title & Action Bar */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {chapter.title}
          </h1>

          <div className="flex items-center gap-2 flex-shrink-0 pt-1">
            {edited && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                Edited locally
              </span>
            )}
            <button
              onClick={() => setEditorOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-gray-200/80 dark:border-neutral-700"
            >
              <Pencil size={12} />
              <span>Edit page</span>
            </button>
          </div>
        </div>

        {/* Subtitle / Lead Paragraph */}
        {chapter.subtitle && (
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {chapter.subtitle}
          </p>
        )}
      </div>

      {/* Chapter Body Sections with Socratic Micro-Explanation Selection HUD */}
      <SocraticSelectionHUD chapterId={chapterId}>
        <div className="prose-qairu space-y-10">
          {sections.map((section, i) => {
            const isRNNSection =
              chapterId === 1 &&
              (section.title.toLowerCase().includes('recurrent') ||
                section.title.toLowerCase().includes('rnn') ||
                i === 2)

            return (
              <div key={i} className="space-y-8">
                <section id={`section-${i}`} className="scroll-mt-24">
                  <h2 className="group flex items-center justify-between">
                    <span>{section.title}</span>
                    <a
                      href={`#section-${i}`}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-neutral-500 hover:text-blue-500 transition-opacity"
                      aria-label="Permalink"
                    >
                      <Hash size={18} />
                    </a>
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: section.body }} />
                </section>

                {/* Trigram Language Model Explorer (Chapter 1) */}
                {isRNNSection && (
                  <div className="not-prose my-8 p-1 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800">
                    <TrigramLanguageModel />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SocraticSelectionHUD>

      {/* ── Interactive Playground Window (Chapters 2+) ── */}
      {playgroundType && chapterId !== 1 && (
        <div className="mt-12 p-1 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800">
          <PlaygroundRouter type={playgroundType} />
        </div>
      )}

      {/* ── Training the Model with Generate Button (Chapter 1) ── */}
      {chapterId === 1 && (
        <div className="mt-12 space-y-6">
          <div className="p-1 rounded-xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800">
            <ModelTrainingWindow />
          </div>
          <ChapterNotesArea chapterId={chapterId} />
        </div>
      )}

      {/* ── Adaptive Tree of Knowledge Validation Check ── */}
      <div className="mt-12">
        <ChapterKnowledgeCheck chapterId={chapterId} />
      </div>

      {/* Mark Complete Action */}
      {!isDone && (
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
          >
            <CheckCircle2 size={15} />
            <span>Mark Complete — {nextCh ? 'Next Chapter' : 'Finish Course'}</span>
          </button>
        </div>
      )}

      {/* Nextra Signature Bottom Pagination Cards */}
      <div className="mt-14 pt-8 border-t border-gray-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevCh ? (
          <Link
            to={`/chapter/${prevCh.id}`}
            className="flex flex-col p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-[#161618] hover:bg-blue-50/20 dark:hover:bg-neutral-800/40 transition-all group"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
              {prevCh.title}
            </span>
          </Link>
        ) : (
          <Link
            to="/"
            className="flex flex-col p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-[#161618] hover:bg-blue-50/20 dark:hover:bg-neutral-800/40 transition-all group"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
              Introduction
            </span>
          </Link>
        )}

        {nextCh && (
          <Link
            to={`/chapter/${nextCh.id}`}
            className="flex flex-col items-end p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-white dark:bg-[#161618] hover:bg-blue-50/20 dark:hover:bg-neutral-800/40 transition-all group text-right"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
              Next
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
              {nextCh.title}
            </span>
          </Link>
        )}
      </div>

      {/* Editor Drawer */}
      {editorOpen && (
        <EditorPanel
          chapterId={chapterId}
          sections={sections}
          activeSectionIndex={activeSection}
          onChange={(updated) => setSections(updated)}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}
