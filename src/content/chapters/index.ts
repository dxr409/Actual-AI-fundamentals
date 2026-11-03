import { ch9 } from './ch9'
import { ch10 } from './ch10'
import { ch11 } from './ch11'
import { ch12 } from './ch12'
import { ch13 } from './ch13'
import { ch14 } from './ch14'
import { ch15 } from './ch15'
import { ch16 } from './ch16'
import { ch17 } from './ch17'
import { ch18 } from './ch18'
import { ch19 } from './ch19'
import { lmb101, lmb102, lmb103, lmb104 } from './lmbPart1Foundations'
import { lmb105, lmb106, lmb107, lmb108, lmb109, lmb110, lmb111 } from './lmbPart2HowModelsWork'

export interface Chapter {
  id: number
  slug: string
  title: string
  subtitle: string
  partNumber: string  // e.g. 'PART I'
  partTitle: string   // e.g. 'AI fundamentals'
  readingTime: number // minutes
  hasPlayground: boolean
  playgroundType?: string
  isAvailable?: boolean
}

export const CHAPTERS: Chapter[] = [
  // ── PART I: AI fundamentals ──
  {
    id: 17,
    slug: 'search-algorithms-astar',
    title: 'Search algorithms, A* and heuristics',
    subtitle: 'How AI navigates grids, weighs terrain costs, and finds optimal paths using BFS, DFS, Dijkstra, and A*',
    partNumber: 'PART I',
    partTitle: 'AI fundamentals',
    readingTime: 12,
    hasPlayground: true,
    playgroundType: 'search-algorithms',
    isAvailable: true,
  },
  {
    id: 18,
    slug: 'adversarial-search-game-trees',
    title: 'Adversarial search, game trees and decision making',
    subtitle: 'Outsmarting intelligent opponents with Minimax, Alpha-Beta pruning, and Expectiminimax',
    partNumber: 'PART I',
    partTitle: 'AI fundamentals',
    readingTime: 13,
    hasPlayground: true,
    playgroundType: 'adversarial-search',
    isAvailable: true,
  },
  {
    id: 19,
    slug: 'probability-bayesian-sequential',
    title: 'Probability, Bayesian inference and sequential inference',
    subtitle: 'Reasoning under uncertainty, dice & lava river dilemmas, and how AI values future rewards with γ (gamma)',
    partNumber: 'PART I',
    partTitle: 'AI fundamentals',
    readingTime: 14,
    hasPlayground: true,
    playgroundType: 'probability-bayesian',
    isAvailable: true,
  },

  // ── PART II: Foundations ──
  {
    id: 101,
    slug: 'lmb-what-is-a-language-model',
    title: 'What is a Language Model?',
    subtitle: 'Next-token prediction, n-grams, and temperature sampling',
    partNumber: 'PART II',
    partTitle: 'Foundations',
    readingTime: 12,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 102,
    slug: 'lmb-earlier-models-transformer-leap',
    title: 'Earlier Models & The Transformer Leap',
    subtitle: 'RNN bottlenecks, sequential speed limits, and causal self-attention',
    partNumber: 'PART II',
    partTitle: 'Foundations',
    readingTime: 14,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 103,
    slug: 'lmb-tokenization-bpe',
    title: 'Tokenization & Byte Pair Encoding',
    subtitle: 'Turning text to IDs, discovering vocabularies, and BPE merges',
    partNumber: 'PART II',
    partTitle: 'Foundations',
    readingTime: 11,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 104,
    slug: 'lmb-embeddings-vector-arithmetic',
    title: 'Embeddings & Vector Arithmetic',
    subtitle: 'High-dimensional geometry, GloVe similarity, and king - man + woman = queen',
    partNumber: 'PART II',
    partTitle: 'Foundations',
    readingTime: 13,
    hasPlayground: false,
    isAvailable: true,
  },

  // ── PART III: How models work ──
  {
    id: 105,
    slug: 'lmb-anatomy-of-a-transformer',
    title: 'Anatomy of a Transformer & Attention',
    subtitle: 'Pipeline structure, query-key-value dot products, and multi-head routing',
    partNumber: 'PART III',
    partTitle: 'How models work',
    readingTime: 15,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 106,
    slug: 'lmb-inside-one-block-ffn-residuals',
    title: 'Inside One Block: FFN & Residuals',
    subtitle: 'RMSNorm, SwiGLU MLP, non-linear folding, and the residual highway',
    partNumber: 'PART III',
    partTitle: 'How models work',
    readingTime: 12,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 107,
    slug: 'lmb-sizing-it-up-hyperparameters',
    title: 'Sizing It Up: Hyperparameters & Scaling',
    subtitle: 'The 5 core dimensions, parameter arithmetic, and memory footprint',
    partNumber: 'PART III',
    partTitle: 'How models work',
    readingTime: 10,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 108,
    slug: 'lmb-training-data-curation',
    title: 'Training Data: Web Corpora & Curation',
    subtitle: 'Chinchilla compute ratio, deduplication, and the shift-by-one training signal',
    partNumber: 'PART III',
    partTitle: 'How models work',
    readingTime: 11,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 109,
    slug: 'lmb-how-models-learn-weights',
    title: 'How Models Learn: Objective & Weights',
    subtitle: 'Parameters as dials, checkpoints, and backpropagation mechanics',
    partNumber: 'PART III',
    partTitle: 'How models work',
    readingTime: 9,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 110,
    slug: 'lmb-loss-and-gradient-descent',
    title: 'Watch It Learn, Loss & Gradient Descent',
    subtitle: 'Cross-entropy cliff near zero, entropy floors, and rolling downhill',
    partNumber: 'PART III',
    partTitle: 'How models work',
    readingTime: 14,
    hasPlayground: false,
    isAvailable: true,
  },
  {
    id: 111,
    slug: 'lmb-behavior-tuning-sft-dpo',
    title: 'How Models Learn Behavior: SFT & DPO',
    subtitle: 'Base model limitations, user prompt loss masking, and human preference ballots',
    partNumber: 'PART III',
    partTitle: 'How models work',
    readingTime: 13,
    hasPlayground: false,
    isAvailable: true,
  },

  // ── PART IV: Build your model ──
  {
    id: 9,
    slug: 'project-setup',
    title: 'Project setup',
    subtitle: 'Configuring Python, PyTorch/MLX, and hardware acceleration',
    partNumber: 'PART IV',
    partTitle: 'Build your model',
    readingTime: 8,
    hasPlayground: true,
    playgroundType: 'wb-project-setup',
    isAvailable: true,
  },
  {
    id: 10,
    slug: 'base-models',
    title: 'Base models',
    subtitle: 'Model architectures, parameter counts, and baseline weights',
    partNumber: 'PART IV',
    partTitle: 'Build your model',
    readingTime: 10,
    hasPlayground: true,
    playgroundType: 'wb-base-models',
    isAvailable: true,
  },
  {
    id: 11,
    slug: 'pre-training-data',
    title: 'Pre-training data',
    subtitle: 'Preparing tokens, packing batches, and context windows',
    partNumber: 'PART IV',
    partTitle: 'Build your model',
    readingTime: 12,
    hasPlayground: true,
    playgroundType: 'wb-pretraining-data',
    isAvailable: true,
  },
  {
    id: 12,
    slug: 'pre-training',
    title: 'Pre-training',
    subtitle: 'Running forward & backward passes and monitoring live loss curves',
    partNumber: 'PART IV',
    partTitle: 'Build your model',
    readingTime: 15,
    hasPlayground: true,
    playgroundType: 'wb-pretraining-run',
    isAvailable: true,
  },
  {
    id: 13,
    slug: 'sampling',
    title: 'Sampling',
    subtitle: 'Temperature, top-p, top-k, and generating text from logits',
    partNumber: 'PART IV',
    partTitle: 'Build your model',
    readingTime: 9,
    hasPlayground: true,
    playgroundType: 'wb-sampling',
    isAvailable: true,
  },
  {
    id: 14,
    slug: 'fine-tuning-data',
    title: 'Fine-tuning data',
    subtitle: 'Formatting conversational pairs and prompt-completion datasets',
    partNumber: 'PART IV',
    partTitle: 'Build your model',
    readingTime: 10,
    hasPlayground: true,
    playgroundType: 'wb-finetuning-data',
    isAvailable: true,
  },
  {
    id: 15,
    slug: 'supervised-fine-tuning',
    title: 'Supervised fine-tuning',
    subtitle: 'Teaching the model conversational turn-taking and task instructions',
    partNumber: 'PART IV',
    partTitle: 'Build your model',
    readingTime: 12,
    hasPlayground: true,
    playgroundType: 'wb-sft-run',
    isAvailable: true,
  },
  {
    id: 16,
    slug: 'chat-with-model',
    title: 'Chat with your model',
    subtitle: 'Interactive chat interface with token probability x-ray inspection',
    partNumber: 'PART IV',
    partTitle: 'Build your model',
    readingTime: 10,
    hasPlayground: true,
    playgroundType: 'wb-chat-xray',
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
  9: ch9, 10: ch10, 11: ch11, 12: ch12, 13: ch13, 14: ch14, 15: ch15, 16: ch16,
  17: ch17, 18: ch18, 19: ch19,
  101: lmb101, 102: lmb102, 103: lmb103, 104: lmb104,
  105: lmb105, 106: lmb106, 107: lmb107, 108: lmb108, 109: lmb109, 110: lmb110, 111: lmb111,
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
