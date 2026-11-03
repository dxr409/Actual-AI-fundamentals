import React, { useState, useEffect } from 'react'
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Scissors,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  ChevronRight,
} from 'lucide-react'
import UnderTheHood from './UnderTheHood'

type AdvAlgoId = 'minimax' | 'alphabeta' | 'expectiminimax'
type PlayerRole = 'max' | 'min'

const ACCENT = '#f6e9c7'

interface AdvAlgoMeta {
  id: AdvAlgoId
  name: string
  shortName: string
  subtitle: string
  color: string
  formula: string
  summary: string
}

const ADV_ALGOS: Record<AdvAlgoId, AdvAlgoMeta> = {
  minimax: {
    id: 'minimax',
    name: 'Minimax (Tug-of-War)',
    shortName: 'Minimax',
    subtitle: 'Interactive Rope Pull (MAX ↑ vs MIN ↓)',
    color: ACCENT,
    formula: 'MAX pulls UP: max(children) • MIN pulls DOWN: min(children)',
    summary:
      'MAX wants to pull the rope marker as high UP (+) as possible; MIN wants to yank it as far DOWN (−) as possible. Since MIN always picks the counter-athlete that pulls lowest, MAX picks Athlete A whose worst-case pull is still +6m UP!',
  },
  alphabeta: {
    id: 'alphabeta',
    name: 'Alpha-Beta Pruning',
    shortName: 'Alpha-Beta',
    subtitle: 'Visual Branch Cutting on the Rope Tree',
    color: ACCENT,
    formula: 'Cut remaining athletes as soon as β ≤ α (+6m floor)',
    summary:
      'Once Athlete A guarantees a rope height of at least α = +6m UP, seeing Athlete B’s first counter-puller yank the rope to −15m (β = −15m ≤ +6m) proves Athlete B is hopeless. We snip the +25m and +10m branches without testing them!',
  },
  expectiminimax: {
    id: 'expectiminimax',
    name: 'Expectiminimax',
    shortName: 'Expectiminimax',
    subtitle: 'Visualizing Chance (33% Stamina / Wind Rolls)',
    color: ACCENT,
    formula: 'CHANCE node = 33.3% × Pull₁ + 33.3% × Pull₂ + 33.3% × Pull₃',
    summary:
      'When the opposing pull is governed by random stamina/wind gusts (33% chance each) instead of a rational MIN enemy, we compute the average rope height: Athlete A averages +8.7m UP, Athlete B averages +6.7m UP, and Athlete C averages +3.7m UP.',
  },
}

interface AthleteSquad {
  id: number
  name: string
  tag: string
  counterAthletes: [
    { name: string; ropeHeight: number },
    { name: string; ropeHeight: number },
    { name: string; ropeHeight: number },
  ]
}

const ATHLETE_SQUADS: AthleteSquad[] = [
  {
    id: 0,
    name: 'Athlete A · Steady Grip',
    tag: 'Consistent Upward Pull',
    counterAthletes: [
      { name: 'MIN Puller A1', ropeHeight: 6 },
      { name: 'MIN Puller A2', ropeHeight: 9 },
      { name: 'MIN Puller A3', ropeHeight: 11 },
    ],
  },
  {
    id: 1,
    name: 'Athlete B · Power Burst',
    tag: '+25m Bait / −15m Slip',
    counterAthletes: [
      { name: 'MIN Anchor B1', ropeHeight: -15 },
      { name: 'MIN Puller B2', ropeHeight: 25 },
      { name: 'MIN Puller B3', ropeHeight: 10 },
    ],
  },
  {
    id: 2,
    name: 'Athlete C · Quick Sprint',
    tag: 'Volatile Stamina',
    counterAthletes: [
      { name: 'MIN Puller C1', ropeHeight: 2 },
      { name: 'MIN Puller C2', ropeHeight: 14 },
      { name: 'MIN Anchor C3', ropeHeight: -5 },
    ],
  },
]

interface AlphaBetaStep {
  stepIdx: number
  title: string
  alpha: number | null
  beta: number | null
  ropePreview: number
  evaluated: string[]
  pruned: string[]
  explanation: string
}

const ALPHABETA_STEPS: AlphaBetaStep[] = [
  {
    stepIdx: 0,
    title: 'Step 1: Evaluate Athlete A (Full Scan)',
    alpha: 6,
    beta: 6,
    ropePreview: 6,
    evaluated: ['0-0', '0-1', '0-2'],
    pruned: [],
    explanation:
      'We test all 3 MIN counter-pullers under Athlete A: +6m, +9m, and +11m. MIN chooses +6m (the lowest). MAX now locks in a guaranteed floor of α = +6m UP on the rope!',
  },
  {
    stepIdx: 1,
    title: 'Step 2: Athlete B — First Pull Hits −15m (PRUNE!)',
    alpha: 6,
    beta: -15,
    ropePreview: -15,
    evaluated: ['0-0', '0-1', '0-2', '1-0'],
    pruned: ['1-1', '1-2'],
    explanation:
      'Athlete B’s very first counter-puller (B1) yanks the rope down to −15m! That means MIN can force Athlete B to ≤ −15m (β = −15m). Since MAX already has α = +6m from Athlete A, we SNIP B2 (+25m) and B3 (+10m) without evaluating them!',
  },
  {
    stepIdx: 2,
    title: 'Step 3: Athlete C — First Pull Hits +2m (PRUNE!)',
    alpha: 6,
    beta: 2,
    ropePreview: 6,
    evaluated: ['0-0', '0-1', '0-2', '1-0', '2-0'],
    pruned: ['1-1', '1-2', '2-1', '2-2'],
    explanation:
      'Athlete C’s first counter-puller (C1) pulls the rope to +2m (β = +2m ≤ α = +6m). Even before checking C2 (+14m) or C3 (−5m), we know Athlete C cannot beat Athlete A’s +6m. We snip C2 and C3—saving 44% of leaf evaluations!',
  },
]

const PYTHON_ADV_SNIPPETS: Record<AdvAlgoId, { title: string; explanation: string; code: string }> = {
  minimax: {
    title: 'Minimax Vertical Rope Tug-of-War in Python',
    explanation: 'MAX selects the athlete that maximizes the rope height; MIN selects the counter-athlete that pulls the rope height as low as possible.',
    code: `def minimax_rope(node, depth, is_max_turn):
    if depth == 0 or node.is_leaf():
        return node.rope_height

    if is_max_turn:
        # MAX pulls UPWARD (+): pick highest guaranteed rope height
        return max(minimax_rope(child, depth - 1, False) for child in node.children)
    else:
        # MIN pulls DOWNWARD (-): pick lowest rope height
        return min(minimax_rope(child, depth - 1, True) for child in node.children)`,
  },
  alphabeta: {
    title: 'Alpha-Beta Pruning in Python',
    explanation: 'Tracks alpha (MAX upward floor) and beta (MIN downward ceiling). As soon as beta <= alpha, remaining counter-athletes are snipped.',
    code: `def alphabeta_rope(node, depth, alpha, beta, is_max_turn):
    if depth == 0 or node.is_leaf():
        return node.rope_height

    if is_max_turn:
        val = float('-inf')
        for child in node.children:
            val = max(val, alphabeta_rope(child, depth - 1, alpha, beta, False))
            alpha = max(alpha, val)
            if beta <= alpha:
                break  # Prune remaining athletes!
        return val
    else:
        val = float('inf')
        for child in node.children:
            val = min(val, alphabeta_rope(child, depth - 1, alpha, beta, True))
            beta = min(beta, val)
            if beta <= alpha:
                break  # Prune remaining counter-pullers!
        return val`,
  },
  expectiminimax: {
    title: 'Expectiminimax (Chance Stamina Nodes) in Python',
    explanation: 'Replaces the adversarial MIN layer with a CHANCE layer that averages rope height over 33.3% probability outcomes.',
    code: `def expectiminimax_rope(node, depth, turn_type):
    if depth == 0 or node.is_leaf():
        return node.rope_height

    if turn_type == 'MAX':
        return max(expectiminimax_rope(c, depth - 1, 'CHANCE') for c in node.children)
    elif turn_type == 'CHANCE':
        # Each stamina outcome has 33.3% (0.333) probability
        return sum(0.3333 * expectiminimax_rope(c, depth - 1, 'MAX') for c in node.children)`,
  },
}

interface VisualAdvChallenge {
  id: string
  title: string
  subtitle: string
  tag: string
  correctAlgo: AdvAlgoId
  explanation: string
  visualType: 'ttt' | 'chess' | 'dice' | 'connect4'
}

const ADV_CHALLENGES: VisualAdvChallenge[] = [
  {
    id: 'adv1',
    title: 'Tic-Tac-Toe Endgame',
    subtitle: 'Only 4 empty squares left (< 20 total states)',
    tag: 'Tiny Exact Tree',
    correctAlgo: 'minimax',
    explanation: 'On a tiny tree with no randomness, pure Minimax checks every single state in microseconds for 100% optimal play.',
    visualType: 'ttt',
  },
  {
    id: 'adv2',
    title: 'Grandmaster Chess Engine',
    subtitle: '35 moves/turn • Deep tactical traps',
    tag: 'High Branching + Eval',
    correctAlgo: 'alphabeta',
    explanation: 'Alpha-Beta Pruning cuts hopeless variations immediately, letting the engine search twice as deep per second.',
    visualType: 'chess',
  },
  {
    id: 'adv3',
    title: 'Backgammon / Dice Duel',
    subtitle: 'Opponent moves + random dice rolls',
    tag: 'Adversary + Chance',
    correctAlgo: 'expectiminimax',
    explanation: 'Expectiminimax handles random turns by taking probability-weighted averages instead of assuming worst-case outcomes.',
    visualType: 'dice',
  },
  {
    id: 'adv4',
    title: 'Tournament Checkers (Depth 14)',
    subtitle: 'Billions of deep branches • Deterministic jumps',
    tag: 'Deep Pruning Needed',
    correctAlgo: 'alphabeta',
    explanation: 'Searching 14 plies deep in Checkers requires Alpha-Beta Pruning to snip losing branches before they explode.',
    visualType: 'connect4',
  },
]

// Maps rope height in [-18, +26] to vertical percentage [88% (bottom) .. 12% (top)]
function ropeHeightToTopPct(h: number): number {
  const clamped = Math.max(-18, Math.min(26, h))
  const norm = (clamped - -18) / (26 - -18) // 0 at -18, 1 at +26
  return 88 - norm * 76
}

export default function AdversarialSearchPlayground() {
  const [selectedAlgo, setSelectedAlgo] = useState<AdvAlgoId>('minimax')
  const [role, setRole] = useState<PlayerRole>('max')

  // Minimax interactive state:
  // When role === 'max': human picks 1 of the 3 MAX Athletes (0, 1, 2)
  const [maxChosenSquad, setMaxChosenSquad] = useState<number | null>(null)

  // When role === 'min': human picks 1 of the 3 MIN Athletes inside the active squad (or across squads)
  const [minActiveSquad, setMinActiveSquad] = useState<number>(1) // Default to Squad B (+25m / -15m) so MIN can yank it to -15m!
  const [minChosenPuller, setMinChosenPuller] = useState<number | null>(null)

  // Alpha-Beta visual step state (0, 1, 2)
  const [abStepIdx, setAbStepIdx] = useState<number>(2)
  const [abPlaying, setAbPlaying] = useState<boolean>(false)

  // Expectiminimax visual state
  const [expSelectedSquad, setExpSelectedSquad] = useState<number>(0)
  const [expSampledIdx, setExpSampledIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!abPlaying || selectedAlgo !== 'alphabeta') return
    const timer = setTimeout(() => {
      setAbStepIdx((prev) => {
        if (prev >= ALPHABETA_STEPS.length - 1) {
          setAbPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1800)
    return () => clearTimeout(timer)
  }, [abPlaying, abStepIdx, selectedAlgo])

  const resetGame = () => {
    setMaxChosenSquad(null)
    setMinChosenPuller(null)
    setExpSampledIdx(null)
  }

  const handleRoleSwitch = (newRole: PlayerRole) => {
    setRole(newRole)
    resetGame()
  }

  // Compute Minimax Outcome when playing as MAX
  const maxTurnOutcome = (() => {
    if (maxChosenSquad === null) return null
    const squad = ATHLETE_SQUADS[maxChosenSquad]
    const heights = squad.counterAthletes.map((c) => c.ropeHeight)
    const minVal = Math.min(...heights)
    const minIdx = heights.indexOf(minVal)
    const counter = squad.counterAthletes[minIdx]
    return {
      finalHeight: minVal,
      pickedIdx: minIdx,
      isOptimal: maxChosenSquad === 0,
      message:
        maxChosenSquad === 0
          ? `Optimal Upward Pull! Even after ${counter.name} pulled downward as hard as possible, the rope stays at +6m UP (the highest guaranteed height!).`
          : maxChosenSquad === 1
          ? `Pulled Down! You chased Athlete B's +25m upward burst, so MIN sent ${counter.name} to yank the rope down to −15m! Athlete A guarantees +6m UP.`
          : `Pulled Down! MIN countered with ${counter.name} and dragged the rope to −5m DOWN. Athlete A guarantees +6m UP.`,
    }
  })()

  // Compute Minimax Outcome when playing as MIN (selecting 1 of the 3 MIN athletes to pull rope DOWN)
  const minTurnOutcome = (() => {
    if (minChosenPuller === null) return null
    const squad = ATHLETE_SQUADS[minActiveSquad]
    const chosen = squad.counterAthletes[minChosenPuller]
    const heights = squad.counterAthletes.map((c) => c.ropeHeight)
    const minVal = Math.min(...heights)
    const isOptimalMin = chosen.ropeHeight === minVal
    return {
      finalHeight: chosen.ropeHeight,
      isOptimal: isOptimalMin,
      message: isOptimalMin
        ? `Perfect Downward Pull! You selected ${chosen.name} (${chosen.ropeHeight >= 0 ? `+${chosen.ropeHeight}m` : `${chosen.ropeHeight}m`}), pulling the rope to the lowest possible point against ${squad.name}!`
        : `Missed Downward Pull! You picked ${chosen.name} (${chosen.ropeHeight >= 0 ? `+${chosen.ropeHeight}m` : `${chosen.ropeHeight}m`}), letting the rope stay high! Another MIN athlete in this group could pull it to ${minVal >= 0 ? `+${minVal}m` : `${minVal}m`}.`,
    }
  })()

  // Current Rope Height shown on the Vertical Rope Gauge
  const currentRopeHeight = (() => {
    if (selectedAlgo === 'minimax') {
      if (role === 'max') {
        return maxTurnOutcome ? maxTurnOutcome.finalHeight : 0
      } else {
        return minTurnOutcome ? minTurnOutcome.finalHeight : 0
      }
    }
    if (selectedAlgo === 'alphabeta') {
      return ALPHABETA_STEPS[abStepIdx].ropePreview
    }
    // expectiminimax
    const sq = ATHLETE_SQUADS[expSelectedSquad]
    if (expSampledIdx !== null) {
      return sq.counterAthletes[expSampledIdx].ropeHeight
    }
    const avg =
      (sq.counterAthletes[0].ropeHeight +
        sq.counterAthletes[1].ropeHeight +
        sq.counterAthletes[2].ropeHeight) /
      3
    return Math.round(avg * 10) / 10
  })()

  const [answers, setAnswers] = useState<Record<string, AdvAlgoId>>({})
  const correctCount = ADV_CHALLENGES.filter((c) => answers[c.id] === c.correctAlgo).length
  const algoMeta = ADV_ALGOS[selectedAlgo]
  const snippet = PYTHON_ADV_SNIPPETS[selectedAlgo]
  const abStep = ALPHABETA_STEPS[abStepIdx]

  return (
    <div className="space-y-8 select-none">
      {/* ── WINDOW 1: VERTICAL ROPE TUG-OF-WAR & ADVERSARIAL SEARCH VISUALIZER ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: '#161618',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Row 1: 3 Adversarial Search Methods Selector (Accent Color #f6e9c7) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {(['minimax', 'alphabeta', 'expectiminimax'] as AdvAlgoId[]).map((aId) => {
            const meta = ADV_ALGOS[aId]
            const active = selectedAlgo === aId
            return (
              <button
                key={aId}
                onClick={() => {
                  setSelectedAlgo(aId)
                  resetGame()
                }}
                className="p-3 rounded-xl border text-left transition-all cursor-pointer"
                style={{
                  background: active ? 'rgba(246, 233, 199, 0.14)' : '#111113',
                  borderColor: active ? ACCENT : 'rgba(255,255,255,0.07)',
                  boxShadow: active ? '0 0 12px rgba(246, 233, 199, 0.18)' : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="font-bold text-xs"
                    style={{ color: active ? ACCENT : '#e5e5ea' }}
                  >
                    {meta.shortName}
                  </span>
                  {active && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
                    />
                  )}
                </div>
                <span className="text-[10px] text-[#8e8e93] block truncate">{meta.subtitle}</span>
              </button>
            )
          })}
        </div>

        {/* Mode-Specific Controls Bar */}
        {selectedAlgo === 'minimax' && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-[#111113] p-1 rounded-xl border border-[rgba(255,255,255,0.07)]">
              <button
                onClick={() => handleRoleSwitch('max')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'max'
                    ? 'bg-[#f6e9c7] text-[#1a1813]'
                    : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                <ArrowUp size={13} />
                <span>Play as MAX (Pull Rope UP ↑)</span>
              </button>
              <button
                onClick={() => handleRoleSwitch('min')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'min'
                    ? 'bg-[#f6e9c7] text-[#1a1813]'
                    : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                <ArrowDown size={13} />
                <span>Play as MIN (Pull Rope DOWN ↓)</span>
              </button>
            </div>

            <button
              onClick={resetGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111113] border border-white/10 text-xs text-[#a1a1aa] hover:text-white cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Rope</span>
            </button>
          </div>
        )}

        {selectedAlgo === 'alphabeta' && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-[#111113] p-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5">
              {ALPHABETA_STEPS.map((st) => (
                <button
                  key={st.stepIdx}
                  onClick={() => {
                    setAbPlaying(false)
                    setAbStepIdx(st.stepIdx)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    abStepIdx === st.stepIdx
                      ? 'bg-[#f6e9c7] text-[#1a1813]'
                      : 'bg-[#1b1b20] text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Step {st.stepIdx + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (abStepIdx >= ALPHABETA_STEPS.length - 1) setAbStepIdx(0)
                  setAbPlaying((p) => !p)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f6e9c7]/15 text-[#f6e9c7] border border-[#f6e9c7]/40 hover:bg-[#f6e9c7]/25 cursor-pointer"
              >
                {abPlaying ? <Pause size={12} /> : <Play size={12} />}
                <span>{abPlaying ? 'Pause' : 'Auto-Step Pruning'}</span>
              </button>
            </div>
          </div>
        )}

        {selectedAlgo === 'expectiminimax' && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-[#111113] p-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#a1a1aa] mr-1 font-medium">Inspect Athlete:</span>
              {ATHLETE_SQUADS.map((sq, idx) => (
                <button
                  key={sq.id}
                  onClick={() => {
                    setExpSelectedSquad(idx)
                    setExpSampledIdx(null)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    expSelectedSquad === idx
                      ? 'bg-[#f6e9c7] text-[#1a1813]'
                      : 'bg-[#1b1b20] text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  {sq.name.split(' · ')[0]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setExpSampledIdx(Math.floor(Math.random() * 3))}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#f6e9c7] text-[#1a1813] hover:bg-[#ebd6a1] cursor-pointer"
            >
              <span>Simulate 33% Wind Roll</span>
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* ── MAIN ARENA: VERTICAL ROPE TOWER (LEFT 4 COLS) + ATHLETE TREE (RIGHT 8 COLS) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left 4 Cols: Live Vertical Tug-of-War Rope Tower */}
          <div className="lg:col-span-4 bg-[#111113] p-4 rounded-xl border border-[rgba(255,255,255,0.07)] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#10b981]">
                <ArrowUp size={14} />
                <span>MAX GOAL: PULL UP (+)</span>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#1c1c22] text-[#f6e9c7] border border-white/10">
                {currentRopeHeight > 0 ? `+${currentRopeHeight}m` : `${currentRopeHeight}m`}
              </span>
            </div>

            {/* Vertical Rope Shaft */}
            <div className="relative h-72 w-full rounded-xl bg-[#16161b] border border-white/5 overflow-hidden my-1">
              {/* Top Zone (MAX Victory Zone) */}
              <div
                className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0.0) 100%)',
                }}
              />
              {/* Bottom Zone (MIN Victory Zone) */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(0deg, rgba(239, 68, 68, 0.16) 0%, rgba(239, 68, 68, 0.0) 100%)',
                }}
              />

              {/* Elevation Ruler Marks */}
              {[25, 15, 6, 0, -5, -15].map((mark) => {
                const topPct = ropeHeightToTopPct(mark)
                const isZero = mark === 0
                const isAlphaFloor = selectedAlgo === 'alphabeta' && mark === 6
                return (
                  <div
                    key={mark}
                    className="absolute inset-x-0 flex items-center justify-between px-3 pointer-events-none"
                    style={{ top: `${topPct}%`, transform: 'translateY(-50%)' }}
                  >
                    <span
                      className={`text-[10px] font-mono ${
                        isAlphaFloor
                          ? 'text-[#f6e9c7] font-bold'
                          : isZero
                          ? 'text-white/70 font-bold'
                          : 'text-[#71717a]'
                      }`}
                    >
                      {mark > 0 ? `+${mark}m` : `${mark}m`}
                    </span>
                    <div
                      className={`flex-1 mx-2 border-t ${
                        isAlphaFloor
                          ? 'border-[#f6e9c7] border-dashed'
                          : isZero
                          ? 'border-white/25'
                          : 'border-white/5'
                      }`}
                    />
                    {isAlphaFloor && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#f6e9c7]/20 text-[#f6e9c7] border border-[#f6e9c7]/40">
                        α = +6m floor
                      </span>
                    )}
                  </div>
                )
              })}

              {/* The Vertical Braided Rope in Center */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-2.5 rounded-full"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, #d6c49e, #d6c49e 4px, #8c7853 4px, #8c7853 8px)',
                  boxShadow: '0 0 12px rgba(0,0,0,0.6)',
                }}
              />

              {/* Top MAX Puller Anchor Badge */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#10b981]/20 border border-[#10b981]/50 text-[10px] font-bold text-[#10b981] flex items-center gap-1">
                <ArrowUp size={10} /> MAX TEAM
              </div>

              {/* Bottom MIN Puller Anchor Badge */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#ef4444]/20 border border-[#ef4444]/50 text-[10px] font-bold text-[#ef4444] flex items-center gap-1">
                <ArrowDown size={10} /> MIN TEAM
              </div>

              {/* Animated Rope Knot / Ribbon Marker */}
              <div
                className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-out flex items-center gap-2 z-10"
                style={{
                  top: `${ropeHeightToTopPct(currentRopeHeight)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="px-3 py-1 rounded-full font-mono text-xs font-bold border-2 shadow-lg whitespace-nowrap flex items-center gap-1.5"
                  style={{
                    background:
                      currentRopeHeight > 0
                        ? '#10b981'
                        : currentRopeHeight < 0
                        ? '#ef4444'
                        : '#f6e9c7',
                    color: currentRopeHeight === 0 ? '#1a1813' : '#ffffff',
                    borderColor: '#ffffff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  }}
                >
                  <span>
                    Rope: {currentRopeHeight > 0 ? `+${currentRopeHeight}m` : `${currentRopeHeight}m`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#ef4444]">
                <ArrowDown size={14} />
                <span>MIN GOAL: PULL DOWN (−)</span>
              </div>
              <span className="text-[10px] text-[#8e8e93] font-mono">Zero-Sum Rope</span>
            </div>
          </div>

          {/* Right 8 Cols: Interactive Athlete Selection & Tree Visualization */}
          <div className="lg:col-span-8 bg-[#111113] p-4 rounded-xl border border-[rgba(255,255,255,0.07)] flex flex-col justify-between">
            <div>
              {/* Dynamic Instruction Banner */}
              <div className="mb-4 p-2.5 rounded-xl bg-[#18181f] border border-white/10 text-xs flex items-center justify-between gap-2">
                <span className="font-semibold text-[#f6e9c7]">
                  {selectedAlgo === 'minimax' ? (
                    role === 'max' ? (
                      'YOUR TURN (MAX ↑): Select 1 of the 3 MAX Athletes below to pull the rope as high UP as possible!'
                    ) : (
                      'YOUR TURN (MIN ↓): Select 1 of the 3 MIN Counter-Athletes in the highlighted group to yank the rope DOWN!'
                    )
                  ) : selectedAlgo === 'alphabeta' ? (
                    abStep.title
                  ) : (
                    'EXPECTIMINIMAX: Each Athlete’s 3 outcomes happen with 33.3% probability (Wind / Stamina Roll).'
                  )}
                </span>

                {selectedAlgo === 'minimax' && role === 'min' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-[#8e8e93] mr-1">Target MAX Athlete:</span>
                    {['A', 'B', 'C'].map((letter, idx) => (
                      <button
                        key={letter}
                        onClick={() => {
                          setMinActiveSquad(idx)
                          setMinChosenPuller(null)
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          minActiveSquad === idx
                            ? 'bg-[#f6e9c7] text-[#1a1813]'
                            : 'bg-[#25252d] text-[#a1a1aa] hover:text-white'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3 ATHLETE COLUMNS (MAX Squads -> 3 MIN Counter-Pullers each) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ATHLETE_SQUADS.map((squad, sIdx) => {
                  const heights = squad.counterAthletes.map((c) => c.ropeHeight)
                  const minHeight = Math.min(...heights)
                  const avgHeight =
                    Math.round(((heights[0] + heights[1] + heights[2]) / 3) * 10) / 10

                  const isSquadActive =
                    (selectedAlgo === 'minimax' && role === 'max' && maxChosenSquad === sIdx) ||
                    (selectedAlgo === 'minimax' && role === 'min' && minActiveSquad === sIdx) ||
                    (selectedAlgo === 'expectiminimax' && expSelectedSquad === sIdx) ||
                    (selectedAlgo === 'alphabeta' && sIdx === 0)

                  return (
                    <div
                      key={squad.id}
                      className="p-3 rounded-xl border transition-all flex flex-col justify-between"
                      style={{
                        background: isSquadActive ? 'rgba(246, 233, 199, 0.08)' : '#17171d',
                        borderColor: isSquadActive ? ACCENT : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* MAX Athlete Header Button */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedAlgo === 'minimax' && role === 'max') {
                              setMaxChosenSquad(sIdx)
                            } else if (selectedAlgo === 'minimax' && role === 'min') {
                              setMinActiveSquad(sIdx)
                              setMinChosenPuller(null)
                            } else if (selectedAlgo === 'expectiminimax') {
                              setExpSelectedSquad(sIdx)
                              setExpSampledIdx(null)
                            }
                          }}
                          className="w-full p-2.5 rounded-lg border text-left transition-all mb-2 cursor-pointer"
                          style={{
                            background: isSquadActive ? ACCENT : '#22222a',
                            color: isSquadActive ? '#1a1813' : '#f4f4f5',
                            borderColor: isSquadActive ? '#ffffff' : 'rgba(255,255,255,0.1)',
                          }}
                        >
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span>{squad.name}</span>
                            <ArrowUp size={13} />
                          </div>
                          <div
                            className={`text-[10px] mt-0.5 flex items-center justify-between font-mono ${
                              isSquadActive ? 'text-[#2c281e]' : 'text-[#a1a1aa]'
                            }`}
                          >
                            <span>{squad.tag}</span>
                            <strong>
                              {selectedAlgo === 'expectiminimax'
                                ? `Avg: +${avgHeight}m`
                                : `Min: ${minHeight >= 0 ? `+${minHeight}m` : `${minHeight}m`}`}
                            </strong>
                          </div>
                        </button>

                        {/* Sub-label for the 3 opposing pullers */}
                        <div className="text-[10px] font-mono text-[#8e8e93] mb-1.5 flex items-center justify-between px-0.5">
                          <span>
                            {selectedAlgo === 'expectiminimax'
                              ? '3 Stamina Outcomes (33% ea):'
                              : '3 Opposing MIN Athletes (↓):'}
                          </span>
                        </div>

                        {/* The 3 Counter-Athletes */}
                        <div className="space-y-1.5">
                          {squad.counterAthletes.map((ca, cIdx) => {
                            const nodeKey = `${sIdx}-${cIdx}`
                            const isPruned =
                              selectedAlgo === 'alphabeta' && abStep.pruned.includes(nodeKey)
                            const isEvaluated =
                              selectedAlgo === 'alphabeta' && abStep.evaluated.includes(nodeKey)

                            const isPickedByAiMin =
                              selectedAlgo === 'minimax' &&
                              role === 'max' &&
                              maxChosenSquad === sIdx &&
                              maxTurnOutcome?.pickedIdx === cIdx

                            const isPickedByHumanMin =
                              selectedAlgo === 'minimax' &&
                              role === 'min' &&
                              minActiveSquad === sIdx &&
                              minChosenPuller === cIdx

                            const isSampledInExp =
                              selectedAlgo === 'expectiminimax' &&
                              expSelectedSquad === sIdx &&
                              expSampledIdx === cIdx

                            const isHighlighted =
                              isPickedByAiMin || isPickedByHumanMin || isSampledInExp

                            const canClickAsMin =
                              selectedAlgo === 'minimax' && role === 'min'

                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => {
                                  if (canClickAsMin) {
                                    setMinActiveSquad(sIdx)
                                    setMinChosenPuller(cIdx)
                                  } else if (selectedAlgo === 'minimax' && role === 'max') {
                                    setMaxChosenSquad(sIdx)
                                  } else if (selectedAlgo === 'expectiminimax') {
                                    setExpSelectedSquad(sIdx)
                                    setExpSampledIdx(cIdx)
                                  }
                                }}
                                className="w-full px-2.5 py-2 rounded-lg border font-mono text-xs flex items-center justify-between transition-all cursor-pointer"
                                style={{
                                  background: isHighlighted
                                    ? ca.ropeHeight < 0
                                      ? '#ef4444'
                                      : '#10b981'
                                    : isPruned
                                    ? '#241316'
                                    : isEvaluated
                                    ? '#1e1e26'
                                    : '#111115',
                                  borderColor: isHighlighted
                                    ? '#ffffff'
                                    : isPruned
                                    ? 'rgba(239, 68, 68, 0.45)'
                                    : isEvaluated
                                    ? 'rgba(246, 233, 199, 0.35)'
                                    : 'rgba(255,255,255,0.07)',
                                  color: isHighlighted
                                    ? '#ffffff'
                                    : isPruned
                                    ? '#f87171'
                                    : '#e5e5ea',
                                  opacity: isPruned ? 0.55 : 1,
                                }}
                              >
                                <span className="truncate text-[11px]">{ca.name}</span>
                                <span className="font-bold flex items-center gap-1">
                                  {isPruned ? (
                                    <span className="text-[10px] text-[#ef4444] flex items-center gap-0.5">
                                      <Scissors size={10} /> Pruned
                                    </span>
                                  ) : (
                                    <>
                                      {selectedAlgo === 'expectiminimax' && (
                                        <span className="text-[9px] text-[#a1a1aa] mr-1">33%</span>
                                      )}
                                      <span
                                        className={
                                          isHighlighted
                                            ? 'text-white'
                                            : ca.ropeHeight < 0
                                            ? 'text-[#fca5a5]'
                                            : ca.ropeHeight >= 20
                                            ? 'text-[#f6e9c7]'
                                            : 'text-[#10b981]'
                                        }
                                      >
                                        {ca.ropeHeight >= 0
                                          ? `+${ca.ropeHeight}m ↑`
                                          : `${ca.ropeHeight}m ↓`}
                                      </span>
                                    </>
                                  )}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Outcome / Algorithm Explanation Banner */}
            <div className="mt-4 space-y-2.5">
              {selectedAlgo === 'minimax' && (maxTurnOutcome || minTurnOutcome) && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${
                    (role === 'max' && maxTurnOutcome?.isOptimal) ||
                    (role === 'min' && minTurnOutcome?.isOptimal)
                      ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#a7f3d0]'
                      : 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#fecaca]'
                  }`}
                >
                  {role === 'max' ? maxTurnOutcome?.message : minTurnOutcome?.message}
                </div>
              )}

              {selectedAlgo === 'alphabeta' && (
                <div className="p-3 rounded-xl bg-[#18181f] border border-[#f6e9c7]/35 text-xs text-[#e5e5ea] leading-relaxed">
                  <strong className="text-[#f6e9c7] block mb-0.5">{abStep.title}</strong>
                  {abStep.explanation}
                </div>
              )}

              {selectedAlgo === 'expectiminimax' && (
                <div className="p-3 rounded-xl bg-[#18181f] border border-[#f6e9c7]/35 text-xs text-[#e5e5ea] leading-relaxed">
                  <strong className="text-[#f6e9c7]">
                    {ATHLETE_SQUADS[expSelectedSquad].name} Expected Pull:{' '}
                  </strong>
                  33.3% × ({ATHLETE_SQUADS[expSelectedSquad].counterAthletes[0].ropeHeight}m) + 33.3%
                  × ({ATHLETE_SQUADS[expSelectedSquad].counterAthletes[1].ropeHeight}m) + 33.3% × (
                  {ATHLETE_SQUADS[expSelectedSquad].counterAthletes[2].ropeHeight}m) ={' '}
                  <strong className="text-[#10b981]">
                    +
                    {(
                      (ATHLETE_SQUADS[expSelectedSquad].counterAthletes[0].ropeHeight +
                        ATHLETE_SQUADS[expSelectedSquad].counterAthletes[1].ropeHeight +
                        ATHLETE_SQUADS[expSelectedSquad].counterAthletes[2].ropeHeight) /
                      3
                    ).toFixed(1)}
                    m UP
                  </strong>
                  . Notice that Athlete B (−15m slip) jumps from −15m in Minimax up to +6.7m in
                  Expectiminimax because the −15m counter only happens 33.3% of the time!
                </div>
              )}

              {/* Method Formula Summary Bar */}
              <div className="p-3 rounded-xl bg-[#16161b] border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#f6e9c7]">{algoMeta.name}</span>
                <span className="font-mono text-[11px] text-[#cbd5e1]">{algoMeta.formula}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Under the Hood */}
        <UnderTheHood
          key={selectedAlgo}
          id={`adv-code-${selectedAlgo}`}
          title={`Under the hood: ${snippet.title}`}
          explanation={snippet.explanation}
          defaultCode={snippet.code}
        />
      </div>

      {/* ── WINDOW 2: VISUAL GAME ENVIRONMENTS TEST ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: '#161618',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
              Game Environment Test
            </span>
            <span className="text-xs text-[#8e8e93]">• Pick the best algorithm for each game</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-[#111113] border border-white/10 text-xs font-mono">
              Score: <strong className="text-[#10b981]">{correctCount}</strong> / 4
            </div>
            {Object.keys(answers).length > 0 && (
              <button
                onClick={() => setAnswers({})}
                className="text-xs text-[#8e8e93] hover:text-white cursor-pointer underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADV_CHALLENGES.map((ch) => {
            const chosen = answers[ch.id]
            const isCorrect = chosen === ch.correctAlgo

            return (
              <div
                key={ch.id}
                className="p-4 rounded-xl bg-[#111113] border flex flex-col justify-between transition-all"
                style={{
                  borderColor: !chosen
                    ? 'rgba(255,255,255,0.07)'
                    : isCorrect
                    ? 'rgba(16, 185, 129, 0.5)'
                    : 'rgba(239, 68, 68, 0.5)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white">{ch.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e24] text-[#f6e9c7] border border-[#f6e9c7]/25">
                      {ch.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] mb-3">{ch.subtitle}</p>

                  {/* Mini Visual Game Board Preview */}
                  <div className="p-3 rounded-lg bg-[#17171c] border border-white/5 mb-3 flex items-center justify-center min-h-[76px]">
                    {ch.visualType === 'ttt' && (
                      <div className="grid grid-cols-3 gap-1 w-20">
                        {['X', 'O', 'X', 'O', 'X', '', '', 'O', ''].map((cell, i) => (
                          <div
                            key={i}
                            className="h-5 rounded-xs bg-[#24242d] flex items-center justify-center text-[10px] font-bold"
                            style={{ color: cell === 'X' ? '#f6e9c7' : '#a1a1aa' }}
                          >
                            {cell || '·'}
                          </div>
                        ))}
                      </div>
                    )}
                    {ch.visualType === 'chess' && (
                      <div className="flex items-center gap-3 text-xs font-mono text-[#cbd5e1]">
                        <span className="px-2 py-1 rounded bg-[#24242d] text-[#f6e9c7] border border-white/10">
                          b = 35 moves
                        </span>
                        <span className="px-2 py-1 rounded bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 flex items-center gap-1">
                          <Scissors size={12} /> β ≤ α Cutoff
                        </span>
                      </div>
                    )}
                    {ch.visualType === 'dice' && (
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1.5 rounded-lg bg-[#24242d] border border-[#f6e9c7]/30 font-mono text-xs font-bold text-[#f6e9c7]">
                          2d6
                        </span>
                        <div className="text-[11px] font-mono text-[#f6e9c7]">
                          <div>P(Roll) = 2.8%</div>
                          <div className="text-[#8e8e93]">MAX → CHANCE → MIN</div>
                        </div>
                      </div>
                    )}
                    {ch.visualType === 'connect4' && (
                      <div className="flex items-center gap-3">
                        <div className="grid grid-cols-4 gap-1.5 bg-[#202026] p-2 rounded border border-white/10">
                          {[1, 2, 1, 0, 2, 1, 2, 0].map((s, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full block"
                              style={{
                                backgroundColor:
                                  s === 1 ? '#ef4444' : s === 2 ? '#f6e9c7' : '#2e2e36',
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-mono text-[#10b981] flex items-center gap-1">
                          <Scissors size={11} /> Depth 14 Prune
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {(['minimax', 'alphabeta', 'expectiminimax'] as AdvAlgoId[]).map((aId) => {
                      const active = chosen === aId
                      return (
                        <button
                          key={aId}
                          onClick={() => setAnswers((prev) => ({ ...prev, [ch.id]: aId }))}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border truncate ${
                            active
                              ? aId === ch.correctAlgo
                                ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]'
                                : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]'
                              : 'bg-[#1a1a20] text-[#d4d4d8] border-[rgba(255,255,255,0.07)] hover:border-white/25'
                          }`}
                        >
                          {ADV_ALGOS[aId].shortName}
                        </button>
                      )
                    })}
                  </div>

                  {chosen && (
                    <div
                      className={`mt-2 p-2 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
                        isCorrect
                          ? 'bg-[#10b981]/10 text-[#a7f3d0] border border-[#10b981]/25'
                          : 'bg-[#ef4444]/10 text-[#fecaca] border border-[#ef4444]/25'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={13} className="text-[#ef4444] shrink-0 mt-0.5" />
                      )}
                      <span>
                        {isCorrect
                          ? ch.explanation
                          : 'Not the best fit—check the branching size and whether random chance is involved!'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
