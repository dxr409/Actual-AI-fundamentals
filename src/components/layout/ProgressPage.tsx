import { useTranslation } from 'react-i18next'
import { useProgressStore } from '@/lib/store'
import { CHAPTERS } from '@/content/chapters'
import { CheckCircle2, Circle } from 'lucide-react'
import clsx from 'clsx'

export default function ProgressPage() {
  const { t } = useTranslation()
  const completed = useProgressStore((s) => s.completed)
  const doneCount = Object.values(completed).filter(Boolean).length
  const pct = Math.round((doneCount / CHAPTERS.length) * 100)

  return (
    <div className="max-w-2xl mx-auto px-8 py-12 animate-fade-in">
      <h1 className="text-2xl font-serif font-medium text-text-primary mb-2">{t('progress.title')}</h1>
      <p className="text-text-muted text-sm mb-8">
        {doneCount === CHAPTERS.length ? t('progress.all_done') : t('progress.keep_going')}
      </p>

      {/* Big circle progress */}
      <div className="flex items-center justify-center mb-10">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a2a50" strokeWidth="2" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="#22d3ee" strokeWidth="2"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold text-cyan-400">{pct}%</span>
            <span className="text-xs text-text-muted">{t('progress.overall')}</span>
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="space-y-3">
        {CHAPTERS.map((ch) => {
          const done = !!completed[ch.id]
          return (
            <div
              key={ch.id}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-xl border',
                done ? 'bg-navy-800/40 border-cyan-500/20' : 'bg-navy-900 border-border'
              )}
            >
              <div className={clsx('flex-shrink-0', done ? 'text-cyan-400' : 'text-text-muted')}>
                {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>
              <div className="flex-1">
                <p className={clsx('text-sm font-medium', done ? 'text-text-primary' : 'text-text-secondary')}>
                  {t('textbook.chapter')} {ch.id} — {t(`chapters.${ch.id}.title`)}
                </p>
                <p className="text-xs text-text-muted">{t(`chapters.${ch.id}.subtitle`)}</p>
              </div>
              <span className={clsx(
                'text-xs font-medium px-2.5 py-1 rounded-full',
                done ? 'bg-cyan-500/15 text-cyan-400' : 'bg-navy-700 text-text-muted'
              )}>
                {done ? t('textbook.completed') : `${ch.readingTime} ${t('textbook.min_read')}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
