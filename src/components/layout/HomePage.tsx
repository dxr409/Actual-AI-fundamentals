import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore, useProgressStore } from '@/lib/store'
import { CHAPTERS } from '@/content/chapters'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

export default function HomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const completed = useProgressStore((s) => s.completed)
  const doneCount = Object.values(completed).filter(Boolean).length
  const pct = Math.round((doneCount / CHAPTERS.length) * 100)
  const nextChapter = CHAPTERS.find((ch) => !completed[ch.id]) ?? CHAPTERS[CHAPTERS.length - 1]

  return (
    <div className="max-w-3xl mx-auto px-8 py-12 animate-fade-in">

      {/* Greeting */}
      <div className="mb-10">
        <p className="text-text-muted text-sm mb-1">{t('home.welcome')},</p>
        <h1 className="text-3xl font-semibold text-text-primary capitalize tracking-tight">
          {user?.name ?? 'Student'}
        </h1>
        <p className="text-text-muted mt-1">{t('home.subtitle')}</p>
      </div>

      {/* Progress bar */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text-primary">{t('progress.overall')}</span>
          <span className="text-sm font-mono" style={{ color: '#e8a488' }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#121011' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: '#7c361f' }}
          />
        </div>
        <p className="mt-2 text-xs text-text-muted">
          {doneCount} / {CHAPTERS.length} {t('home.chapters_done')}
        </p>
      </div>

      {/* Continue CTA */}
      <Link to={`/chapter/${nextChapter.id}`} className="btn-primary mb-10 inline-flex">
        {doneCount === 0 ? t('home.start') : t('home.continue')}
        <ArrowRight size={16} />
      </Link>

      {/* Overview */}
      <h2 className="text-lg font-semibold text-text-primary mb-2">{t('home.overview_title')}</h2>
      <p className="text-text-muted text-sm mb-6">{t('home.overview_sub')}</p>

      {/* Chapter list — no "interactive" badge, no "min read" */}
      <div className="space-y-2">
        {CHAPTERS.map((ch) => {
          const done = !!completed[ch.id]
          return (
            <Link
              key={ch.id}
              to={`/chapter/${ch.id}`}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group',
              )}
              style={{
                background: done ? '#2a3545' : '#2a3545',
                borderColor: done ? '#7c361f40' : '#4a5e72',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = '#7c361f')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = done ? '#7c361f40' : '#4a5e72')}
            >
              {/* Chapter number / checkmark — uses #7c361f and #121011 */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-mono"
                style={{
                  background: done ? '#7c361f' : '#121011',
                  color: '#f0ece8',
                }}>
                {done ? <CheckCircle2 size={16} /> : ch.id}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-text-primary">{t(`chapters.${ch.id}.title`)}</p>
                <p className="text-xs text-text-muted truncate">{t(`chapters.${ch.id}.subtitle`)}</p>
              </div>

              <ArrowRight size={14} className="text-text-muted flex-shrink-0 transition-colors"
                style={{ color: '#6a8292' }}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
