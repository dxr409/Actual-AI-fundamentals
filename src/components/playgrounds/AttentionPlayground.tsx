import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

// Pre-computed attention weights for a sample sentence (simulated)
const SENTENCE = ['The', 'cat', 'sat', 'on', 'the', 'mat']

// Attention matrix [query_idx][key_idx] — hand-crafted to look plausible
const ATTENTION: number[][] = [
  [0.40, 0.15, 0.10, 0.08, 0.18, 0.09],  // The → attends mostly to itself + "the"
  [0.12, 0.45, 0.20, 0.05, 0.08, 0.10],  // cat → attends to itself, "sat"
  [0.08, 0.22, 0.38, 0.12, 0.08, 0.12],  // sat → attends to "cat", itself
  [0.05, 0.10, 0.15, 0.35, 0.20, 0.15],  // on  → attends to itself, "the", "mat"
  [0.30, 0.08, 0.08, 0.12, 0.32, 0.10],  // the → attends to "The", itself
  [0.05, 0.12, 0.18, 0.15, 0.15, 0.35],  // mat → attends to "sat", "on", itself
]

function alphaToHex(a: number) {
  return Math.round(a * 255).toString(16).padStart(2, '0')
}

export default function AttentionPlayground() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number>(1)

  const weights = ATTENTION[selected]
  const maxW = Math.max(...weights)

  return (
    <div className="p-6">
      <p className="text-xs text-text-muted mb-5">
        {t('textbook.try_it')} — click a word to see what it attends to
      </p>

      {/* Sentence tokens (queries) */}
      <div className="flex gap-2 flex-wrap mb-8">
        {SENTENCE.map((word, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={clsx(
              'px-3 py-1.5 rounded-lg border text-sm font-mono transition-all duration-200',
              selected === i
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-navy-800 border-border text-text-secondary hover:border-navy-500'
            )}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Attention heatmap row */}
      <div className="mb-6">
        <p className="text-xs text-text-muted mb-3">
          Attention from <span className="text-cyan-400 font-mono">"{SENTENCE[selected]}"</span> to each token:
        </p>
        <div className="flex gap-2 flex-wrap">
          {SENTENCE.map((word, i) => {
            const w = weights[i]
            const intensity = w / maxW
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300"
                  style={{
                    background: `#22d3ee${alphaToHex(intensity * 0.8)}`,
                    borderColor: `#22d3ee${alphaToHex(intensity)}`,
                  }}
                >
                  <span className="text-xs font-mono text-white font-bold">
                    {(w * 100).toFixed(0)}%
                  </span>
                </div>
                <span className={clsx(
                  'text-xs font-mono',
                  i === selected ? 'text-cyan-400' : 'text-text-muted'
                )}>
                  {word}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Full matrix */}
      <details className="mt-4">
        <summary className="text-xs text-text-muted cursor-pointer hover:text-cyan-400 transition-colors mb-3">
          Show full attention matrix
        </summary>
        <div className="overflow-x-auto">
          <table className="text-xs font-mono">
            <thead>
              <tr>
                <th className="text-text-muted pr-3 py-1 text-right">→</th>
                {SENTENCE.map((w) => (
                  <th key={w} className="text-text-muted px-2 py-1 font-normal">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SENTENCE.map((rowW, ri) => (
                <tr key={ri}>
                  <td className={clsx('pr-3 py-1 text-right', ri === selected ? 'text-cyan-400' : 'text-text-muted')}>
                    {rowW}
                  </td>
                  {ATTENTION[ri].map((val, ci) => (
                    <td key={ci}
                      className="px-2 py-1 rounded text-center"
                      style={{ color: `#22d3ee${alphaToHex(val / maxW)}` }}
                    >
                      {(val * 100).toFixed(0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
