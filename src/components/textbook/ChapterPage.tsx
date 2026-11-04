import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProgressStore, useUIStore } from '@/lib/store'
import { CHAPTERS, Chapter, getChapterDefaultSections } from '@/content/chapters'
import { ArrowLeft, ArrowRight, CheckCircle2, Pencil, Hash } from 'lucide-react'

// Interactive Playgrounds (AI Fundamentals & Legacy)
import NggramPlayground from '@/components/playgrounds/NggramPlayground'
import TokenizerPlayground from '@/components/playgrounds/TokenizerPlayground'
import EmbeddingsPlayground from '@/components/playgrounds/EmbeddingsPlayground'
import TransformerBlockPlayground from '@/components/playgrounds/TransformerBlockPlayground'
import TransformerSizePlayground from '@/components/playgrounds/TransformerSizePlayground'
import LossPlayground from '@/components/playgrounds/LossPlayground'
import SearchAlgorithmsPlayground from '@/components/playgrounds/SearchAlgorithmsPlayground'
import AdversarialSearchPlayground from '@/components/playgrounds/AdversarialSearchPlayground'
import ProbabilityBayesianPlayground from '@/components/playgrounds/ProbabilityBayesianPlayground'
import ClassicalMLNeuralPlayground from '@/components/playgrounds/ClassicalMLNeuralPlayground'

// Language Model Builder Interactive Windows
import LMBNGramPlayground, {
  NGramCountTrainer,
  NGramTemperatureSampler,
} from '@/components/playgrounds/lmb/LMBNGramPlayground'
import LMBTokenizerPlayground, {
  BPEMergeTokenizer,
} from '@/components/playgrounds/lmb/LMBTokenizerPlayground'
import LMBEmbeddingsPlayground, {
  EmbeddingSpaceExplorer,
  EmbeddingVectorArithmetic,
} from '@/components/playgrounds/lmb/LMBEmbeddingsPlayground'
import LMBTransformerPlayground, {
  TransformerPipelineStages,
  AttentionMatrixExplorer,
} from '@/components/playgrounds/lmb/LMBTransformerPlayground'
import LMBBlockPlayground, {
  ActivationFunctionLab,
  TransformerBlockInspector,
} from '@/components/playgrounds/lmb/LMBBlockPlayground'
import LMBSizeSandboxPlayground, {
  ModelSizeSandbox,
} from '@/components/playgrounds/lmb/LMBSizeSandboxPlayground'
import LMBCleaningSplitPlayground, {
  DataCleaningDiff,
  TrainValSplitPacker,
} from '@/components/playgrounds/lmb/LMBCleaningSplitPlayground'
import LMBLearningDemoPlayground, {
  WatchModelLearnDemo,
  CrossEntropyCliff,
  ManualFiveKnobsTrainer,
  GradientDescentLandscape,
} from '@/components/playgrounds/lmb/LMBLearningDemoPlayground'
import LMBBehaviorTuningPlayground, {
  SFTByExampleLab,
  DPOPreferenceLab,
} from '@/components/playgrounds/lmb/LMBBehaviorTuningPlayground'
import LMBWorkbenchPlayground, {
  WorkbenchMode,
} from '@/components/playgrounds/lmb/LMBWorkbenchPlayground'
import {
  MLPMultistepTutorial,
  ColabNotebookCard,
} from '@/components/playgrounds/lmb/LMBMLPTutorialPlayground'

import { EditorPanel, loadEdits, hasEdits } from './ChapterEditor'
import TrigramLanguageModel from './TrigramLanguageModel'
import ModelTrainingWindow from './ModelTrainingWindow'
import ChapterNotesArea from './ChapterNotesArea'
import SocraticSelectionHUD from '@/components/socratic/SocraticSelectionHUD'
import ChapterKnowledgeCheck from '@/components/knowledge/ChapterKnowledgeCheck'
import { ENABLE_EDITING } from '@/lib/editMode'

function getChapterContent(id: number, _meta?: Chapter) {
  return {
    sections: getChapterDefaultSections(id),
  }
}

function InlineInteractiveRouter({ id }: { id: string }) {
  switch (id) {
    case 'ngram-count-trainer':
      return <NGramCountTrainer />
    case 'ngram-temperature-sampler':
      return <NGramTemperatureSampler />
    case 'bpe-merge-tokenizer':
      return <BPEMergeTokenizer />
    case 'embedding-space-explorer':
      return <EmbeddingSpaceExplorer />
    case 'embedding-vector-arithmetic':
      return <EmbeddingVectorArithmetic />
    case 'transformer-pipeline':
      return <TransformerPipelineStages />
    case 'attention-matrix-explorer':
      return <AttentionMatrixExplorer />
    case 'activation-function-lab':
      return <ActivationFunctionLab />
    case 'transformer-block-inspector':
      return <TransformerBlockInspector />
    case 'model-size-sandbox':
      return <ModelSizeSandbox />
    case 'data-cleaning-diff':
      return <DataCleaningDiff />
    case 'train-val-split-packer':
      return <TrainValSplitPacker />
    case 'watch-model-learn':
      return <WatchModelLearnDemo />
    case 'cross-entropy-cliff':
      return <CrossEntropyCliff />
    case 'manual-five-knobs':
      return <ManualFiveKnobsTrainer />
    case 'gradient-descent-landscape':
      return <GradientDescentLandscape />
    case 'sft-by-example':
      return <SFTByExampleLab />
    case 'dpo-preference-lab':
      return <DPOPreferenceLab />
    case 'mlp-multistep-tutorial':
      return <MLPMultistepTutorial />
    case 'colab-link-bigram':
      return (
        <ColabNotebookCard
          storageId="bigram-ch101"
          defaultTitle="Kazakh Names Bi-Gram Language Model — Google Colab"
          defaultDescription="Run the full Kazakh Names dataset loader, bi-gram probability matrix, and multinomial name sampler in Google Colab."
          defaultUrl="https://colab.research.google.com/"
        />
      )
    case 'colab-link-mlp':
      return (
        <ColabNotebookCard
          storageId="mlp-ch102"
          defaultTitle="Kazakh Names MLP Language Model (Bengio et al.) — Google Colab"
          defaultDescription="Train the end-to-end character-level MLP (Embeddings, Concatenation, W1/b1, BatchNorm, tanh, Logits & Cross-Entropy Loss) in Google Colab."
          defaultUrl="https://colab.research.google.com/"
        />
      )
    default:
      return null
  }
}

function renderSectionBodyWithInteractives(html: string) {
  const parts = html.split(/<!-- INTERACTIVE:([a-z0-9-]+) -->/g)
  if (parts.length === 1) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  const elements: React.ReactNode[] = []
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i].trim()) {
        elements.push(<div key={`html-${i}`} dangerouslySetInnerHTML={{ __html: parts[i] }} />)
      }
    } else {
      const interactiveId = parts[i]
      elements.push(
        <div key={`interactive-${i}-${interactiveId}`} className="not-prose my-6">
          <InlineInteractiveRouter id={interactiveId} />
        </div>
      )
    }
  }
  return <>{elements}</>
}

function PlaygroundRouter({ type }: { type: string }) {
  if (type === 'search-algorithms')   return <SearchAlgorithmsPlayground />
  if (type === 'adversarial-search')  return <AdversarialSearchPlayground />
  if (type === 'probability-bayesian') return <ProbabilityBayesianPlayground />
  if (type === 'classical-ml')        return <ClassicalMLNeuralPlayground />
  if (type === 'tokenizer')           return <TokenizerPlayground />
  if (type === 'attention')           return <TransformerBlockPlayground />
  if (type === 'transformer-block')   return <TransformerBlockPlayground />
  if (type === 'size')                return <TransformerSizePlayground />
  if (type === 'loss')                return <LossPlayground />
  if (type === 'embeddings')          return <EmbeddingsPlayground />
  if (type === 'ngram')               return <NggramPlayground />
  if (type === 'lmb-ngram')           return <LMBNGramPlayground />
  if (type === 'lmb-tokenizer')       return <LMBTokenizerPlayground />
  if (type === 'lmb-embeddings')      return <LMBEmbeddingsPlayground />
  if (type === 'lmb-attention')       return <LMBTransformerPlayground />
  if (type === 'lmb-block')           return <LMBBlockPlayground />
  if (type === 'lmb-size')            return <LMBSizeSandboxPlayground />
  if (type === 'lmb-data')            return <LMBCleaningSplitPlayground />
  if (type === 'lmb-learning')        return <LMBLearningDemoPlayground />
  if (type === 'lmb-behavior')        return <LMBBehaviorTuningPlayground />
  if (type === 'lmb-workbench')       return <LMBWorkbenchPlayground />
  if (type.startsWith('wb-'))         return <LMBWorkbenchPlayground mode={type as WorkbenchMode} />
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
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
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

  const chIndex = CHAPTERS.findIndex((c) => c.id === chapterId)
  const prevCh = chIndex > 0 ? CHAPTERS[chIndex - 1] : undefined
  const nextCh = chIndex >= 0 && chIndex < CHAPTERS.length - 1 ? CHAPTERS[chIndex + 1] : undefined
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

  const hasInlineInteractives = sections.some((s) =>
    /<!-- INTERACTIVE:([a-z0-9-]+) -->/.test(s.body)
  )

  const playgroundType =
    chapter.playgroundType ||
    (chapterId === 4 ? 'attention' : chapterId === 5 ? 'size' : chapterId === 6 ? 'loss' : null)

  return (
    <div className="w-full max-w-4xl mx-auto py-4 select-text">
      {/* Chapter Title & Action Bar */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {chapter.title}
          </h1>

          {ENABLE_EDITING && (
            <div className="flex items-center gap-2 flex-shrink-0 pt-1">
              {edited && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-[#f6e9c7]/30 dark:bg-[#f6e9c7]/15 text-[#1a1813] dark:text-[#f6e9c7] border border-[#f6e9c7]/40">
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
          )}
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
                      className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-neutral-500 hover:text-[#a1782e] dark:hover:text-[#f6e9c7] transition-opacity"
                      aria-label="Permalink"
                    >
                      <Hash size={18} />
                    </a>
                  </h2>
                  {renderSectionBodyWithInteractives(section.body)}
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

      {/* ── Interactive Playground Window (for chapters without inline markers, e.g. AI Fundamentals & Build Your Model) ── */}
      {playgroundType && chapterId !== 1 && !hasInlineInteractives && (
        <div className="mt-10">
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

      {/* Mark Complete Action with #f6e9c7 accent */}
      {!isDone && (
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-[#1a1813] bg-[#f6e9c7] hover:bg-[#ebd6a1] shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <CheckCircle2 size={15} />
            <span>Mark Complete — {nextCh ? 'Next Chapter' : 'Finish Course'}</span>
          </button>
        </div>
      )}

      {/* Nextra Signature Bottom Pagination Cards with #f6e9c7 hover accents */}
      <div className="mt-14 pt-8 border-t border-gray-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevCh ? (
          <Link
            to={`/chapter/${prevCh.id}`}
            className="flex flex-col p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-[#f6e9c7]/70 dark:hover:border-[#f6e9c7]/70 bg-white dark:bg-[#161618] hover:bg-[#f6e9c7]/10 dark:hover:bg-[#f6e9c7]/5 transition-all group"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-stone-900 dark:group-hover:text-[#f6e9c7] truncate">
              {prevCh.title}
            </span>
          </Link>
        ) : (
          <Link
            to="/"
            className="flex flex-col p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-[#f6e9c7]/70 dark:hover:border-[#f6e9c7]/70 bg-white dark:bg-[#161618] hover:bg-[#f6e9c7]/10 dark:hover:bg-[#f6e9c7]/5 transition-all group"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
              <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
              Previous
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-stone-900 dark:group-hover:text-[#f6e9c7] truncate">
              Introduction
            </span>
          </Link>
        )}

        {nextCh && (
          <Link
            to={`/chapter/${nextCh.id}`}
            className="flex flex-col items-end p-4 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-[#f6e9c7]/70 dark:hover:border-[#f6e9c7]/70 bg-white dark:bg-[#161618] hover:bg-[#f6e9c7]/10 dark:hover:bg-[#f6e9c7]/5 transition-all group text-right"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
              Next
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-stone-900 dark:group-hover:text-[#f6e9c7] truncate">
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
