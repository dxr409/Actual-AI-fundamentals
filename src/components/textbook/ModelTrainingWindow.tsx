import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Play, Pause, RotateCcw, Sparkles, Check, ChevronRight, SkipForward, FastForward } from 'lucide-react'

// ── Customizable list of names for generation ──
export const GENERATED_NAMES_LIST = [
  'алтайыз',
  'орайбелкиен',
  'бекүнбанай',
  'тананай',
  'баныс',
  'дихам',
  'елтөре',
  'ипанұлик',
  'дия',
  'гүлсбал',
  'мекөлдәдырғарасұраз',
  'гүлайжатұр',
  'қилия',
  'нбожұрын',
  'айнбағұрәділипыбінүлия',
  'диязысей',
  'моңдан',
  'қазар',
  'әзай',
  'баназ',
  'жансі',
  'шайшібали',
  'жітжат',
  'жұрмак',
  'дин',
  'мшайлайәзияменардана',
  'бамекелай',
  'жұпасасеу',
  'бәрама',
  'қожанұллизияр',
  'жанұрме',
  'майту',
  'әдай',
]

// Default training tokens for Kazakh names
const KAZAKH_TRAINING_TOKENS = [
  'Алтай', 'Орайбек', 'Бекүн', 'Тана', 'Баныс',
  'Дихам', 'Елтөре', 'Ипан', 'Дия', 'Гүлсбал',
  'Мекөл', 'Гүлай', 'Қилия', 'Жұрын', 'Айнбағұр',
  'Әділ', 'Диясы', 'Моңдан', 'Қазар', 'Әзай',
  'Баназ', 'Жансі', 'Шайшібали', 'Жітжат', 'Жұрмак',
  'Дин', 'Ардана', 'Бамеке', 'Жұпа', 'Бәрама',
  'Қожанұр', 'Жанұр', 'Майту', 'Әдай',
]

export default function ModelTrainingWindow() {
  const totalTokens = KAZAKH_TRAINING_TOKENS.length
  const [currentStep, setCurrentStep] = useState(totalTokens) // Start complete as in screenshot
  const [isTraining, setIsTraining] = useState(false)
  const [generatedNames, setGeneratedNames] = useState<string[]>([])
  const [justGenerated, setJustGenerated] = useState<string | null>(null)
  const trainIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Progress percentage
  const progressPct = Math.round((currentStep / totalTokens) * 100)
  const isComplete = currentStep >= totalTokens

  // Current token and transition
  const currentToken = KAZAKH_TRAINING_TOKENS[Math.min(currentStep, totalTokens - 1)]

  // Break token into prefix and suffix (e.g. "Ali" -> "bek")
  const transition = useMemo(() => {
    if (isComplete) {
      return { from: 'Temirlan .', to: 'done' }
    }
    const name = currentToken
    if (name.length > 3) {
      return { from: name.slice(0, 3).toLowerCase(), to: name.slice(3).toLowerCase() }
    }
    return { from: name.toLowerCase(), to: '⟨EOS⟩' }
  }, [currentToken, isComplete])

  // Training animation loop
  useEffect(() => {
    if (isTraining && currentStep < totalTokens) {
      trainIntervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev + 1 >= totalTokens) {
            setIsTraining(false)
            return totalTokens
          }
          return prev + 1
        })
      }, 160)
    } else {
      if (trainIntervalRef.current) clearInterval(trainIntervalRef.current)
    }

    return () => {
      if (trainIntervalRef.current) clearInterval(trainIntervalRef.current)
    }
  }, [isTraining, currentStep, totalTokens])

  const handleTrain = () => {
    if (isComplete) {
      setCurrentStep(0)
    }
    setIsTraining(true)
  }

  const handleStep = () => {
    setIsTraining(false)
    if (currentStep < totalTokens) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleTrainAll = () => {
    setIsTraining(false)
    setCurrentStep(totalTokens)
  }

  const handleReset = () => {
    setIsTraining(false)
    setCurrentStep(0)
  }

  const handleGenerate = () => {
    // Pick a random name from the list
    const randomIndex = Math.floor(Math.random() * GENERATED_NAMES_LIST.length)
    const newName = GENERATED_NAMES_LIST[randomIndex]
    setJustGenerated(newName)
    setGeneratedNames((prev) => [newName, ...prev.slice(0, 7)])

    // Clear flash effect after 1.5s
    setTimeout(() => {
      setJustGenerated(null)
    }, 1500)
  }

  // Sliding window: show 18 chips around the current index
  const visibleTokens = useMemo(() => {
    const start = Math.max(0, currentStep - 12)
    const end = Math.min(totalTokens, start + 18)
    return KAZAKH_TRAINING_TOKENS.slice(start, end).map((tok, i) => ({
      name: tok,
      index: start + i,
      isCurrent: start + i === Math.min(currentStep, totalTokens - 1),
    }))
  }, [currentStep, totalTokens])

  return (
    <div
      className="rounded-2xl overflow-hidden my-10 select-none transition-all"
      style={{
        background: '#161618',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* ── Top Header ── */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.07)' }}
      >
        <span className="text-sm font-semibold text-[#f0ece8] tracking-tight">
          Training the model
        </span>

        {/* Generate Button on top right */}
        <button
          onClick={handleGenerate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer hover:bg-[#a84dd8]"
          style={{
            background: '#bf5af2',
          }}
          title="Sample a new name from the trained model"
        >
          <Sparkles size={13} />
          <span>Generate</span>
        </button>
      </div>

      {/* ── Controls & Training Pass Row ── */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e8e93] block">
              Training Pass
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold font-mono text-[#f2f2f7]">
                {currentStep}
              </span>
              <span className="text-sm text-[#8e8e93] font-mono">
                / {totalTokens} words seen
              </span>
            </div>
          </div>

          {/* Action Buttons matching screenshot */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTrain}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#222226] text-[#f2f2f7] hover:bg-[#2c2c30] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
            >
              {isTraining ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
              <span>{isTraining ? 'Pause' : 'Train'}</span>
            </button>

            <button
              onClick={handleStep}
              disabled={isComplete}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#222226] text-[#f2f2f7] hover:bg-[#2c2c30] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer disabled:opacity-40"
            >
              <SkipForward size={12} />
              <span>One example</span>
            </button>

            <button
              onClick={handleTrainAll}
              disabled={isComplete}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#222226] text-[#f2f2f7] hover:bg-[#2c2c30] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer disabled:opacity-40"
            >
              <FastForward size={12} />
              <span>Train all</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-[#1c1c1e] text-[#8e8e93] hover:text-[#f2f2f7] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ── Blue Progress Bar ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 rounded-full bg-[#202024] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${progressPct}%`,
                background: '#0a84ff',
                boxShadow: '0 0 10px rgba(10, 132, 255, 0.5)',
              }}
            />
          </div>
          <span className="font-mono text-xs font-semibold text-[#8e8e93] w-14 text-right">
            {progressPct.toFixed(1).replace('.', ',')}%
          </span>
        </div>

        {/* ── 2-Column Split: Sliding Window + Status Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Left: Sliding Training Window */}
          <div
            className="p-4 rounded-xl border"
            style={{
              background: '#111113',
              borderColor: 'rgba(255, 255, 255, 0.07)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93]">
                Sliding Training Window
              </span>
              <span className="text-[11px] text-[#636366]">
                current word is emphasized
              </span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[100px] items-start">
              {visibleTokens.map((t) => (
                <span
                  key={t.index}
                  className="px-2.5 py-1 rounded-lg font-mono text-xs transition-all duration-150"
                  style={{
                    background: t.isCurrent
                      ? 'rgba(10, 132, 255, 0.25)'
                      : '#202024',
                    border: t.isCurrent
                      ? '1px solid #0a84ff'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    color: t.isCurrent ? '#ffffff' : '#8e8e93',
                    fontWeight: t.isCurrent ? 700 : 400,
                    transform: t.isCurrent ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: t.isCurrent ? '0 0 8px rgba(10, 132, 255, 0.4)' : 'none',
                  }}
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Status Cards */}
          <div className="space-y-3">
            {/* Card 1: Training Complete / Transition */}
            <div
              className="p-4 rounded-xl border"
              style={{
                background: '#111113',
                borderColor: 'rgba(255, 255, 255, 0.07)',
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93] block mb-2.5">
                {isComplete ? 'Training Complete' : 'Learning Transition'}
              </span>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span
                  className="px-2.5 py-1 rounded-lg text-[#64dfdf] border"
                  style={{
                    background: 'rgba(10, 132, 255, 0.18)',
                    borderColor: 'rgba(10, 132, 255, 0.35)',
                  }}
                >
                  {transition.from}
                </span>
                <ChevronRight size={14} className="text-[#8e8e93]" />
                <span
                  className="px-2.5 py-1 rounded-lg text-[#ffffff] border font-bold"
                  style={{
                    background: '#bf5af2',
                    borderColor: '#bf5af2',
                    boxShadow: '0 0 10px rgba(191, 90, 242, 0.4)',
                  }}
                >
                  {transition.to}
                </span>
              </div>
            </div>

            {/* Card 2: Table Update */}
            <div
              className="p-4 rounded-xl border flex items-center gap-2 text-xs"
              style={{
                background: '#111113',
                borderColor: 'rgba(255, 255, 255, 0.07)',
                color: '#aeaeb2',
              }}
            >
              <div className="w-4 h-4 rounded-full flex items-center justify-center bg-[#242428] text-[#30d158] flex-shrink-0">
                <Check size={11} strokeWidth={3} />
              </div>
              <span className="text-[#8e8e93]">
                {isComplete
                  ? 'All count rows are up to date'
                  : `Updated transition count for prefix "${transition.from}"`}
              </span>
            </div>
          </div>
        </div>

        {/* ── Generation Showcase (Activated by "Generate" button) ── */}
        <div
          className="mt-4 p-4 rounded-xl border"
          style={{
            background: '#131316',
            borderColor: 'rgba(191, 90, 242, 0.25)',
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} style={{ color: '#bf5af2' }} />
              <span className="text-xs font-bold text-[#f2f2f7] uppercase tracking-wider">
                Model Output (Generated Kazakh Names)
              </span>
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer hover:bg-[#a84dd8]"
              style={{ background: '#bf5af2' }}
            >
              <Sparkles size={11} />
              <span>Generate</span>
            </button>
          </div>

          {generatedNames.length === 0 ? (
            <div className="py-4 text-center text-xs text-[#8e8e93] italic bg-[#18181c] rounded-lg border border-[rgba(255,255,255,0.04)]">
              Output is currently empty. Click <span className="text-[#bf5af2] font-semibold not-italic">Generate</span> to sample names from the learned distribution.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {generatedNames.map((name, i) => {
                const isLatest = name === justGenerated && i === 0
                return (
                  <span
                    key={`${name}-${i}`}
                    className="px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all duration-300"
                    style={{
                      background: isLatest ? 'rgba(191, 90, 242, 0.35)' : '#222226',
                      border: isLatest ? '1.5px solid #bf5af2' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isLatest ? '#ffffff' : '#e5e5ea',
                      boxShadow: isLatest ? '0 0 16px rgba(191, 90, 242, 0.6)' : 'none',
                      transform: isLatest ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {name}
                  </span>
                )
              })}
            </div>
          )}
          <span className="text-[11px] text-[#636366] block mt-2">
            Clicking <strong>Generate</strong> samples character sequences following the conditional probability distributions learned during training.
          </span>
        </div>
      </div>
    </div>
  )
}
