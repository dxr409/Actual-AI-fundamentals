import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Timer, ChevronDown } from 'lucide-react'

const MODES = [
  { label: 'Focus', seconds: 25 * 60 },
  { label: 'Short Break', seconds: 5 * 60 },
  { label: 'Long Break', seconds: 15 * 60 },
]

export default function PomodoroTimer() {
  const [modeIndex, setModeIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MODES[0].seconds)
  const [isRunning, setIsRunning] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleRunning = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRunning(false)
    setTimeLeft(MODES[modeIndex].seconds)
  }

  const switchMode = (idx: number) => {
    setModeIndex(idx)
    setIsRunning(false)
    setTimeLeft(MODES[idx].seconds)
    setMenuOpen(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="relative flex items-center" ref={menuRef}>
      {/* Pomodoro Pill: Height h-9 matching search input */}
      <div
        onClick={toggleRunning}
        className={`h-9 flex items-center gap-1.5 px-3 rounded-lg border text-xs cursor-pointer select-none transition-all duration-150 ${
          isRunning
            ? 'bg-[#f6e9c7]/20 border-[#f6e9c7] text-[#1a1813] dark:text-[#f6e9c7] font-medium shadow-xs'
            : 'bg-gray-100/80 dark:bg-white/[0.07] border-gray-200/80 dark:border-neutral-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-neutral-800'
        }`}
        title={isRunning ? 'Pause Pomodoro' : 'Start Focus Session'}
      >
        <Timer size={14} className={isRunning ? 'text-[#a1782e] dark:text-[#f6e9c7]' : 'text-gray-400 dark:text-gray-500'} />

        <span className="font-mono font-semibold tracking-tight text-xs tabular-nums">
          {formattedTime}
        </span>

        {isRunning ? (
          <Pause size={11} className="text-[#a1782e] dark:text-[#f6e9c7]" />
        ) : (
          <Play size={11} className="text-gray-400 dark:text-gray-500" />
        )}

        {/* Small reset button */}
        <button
          onClick={resetTimer}
          className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 p-0.5 ml-0.5 rounded transition-colors"
          title="Reset timer"
        >
          <RotateCcw size={11} />
        </button>

        {/* Dropdown chevron */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
          className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 p-0.5 rounded transition-colors"
          title="Change mode"
        >
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Mode selection popover */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1c1c20] shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500 px-3 py-1 block">
            Timer Modes
          </span>
          {MODES.map((m, idx) => (
            <button
              key={m.label}
              onClick={() => switchMode(idx)}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                modeIndex === idx
                  ? 'bg-[#f6e9c7] text-[#1a1813] font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span>{m.label}</span>
              <span className="font-mono text-[10px] opacity-75">
                {m.seconds / 60}m
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
