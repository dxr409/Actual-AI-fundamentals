import React, { useState, useMemo } from 'react'
import { BrainCircuit, Sparkles, CheckCircle2, XCircle, Layers, Sliders } from 'lucide-react'
import UnderTheHood from './UnderTheHood'

type DatasetId = 'linear' | 'box' | 'xor' | 'ring'
type ModelId = 'linear_model' | 'tree' | 'knn' | 'mlp'
type ActivationId = 'relu' | 'tanh' | 'linear_act'

interface DataPoint {
  x: number // -1 to 1
  y: number // -1 to 1
  label: 0 | 1 // 0 = Sky Blue, 1 = Amber/Orange
}

const DATASETS: Record<DatasetId, { name: string; badge: string; points: DataPoint[] }> = {
  linear: {
    name: '📐 Diagonal Split',
    badge: 'Linearly Separable',
    points: [
      { x: -0.7, y: 0.6, label: 0 },
      { x: -0.5, y: 0.3, label: 0 },
      { x: -0.3, y: 0.7, label: 0 },
      { x: -0.6, y: -0.1, label: 0 },
      { x: -0.2, y: 0.3, label: 0 },
      { x: 0.1, y: 0.6, label: 0 },
      { x: 0.6, y: -0.6, label: 1 },
      { x: 0.5, y: -0.2, label: 1 },
      { x: 0.3, y: -0.7, label: 1 },
      { x: 0.7, y: 0.1, label: 1 },
      { x: 0.2, y: -0.3, label: 1 },
      { x: -0.1, y: -0.6, label: 1 },
    ],
  },
  xor: {
    name: '♟️ The XOR Trap',
    badge: 'Breaks Single Lines!',
    points: [
      // Top-Right (+, +) -> Class 1
      { x: 0.45, y: 0.45, label: 1 },
      { x: 0.65, y: 0.6, label: 1 },
      { x: 0.35, y: 0.7, label: 1 },
      // Bottom-Left (-, -) -> Class 1
      { x: -0.45, y: -0.45, label: 1 },
      { x: -0.65, y: -0.6, label: 1 },
      { x: -0.35, y: -0.7, label: 1 },
      // Top-Left (-, +) -> Class 0
      { x: -0.45, y: 0.45, label: 0 },
      { x: -0.65, y: 0.6, label: 0 },
      { x: -0.35, y: 0.7, label: 0 },
      // Bottom-Right (+, -) -> Class 0
      { x: 0.45, y: -0.45, label: 0 },
      { x: 0.65, y: -0.6, label: 0 },
      { x: 0.35, y: -0.7, label: 0 },
    ],
  },
  ring: {
    name: '🎯 Bullseye Ring',
    badge: 'Radial Non-Linear',
    points: [
      // Inner core -> Class 1
      { x: 0.0, y: 0.0, label: 1 },
      { x: 0.2, y: 0.15, label: 1 },
      { x: -0.2, y: 0.15, label: 1 },
      { x: 0.15, y: -0.2, label: 1 },
      { x: -0.18, y: -0.18, label: 1 },
      // Outer ring -> Class 0
      { x: 0.75, y: 0.0, label: 0 },
      { x: -0.75, y: 0.0, label: 0 },
      { x: 0.0, y: 0.75, label: 0 },
      { x: 0.0, y: -0.75, label: 0 },
      { x: 0.55, y: 0.55, label: 0 },
      { x: -0.55, y: 0.55, label: 0 },
      { x: 0.55, y: -0.55, label: 0 },
      { x: -0.55, y: -0.55, label: 0 },
    ],
  },
  box: {
    name: '📦 Threshold Corner',
    badge: 'Rule-Friendly',
    points: [
      // Inside top-right quadrant (x > 0, y > 0) -> Class 1
      { x: 0.3, y: 0.3, label: 1 },
      { x: 0.65, y: 0.35, label: 1 },
      { x: 0.35, y: 0.65, label: 1 },
      { x: 0.68, y: 0.68, label: 1 },
      // Everywhere else -> Class 0
      { x: -0.5, y: 0.5, label: 0 },
      { x: -0.3, y: 0.2, label: 0 },
      { x: -0.5, y: -0.5, label: 0 },
      { x: -0.2, y: -0.6, label: 0 },
      { x: 0.5, y: -0.5, label: 0 },
      { x: 0.3, y: -0.3, label: 0 },
    ],
  },
}

// Predict probability (0..1) for coordinate (x, y) in [-1, 1]
function predictPoint(
  x: number,
  y: number,
  dataset: DatasetId,
  model: ModelId,
  neurons: number,
  activation: ActivationId,
  points: DataPoint[]
): number {
  if (model === 'linear_model' || (model === 'mlp' && activation === 'linear_act')) {
    // A single linear plane! Even a 100-neuron network with linear activations collapses into a single straight line:
    if (dataset === 'linear') {
      return 1 / (1 + Math.exp(-(3.5 * x - 3.5 * y)))
    }
    if (dataset === 'box') {
      return 1 / (1 + Math.exp(-(2.5 * x + 2.5 * y - 1.2)))
    }
    // On XOR or Ring, best possible straight line fails on at least one quadrant/side
    return 1 / (1 + Math.exp(-(1.8 * x + 0.4 * y - 0.2)))
  }

  if (model === 'tree') {
    // Axis-aligned rectangular splits
    if (dataset === 'linear') {
      if (x > 0.1 && y < 0.2) return 0.92
      if (x > -0.2 && y < -0.3) return 0.88
      return 0.1
    }
    if (dataset === 'box') {
      return x > 0.05 && y > 0.05 ? 0.95 : 0.05
    }
    if (dataset === 'xor') {
      // Decision tree with depth 2 can carve 4 axis-aligned quadrants
      return (x >= 0 && y >= 0) || (x < 0 && y < 0) ? 0.9 : 0.1
    }
    // Ring: boxy approximation of a circle
    return Math.abs(x) < 0.38 && Math.abs(y) < 0.38 ? 0.88 : 0.12
  }

  if (model === 'knn') {
    // 3-Nearest Neighbors
    const dists = points
      .map((p) => ({
        d: Math.hypot(p.x - x, p.y - y),
        label: p.label,
      }))
      .sort((a, b) => a.d - b.d)
    const k = 3
    const topK = dists.slice(0, k)
    const avg = topK.reduce((acc, item) => acc + item.label, 0) / k
    return avg
  }

  // Model === 'mlp' with non-linear activation (ReLU or Tanh)
  if (neurons === 1) {
    // 1 hidden neuron can only form 1 fold (still a single half-space boundary)
    return 1 / (1 + Math.exp(-(3.0 * x - 2.5 * y - 0.3)))
  }

  if (neurons === 2) {
    // 2 hidden neurons can form a V-wedge or parallel strip! Solves XOR, struggles slightly on full 360 ring
    if (dataset === 'xor') {
      const h1 = Math.max(0, x + y)
      const h2 = Math.max(0, -x - y)
      const z = 4.0 * (h1 + h2) - 1.2
      return 1 / (1 + Math.exp(-z))
    }
    if (dataset === 'ring') {
      // 2 neurons can only bound 2 sides (a band), leaving top/bottom open!
      const band = 1 - Math.abs(x) * 2.2
      return 1 / (1 + Math.exp(-band * 3))
    }
    if (dataset === 'box') {
      return x > 0 && y > 0 ? 0.92 : 0.08
    }
    return 1 / (1 + Math.exp(-(3.5 * x - 3.5 * y)))
  }

  // 4+ hidden neurons with ReLU or Tanh: universal approximator bends space smoothly!
  const smooth = activation === 'tanh'
  if (dataset === 'xor') {
    const score = smooth ? Math.tanh(2.5 * x) * Math.tanh(2.5 * y) : x * y * 4.5
    return 1 / (1 + Math.exp(-score * 3.5))
  }
  if (dataset === 'ring') {
    const r = smooth ? Math.hypot(x, y) : (Math.abs(x) * 0.8 + Math.abs(y) * 0.8)
    return 1 / (1 + Math.exp((r - 0.42) * 9))
  }
  if (dataset === 'box') {
    const s = Math.min(x, y)
    return 1 / (1 + Math.exp(-s * 10))
  }
  return 1 / (1 + Math.exp(-(4 * x - 4 * y)))
}

interface MLChallenge {
  id: string
  title: string
  badge: string
  scenario: string
  correctModel: ModelId
  explanation: string
  wrongHints: Partial<Record<ModelId, string>>
}

const ML_CHALLENGES: MLChallenge[] = [
  {
    id: 'ml1',
    title: 'Environment 1: Hospital Loan & Triage Rulebook',
    badge: 'Tabular Thresholds • Explainable',
    scenario:
      'A hospital needs a fast model using 5 clear clinical thresholds (e.g., "If Age > 65 AND Blood Pressure > 140 → High Risk") that doctors can audit on a printed flowchart without a GPU.',
    correctModel: 'tree',
    explanation:
      'Spot on! Decision Trees split features along clear axis-aligned thresholds (If/Else rules) that doctors and regulators can read and verify directly.',
    wrongHints: {
      linear_model: 'A single weighted sum blends all variables together instead of giving crisp If/Else clinical threshold rules.',
      knn: 'k-NN has no explicit rules—it requires storing and comparing patient records at runtime.',
      mlp: 'Neural networks are "black boxes" of matrix multiplications that cannot be printed as simple If/Else flowcharts.',
    },
  },
  {
    id: 'ml2',
    title: 'Environment 2: Ice Cream Sales vs. Daily Temperature',
    badge: '1D Proportional Trend • Tiny Data',
    scenario:
      'A small beach stand has only 25 days of sales records. Every +5°C increase in temperature steadily adds ~40 cones sold. You need to predict sales at 35°C without overfitting.',
    correctModel: 'linear_model',
    explanation:
      'Correct! When the underlying physics or economics follow a clean proportional trend and data is small, a Linear Model generalizes cleanly and can extrapolate smoothly.',
    wrongHints: {
      tree: 'Decision trees cannot extrapolate beyond the highest temperature seen in training—they flatten out like stair-steps!',
      knn: 'k-NN just averages the 3 closest days in the past and can never predict a higher record on a hotter day.',
      mlp: 'A deep neural network on just 25 data points can easily overfit noise unless heavily regularized.',
    },
  },
  {
    id: 'ml3',
    title: 'Environment 3: Real-Time GPS Store Recommender',
    badge: 'Spatial Proximity • Zero Training Time',
    scenario:
      'You have a map of cafes labeled by vibe ("Cozy Indie" vs "Corporate Hub"). New cafes are added every minute, and you want to classify a street corner purely by looking at the 3 physically closest cafes right now.',
    correctModel: 'knn',
    explanation:
      'Nailed it! k-Nearest Neighbors (k-NN) requires zero training time when new points arrive and classifies coordinates directly by voting among the k closest neighbors.',
    wrongHints: {
      linear_model: 'City neighborhoods form irregular pockets, not a single straight line across the entire city!',
      tree: 'Retraining a tree every minute for fine spatial pockets creates blocky rectangular boundaries.',
      mlp: 'Retraining neural network weights every time a single cafe is added is unnecessary when pure distance lookup works.',
    },
  },
  {
    id: 'ml4',
    title: 'Environment 4: Raw Audio, Vision & Entangled XOR Patterns',
    badge: 'High-Dimensional • Non-Linear',
    scenario:
      'You are classifying complex non-linear patterns (like concentric rings, spirals, raw pixels, or token embeddings) where no single feature threshold or straight line works.',
    correctModel: 'mlp',
    explanation:
      'Bravo! Multi-Layer Neural Networks with non-linear activations (like ReLU) stack hidden layers to bend, fold, and untangle complex feature spaces.',
    wrongHints: {
      linear_model: 'Linear models are mathematically blind to XOR and concentric patterns—hitting a hard 50% ceiling.',
      tree: 'On raw pixels or smooth curved manifolds, axis-aligned boxes shatter into thousands of brittle stair-steps.',
      knn: 'In high dimensions (like raw images or embeddings), Euclidean distance breaks down ("curse of dimensionality") without learned neural representations.',
    },
  },
]

const PYTHON_ML_CODE = `import torch
import torch.nn as nn
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier

# 1. Classical ML: Single-line Logistic Regression & Decision Tree
linear_clf = LogisticRegression().fit(X_train, y_train)
tree_clf = DecisionTreeClassifier(max_depth=3).fit(X_train, y_train)

# 2. Neural Network (MLP): Stacking Linear Layers + Non-Linear ReLU
# Without nn.ReLU(), two Linear layers W2(W1 * x) collapse into a single matrix!
mlp = nn.Sequential(
    nn.Linear(2, 8),   # Project 2D (x, y) into 8 hidden features
    nn.ReLU(),         # Non-linear fold: max(0, z) bends the space!
    nn.Linear(8, 1),   # Combine folded features into final logit
    nn.Sigmoid()       # Squash score into probability (0.0 to 1.0)
)`

export default function ClassicalMLNeuralPlayground() {
  const [dataset, setDataset] = useState<DatasetId>('xor')
  const [model, setModel] = useState<ModelId>('mlp')
  const [neurons, setNeurons] = useState<number>(4)
  const [activation, setActivation] = useState<ActivationId>('relu')

  const ds = DATASETS[dataset]

  // Compute 19x19 grid heatmap of decision boundary + training accuracy
  const GRID_N = 19
  const heatmapGrid = useMemo(() => {
    const cells: { r: number; c: number; prob: number }[] = []
    for (let r = 0; r < GRID_N; r++) {
      for (let c = 0; c < GRID_N; c++) {
        const x = (c / (GRID_N - 1)) * 2 - 1
        const y = 1 - (r / (GRID_N - 1)) * 2
        const prob = predictPoint(x, y, dataset, model, neurons, activation, ds.points)
        cells.push({ r, c, prob })
      }
    }
    return cells
  }, [dataset, model, neurons, activation, ds.points])

  const accuracy = useMemo(() => {
    let correct = 0
    for (const pt of ds.points) {
      const p = predictPoint(pt.x, pt.y, dataset, model, neurons, activation, ds.points)
      const pred = p >= 0.5 ? 1 : 0
      if (pred === pt.label) correct++
    }
    return Math.round((correct / ds.points.length) * 100)
  }, [dataset, model, neurons, activation, ds.points])

  // Quiz state
  const [answers, setAnswers] = useState<Record<string, ModelId>>({})
  const correctCount = ML_CHALLENGES.filter((c) => answers[c.id] === c.correctModel).length

  return (
    <div className="space-y-8 select-none">
      {/* ── PART 1: CLASSICAL ML VS. NEURAL NETWORK DECISION BOUNDARY ARENA ── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#161618',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit size={16} className="text-[#c084fc]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c084fc]">
                Decision Boundary Laboratory • Classical ML vs. Neural Nets
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#f4f4f5] tracking-tight">
              How Algorithms Carve Up Space
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              Pick a dataset (try <strong className="text-white">The XOR Trap</strong>!) and switch between a single straight line, a Decision Tree, k-NN, and a Neural Network.
            </p>
          </div>

          {/* Dataset Picker */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#111113] p-1 rounded-xl border border-[rgba(255,255,255,0.08)]">
            {(Object.keys(DATASETS) as DatasetId[]).map((dId) => (
              <button
                key={dId}
                onClick={() => setDataset(dId)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dataset === dId
                    ? 'bg-[#f6e9c7] text-[#1a1813]'
                    : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                {DATASETS[dId].name}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Model Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {[
            {
              id: 'linear_model' as ModelId,
              name: 'Linear Classifier',
              sub: 'Single straight line (wx + b)',
              color: '#38bdf8',
            },
            {
              id: 'tree' as ModelId,
              name: 'Decision Tree',
              sub: 'If/Else axis-aligned boxes',
              color: '#10b981',
            },
            {
              id: 'knn' as ModelId,
              name: 'k-Nearest Neighbors',
              sub: 'Closest training dots vote',
              color: '#f59e0b',
            },
            {
              id: 'mlp' as ModelId,
              name: 'Neural Network (MLP)',
              sub: 'Hidden layers + activation',
              color: '#c084fc',
            },
          ].map((m) => {
            const active = model === m.id
            return (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className="flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer"
                style={{
                  background: active ? `${m.color}18` : '#111113',
                  borderColor: active ? m.color : 'rgba(255,255,255,0.07)',
                }}
              >
                <span
                  className="text-xs font-bold mb-0.5"
                  style={{ color: active ? m.color : '#f4f4f5' }}
                >
                  {m.name}
                </span>
                <span className="text-[10px] text-[#8e8e93]">{m.sub}</span>
              </button>
            )
          })}
        </div>

        {/* Main Canvas + Architecture Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 6 Cols: 2D Decision Boundary Canvas */}
          <div className="lg:col-span-6 bg-[#111113] p-4 rounded-xl border border-[rgba(255,255,255,0.07)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white">
                {ds.name} • <span className="text-[#8e8e93] font-normal">{ds.badge}</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  accuracy === 100
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : accuracy >= 75
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                    : 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                }`}
              >
                Accuracy: {accuracy}%
              </span>
            </div>

            {/* SVG 2D Feature Space (280x280) */}
            <svg
              viewBox="0 0 280 280"
              className="w-full max-w-[310px] mx-auto rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)]"
            >
              {/* Background Heatmap Cells */}
              {heatmapGrid.map((cell, idx) => {
                const cellSize = 280 / GRID_N
                const isOrange = cell.prob >= 0.5
                const intensity = Math.abs(cell.prob - 0.5) * 2 // 0..1
                const fill = isOrange
                  ? `rgba(245, 158, 11, ${0.12 + intensity * 0.38})`
                  : `rgba(56, 189, 248, ${0.12 + intensity * 0.38})`
                return (
                  <rect
                    key={idx}
                    x={cell.c * cellSize}
                    y={cell.r * cellSize}
                    width={cellSize + 0.6}
                    height={cellSize + 0.6}
                    fill={fill}
                  />
                )
              })}

              {/* Coordinate Axes */}
              <line x1={140} y1={0} x2={140} y2={280} stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />
              <line x1={0} y1={140} x2={280} y2={140} stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />

              {/* Data Points */}
              {ds.points.map((pt, i) => {
                const cx = ((pt.x + 1) / 2) * 280
                const cy = ((1 - pt.y) / 2) * 280
                const p = predictPoint(pt.x, pt.y, dataset, model, neurons, activation, ds.points)
                const isRight = (p >= 0.5 ? 1 : 0) === pt.label

                return (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={7.5}
                      fill={pt.label === 1 ? '#f59e0b' : '#38bdf8'}
                      stroke={isRight ? '#ffffff' : '#ef4444'}
                      strokeWidth={isRight ? 2 : 3}
                    />
                  </g>
                )
              })}
            </svg>

            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-[#8e8e93]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#38bdf8] border border-white inline-block" /> Class 0 (Blue)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b] border border-white inline-block" /> Class 1 (Amber)
              </span>
            </div>
          </div>

          {/* Right 6 Cols: Neural Net Tuner & Conceptual Insights */}
          <div className="lg:col-span-6 space-y-4">
            {model === 'mlp' ? (
              <div className="p-4 rounded-xl bg-[#111113] border border-[#c084fc]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#c084fc]">
                    🧠 Tune Your Hidden Layer
                  </span>
                  <span className="text-[11px] font-mono text-[#a1a1aa]">
                    2 Inputs → {neurons} Hidden → 1 Output
                  </span>
                </div>

                {/* Hidden Neurons Picker */}
                <div>
                  <span className="text-[11px] text-[#a1a1aa] block mb-1.5">
                    Number of Hidden Neurons (How many folds in space?):
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 4, 8].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNeurons(n)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all ${
                          neurons === n
                            ? 'bg-[#c084fc] text-[#111113] border-[#c084fc]'
                            : 'bg-[#1a1a20] text-[#cbd5e1] border-white/10 hover:border-white/30'
                        }`}
                      >
                        {n} {n === 1 ? 'Neuron' : 'Neurons'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activation Function Picker */}
                <div>
                  <span className="text-[11px] text-[#a1a1aa] block mb-1.5">
                    Activation Function (What happens without non-linearity?):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'relu' as ActivationId, label: 'ReLU (Sharp Folds)' },
                      { id: 'tanh' as ActivationId, label: 'Tanh (Smooth Curves)' },
                      { id: 'linear_act' as ActivationId, label: 'None (Linear Collapse!)' },
                    ].map((act) => (
                      <button
                        key={act.id}
                        onClick={() => setActivation(act.id)}
                        className={`py-2 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${
                          activation === act.id
                            ? act.id === 'linear_act'
                              ? 'bg-[#ef4444]/20 text-[#fca5a5] border-[#ef4444]'
                              : 'bg-[#10b981]/20 text-[#a7f3d0] border-[#10b981]'
                            : 'bg-[#1a1a20] text-[#cbd5e1] border-white/10 hover:border-white/30'
                        }`}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Explanation of Current Neural Setup */}
                <div className="p-3 rounded-xl bg-[#18181f] border border-white/5 text-xs text-[#cbd5e1] leading-relaxed">
                  {activation === 'linear_act' ? (
                    <>
                      <strong className="text-[#ef4444]">⚠️ Linear Collapse!</strong> Without a non-linear activation like ReLU, multiplying two matrices <code className="text-white">W₂ · (W₁ · x)</code> is just one matrix <code className="text-white">W_combined · x</code>. Even with {neurons} neurons, your neural network collapses into a single straight line!
                    </>
                  ) : neurons === 1 ? (
                    <>
                      <strong className="text-[#f59e0b]">1 Neuron = 1 Crease:</strong> A single hidden neuron can only make one straight crease across the canvas—not enough to surround the XOR islands or the Bullseye ring!
                    </>
                  ) : (
                    <>
                      <strong className="text-[#10b981]">✨ Space Folding Active:</strong> Each hidden neuron acts like a fold in a sheet of paper. Combining {neurons} {activation.toUpperCase()} neurons lets the final layer slice cleanly through non-linear patterns!
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.08)] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                  {model === 'linear_model'
                    ? '📏 Linear Classifier (Logistic Regression)'
                    : model === 'tree'
                    ? '🌳 Decision Tree (Axis-Aligned Splits)'
                    : '📍 k-Nearest Neighbors (Local Distance Voting)'}
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  {model === 'linear_model'
                    ? 'Computes a single weighted sum z = w₁x + w₂y + b. It draws one clean straight boundary across the map. Super fast and interpretable on simple trends, but mathematically helpless on the XOR Trap (stuck at 58% accuracy)!'
                    : model === 'tree'
                    ? 'Slices space using vertical and horizontal If/Else rules (like "Is x > 0? Is y > 0?"). Great for spreadsheets, medical checklists, and credit scores, though its boundaries are always blocky rectangles.'
                    : 'Instead of learning equations or lines, k-NN memorizes all training points and colors every spot on the map by asking the 3 closest dots to vote. Flexible on 2D maps, but struggles when features grow to thousands of dimensions.'}
                </p>
              </div>
            )}

            {/* Quick Bridge to Deep Learning */}
            <div className="p-4 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.07)] text-xs text-[#a1a1aa] leading-relaxed">
              <strong className="text-white block mb-1">
                🔗 How This Connects to Large Language Models:
              </strong>
              Inside every Transformer block (which you will build in the next chapters!), right after Attention gathers context, the tokens pass through an <strong className="text-[#c084fc]">MLP (Multi-Layer Perceptron)</strong>—the exact same <code className="text-[#f6e9c7]">Linear → Activation → Linear</code> neural network you just tuned above!
            </div>
          </div>
        </div>

        <UnderTheHood
          id="classical-ml-neural-python"
          title="Under the hood: Classical ML vs. PyTorch Neural Network"
          explanation="Compare how classical Scikit-Learn models fit tabular boundaries versus how a 2-layer PyTorch neural network uses nn.ReLU() to fold non-linear space."
          defaultCode={PYTHON_ML_CODE}
        />
      </div>

      {/* ── PART 2: 4 ENVIRONMENTS CHALLENGE ── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: '#161618',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={15} className="text-[#f6e9c7]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f6e9c7]">
                Interactive Test • 4 ML Environments
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Choose the Right Machine Learning Model for the Job
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              Real AI engineers don't use a giant neural network when a simple linear line or decision tree is better. Pick the best fit for each scenario!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-[#111113] border border-[rgba(255,255,255,0.08)] text-xs font-mono">
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
          {ML_CHALLENGES.map((env) => {
            const chosen = answers[env.id]
            const isCorrect = chosen === env.correctModel

            return (
              <div
                key={env.id}
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
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white">{env.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e24] text-[#c084fc] border border-[#c084fc]/20 whitespace-nowrap">
                      {env.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed mb-4">{env.scenario}</p>
                </div>

                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                    {[
                      { id: 'linear_model' as ModelId, label: 'Linear' },
                      { id: 'tree' as ModelId, label: 'Decision Tree' },
                      { id: 'knn' as ModelId, label: 'k-NN' },
                      { id: 'mlp' as ModelId, label: 'Neural Net' },
                    ].map((opt) => {
                      const active = chosen === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setAnswers((prev) => ({ ...prev, [env.id]: opt.id }))}
                          className={`px-2 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                            active
                              ? opt.id === env.correctModel
                                ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]'
                                : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]'
                              : 'bg-[#1a1a20] text-[#d4d4d8] border-[rgba(255,255,255,0.07)] hover:border-white/25'
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  {chosen && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
                        isCorrect
                          ? 'bg-[#10b981]/10 text-[#a7f3d0] border border-[#10b981]/25'
                          : 'bg-[#ef4444]/10 text-[#fecaca] border border-[#ef4444]/25'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 size={14} className="text-[#10b981] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={14} className="text-[#ef4444] shrink-0 mt-0.5" />
                      )}
                      <span>{isCorrect ? env.explanation : env.wrongHints[chosen]}</span>
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

