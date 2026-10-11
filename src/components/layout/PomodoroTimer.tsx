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
      {/* Compact Pomodoro Pill */}
      <div
        onClick={toggleRunning}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs cursor-pointer select-none transition-all duration-150 ${
          isRunning
            ? 'bg-[rgba(191,90,242,0.18)] border-[#bf5af2] text-[#f2f2f7]'
            : 'bg-[#1e1e22] border-[rgba(255,255,255,0.08)] text-[#aeaeb2] hover:text-[#f2f2f7] hover:bg-[#28282e]'
        }`}
        title={isRunning ? 'Pause Pomodoro' : 'Start Focus Session'}
      >
        <Timer size={13} style={{ color: isRunning ? '#bf5af2' : '#8e8e93' }} />

        <span className="font-mono font-semibold tracking-tight text-[11px] tabular-nums">
          {formattedTime}
        </span>

        {isRunning ? (
          <Pause size={10} style={{ color: '#bf5af2' }} />
        ) : (
          <Play size={10} style={{ color: '#8e8e93' }} />
        )}

        {/* Small reset button */}
        <button
          onClick={resetTimer}
          className="hover:text-white text-[#8e8e93] p-0.5 ml-0.5 rounded transition-colors"
          title="Reset timer"
        >
          <RotateCcw size={10} />
        </button>

        {/* Dropdown chevron */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
          className="hover:text-white text-[#8e8e93] p-0.5 rounded transition-colors"
          title="Change mode"
        >
          <ChevronDown size={11} />
        </button>
      </div>

      {/* Mode selection popover */}
      {menuOpen && (
        <div
          className="absolute right-0 top-9 w-36 py-1.5 rounded-xl border shadow-2xl z-50 animate-fade-in"
          style={{
            background: '#1c1c20',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e8e93] px-3 py-1 block">
            Timer Modes
          </span>
          {MODES.map((m, idx) => (
            <button
              key={m.label}
              onClick={() => switchMode(idx)}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                modeIndex === idx
                  ? 'bg-[#bf5af2] text-white font-medium'
                  : 'text-[#aeaeb2] hover:bg-[#28282e] hover:text-white'
              }`}
            >
              <span>{m.label}</span>
              <span className="font-mono text-[10px] opacity-80">
                {m.seconds / 60}m
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
