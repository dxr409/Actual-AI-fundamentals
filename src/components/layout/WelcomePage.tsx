import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, useProgressStore } from '@/lib/store'
import { CHAPTERS } from '@/content/chapters'
import { ArrowRight, Pencil } from 'lucide-react'
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
    <div className="max-w-3xl mx-auto px-8 py-12 animate-fade-in">
      {/* Top action bar with edit button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {edited && (
            <span
              className="pill text-xs"
              style={{
                background: 'rgba(56, 22, 14, 0.2)',
                color: '#e8a488',
                border: '1px solid rgba(56, 22, 14, 0.4)',
              }}
            >
              Edited locally
            </span>
          )}
        </div>
        <button
          onClick={() => setEditorOpen(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ color: '#7a8b9e', border: '1px solid #3c4856' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7c361f'
            e.currentTarget.style.color = '#e8a488'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#3c4856'
            e.currentTarget.style.color = '#7a8b9e'
          }}
        >
          <Pencil size={12} />
          Edit page
        </button>
      </div>

      {/* Greeting Header */}
      <div className="mb-8">
        <p style={{ color: '#65778a', fontSize: 13, marginBottom: 4 }}>
          {welcomeContent.greeting},
        </p>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#f0ece8',
            letterSpacing: '-0.5px',
            textTransform: 'capitalize',
          }}
        >
          {user?.name ?? 'Student'}
        </h1>
        <p style={{ color: '#8898a9', marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>
          {welcomeContent.subtitle}
        </p>
        {welcomeContent.introNotice && (
          <p style={{ color: '#6b7d90', marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
            {welcomeContent.introNotice}
          </p>
        )}
      </div>

      {/* Progress card */}
      <div
        style={{
          background: '#15181e',
          border: '1px solid #28303d',
          borderRadius: 14,
          padding: '18px 22px',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#c8d8e4' }}>Overall Completion</span>
          <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#f59e0b' }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: '#252d3a', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #f59e0b, #f97316)',
              transition: 'width 0.7s ease',
            }}
          />
        </div>
        <p style={{ marginTop: 8, fontSize: 11, color: '#65778a' }}>
          {doneCount} of {CHAPTERS.length} chapters completed
        </p>
      </div>

      {/* Continue CTA */}
      <Link
        to={`/chapter/${nextChapter.id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 22px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          background: '#38160e',
          color: '#f0ece8',
          textDecoration: 'none',
          marginBottom: 24,
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#7c361f')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#38160e')}
      >
        {doneCount === 0 ? 'Start Learning' : 'Continue Reading'}
        <ArrowRight size={15} />
      </Link>

      {/* Dynamic Curriculum Roadmap */}
      <div className="mt-4">
        <CurriculumRoadmap currentChapterId={nextChapter.id} />
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
