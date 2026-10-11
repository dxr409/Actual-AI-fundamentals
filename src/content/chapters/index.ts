import { ch1 } from './ch1'
import { ch2 } from './ch2'
import { ch3 } from './ch3'
import { ch4 } from './ch4'
import { ch5 } from './ch5'
import { ch6 } from './ch6'
import { ch7 } from './ch7'
import { ch8 } from './ch8'
import { ch9 } from './ch9'
import { ch10 } from './ch10'
import { ch11 } from './ch11'
import { ch12 } from './ch12'
import { ch13 } from './ch13'
import { ch14 } from './ch14'
import { ch15 } from './ch15'
import { ch16 } from './ch16'

export interface Chapter {
  id: number
  slug: string
  title: string
  subtitle: string
  partNumber: string  // e.g. 'PART I'
  partTitle: string   // e.g. 'Foundations'
  readingTime: number // minutes
  hasPlayground: boolean
  playgroundType?: string
  isAvailable?: boolean
}

export const CHAPTERS: Chapter[] = [
  // ── PART I: Foundations ──
  {
    id: 1,
    slug: 'language-models',
    title: 'What is a language model?',
    subtitle: 'Next-word prediction, n-grams, and the foundations of modern AI',
    partNumber: 'PART I',
    partTitle: 'Foundations',
    readingTime: 12,
    hasPlayground: true,
    playgroundType: 'ngram',
    isAvailable: true,
  },
  {
    id: 2,
    slug: 'tokenization',
    title: 'Tokenization',
    subtitle: 'Turning raw human text into sequences of numbers',
    partNumber: 'PART I',
    partTitle: 'Foundations',
    readingTime: 10,
    hasPlayground: true,
    playgroundType: 'tokenizer',
    isAvailable: true,
  },
  {
    id: 3,
    slug: 'embeddings',
    title: 'Embeddings',
    subtitle: 'Mapping words to geometric points in high-dimensional vector space',
    partNumber: 'PART I',
    partTitle: 'Foundations',
    readingTime: 11,
    hasPlayground: true,
    playgroundType: 'embeddings',
    isAvailable: true,
  },

  // ── PART II: How models work ──
  {
    id: 4,
    slug: 'attention',
    title: 'Anatomy of a Transformer',
    subtitle: 'Self-attention mechanisms, multi-head routing, and building blocks',
    partNumber: 'PART II',
    partTitle: 'How models work',
    readingTime: 14,
    hasPlayground: true,
    playgroundType: 'attention',
    isAvailable: true,
  },
  {
    id: 5,
    slug: 'transformer',
    title: 'Training data',
    subtitle: 'Web text corpora, filtering pipelines, deduplication, and quality',
    partNumber: 'PART II',
    partTitle: 'How models work',
    readingTime: 10,
    hasPlayground: true,
    playgroundType: 'size',
    isAvailable: true,
  },
  {
    id: 6,
    slug: 'training-data',
    title: 'How models learn',
    subtitle: 'Loss functions, cross-entropy, backpropagation, and gradient descent',
    partNumber: 'PART II',
    partTitle: 'How models work',
    readingTime: 12,
    hasPlayground: true,
    playgroundType: 'loss',
    isAvailable: true,
  },
  {
    id: 7,
    slug: 'loss-gradient-descent',
    title: 'How models learn behavior',
    subtitle: 'From raw text prediction to instruction-following and safety alignment',
    partNumber: 'PART II',
    partTitle: 'How models work',
    readingTime: 11,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 8,
    slug: 'fine-tuning',
    title: 'Fine-tuning (SFT & DPO)',
    subtitle: 'Supervised fine-tuning and direct preference optimization',
    partNumber: 'PART II',
    partTitle: 'How models work',
    readingTime: 13,
    hasPlayground: false,
    isAvailable: true,
  },

  // ── PART III: Build your model ──
  {
    id: 9,
    slug: 'project-setup',
    title: 'Project setup',
    subtitle: 'Configuring Python, PyTorch/MLX, and hardware acceleration',
    partNumber: 'PART III',
    partTitle: 'Build your model',
    readingTime: 8,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 10,
    slug: 'base-models',
    title: 'Base models',
    subtitle: 'Model architectures, parameter counts, and baseline weights',
    partNumber: 'PART III',
    partTitle: 'Build your model',
    readingTime: 10,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 11,
    slug: 'pre-training-data',
    title: 'Pre-training data',
    subtitle: 'Preparing tokens, packing batches, and context windows',
    partNumber: 'PART III',
    partTitle: 'Build your model',
    readingTime: 12,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 12,
    slug: 'pre-training',
    title: 'Pre-training',
    subtitle: 'Running forward & backward passes and monitoring live loss curves',
    partNumber: 'PART III',
    partTitle: 'Build your model',
    readingTime: 15,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 13,
    slug: 'sampling',
    title: 'Sampling',
    subtitle: 'Temperature, top-p, top-k, and generating text from logits',
    partNumber: 'PART III',
    partTitle: 'Build your model',
    readingTime: 9,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 14,
    slug: 'fine-tuning-data',
    title: 'Fine-tuning data',
    subtitle: 'Formatting conversational pairs and prompt-completion datasets',
    partNumber: 'PART III',
    partTitle: 'Build your model',
    readingTime: 10,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 15,
    slug: 'supervised-fine-tuning',
    title: 'Supervised fine-tuning',
    subtitle: 'Teaching the model conversational turn-taking and task instructions',
    partNumber: 'PART III',
    partTitle: 'Build your model',
    readingTime: 12,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 16,
    slug: 'chat-with-model',
    title: 'Chat with your model',
    subtitle: 'Interactive chat interface with token probability x-ray inspection',
    partNumber: 'PART III',
    partTitle: 'Build your model',
    readingTime: 10,
    hasPlayground: false,
    isAvailable: true,
  },
]

export interface ChapterPartGroup {
  partNumber: string
  partTitle: string
  chapters: Chapter[]
}

export function getChapterPartGroups(): ChapterPartGroup[] {
  const groups: ChapterPartGroup[] = []
  for (const ch of CHAPTERS) {
    let group = groups.find((g) => g.partNumber === ch.partNumber)
    if (!group) {
      group = {
        partNumber: ch.partNumber,
        partTitle: ch.partTitle,
        chapters: [],
      }
      groups.push(group)
    }
    group.chapters.push(ch)
  }
  return groups
}

const CONTENT_MAP: Record<number, { sections: { title: string; body: string }[] }> = {
  1: ch1, 2: ch2, 3: ch3, 4: ch4, 5: ch5, 6: ch6, 7: ch7, 8: ch8,
  9: ch9, 10: ch10, 11: ch11, 12: ch12, 13: ch13, 14: ch14, 15: ch15, 16: ch16,
}

export function getChapterDefaultSections(id: number): { title: string; body: string }[] {
  if (CONTENT_MAP[id]) return CONTENT_MAP[id].sections
  const ch = CHAPTERS.find((c) => c.id === id)
  return [
    {
      title: ch?.title ?? `Chapter ${id}`,
      body: `<p>${ch?.subtitle ?? 'Workbench Module'}</p>`,
    },
  ]
}

export function getChapterLiveSections(id: number): { title: string; body: string }[] {
  try {
    const raw = localStorage.getItem(`qairu-edit-ch${id}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return getChapterDefaultSections(id)
}
