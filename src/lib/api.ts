import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('qairu-auth')
  if (raw) {
    const { state } = JSON.parse(raw)
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
  }
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
}

// ── Progress ──────────────────────────────────────────────────────────────────
export const progressApi = {
  sync: (completed: Record<number, boolean>) =>
    api.post('/progress/sync', { completed }).catch(() => null), // graceful offline fail
}

// ── Chat / AI Helper ──────────────────────────────────────────────────────────
export interface ChatPayload {
  message: string
  chapter_context: string
  student_id: string
}

export const chatApi = {
  send: (payload: ChatPayload) => api.post('/chat', payload),
}

// ── Knowledge Graph / Obsidian Tree ──────────────────────────────────────────
export interface BloomQuestion {
  id: string
  bloom_level: 'remember' | 'understand' | 'apply'
  question: string
  options: string[]
  correct_index: number
  explanation: string
  socratic_hint: string
}

export interface TopicNode {
  id: string
  title: string
  category: 'theory' | 'architecture' | 'training' | 'systems' | 'core'
  description: string
  prerequisites: string[]
  status: 'locked' | 'unlocked' | 'needs_review' | 'mastered'
  mastery_score: number
  brightness: number
  x: number
  y: number
  content_page: string
  chapter_link?: number
  questions?: BloomQuestion[]
}

export interface GraphEdge {
  source: string
  target: string
  label?: string
}

export interface KnowledgeGraphData {
  nodes: TopicNode[]
  edges: GraphEdge[]
}

export const knowledgeApi = {
  getGraph: () => api.get<KnowledgeGraphData>('/knowledge-graph'),
  recordQuizResult: (topic_id: string, score: number) =>
    api.post<{
      success: boolean
      topic_id: string
      status: string
      score: number
      brightness: number
      unlocked_nodes: string[]
      graph: KnowledgeGraphData
    }>('/record-quiz-result', { topic_id, score }),
  generateQuiz: (topic: string, lecture_text?: string) =>
    api.post<{ questions: BloomQuestion[] }>('/generate-quiz', { topic, lecture_text }),
}

export default api
