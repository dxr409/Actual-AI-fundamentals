import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProgressStore, useUIStore } from '@/lib/store'
import { CHAPTERS, Chapter, getChapterDefaultSections } from '@/content/chapters'
import { ArrowLeft, ArrowRight, CheckCircle2, Pencil } from 'lucide-react'

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
      <div className="flex items-center justify-center h-full text-[#8e8e93]">
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
    <div className="max-w-3xl mx-auto px-10 py-12 animate-fade-in select-text">
      {/* Chapter Eyebrow & Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          {/* Eyebrow in purple/magenta */}
          <span
            className="text-[11px] font-bold tracking-[0.18em] uppercase"
            style={{ color: '#bf5af2' }}
          >
            Chapter {chapter.id}
          </span>

          <div className="flex items-center gap-2">
            {edited && (
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  background: 'rgba(191, 90, 242, 0.15)',
                  color: '#bf5af2',
                  border: '1px solid rgba(191, 90, 242, 0.3)',
                }}
              >
                Edited locally
              </span>
            )}
            <button
              onClick={() => setEditorOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer text-[#e5e5ea] hover:text-white bg-[#1e1e22] hover:bg-[#28282e] border border-[rgba(255,255,255,0.08)]"
            >
              <Pencil size={12} />
              <span>Edit page</span>
            </button>
          </div>
        </div>

        {/* Large Bold Chapter Title */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#ffffff] mb-4">
          {chapter.title}
        </h1>

        {/* Italicized Lead Paragraph */}
        {chapter.subtitle && (
          <p className="text-base italic leading-relaxed text-[#a1a1a6] max-w-2xl">
            {chapter.subtitle}
          </p>
        )}
      </div>

      {/* Chapter Body Sections with Socratic Micro-Explanation Selection HUD */}
      <SocraticSelectionHUD chapterId={chapterId}>
        <div className="prose-qairu space-y-12">
          {sections.map((section, i) => {
            // Check if this section is RNN (Section 2) in Chapter 1
            const isRNNSection =
              chapterId === 1 &&
              (section.title.toLowerCase().includes('recurrent') ||
                section.title.toLowerCase().includes('rnn') ||
                i === 2)

            return (
              <div key={i} className="space-y-12">
                <section id={`section-${i}`} className="scroll-mt-16">
                  <h2>{section.title}</h2>
                  <div dangerouslySetInnerHTML={{ __html: section.body }} />
                </section>

                {/* Trigram Language Model Explorer: Placed between RNN and Why This Matters */}
                {isRNNSection && (
                  <div className="not-prose my-10">
                    <TrigramLanguageModel />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SocraticSelectionHUD>

      {/* ── Interactive Playground Window (For Chapters 2+) ── */}
      {playgroundType && chapterId !== 1 && (
        <div className="mt-14">
          <PlaygroundRouter type={playgroundType} />
        </div>
      )}

      {/* ── Training the Model with Generate Button (For Chapter 1) ── */}
      {chapterId === 1 && (
        <div className="mt-14 space-y-6">
          <ModelTrainingWindow />
          <ChapterNotesArea chapterId={chapterId} />
        </div>
      )}

      {/* ── Adaptive Tree of Knowledge Validation Check ── */}
      <ChapterKnowledgeCheck chapterId={chapterId} />

      {/* Complete Button */}
      {!isDone && (
        <div className="mt-14 pt-8 border-t border-[rgba(255,255,255,0.07)]">
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-lg hover:opacity-90"
            style={{ background: '#bf5af2' }}
          >
            <CheckCircle2 size={15} />
            <span>Mark Complete — {nextCh ? 'Next Chapter' : 'Finish Course'}</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="mt-10 flex items-center justify-between">
        {prevCh ? (
          <Link
            to={`/chapter/${prevCh.id}`}
            className="btn-secondary"
          >
            <ArrowLeft size={13} />
            <span>Previous Chapter</span>
          </Link>
        ) : (
          <div />
        )}
        {nextCh && (
          <Link
            to={`/chapter/${nextCh.id}`}
            className="btn-secondary ml-auto"
          >
            <span>Next Chapter</span>
            <ArrowRight size={13} />
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
