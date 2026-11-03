import React, { useState, useMemo } from 'react'
import { Dices, Coins, RotateCcw, BarChart3 } from 'lucide-react'
import UnderTheHood from './UnderTheHood'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

interface GameHistoryItem {
  turn: number
  action: 'stay' | 'quit'
  roll?: number
  outcome: string
  scoreAfter: number
}

const DICE_TRAP_SERIES = [
  { rolls: 0, label: '0 rolls (Quit)', targetScore: 10, survivalProbPct: 100, ev: 10.0 },
  { rolls: 1, label: '1 roll (+Quit)', targetScore: 14, survivalProbPct: 67, ev: 9.33 },
  { rolls: 2, label: '2 rolls (+Quit)', targetScore: 18, survivalProbPct: 44, ev: 8.89 },
  { rolls: 3, label: '3 rolls (+Quit)', targetScore: 22, survivalProbPct: 30, ev: 8.59 },
  { rolls: 4, label: '4 rolls (+Quit)', targetScore: 26, survivalProbPct: 20, ev: 8.39 },
  { rolls: 5, label: '5 rolls (+Quit)', targetScore: 30, survivalProbPct: 13, ev: 8.26 },
]

const STONE_BASE_COINS = [10, 6, 10, 16, 28] // Shore=+10 instant, Stone 1..4 base coins

const PYTHON_PROBABILITY_CODE = `def bellman_rabbit_coins(gamma=1.0):
    """
    Solves the Markov Decision Process (MDP) with percentages:
    - Quit on Shore: receive +10 coins immediately (100% chance).
    - Hop Stone:
        * 33% chance (roll 1-2): Slip into river (-30 coins) and terminate
        * 67% chance (roll 3-6): Land on stone and collect gamma^t * base_coins
    """
    q_quit = 10.0
    p_safe = 0.67
    p_slip = 0.33
    q_roll_once_then_quit = p_safe * (4.0 + gamma * q_quit)
    v_always_stay = (p_safe * 4.0) / (1.0 - p_safe * gamma)
    
    optimal_action = "QUIT (+10)" if q_quit >= q_roll_once_then_quit else "STAY & ROLL"
    return {
        "Q(Quit)": round(q_quit, 2),
        "Q(Roll once, then Quit)": round(q_roll_once_then_quit, 2),
        "V(Always Stay)": round(v_always_stay, 2),
        "optimal_action": optimal_action,
    }

def bayesian_sequential_update(prior_probs, sensor_reading, sensor_accuracy=0.80):
    """Sequential Bayesian Inference: Posterior ∝ Likelihood * Prior"""
    posterior = {
        s: (sensor_accuracy if s == sensor_reading else 1.0 - sensor_accuracy) * p
        for s, p in prior_probs.items()
    }
    total = sum(posterior.values())
    return {s: round((p / total) * 100, 1) for s, p in posterior.items()}`

function RabbitSvg({ slipped }: { slipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="w-10 h-10 overflow-visible drop-shadow"
      style={{
        transform: slipped ? 'rotate(-28deg) translateY(6px)' : undefined,
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Left & Right Long Rabbit Ears */}
      <ellipse cx="18" cy="11" rx="3.8" ry="9.5" transform="rotate(-10 18 11)" fill="#fdfbf7" stroke="#d6c49e" strokeWidth="1.5" />
      <ellipse cx="18" cy="11" rx="1.8" ry="6" transform="rotate(-10 18 11)" fill="#fca5a5" />
      <ellipse cx="29" cy="11" rx="3.8" ry="9.5" transform="rotate(12 29 11)" fill="#fdfbf7" stroke="#d6c49e" strokeWidth="1.5" />
      <ellipse cx="29" cy="11" rx="1.8" ry="6" transform="rotate(12 29 11)" fill="#fca5a5" />
      {/* Fluffy Tail */}
      <circle cx="11" cy="34" r="4.5" fill="#ffffff" stroke="#d6c49e" strokeWidth="1.2" />
      {/* Body */}
      <ellipse cx="23" cy="33" rx="10" ry="8.5" fill="#fdfbf7" stroke="#d6c49e" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="25" cy="22" r="8.5" fill="#fdfbf7" stroke="#d6c49e" strokeWidth="1.5" />
      {/* Eyes */}
      {slipped ? (
        <>
          <text x="20" y="23" fontSize="6" fontWeight="bold" fill="#ef4444">×</text>
          <text x="27" y="23" fontSize="6" fontWeight="bold" fill="#ef4444">×</text>
        </>
      ) : (
        <>
          <circle cx="22.5" cy="20.5" r="1.5" fill="#18181b" />
          <circle cx="28.5" cy="20.5" r="1.5" fill="#18181b" />
          <circle cx="23" cy="20" r="0.5" fill="#ffffff" />
          <circle cx="29" cy="20" r="0.5" fill="#ffffff" />
        </>
      )}
      {/* Pink Nose */}
      <ellipse cx="26" cy="23.5" rx="1.6" ry="1.1" fill="#f43f5e" />
      {/* Paws */}
      <ellipse cx="19" cy="40.5" rx="3.5" ry="2" fill="#fdfbf7" stroke="#d6c49e" strokeWidth="1.2" />
      <ellipse cx="28" cy="40.5" rx="3.5" ry="2" fill="#fdfbf7" stroke="#d6c49e" strokeWidth="1.2" />
    </svg>
  )
}

function CoinStackSvg({ count, maxDisc = 7 }: { count: number; maxDisc?: number }) {
  const discs = Math.min(maxDisc, Math.max(0, Math.ceil(count / 4)))
  if (count <= 0) {
    return (
      <div className="h-9 flex items-center justify-center text-[10px] font-mono text-[#71717a]">
        0 coins
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-end h-10">
      <svg viewBox="0 0 40 36" className="w-9 h-9 overflow-visible">
        {Array.from({ length: discs }).map((_, idx) => {
          const cy = 30 - idx * 4.2
          return (
            <g key={idx}>
              <ellipse
                cx="20"
                cy={cy}
                rx="11"
                ry="3.6"
                fill="#f59e0b"
                stroke="#fef08a"
                strokeWidth="1"
              />
              <ellipse cx="20" cy={cy - 0.8} rx="8" ry="2.2" fill="#fbbf24" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function ProbabilityBayesianPlayground() {
  // ── GAME 1 STATE: STAY & ROLL VS. QUIT ──
  const [score, setScore] = useState(0)
  const [turn, setTurn] = useState(1)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [gameState, setGameState] = useState<'playing' | 'busted' | 'quitted'>('playing')
  const [history, setHistory] = useState<GameHistoryItem[]>([])
  const [hasPlayed, setHasPlayed] = useState(false)
  const [showMathBehindIt, setShowMathBehindIt] = useState(false)

  const handleStayAndRoll = () => {
    if (gameState !== 'playing') return
    setHasPlayed(true)
    const roll = Math.floor(Math.random() * 6) + 1
    setLastRoll(roll)

    if (roll <= 2) {
      const nextHist: GameHistoryItem = {
        turn,
        action: 'stay',
        roll,
        outcome: `Rolled ${roll} (33% Bust Zone) → Lost!`,
        scoreAfter: score,
      }
      setHistory((prev) => [nextHist, ...prev])
      setGameState('busted')
    } else {
      const newScore = score + 4
      const nextHist: GameHistoryItem = {
        turn,
        action: 'stay',
        roll,
        outcome: `Rolled ${roll} (67% Safe Zone) → +4 pts`,
        scoreAfter: newScore,
      }
      setScore(newScore)
      setTurn((t) => t + 1)
      setHistory((prev) => [nextHist, ...prev])
    }
  }

  const handleQuit = () => {
    if (gameState !== 'playing') return
    setHasPlayed(true)
    const finalScore = score + 10
    const nextHist: GameHistoryItem = {
      turn,
      action: 'quit',
      outcome: `Quitted safely (100%) → +10 pts`,
      scoreAfter: finalScore,
    }
    setScore(finalScore)
    setGameState('quitted')
    setHistory((prev) => [nextHist, ...prev])
  }

  const handleResetGame = () => {
    setScore(0)
    setTurn(1)
    setLastRoll(null)
    setGameState('playing')
    setHistory([])
  }

  // ── GAME 2 STATE: RABBIT STEPPING STONES & GAMMA (γ) COIN MOTIVATION ──
  const [gamma, setGamma] = useState(0.85)
  const [rabbitStep, setRabbitStep] = useState(0) // 0 = Shore, 1..4 = Stones
  const [rabbitStatus, setRabbitStatus] = useState<'ready' | 'hopping' | 'fell' | 'crossed'>('ready')
  const [collectedCoins, setCollectedCoins] = useState(0)
  const [lastHopRoll, setLastHopRoll] = useState<number | null>(null)

  // Coins visible on each stone scale directly with gamma^step to visualize future motivation!
  const stoneMotivatedCoins = useMemo(() => {
    return STONE_BASE_COINS.map((base, idx) => {
      if (idx === 0) return base // Shore instant reward = 10 coins
      return Math.round(base * Math.pow(gamma, idx))
    })
  }, [gamma])

  const mdpMetrics = useMemo(() => {
    const fallPenalty = -30
    const pSafe = 2 / 3 // 67%
    const pSlip = 1 / 3 // 33%
    let riskyEV = 0
    let survivalProb = 1.0
    for (let s = 1; s <= 4; s++) {
      const stoneCoins = stoneMotivatedCoins[s]
      riskyEV += survivalProb * (pSafe * stoneCoins + pSlip * fallPenalty)
      survivalProb *= pSafe
    }

    const safeBridgeCoins =
      stoneMotivatedCoins[1] * 0.5 +
      stoneMotivatedCoins[2] * 0.5 +
      stoneMotivatedCoins[3] * 0.5 +
      stoneMotivatedCoins[4]
    const instantShoreCoins = 10.0

    const bestChoice =
      instantShoreCoins >= riskyEV && instantShoreCoins >= safeBridgeCoins
        ? 'Take +10 Coins on Shore (Far Stones Have Too Few Coins!)'
        : safeBridgeCoins >= riskyEV
        ? `Take Safe Detour Bridge (+${safeBridgeCoins.toFixed(1)} Motivated Coins)`
        : 'Hop Risky River Stones'

    return {
      riskyEV,
      safeBridgeEV: safeBridgeCoins,
      instantShoreEV: instantShoreCoins,
      totalFarCoins:
        stoneMotivatedCoins[1] +
        stoneMotivatedCoins[2] +
        stoneMotivatedCoins[3] +
        stoneMotivatedCoins[4],
      bestChoice,
    }
  }, [stoneMotivatedCoins])

  const hopNextStone = () => {
    if (rabbitStatus === 'fell' || rabbitStatus === 'crossed') return
    const roll = Math.floor(Math.random() * 6) + 1
    setLastHopRoll(roll)
    if (roll <= 2) {
      setRabbitStatus('fell')
      setCollectedCoins((c) => c - 30)
    } else {
      const nextStep = rabbitStep + 1
      const gained = stoneMotivatedCoins[nextStep] ?? 4
      setRabbitStep(nextStep)
      setCollectedCoins((c) => c + gained)
      setRabbitStatus(nextStep >= 4 ? 'crossed' : 'hopping')
    }
  }

  const resetRabbit = () => {
    setRabbitStep(0)
    setRabbitStatus('ready')
    setCollectedCoins(0)
    setLastHopRoll(null)
  }

  // Lively valley sky & meadow background that becomes slightly lighter when discount factor (gamma) is lower
  const arenaBackground = useMemo(() => {
    const t = 1 - gamma // 0 when gamma=1, 1 when gamma=0 (lighter when gamma is lower)
    // Sky top (deep valley teal-slate -> lighter misty morning sky as gamma lowers)
    const r1 = Math.round(22 + t * 52)
    const g1 = Math.round(44 + t * 58)
    const b1 = Math.round(56 + t * 62)

    // Valley meadow horizon (lush sage-emerald -> lighter sunlit meadow)
    const r2 = Math.round(26 + t * 48)
    const g2 = Math.round(62 + t * 56)
    const b2 = Math.round(48 + t * 44)

    // Riverbed water base (deep river blue-teal -> lighter aqua river)
    const r3 = Math.round(14 + t * 36)
    const g3 = Math.round(52 + t * 54)
    const b3 = Math.round(74 + t * 58)

    return `linear-gradient(180deg, rgb(${r1}, ${g1}, ${b1}) 0%, rgb(${r2}, ${g2}, ${b2}) 52%, rgb(${r3}, ${g3}, ${b3}) 100%)`
  }, [gamma])

  return (
    <div className="space-y-8 select-none">
      <style>{`
        @keyframes waveSlide {
          0% { transform: translateX(0px); }
          50% { transform: translateX(-18px); }
          100% { transform: translateX(0px); }
        }
        @keyframes lossShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-7px, 4px); }
          40% { transform: translate(7px, -4px); }
          60% { transform: translate(-5px, -3px); }
          80% { transform: translate(5px, 3px); }
        }
        @keyframes rabbitBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* ── WINDOW 1: "STAY & ROLL VS. QUIT" DICE GAME ── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#161618',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Dices size={18} className="text-[#f6e9c7]" />
            <h3 className="text-lg font-bold text-[#f4f4f5] tracking-tight">
              The "Stay & Roll vs. Quit" Dice Game
            </h3>
          </div>

          {hasPlayed && (
            <button
              type="button"
              onClick={() => setShowMathBehindIt((v) => !v)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showMathBehindIt
                  ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7]'
                  : 'bg-[#1f1e1a] text-[#f6e9c7] border-[#f6e9c7]/40 hover:bg-[#f6e9c7]/15'
              }`}
            >
              <BarChart3 size={14} />
              <span>{showMathBehindIt ? 'Hide Math Behind It' : 'Math behind it'}</span>
            </button>
          )}
        </div>

        <div className="space-y-5">
          {/* Live Dice Table */}
          <div className="bg-[#111113] p-5 rounded-xl border border-[rgba(255,255,255,0.07)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8e8e93] block">
                  Score
                </span>
                <span className="text-3xl font-mono font-bold text-white">{score} pts</span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border transition-all"
                  style={{
                    background:
                      lastRoll === null
                        ? '#1a1a20'
                        : lastRoll <= 2
                        ? 'rgba(239, 68, 68, 0.22)'
                        : 'rgba(16, 185, 129, 0.18)',
                    borderColor:
                      lastRoll === null
                        ? 'rgba(255,255,255,0.1)'
                        : lastRoll <= 2
                        ? '#ef4444'
                        : '#10b981',
                    animation: gameState === 'busted' ? 'lossShake 0.45s ease-in-out' : undefined,
                  }}
                >
                  {lastRoll ? DICE_FACES[lastRoll - 1] : '🎲'}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Turn #{turn}</div>
                  <div className="text-[#8e8e93]">
                    {lastRoll === null
                      ? 'Choose your action'
                      : lastRoll <= 2
                      ? `Rolled ${lastRoll} (33% Bust!)`
                      : `Rolled ${lastRoll} (67% Win → +4 pts!)`}
                  </div>
                </div>
              </div>
            </div>

            {gameState === 'playing' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <button
                  onClick={handleStayAndRoll}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#10b981]/15 hover:bg-[#10b981]/25 border border-[#10b981]/50 transition-all cursor-pointer group"
                >
                  <span className="text-sm font-bold text-[#10b981] group-hover:scale-105 transition-transform">
                    Stay & Roll (67% Win)
                  </span>
                  <span className="text-[11px] text-[#a7f3d0] mt-1">
                    67% chance (3–6): +4 pts • 33% chance (1–2): Lose!
                  </span>
                </button>

                <button
                  onClick={handleQuit}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#f6e9c7]/15 hover:bg-[#f6e9c7]/25 border border-[#f6e9c7]/50 transition-all cursor-pointer group"
                >
                  <span className="text-sm font-bold text-[#f6e9c7] group-hover:scale-105 transition-transform">
                    Quit Safely (+10 pts)
                  </span>
                  <span className="text-[11px] text-[#fdfbf7] mt-1">
                    100% chance: Lock in {score + 10} pts immediately
                  </span>
                </button>
              </div>
            ) : (
              <div
                className={`mb-4 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  gameState === 'quitted'
                    ? 'bg-[#10b981]/12 border-[#10b981]/40'
                    : 'bg-[#ef4444]/15 border-[#ef4444]/50'
                }`}
                style={{
                  animation: gameState === 'busted' ? 'lossShake 0.45s ease-in-out' : undefined,
                }}
              >
                <div>
                  <span
                    className={`text-sm font-bold block ${
                      gameState === 'quitted' ? 'text-[#10b981]' : 'text-[#ef4444]'
                    }`}
                  >
                    {gameState === 'quitted'
                      ? `Locked in ${score} points safely!`
                      : `BUSTED on a ${lastRoll} (33% risk)! You lost the +10 exit.`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMathBehindIt((v) => !v)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a1916] text-[#f6e9c7] border border-[#f6e9c7]/50 hover:bg-[#f6e9c7]/15 cursor-pointer"
                  >
                    <BarChart3 size={13} />
                    <span>{showMathBehindIt ? 'Hide Math Behind It' : 'Math behind it'}</span>
                  </button>
                  <button
                    onClick={handleResetGame}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#f6e9c7] text-[#1a1813] hover:bg-[#ebd6a1] cursor-pointer shrink-0"
                  >
                    <RotateCcw size={13} />
                    <span>Play Again</span>
                  </button>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#18181c] text-xs border border-[rgba(255,255,255,0.04)]"
                  >
                    <span className="text-[#cbd5e1]">
                      <strong className="text-[#8e8e93] font-mono mr-2">T{h.turn}:</strong>
                      {h.outcome}
                    </span>
                    <span className="font-mono font-semibold text-white">{h.scoreAfter} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revealed by "Math behind it" button: Why Humans Fall for the Dice Trap + Probability Graph (All in %) */}
          {showMathBehindIt && (
            <div className="p-5 rounded-xl bg-[#111113] border border-[#f6e9c7]/35 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center animate-fade-in">
              {/* Left 6 Cols: Explanation & EV Breakdown */}
              <div className="lg:col-span-6 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
                  Why Humans Fall for the Dice Trap
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  Most players press <strong className="text-white">Stay & Roll</strong> because a{' '}
                  <code className="text-[#10b981]">67%</code> win probability feels high. But let's
                  check the exact <strong className="text-white">Expected Value (EV)</strong>:
                </p>

                <div className="space-y-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-[#18181e] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
                    <span className="text-[#a1a1aa]">1. Quit Immediately (100% safe):</span>
                    <span className="font-mono font-bold text-[#10b981]">10.00 pts</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#18181e] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
                    <span className="text-[#a1a1aa]">2. Roll Once, then Quit:</span>
                    <span className="font-mono font-bold text-[#facc15]">
                      67% × (4 + 10) = 9.33 pts
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#18181e] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
                    <span className="text-[#a1a1aa]">3. Stay & Roll Forever:</span>
                    <span className="font-mono font-bold text-[#ef4444]">
                      V = 67% × (4 + V) ⇒ 8.00 pts
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#a1a1aa] leading-relaxed pt-1">
                  Every time you roll, you face a <code className="text-[#ef4444]">33%</code> risk
                  of losing your <strong className="text-white">+10 exit option</strong> (costing{' '}
                  <code className="text-[#ef4444]">−3.33 expected points</code>) to gain{' '}
                  <code className="text-[#10b981]">67% × 4 = +2.67</code> expected points. Your
                  probability of surviving without busting compounds as{' '}
                  <code className="text-[#f6e9c7]">(67%)^k</code>!
                </p>
              </div>

              {/* Right 6 Cols: Probability of Reaching High Score & EV Decay Graph */}
              <div className="lg:col-span-6 p-4 rounded-xl bg-[#18181c] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#f6e9c7] font-bold">
                    Probability of Surviving k Rolls to Reach High Score
                  </span>
                  <span className="text-[#a1a1aa]">P(survive) = (67%)^k</span>
                </div>

                <svg viewBox="0 0 320 165" className="w-full h-44 overflow-visible">
                  {[0, 0.25, 0.5, 0.75, 1.0].map((tick) => {
                    const y = 130 - tick * 100
                    return (
                      <g key={tick}>
                        <line
                          x1="34"
                          y1={y}
                          x2="305"
                          y2={y}
                          stroke="rgba(255,255,255,0.07)"
                          strokeWidth="1"
                        />
                        <text
                          x="6"
                          y={y + 3}
                          fontSize="8"
                          fontFamily="monospace"
                          fill="#8e8e93"
                        >
                          {Math.round(tick * 100)}%
                        </text>
                      </g>
                    )
                  })}

                  {DICE_TRAP_SERIES.map((d, i) => {
                    const x = 44 + i * 44
                    const barH = d.survivalProbPct
                    const y = 130 - barH
                    const barColor =
                      i === 0 ? '#10b981' : i <= 2 ? '#eab308' : '#ef4444'

                    return (
                      <g key={d.rolls}>
                        <rect
                          x={x}
                          y={y}
                          width="26"
                          height={barH}
                          rx="4"
                          fill={barColor}
                          fillOpacity="0.82"
                        />
                        <text
                          x={x + 13}
                          y={y - 5}
                          textAnchor="middle"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          {d.survivalProbPct}%
                        </text>
                        <text
                          x={x + 13}
                          y="144"
                          textAnchor="middle"
                          fontSize="8"
                          fontFamily="monospace"
                          fill="#f6e9c7"
                        >
                          {d.targetScore}pts
                        </text>
                        <text
                          x={x + 13}
                          y="155"
                          textAnchor="middle"
                          fontSize="7.5"
                          fontFamily="monospace"
                          fill="#8e8e93"
                        >
                          {d.rolls}r (EV {d.ev})
                        </text>
                      </g>
                    )
                  })}
                </svg>

                <div className="text-[11px] text-[#a1a1aa] flex items-center justify-between pt-1 border-t border-white/10 font-mono">
                  <span>10 pts: 100% chance</span>
                  <span>18 pts: 44% chance</span>
                  <span className="text-[#ef4444]">30 pts: only 13% chance!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── WINDOW 2: RABBIT STEPPING STONES & GAMMA (γ) COIN MOTIVATION ── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#161618',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-[#f59e0b]" />
            <h3 className="text-lg font-bold text-white">
              Rabbit Stepping Stones & Discount Factor (γ) Motivation
            </h3>
          </div>
          <span className="text-xs font-mono text-[#f6e9c7] bg-[#1f1e1a] px-3 py-1 rounded-full border border-[#f6e9c7]/30">
            Increase γ to spawn more coins on far stones!
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 7 Cols: Rabbit Jumping on Stones Collecting Coins */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className="p-4 rounded-2xl border relative overflow-hidden transition-all duration-300"
              style={{
                background: arenaBackground,
                borderColor:
                  rabbitStatus === 'fell' ? '#ef4444' : 'rgba(246, 233, 199, 0.35)',
                animation: rabbitStatus === 'fell' ? 'lossShake 0.5s ease-in-out' : undefined,
              }}
            >
              {/* ── LIVELY VALLEY SCENERY & FLOWING WATER UNDER THE STONES (BUILT FROM SCRATCH) ── */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Distant Valley Mountains, Rolling Green Hills & Pine Trees */}
                <svg
                  viewBox="0 0 600 260"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                >
                  {/* Warm Valley Sun Glow */}
                  <circle
                    cx="510"
                    cy="44"
                    r={22 + gamma * 10}
                    fill="rgba(246, 233, 199, 0.22)"
                  />
                  <circle cx="510" cy="44" r="13" fill="rgba(253, 251, 247, 0.45)" />

                  {/* Soft Valley Clouds */}
                  <g fill="rgba(253, 251, 247, 0.14)">
                    <ellipse cx="115" cy="38" rx="34" ry="10" />
                    <ellipse cx="135" cy="34" rx="24" ry="9" />
                    <ellipse cx="320" cy="30" rx="40" ry="9" />
                  </g>

                  {/* Far Mountain Ridge */}
                  <path
                    d="M0,135 L75,78 L155,122 L250,64 L355,118 L445,72 L535,112 L600,82 L600,165 L0,165 Z"
                    fill="rgba(20, 48, 42, 0.45)"
                  />

                  {/* Rolling Lively Green Valley Hills */}
                  <path
                    d="M0,142 Q95,102 205,134 T420,126 T600,136 L600,180 L0,180 Z"
                    fill="rgba(22, 101, 52, 0.55)"
                  />
                  <path
                    d="M0,156 Q140,128 280,152 T600,148 L600,190 L0,190 Z"
                    fill="rgba(21, 128, 61, 0.52)"
                  />

                  {/* Valley Pine Trees Along the Riverbanks */}
                  {[28, 52, 165, 435, 548, 574].map((tx, i) => (
                    <g key={i} transform={`translate(${tx}, ${i % 2 === 0 ? 118 : 124})`}>
                      <polygon points="10,0 0,22 20,22" fill="rgba(20, 83, 45, 0.85)" />
                      <polygon points="10,8 -2,30 22,30" fill="rgba(22, 101, 52, 0.9)" />
                      <rect x="8" y="30" width="4" height="6" fill="rgba(68, 64, 60, 0.8)" />
                    </g>
                  ))}
                </svg>

                {/* Animated Flowing River Water Stream Directly Under the Stepping Stones */}
                <div
                  className="absolute inset-x-0 bottom-0 h-32"
                  style={{ animation: 'waveSlide 3.6s ease-in-out infinite' }}
                >
                  <svg
                    viewBox="0 0 600 120"
                    preserveAspectRatio="none"
                    className="w-[108%] h-full -ml-[4%]"
                  >
                    {/* Upper River Current */}
                    <path
                      d="M0,26 Q75,12 150,26 T300,26 T450,26 T600,26 L600,120 L0,120 Z"
                      fill="rgba(14, 116, 144, 0.62)"
                    />
                    {/* Mid Shimmering Water Wave */}
                    <path
                      d="M0,46 Q75,62 150,46 T300,46 T450,46 T600,46 L600,120 L0,120 Z"
                      fill="rgba(2, 132, 199, 0.52)"
                    />
                    {/* Deep Riverbed Current */}
                    <path
                      d="M0,70 Q75,56 150,70 T300,70 T450,70 T600,70 L600,120 L0,120 Z"
                      fill="rgba(12, 74, 110, 0.72)"
                    />
                    {/* Sparkling Whitewater Ripples Under the Stones */}
                    <line x1="55" y1="42" x2="95" y2="42" stroke="rgba(224, 242, 254, 0.35)" strokeWidth="2" strokeLinecap="round" />
                    <line x1="185" y1="58" x2="235" y2="58" stroke="rgba(224, 242, 254, 0.35)" strokeWidth="2" strokeLinecap="round" />
                    <line x1="310" y1="45" x2="355" y2="45" stroke="rgba(224, 242, 254, 0.35)" strokeWidth="2" strokeLinecap="round" />
                    <line x1="440" y1="62" x2="490" y2="62" stroke="rgba(224, 242, 254, 0.35)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Top Status Row inside Arena */}
              <div className="relative z-10 flex items-center justify-between text-xs font-bold mb-3">
                <span className="px-2.5 py-1 rounded-full bg-black/45 text-white border border-white/10">
                  {gamma < 0.35
                    ? 'γ ≈ 0 (Low Motivation): Far stones have 0 coins — Rabbit stays on Shore!'
                    : gamma < 0.75
                    ? 'γ ≈ 0.5 (Moderate Motivation): Far coin stacks are shrinking'
                    : 'γ ≈ 1.0 (High Motivation): Far stones overflow with golden coins!'}
                </span>
                <span className="font-mono px-3 py-1 rounded-full bg-black/55 text-[#fbbf24] border border-[#fbbf24]/30">
                  Bag: {collectedCoins} coins
                </span>
              </div>

              {/* ── 5 STEPPING STONES WITH DYNAMIC GAMMA COIN STACKS & RABBIT ── */}
              <div className="relative z-10 grid grid-cols-5 gap-2 items-end my-5 pt-4">
                {[0, 1, 2, 3, 4].map((st) => {
                  const isRabbitHere = rabbitStep === st
                  const isPassed = rabbitStep > st
                  const coinsOnStone = stoneMotivatedCoins[st]
                  const baseCoins = STONE_BASE_COINS[st]

                  return (
                    <div key={st} className="flex flex-col items-center">
                      {/* Above Stone: Either the Rabbit or the Dynamic Stack of Golden Coins */}
                      <div className="h-14 flex flex-col items-center justify-end mb-1">
                        {isRabbitHere ? (
                          <div
                            style={{
                              animation:
                                rabbitStatus !== 'fell'
                                  ? 'rabbitBounce 1.1s ease-in-out infinite'
                                  : undefined,
                            }}
                          >
                            <RabbitSvg slipped={rabbitStatus === 'fell'} />
                          </div>
                        ) : isPassed ? (
                          <span className="text-[10px] font-mono text-[#10b981] font-bold">
                            Collected ✓
                          </span>
                        ) : (
                          <CoinStackSvg count={coinsOnStone} />
                        )}
                      </div>

                      {/* Coin Badge */}
                      <div
                        className={`mb-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          coinsOnStone > 0
                            ? 'bg-[#f59e0b]/20 text-[#fde68a] border-[#f59e0b]/40'
                            : 'bg-black/30 text-[#71717a] border-white/10'
                        }`}
                      >
                        +{coinsOnStone} {coinsOnStone === 1 ? 'coin' : 'coins'}
                      </div>

                      {/* Physical Stepping Stone */}
                      <div
                        className="w-full py-2.5 px-1.5 rounded-2xl border-2 text-center transition-all shadow-md"
                        style={{
                          background:
                            isRabbitHere && rabbitStatus === 'fell'
                              ? 'rgba(239, 68, 68, 0.5)'
                              : isRabbitHere
                              ? '#f6e9c7'
                              : isPassed
                              ? 'rgba(16, 185, 129, 0.28)'
                              : 'rgba(24, 24, 28, 0.88)',
                          borderColor:
                            isRabbitHere && rabbitStatus === 'fell'
                              ? '#ef4444'
                              : isRabbitHere
                              ? '#ffffff'
                              : isPassed
                              ? '#10b981'
                              : 'rgba(255,255,255,0.18)',
                        }}
                      >
                        <div
                          className={`text-[10px] font-bold ${
                            isRabbitHere && rabbitStatus !== 'fell' ? 'text-[#1a1813]' : 'text-white'
                          }`}
                        >
                          {st === 0 ? 'Shore' : st === 4 ? 'Stone 4' : `Stone ${st}`}
                        </div>
                        <div
                          className={`text-[9px] font-mono ${
                            isRabbitHere && rabbitStatus !== 'fell'
                              ? 'text-[#3a3528]'
                              : 'text-[#a1a1aa]'
                          }`}
                        >
                          {st === 0 ? 'Base 10' : `${baseCoins}×γ^${st}`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Controls & Outcome Row */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/15">
                <div className="text-xs font-bold">
                  {rabbitStatus === 'fell' ? (
                    <span className="text-[#fecaca] bg-[#ef4444]/30 px-3 py-1 rounded-lg border border-[#ef4444]">
                      Rabbit slipped into the river! (Rolled {lastHopRoll} • 33% hazard → −30 coins)
                    </span>
                  ) : rabbitStatus === 'crossed' ? (
                    <span className="text-[#a7f3d0] bg-[#10b981]/25 px-3 py-1 rounded-lg border border-[#10b981]">
                      Rabbit reached Stone 4! Collected {collectedCoins} total coins!
                    </span>
                  ) : (
                    <span className="text-white/90">
                      Each hop: <strong className="text-[#10b981]">67% Safe (Collect Stone Coins)</strong> •{' '}
                      <strong className="text-[#ef4444]">33% Slip (−30 coins)</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {rabbitStatus !== 'fell' && rabbitStatus !== 'crossed' && (
                    <button
                      onClick={hopNextStone}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#f6e9c7] text-[#1a1813] hover:bg-[#ebd6a1] cursor-pointer shadow"
                    >
                      Hop Next Stone (67% Safe) →
                    </button>
                  )}
                  <button
                    onClick={resetRabbit}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-black/55 text-white hover:bg-black/80 cursor-pointer border border-white/15"
                  >
                    Reset Rabbit
                  </button>
                </div>
              </div>
            </div>

            {/* GAMMA (γ) SLIDER CONTROL */}
            <div className="p-4 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
                  Discount Factor γ (Future Coin Motivation) = {gamma.toFixed(2)}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#f6e9c7]/15 text-[#f6e9c7] border border-[#f6e9c7]/35 font-mono text-xs font-bold">
                  Far Stones Total: +{mdpMetrics.totalFarCoins} coins
                </span>
              </div>

              <input
                type="range"
                min="0.00"
                max="1.00"
                step="0.02"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full accent-[#f6e9c7] cursor-pointer my-1.5"
              />

              <div className="flex justify-between text-[10px] font-mono text-[#8e8e93]">
                <span>γ = 0.00 (0 coins on far stones → No motivation)</span>
                <span>γ = 1.00 (+60 coins across far stones → Full motivation!)</span>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Live AI Bellman Policy Comparison (Green, Yellow, Red — All in %) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.08)] space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                How γ Coin Stacks Change the Rabbit's Decision
              </div>

              <div className="space-y-2">
                {/* 1. Green */}
                <div className="p-3 rounded-xl bg-[#18181e] border border-[#10b981]/30">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-semibold text-[#10b981]">
                      1. Stay on Shore (+10 Coins, 100% Safe)
                    </span>
                    <span className="font-mono font-bold text-[#10b981]">
                      +{mdpMetrics.instantShoreEV.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8e8e93]">
                    Wins when γ is low because far stones shrink to almost 0 coins!
                  </p>
                </div>

                {/* 2. Yellow */}
                <div className="p-3 rounded-xl bg-[#18181e] border border-[#eab308]/30">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-semibold text-[#facc15]">
                      2. Safe Detour Bridge (100% Safe, Far Coins)
                    </span>
                    <span className="font-mono font-bold text-[#facc15]">
                      +{mdpMetrics.safeBridgeEV.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8e8e93]">
                    Stone 4 holds +{stoneMotivatedCoins[4]} coins (28 × γ⁴). Wins when γ is high!
                  </p>
                </div>

                {/* 3. Red */}
                <div className="p-3 rounded-xl bg-[#18181e] border border-[#ef4444]/30">
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="font-semibold text-[#ef4444]">
                      3. Hop Risky Stones (67% Safe / 33% Slip)
                    </span>
                    <span className="font-mono font-bold text-[#ef4444]">
                      {mdpMetrics.riskyEV >= 0
                        ? `+${mdpMetrics.riskyEV.toFixed(1)}`
                        : mdpMetrics.riskyEV.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8e8e93]">
                    Each hop has a 67% success rate and a 33% river slip risk (−30 coins).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f6e9c7]/12 border border-[#f6e9c7]/35 text-xs text-[#fdfbf7]">
                <strong className="text-[#f6e9c7]">Optimal Rabbit Policy:</strong>{' '}
                <span className="font-mono font-bold underline">{mdpMetrics.bestChoice}</span>
              </div>
            </div>
          </div>
        </div>

        <UnderTheHood
          id="probability-bayesian-python"
          title="Under the hood: Bellman Expected Value (γ) & Bayesian Updating in Python"
          explanation="See how discount factor gamma (γ) scales future coin rewards on distant stones using percentage probabilities (67% vs 33%)."
          defaultCode={PYTHON_PROBABILITY_CODE}
        />
      </div>
    </div>
  )
}
