import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// Mini bigram model built from sample sentences
const CORPUS = [
  'the cat sat on the mat',
  'the cat ate the rat',
  'the dog sat on the log',
  'a big red cat sat here',
  'the big dog ate a rat',
  'cats and dogs are good friends',
  'language models predict the next word',
  'artificial intelligence is changing the world',
  'neural networks learn from data',
  'the model predicts the next token',
]

function buildBigrams(corpus: string[]) {
  const counts: Record<string, Record<string, number>> = {}
  for (const sentence of corpus) {
    const words = sentence.toLowerCase().split(' ')
    for (let i = 0; i < words.length - 1; i++) {
      const w = words[i], next = words[i + 1]
      if (!counts[w]) counts[w] = {}
      counts[w][next] = (counts[w][next] ?? 0) + 1
    }
  }
  return counts
}

export default function NggramPlayground() {
  const { t } = useTranslation()
  const bigrams = useMemo(() => buildBigrams(CORPUS), [])
  const [word, setWord] = useState('the')

  const predictions = useMemo(() => {
    const key = word.toLowerCase().trim()
    if (!bigrams[key]) return []
    const total = Object.values(bigrams[key]).reduce((a, b) => a + b, 0)
    return Object.entries(bigrams[key])
      .map(([w, c]) => ({ word: w, prob: c / total, count: c }))
      .sort((a, b) => b.prob - a.prob)
  }, [word, bigrams])

  return (
    <div className="p-6">
      <p className="text-xs text-text-muted mb-4">{t('textbook.try_it')} — bigram next-word prediction</p>
      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 bg-navy-800 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Type a word…"
        />
      </div>

      {predictions.length === 0 ? (
        <p className="text-sm text-text-muted">
          No predictions — try: <span className="text-cyan-400 font-mono cursor-pointer"
            onClick={() => setWord('the')}>the</span>, <span className="text-cyan-400 font-mono cursor-pointer"
            onClick={() => setWord('cat')}>cat</span>, <span className="text-cyan-400 font-mono cursor-pointer"
            onClick={() => setWord('a')}>a</span>
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-text-muted mb-3">
            P(next | "{word.toLowerCase().trim()}")
          </p>
          {predictions.map(({ word: w, prob }) => (
            <div key={w} className="flex items-center gap-3">
              <span
                className="font-mono text-sm text-text-primary w-24 cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => setWord(w)}
              >
                {w}
              </span>
              <div className="flex-1 h-5 bg-navy-700 rounded overflow-hidden">
                <div
                  className="h-full bg-cyan-500/60 rounded transition-all duration-500"
                  style={{ width: `${prob * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-text-muted w-10 text-right">
                {(prob * 100).toFixed(0)}%
              </span>
            </div>
          ))}
          <p className="text-xs text-text-muted pt-2">Click a word to chain predictions →</p>
        </div>
      )}
    </div>
  )
}
