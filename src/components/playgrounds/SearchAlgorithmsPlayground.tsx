import React, { useState, useEffect, useMemo } from 'react'
import { Play, Pause, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'
import UnderTheHood from './UnderTheHood'

type AlgoId = 'bfs' | 'dfs' | 'ucs' | 'astar'
type MapId = 'trap' | 'mud' | 'maze'

interface AlgorithmMeta {
  id: AlgoId
  name: string
  shortName: string
  subtitle: string
  formula: string
  color: string
  optimal: string
  summary: string
  watchTip: string
}

const ALGORITHMS: Record<AlgoId, AlgorithmMeta> = {
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    shortName: 'BFS',
    subtitle: 'Ripple waves • Shortest steps',
    formula: 'FIFO Queue (Layer by layer)',
    color: '#f6e9c7',
    optimal: 'Yes (unweighted)',
    summary:
      'Explores evenly in all directions like ripples in a pond (1 step away, then 2, then 3). Guarantees the fewest steps, but ignores mud costs and searches blindly in every direction.',
    watchTip:
      'On Mud Detour, watch BFS march straight through expensive 5x mud because it only counts steps, not energy cost!',
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    shortName: 'DFS',
    subtitle: 'Deep corridor • Tiny RAM',
    formula: 'LIFO Stack (Commit & backtrack)',
    color: '#f6e9c7',
    optimal: 'No (winding paths)',
    summary:
      'Charges headfirst down one path until hitting a wall, then backtracks to the last turn. Uses almost zero memory, but often takes long winding detours.',
    watchTip:
      'Watch the path snake along walls and dead ends instead of taking the direct route.',
  },
  ucs: {
    id: 'ucs',
    name: 'Uniform Cost Search (UCS)',
    shortName: 'UCS',
    subtitle: 'Cheapest cost g(n)',
    formula: 'Priority Queue by g(n) (cost paid)',
    color: '#f6e9c7',
    optimal: 'Yes (lowest cost)',
    summary:
      'Always expands the tile with the lowest cumulative energy cost g(n) from Start. Patiently detours around expensive 5x mud tiles to guarantee the cheapest route.',
    watchTip:
      'Switch to Mud Detour: while BFS plows through mud, UCS detours around it to save energy!',
  },
  astar: {
    id: 'astar',
    name: 'A* Search',
    shortName: 'A*',
    subtitle: 'Optimal g(n) + h(n)',
    formula: 'Priority Queue by f(n) = g(n) + h(n)',
    color: '#f6e9c7',
    optimal: 'Yes (fast & optimal)',
    summary:
      'Combines UCS cost-awareness g(n) with a heuristic compass h(n) (Manhattan distance to Goal). Focuses its search beam toward the goal while still avoiding expensive mud.',
    watchTip:
      'Notice how A* checks far fewer tiles than BFS or UCS while still finding the cheapest path!',
  },
}

const ROWS = 9
const COLS = 13

interface MapConfig {
  id: MapId
  name: string
  start: [number, number]
  goal: [number, number]
  walls: [number, number][]
  mud: [number, number][] // cost 5
}

const MAPS: Record<MapId, MapConfig> = {
  trap: {
    id: 'trap',
    name: '🪤 U-Trap',
    start: [4, 2],
    goal: [4, 10],
    walls: [
      [2, 7], [3, 7], [4, 7], [5, 7], [6, 7],
      [2, 6], [2, 5],
      [6, 6], [6, 5],
    ],
    mud: [],
  },
  mud: {
    id: 'mud',
    name: '🟫 Mud Detour',
    start: [4, 1],
    goal: [4, 11],
    walls: [
      [1, 6], [7, 6],
    ],
    mud: [
      [3, 4], [4, 4], [5, 4],
      [3, 5], [4, 5], [5, 5],
      [3, 6], [4, 6], [5, 6],
      [3, 7], [4, 7], [5, 7],
      [3, 8], [4, 8], [5, 8],
    ],
  },
  maze: {
    id: 'maze',
    name: '🌀 Labyrinth',
    start: [1, 1],
    goal: [7, 11],
    walls: [
      [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
      [4, 5], [5, 5], [6, 5], [7, 5], [8, 5],
      [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
      [3, 9], [4, 9], [5, 9], [6, 9], [7, 9],
      [1, 10], [1, 11],
    ],
    mud: [
      [5, 3], [6, 3], [2, 9],
    ],
  },
}

interface SearchFrame {
  current: [number, number]
  visited: Set<string>
  frontier: Set<string>
  path: [number, number][]
  done: boolean
  totalCost: number
}

function keyOf(r: number, c: number) {
  return `${r},${c}`
}

function manhattan(a: [number, number], b: [number, number]) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

function runSearchSimulation(algo: AlgoId, map: MapConfig, customWalls: Set<string>, customMud: Set<string>): SearchFrame[] {
  const frames: SearchFrame[] = []
  const startKey = keyOf(map.start[0], map.start[1])
  const goalKey = keyOf(map.goal[0], map.goal[1])

  const visited = new Set<string>()
  const parent = new Map<string, string>()
  const gCost = new Map<string, number>()
  gCost.set(startKey, 0)

  const tileCost = (r: number, c: number) => (customMud.has(keyOf(r, c)) ? 5 : 1)

  let orderCounter = 0
  const frontierList: { r: number; c: number; g: number; f: number; order: number }[] = [
    {
      r: map.start[0],
      c: map.start[1],
      g: 0,
      f: manhattan(map.start, map.goal),
      order: orderCounter++,
    },
  ]

  const inFrontier = new Set<string>([startKey])
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [-1, 0],
    [0, -1],
  ]

  while (frontierList.length > 0) {
    let chosenIdx = 0
    if (algo === 'bfs') {
      chosenIdx = 0
    } else if (algo === 'dfs') {
      chosenIdx = frontierList.length - 1
    } else if (algo === 'ucs') {
      frontierList.sort((a, b) => a.g - b.g || a.order - b.order)
      chosenIdx = 0
    } else if (algo === 'astar') {
      frontierList.sort((a, b) => {
        const ha = manhattan([a.r, a.c], map.goal)
        const hb = manhattan([b.r, b.c], map.goal)
        return a.f - b.f || ha - hb || a.order - b.order
      })
      chosenIdx = 0
    }

    const curr = frontierList.splice(chosenIdx, 1)[0]
    const currKey = keyOf(curr.r, curr.c)
    inFrontier.delete(currKey)

    if (visited.has(currKey)) continue
    visited.add(currKey)

    const tracePath: [number, number][] = []
    let trace: string | undefined = currKey
    let costSum = 0
    while (trace) {
      const [tr, tc] = trace.split(',').map(Number)
      tracePath.unshift([tr, tc])
      if (trace !== startKey) {
        costSum += tileCost(tr, tc)
      }
      trace = parent.get(trace)
    }

    const isGoal = currKey === goalKey
    frames.push({
      current: [curr.r, curr.c],
      visited: new Set(visited),
      frontier: new Set(inFrontier),
      path: tracePath,
      done: isGoal,
      totalCost: costSum,
    })

    if (isGoal) break

    for (const [dr, dc] of dirs) {
      const nr = curr.r + dr
      const nc = curr.c + dc
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue
      const nKey = keyOf(nr, nc)
      if (customWalls.has(nKey) || visited.has(nKey)) continue

      const stepCost = tileCost(nr, nc)
      const tentativeG = curr.g + stepCost
      const prevG = gCost.get(nKey)

      if (algo === 'ucs' || algo === 'astar') {
        if (prevG === undefined || tentativeG < prevG) {
          gCost.set(nKey, tentativeG)
          parent.set(nKey, currKey)
          const h = manhattan([nr, nc], map.goal)
          frontierList.push({
            r: nr,
            c: nc,
            g: tentativeG,
            f: tentativeG + h,
            order: orderCounter++,
          })
          inFrontier.add(nKey)
        }
      } else {
        if (!inFrontier.has(nKey)) {
          gCost.set(nKey, tentativeG)
          parent.set(nKey, currKey)
          const h = manhattan([nr, nc], map.goal)
          frontierList.push({
            r: nr,
            c: nc,
            g: tentativeG,
            f: tentativeG + h,
            order: orderCounter++,
          })
          inFrontier.add(nKey)
        }
      }
    }
  }

  return frames
}

const PYTHON_SNIPPETS: Record<AlgoId, { title: string; explanation: string; code: string }> = {
  bfs: {
    title: 'Breadth-First Search (BFS) in Python',
    explanation: 'Uses a FIFO queue (deque). Explores neighbors layer-by-layer to guarantee the shortest step path on unweighted graphs.',
    code: `from collections import deque

def bfs(grid, start, goal):
    queue = deque([start])
    parent = {start: None}

    while queue:
        curr = queue.popleft()
        if curr == goal:
            return reconstruct_path(parent, goal)
            
        for nxt in get_neighbors(grid, curr):
            if nxt not in parent:
                parent[nxt] = curr
                queue.append(nxt)
    return []`,
  },
  dfs: {
    title: 'Depth-First Search (DFS) in Python',
    explanation: 'Uses a LIFO stack. Explores down a single branch until hitting a dead end. Requires minimal memory (O(depth)).',
    code: `def dfs(grid, start, goal):
    stack = [start]
    parent = {start: None}

    while stack:
        curr = stack.pop()
        if curr == goal:
            return reconstruct_path(parent, goal)
            
        for nxt in get_neighbors(grid, curr):
            if nxt not in parent:
                parent[nxt] = curr
                stack.append(nxt)
    return []`,
  },
  ucs: {
    title: 'Uniform Cost Search (UCS) in Python',
    explanation: 'Uses a priority queue sorted strictly by g(n)—the exact cumulative cost paid so far. Guaranteed to find the cheapest route.',
    code: `import heapq

def ucs(grid, start, goal):
    # Priority Queue stores: (cumulative_cost_g, current_node)
    pq = [(0, start)]
    g_cost = {start: 0}
    parent = {start: None}

    while pq:
        g, curr = heapq.heappop(pq)
        if curr == goal:
            return reconstruct_path(parent, goal)

        for nxt, step_cost in get_weighted_neighbors(grid, curr):
            new_g = g + step_cost
            if new_g < g_cost.get(nxt, float('inf')):
                g_cost[nxt] = new_g
                parent[nxt] = curr
                heapq.heappush(pq, (new_g, nxt))
    return []`,
  },
  astar: {
    title: 'A* Search in Python',
    explanation: 'Uses a priority queue ordered by f(n) = g(n) + h(n), balancing exact cost paid with estimated heuristic distance to goal.',
    code: `import heapq

def a_star(grid, start, goal):
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])  # Manhattan distance

    # Priority Queue stores: (f_score, g_cost, current_node)
    pq = [(heuristic(start, goal), 0, start)]
    g_cost = {start: 0}
    parent = {start: None}

    while pq:
        f, g, curr = heapq.heappop(pq)
        if curr == goal:
            return reconstruct_path(parent, goal)

        for nxt, step_cost in get_weighted_neighbors(grid, curr):
            new_g = g + step_cost
            if new_g < g_cost.get(nxt, float('inf')):
                g_cost[nxt] = new_g
                parent[nxt] = curr
                f_score = new_g + heuristic(nxt, goal)
                heapq.heappush(pq, (f_score, new_g, nxt))
    return []`,
  },
}

interface VisualChallenge {
  id: string
  title: string
  subtitle: string
  tag: string
  icon: 'rover' | 'subway' | 'cave' | 'cable'
  correctAlgo: AlgoId
  explanation: string
  miniMap: {
    w: number
    h: number
    start: [number, number]
    goal: [number, number]
    walls?: [number, number][]
    mud?: [number, number][]
    visualHint: string
  }
}

const VISUAL_CHALLENGES: VisualChallenge[] = [
  {
    id: 'env1',
    title: 'Mars Surface Rover',
    subtitle: 'Known GPS coords (x,y) • 5x sand dunes',
    tag: 'Weighted + Heuristic',
    icon: 'rover',
    correctAlgo: 'astar',
    explanation: 'A* balances terrain battery costs g(n) with straight-line GPS heuristic h(n) to reach the target efficiently.',
    miniMap: {
      w: 8,
      h: 5,
      start: [2, 1],
      goal: [2, 6],
      mud: [[1, 3], [2, 3], [3, 3]],
      visualHint: 'GPS Beacon 📡',
    },
  },
  {
    id: 'env2',
    title: 'Metro Transit Evacuation',
    subtitle: 'All station hops = 1 • No spatial compass',
    tag: 'Unweighted Graph',
    icon: 'subway',
    correctAlgo: 'bfs',
    explanation: 'BFS expands outward in waves (1 hop, 2 hops, 3 hops...), guaranteeing the exit with the fewest train transfers.',
    miniMap: {
      w: 8,
      h: 5,
      start: [2, 1],
      goal: [2, 6],
      walls: [[0, 3], [1, 3], [3, 4], [4, 4]],
      visualHint: 'Equal Hops 🚇',
    },
  },
  {
    id: 'env3',
    title: 'Micro-Drone in Cave',
    subtitle: '2 KB memory limit • 500 levels deep',
    tag: 'Strict Memory Limit',
    icon: 'cave',
    correctAlgo: 'dfs',
    explanation: 'DFS only keeps the current path in memory (O(depth)), preventing memory overflow in deep narrow systems.',
    miniMap: {
      w: 8,
      h: 5,
      start: [0, 1],
      goal: [4, 6],
      walls: [[1, 1], [1, 2], [1, 4], [1, 5], [3, 2], [3, 3], [3, 4]],
      visualHint: 'Deep Tunnels 🦇',
    },
  },
  {
    id: 'env4',
    title: 'Packet Routing with Tariffs',
    subtitle: 'Varying transit fees • Distance != Price',
    tag: 'Arbitrary Costs',
    icon: 'cable',
    correctAlgo: 'ucs',
    explanation: 'UCS strictly follows the cumulative cost g(n), finding the cheapest route regardless of physical distance.',
    miniMap: {
      w: 8,
      h: 5,
      start: [2, 1],
      goal: [2, 6],
      mud: [[2, 2], [2, 3], [2, 4]],
      visualHint: 'Fiber Tariffs 🌐',
    },
  },
]

export default function SearchAlgorithmsPlayground() {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoId>('astar')
  const [selectedMap, setSelectedMap] = useState<MapId>('trap')
  const [isPlaying, setIsPlaying] = useState(true)
  const [speedMs, setSpeedMs] = useState(140)
  const [frameIdx, setFrameIdx] = useState(0)
  const [paintMode, setPaintMode] = useState<'wall' | 'mud'>('wall')

  const mapConfig = MAPS[selectedMap]
  const [customWalls, setCustomWalls] = useState<Set<string>>(
    () => new Set(MAPS.trap.walls.map(([r, c]) => keyOf(r, c)))
  )
  const [customMud, setCustomMud] = useState<Set<string>>(
    () => new Set(MAPS.trap.mud.map(([r, c]) => keyOf(r, c)))
  )

  const handleSelectMap = (mId: MapId) => {
    setSelectedMap(mId)
    setCustomWalls(new Set(MAPS[mId].walls.map(([r, c]) => keyOf(r, c))))
    setCustomMud(new Set(MAPS[mId].mud.map(([r, c]) => keyOf(r, c))))
    setFrameIdx(0)
    setIsPlaying(true)
  }

  const frames = useMemo(
    () => runSearchSimulation(selectedAlgo, mapConfig, customWalls, customMud),
    [selectedAlgo, mapConfig, customWalls, customMud]
  )

  useEffect(() => {
    setFrameIdx(0)
    setIsPlaying(true)
  }, [selectedAlgo])

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return
    const isLastFrame = frameIdx >= frames.length - 1
    const delay = isLastFrame ? 1600 : speedMs
    const timer = setTimeout(() => {
      setFrameIdx((prev) => (prev >= frames.length - 1 ? 0 : prev + 1))
    }, delay)
    return () => clearTimeout(timer)
  }, [isPlaying, frameIdx, frames.length, speedMs])

  const currentFrame = frames[Math.min(frameIdx, frames.length - 1)] || {
    current: mapConfig.start,
    visited: new Set<string>(),
    frontier: new Set<string>(),
    path: [mapConfig.start],
    done: false,
    totalCost: 0,
  }

  const finalFrame = frames[frames.length - 1]
  const pathSet = useMemo(
    () => new Set(currentFrame.path.map(([r, c]) => keyOf(r, c))),
    [currentFrame]
  )

  const toggleTile = (r: number, c: number) => {
    const k = keyOf(r, c)
    if (
      (r === mapConfig.start[0] && c === mapConfig.start[1]) ||
      (r === mapConfig.goal[0] && c === mapConfig.goal[1])
    ) {
      return
    }
    if (paintMode === 'wall') {
      const next = new Set(customWalls)
      const nextMud = new Set(customMud)
      if (next.has(k)) next.delete(k)
      else {
        next.add(k)
        nextMud.delete(k)
      }
      setCustomWalls(next)
      setCustomMud(nextMud)
    } else {
      const nextMud = new Set(customMud)
      const nextWalls = new Set(customWalls)
      if (nextMud.has(k)) nextMud.delete(k)
      else {
        nextMud.add(k)
        nextWalls.delete(k)
      }
      setCustomMud(nextMud)
      setCustomWalls(nextWalls)
    }
    setFrameIdx(0)
  }

  const [answers, setAnswers] = useState<Record<string, AlgoId>>({})
  const correctCount = VISUAL_CHALLENGES.filter((env) => answers[env.id] === env.correctAlgo).length
  const algoMeta = ALGORITHMS[selectedAlgo]
  const snippet = PYTHON_SNIPPETS[selectedAlgo]

  return (
    <div className="space-y-8 select-none">
      {/* ── WINDOW 1: SEARCH SIMULATOR ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: '#161618',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Row 1: The 4 Search Methods on Top with brief helper text */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {(['bfs', 'dfs', 'ucs', 'astar'] as AlgoId[]).map((aId) => {
            const meta = ALGORITHMS[aId]
            const active = selectedAlgo === aId
            return (
              <button
                key={aId}
                onClick={() => setSelectedAlgo(aId)}
                className="p-3 rounded-xl border text-left transition-all cursor-pointer"
                style={{
                  background: active ? `${meta.color}1c` : '#111113',
                  borderColor: active ? meta.color : 'rgba(255,255,255,0.07)',
                  boxShadow: active ? `0 0 12px ${meta.color}25` : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="font-bold text-xs"
                    style={{ color: active ? meta.color : '#e5e5ea' }}
                  >
                    {meta.shortName}
                  </span>
                  {active && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                    />
                  )}
                </div>
                <span className="text-[10px] text-[#8e8e93] block truncate">
                  {meta.subtitle}
                </span>
              </button>
            )
          })}
        </div>

        {/* Row 2: Game modes (U-Trap, Mud Detour, Labyrinth) */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-[#111113] p-1 rounded-xl border border-[rgba(255,255,255,0.07)]">
            {(Object.keys(MAPS) as MapId[]).map((mId) => (
              <button
                key={mId}
                onClick={() => handleSelectMap(mId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedMap === mId
                    ? 'bg-[#f6e9c7] text-[#1a1813] shadow-xs'
                    : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                {MAPS[mId].name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-[#111113] border border-white/5 text-[#a1a1aa]">
              Checked: <strong className="text-white">{currentFrame.visited.size}/{finalFrame?.visited.size ?? 0}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#111113] border border-white/5 text-[#a1a1aa]">
              Cost: <strong style={{ color: algoMeta.color }}>{currentFrame.totalCost}</strong>
            </span>
          </div>
        </div>

        {/* Grid + Brief Method Explanation Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left 7 Cols: Animated Grid */}
          <div className="lg:col-span-7 bg-[#111113] p-4 rounded-xl border border-[rgba(255,255,255,0.07)]">
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                maxWidth: 460,
              }}
            >
              {Array.from({ length: ROWS }).map((_, r) =>
                Array.from({ length: COLS }).map((__, c) => {
                  const k = keyOf(r, c)
                  const isStart = r === mapConfig.start[0] && c === mapConfig.start[1]
                  const isGoal = r === mapConfig.goal[0] && c === mapConfig.goal[1]
                  const isCurr =
                    currentFrame.current[0] === r && currentFrame.current[1] === c
                  const isWall = customWalls.has(k)
                  const isMud = customMud.has(k)
                  const isVisited = currentFrame.visited.has(k)
                  const isFrontier = currentFrame.frontier.has(k)
                  const isOnPath = pathSet.has(k)

                  let bg = '#1c1c21'
                  let border = 'rgba(255,255,255,0.04)'
                  let label = ''

                  if (isWall) {
                    bg = '#3a3a44'
                    border = 'rgba(255,255,255,0.12)'
                  } else if (isStart) {
                    bg = '#2563eb'
                    border = '#60a5fa'
                    label = 'S'
                  } else if (isGoal) {
                    bg = '#10b981'
                    border = '#34d399'
                    label = 'G'
                  } else if (isCurr) {
                    bg = '#f6e9c7'
                    border = '#ffffff'
                    label = '🤖'
                  } else if (isOnPath && currentFrame.done) {
                    bg = algoMeta.color
                    border = '#ffffff'
                  } else if (isOnPath) {
                    bg = `${algoMeta.color}90`
                    border = algoMeta.color
                  } else if (isVisited) {
                    bg = isMud ? '#5c4028' : `${algoMeta.color}28`
                    border = isMud ? '#f59e0b60' : `${algoMeta.color}55`
                  } else if (isFrontier) {
                    bg = `${algoMeta.color}14`
                    border = `${algoMeta.color}80`
                  } else if (isMud) {
                    bg = '#3b2818'
                    border = '#92400e'
                  }

                  return (
                    <div
                      key={k}
                      onClick={() => toggleTile(r, c)}
                      title={`(${r}, ${c}) ${isMud ? '• Mud (Cost 5)' : '• Cost 1'}`}
                      className="aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-150 cursor-pointer relative"
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        transform: isCurr ? 'scale(1.12)' : 'scale(1)',
                        zIndex: isCurr ? 10 : 1,
                      }}
                    >
                      {label ? (
                        <span className="text-white drop-shadow">{label}</span>
                      ) : isMud ? (
                        <span className="text-[8px] font-mono text-[#fbbf24] opacity-85">5</span>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>

            {/* Controls bar */}
            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f6e9c7] text-[#1a1813] hover:bg-[#ebd6a1] transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={() => {
                    setFrameIdx(0)
                    setIsPlaying(true)
                  }}
                  className="p-1.5 rounded-lg bg-[#222226] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
                  title="Restart"
                >
                  <RotateCcw size={13} />
                </button>
                <select
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="text-[11px] bg-[#222226] text-[#e5e5ea] rounded-lg px-2 py-1.5 border border-[rgba(255,255,255,0.08)] cursor-pointer"
                >
                  <option value={240}>1x</option>
                  <option value={140}>2x</option>
                  <option value={60}>4x</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-[#8e8e93] mr-1">Draw:</span>
                <button
                  onClick={() => setPaintMode('wall')}
                  className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer ${
                    paintMode === 'wall'
                      ? 'bg-[#3a3a44] text-white border border-white/20'
                      : 'text-[#8e8e93] hover:text-white'
                  }`}
                >
                  🧱 Wall
                </button>
                <button
                  onClick={() => setPaintMode('mud')}
                  className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer ${
                    paintMode === 'mud'
                      ? 'bg-[#78350f] text-[#fef3c7] border border-[#f59e0b]/40'
                      : 'text-[#8e8e93] hover:text-white'
                  }`}
                >
                  🟫 Mud
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Brief Explanation of the Active Search Method */}
          <div className="lg:col-span-5 space-y-3">
            <div
              className="p-4 rounded-xl bg-[#111113] border space-y-2.5"
              style={{ borderColor: `${algoMeta.color}40` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: algoMeta.color }}>
                  {algoMeta.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#cbd5e1]">
                  Optimal: {algoMeta.optimal}
                </span>
              </div>

              <div className="px-2.5 py-1.5 rounded-lg bg-[#19191d] border border-white/5 font-mono text-[11px] text-[#f6e9c7]">
                {algoMeta.formula}
              </div>

              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                {algoMeta.summary}
              </p>

              <div className="p-2.5 rounded-lg bg-[#18181c] border border-white/5 text-[11px] text-[#e5e5ea]">
                <strong className="text-[#f6e9c7]">👀 Watch: </strong>
                {algoMeta.watchTip}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Under the Hood: key forces clean remount when algorithm switches */}
        <UnderTheHood
          key={selectedAlgo}
          id={`search-code-${selectedAlgo}`}
          title={`Under the hood: ${snippet.title}`}
          explanation={snippet.explanation}
          defaultCode={snippet.code}
        />
      </div>

      {/* ── WINDOW 2: VISUAL ENVIRONMENTS TEST ── */}
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
              Environment Match Test
            </span>
            <span className="text-xs text-[#8e8e93]">• Pick the best search algorithm for each map</span>
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

        {/* 4 Cards with Visual Mini-Maps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VISUAL_CHALLENGES.map((ch) => {
            const chosen = answers[ch.id]
            const isCorrect = chosen === ch.correctAlgo
            const mm = ch.miniMap

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
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      {ch.icon === 'rover' && '🛰️'}
                      {ch.icon === 'subway' && '🚇'}
                      {ch.icon === 'cave' && '🦇'}
                      {ch.icon === 'cable' && '🌐'}
                      <span>{ch.title}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e24] text-[#38bdf8] border border-[#38bdf8]/20 whitespace-nowrap">
                      {ch.tag}
                    </span>
                  </div>

                  <p className="text-xs text-[#a1a1aa] mb-3">{ch.subtitle}</p>

                  {/* Gripping Mini Visual Simulation Map */}
                  <div className="p-2.5 rounded-lg bg-[#17171c] border border-white/5 mb-3">
                    <div className="flex items-center justify-between text-[10px] text-[#8e8e93] mb-1.5">
                      <span>Terrain Sensor Scan</span>
                      <span className="text-[#f6e9c7] font-semibold">{mm.visualHint}</span>
                    </div>

                    <div
                      className="grid gap-1 mx-auto"
                      style={{
                        gridTemplateColumns: `repeat(${mm.w}, minmax(0, 1fr))`,
                        maxWidth: 240,
                      }}
                    >
                      {Array.from({ length: mm.h }).map((_, r) =>
                        Array.from({ length: mm.w }).map((__, c) => {
                          const isStart = mm.start[0] === r && mm.start[1] === c
                          const isGoal = mm.goal[0] === r && mm.goal[1] === c
                          const isWall = mm.walls?.some(([wr, wc]) => wr === r && wc === c)
                          const isMud = mm.mud?.some(([mr, mc]) => mr === r && mc === c)

                          let cellBg = '#22222a'
                          let text = ''
                          if (isStart) {
                            cellBg = '#2563eb'
                            text = 'S'
                          } else if (isGoal) {
                            cellBg = '#10b981'
                            text = 'G'
                          } else if (isWall) {
                            cellBg = '#4b5563'
                          } else if (isMud) {
                            cellBg = '#78350f'
                            text = '5'
                          }

                          return (
                            <div
                              key={`${r}-${c}`}
                              className="aspect-square rounded-xs flex items-center justify-center text-[8px] font-bold text-white/90"
                              style={{ background: cellBg }}
                            >
                              {text}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Algorithm Choice Buttons */}
                <div>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {(['bfs', 'dfs', 'ucs', 'astar'] as AlgoId[]).map((aId) => {
                      const active = chosen === aId
                      return (
                        <button
                          key={aId}
                          onClick={() => setAnswers((prev) => ({ ...prev, [ch.id]: aId }))}
                          className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                            active
                              ? aId === ch.correctAlgo
                                ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]'
                                : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]'
                              : 'bg-[#1a1a20] text-[#d4d4d8] border-[rgba(255,255,255,0.07)] hover:border-white/25'
                          }`}
                        >
                          {ALGORITHMS[aId].shortName}
                        </button>
                      )
                    })}
                  </div>

                  {/* Feedback */}
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
                          : `Incorrect for this environment. Review the terrain costs and memory requirements!`}
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
