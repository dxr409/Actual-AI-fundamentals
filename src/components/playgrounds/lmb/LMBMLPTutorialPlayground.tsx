import React, { useState, useEffect } from 'react'
import {
  Code2,
  Sparkles,
  ExternalLink,
  Pencil,
  Eye,
  Save,
  Copy,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { ENABLE_EDITING } from '@/lib/editMode'

interface MLPLayerInfo {
  id: string
  shortLabel: string
  subLabel: string
  shape: string
  formula: string
  title: string
  description: string
  visualDetail: string
}

const GENERAL_MLP_INFO: MLPLayerInfo = {
  id: 'general',
  shortLabel: 'MLP Overview',
  subLabel: 'Bengio et al. (2003)',
  shape: '(B, 3) → (B, 43)',
  formula: 'logits = tanh(BatchNorm(concat(C[X]) @ W1 + b1)) @ W2 + b2',
  title: 'General Overview: Multi-Layer Perceptron (MLP) Character Language Model',
  description:
    'Hover your cursor over any layer in the MLP graph above to inspect how it works! Unlike a bi-gram table (which only looks at 1 character and explodes exponentially if you look back 3 or 5 characters), an MLP embeds each character into a continuous 10D vector, concatenates the context window, passes it through a non-linear hidden layer (W1, b1, BatchNorm, tanh), and outputs 43 logits for the next Kazakh letter.',
  visualDetail:
    'Total Parameters: C (43×10) + W1 (30×200) + b1 (200) + BatchNorm (400) + W2 (200×43) + b2 (43) ≈ 15,673 trainable weights.',
}

const MLP_LAYERS: MLPLayerInfo[] = [
  {
    id: 'input',
    shortLabel: '1. Input (X)',
    subLabel: '3 Context IDs',
    shape: '(Batch, 3)',
    formula: 'X = [[c₁, c₂, c₃]]  ∈ {0..42}³',
    title: 'Input Layer: Sliding Window of 3 Character Indices (block_size = 3)',
    description:
      'Instead of feeding just 1 previous character like a bi-gram model, the input layer takes a fixed context window of 3 consecutive character integer IDs (from 0 to 42). For example, to predict the "й" in "абай", the input row is ["а", "б", "а"] → [1, 3, 1].',
    visualDetail: 'Example Input Row: [1, 3, 1] ("а", "б", "а")  →  Target Y: 13 ("й")',
  },
  {
    id: 'embedding',
    shortLabel: '2. Embedding',
    subLabel: 'Lookup C[X]',
    shape: '(Batch, 3, 10)',
    formula: 'emb = C[X]   where C ∈ ℝ^(43 × 10)',
    title: 'Embedding Layer: Mapping Discrete Letters into 10D Vector Space',
    description:
      'Each of the 43 characters (42 Kazakh letters + ".") has a learnable 10-dimensional row in lookup matrix C. Indexing C[X] replaces each integer ID with its 10D feature vector so similar Kazakh vowels and consonants can share geometry.',
    visualDetail: '3 character IDs × 10 dimensions each = a (3 × 10) mini-matrix per training example.',
  },
  {
    id: 'concat',
    shortLabel: '3. Concat',
    subLabel: '.view(-1, 30)',
    shape: '(Batch, 30)',
    formula: 'x_cat = emb.view(-1, 30) = [C[c₁] ∥ C[c₂] ∥ C[c₃]]',
    title: 'Concatenation Layer: Flattening 3 Embeddings into One 30D Vector',
    description:
      'Matrix multiplication expects a flat vector per example, not a 3D tensor. Calling emb.view(-1, 30) stitches the three 10-number vectors side-by-side into a single 30-number vector without copying any memory.',
    visualDetail: '[10D slot 1] + [10D slot 2] + [10D slot 3]  →  One unified 30D input vector.',
  },
  {
    id: 'hidden',
    shortLabel: '4. W1, b1',
    subLabel: 'Linear (30→200)',
    shape: '(Batch, 200)',
    formula: 'h_preact = x_cat @ W1 + b1   (W1 ∈ ℝ^(30 × 200))',
    title: 'Hidden Linear Layer (W1, b1): Projecting into 200 Feature Detectors',
    description:
      'The 30D concatenated vector is multiplied by weight matrix W1 (30×200) plus bias b1 (200). Each of the 200 hidden neurons looks for specific 3-letter Kazakh syllable patterns (such as vowel harmony or common suffixes like "-бек", "-гүл", "-хан").',
    visualDetail: '30 inputs × 200 neurons = 6,000 weights in W1 detecting trigram patterns.',
  },
  {
    id: 'batchnorm_tanh',
    shortLabel: '5. BatchNorm + tanh',
    subLabel: 'Normalize & Squash',
    shape: '(Batch, 200)',
    formula: 'h = tanh( γ · (h_preact − μ_B) / σ_B + β )',
    title: 'BatchNorm & tanh Non-Linearity: Preventing Dead Saturated Neurons',
    description:
      'If h_preact is too large (+15 or −15), it lands on the flat tails of tanh where gradients vanish (1 − tanh²(z) ≈ 0). BatchNorm centers every neuron to mean 0 and variance 1 across the batch before tanh smoothly squashes values into (−1, +1).',
    visualDetail: 'Healthy pre-activations stay near [-2, +2], keeping tanh gradients alive during backprop.',
  },
  {
    id: 'output',
    shortLabel: '6. Output Logits',
    subLabel: 'W2, b2 (200→43)',
    shape: '(Batch, 43)',
    formula: 'logits = h @ W2 + b2   (W2 ∈ ℝ^(200 × 43))',
    title: 'Output Layer (W2, b2): Producing 43 Raw Logits for Next Letter',
    description:
      'The 200 hidden activations are multiplied by output matrix W2 (200×43) + b2 to produce 43 raw scores (logits)—one for each of the 42 Kazakh letters and index 0 ("."). Higher logit means higher confidence for that next character.',
    visualDetail: '200 hidden features → 43 unnormalized log-scores (logits).',
  },
  {
    id: 'loss',
    shortLabel: '7. Loss Function',
    subLabel: 'Cross-Entropy',
    shape: 'Scalar Float',
    formula: 'L = F.cross_entropy(logits, Y) = −log( exp(logit_y) / Σ exp(logit_j) )',
    title: 'Loss Function: Softmax + Negative Log-Likelihood (Cross-Entropy)',
    description:
      'PyTorch’s F.cross_entropy Exponentiates the 43 logits into positive counts, normalizes them into probabilities summing to 100%, and takes −log(P[target]). As W1, W2, and C learn via gradient descent, loss drops from ~3.76 (random guessing) down toward ~2.05!',
    visualDetail: 'Random uniform loss = −ln(1/43) = 3.76  →  Trained MLP loss ≈ 2.08.',
  },
]

const MLP_GENERATED_KAZAKH_NAMES: string[] = [
  'айболат.',
  'амангелді.',
  'асылбек.',
  'айзере.',
  'алтынай.',
  'ақбота.',
  'арманжан.',
  'айдана.',
  'абылайхан.',
  'ақмарал.',
  'айсұлтан.',
  'әділет.',
  'айжан.',
  'алмасбек.',
  'аружан.',
  'ақжолтай.',
  'айбарша.',
  'асанәлі.',
  'айғаным.',
  'ахметбек.',
  'ақтоты.',
  'алпамыс.',
  'айдынбек.',
  'анарбек.',
  'ақниет.',
  'айтуған.',
  'арыстан.',
  'айкүміс.',
  'аمانбай.',
  'айшагүл.',
]

interface MLPTutorialSavedData {
  step1Text: string
  step1Code: string
  step2Text: string
  step2Code: string
  step3Text: string
  step3Code: string
  step4Text: string
  step4Code: string
  generatedNamesRaw: string
}

const MLP_TUTORIAL_STORAGE_KEY = 'qairu-mlp-deep-tutorial-v1'

export const DEFAULT_MLP_TUTORIAL_DATA: MLPTutorialSavedData = {
  step1Text:
    'Step 1 (Input Dataset): Slide a window of block_size = 3 characters across each Kazakh name to create input contexts X of shape (N, 3) and target next-letter labels Y of shape (N,).',
  step1Code: `block_size = 3 # context length: how many characters do we take to predict the next one?
X, Y = [], []

for w in words:
    context = [0] * block_size # start with [0, 0, 0] ("...")
    for ch in w + '.':
        ix = stoi[ch]
        X.append(context)
        Y.append(ix)
        context = context[1:] + [ix] # crop and append

X = torch.tensor(X) # shape: (N, 3)
Y = torch.tensor(Y) # shape: (N,)`,

  step2Text:
    'Step 2 (Embedding & Concatenation): Embed each integer ID in X into a 10D vector using lookup table C (43×10), then concatenate the 3 vectors into a single 30D row with .view(-1, 30).',
  step2Code: `n_embd = 10 # dimensionality of character embedding vectors
vocab_size = 43 # 42 Kazakh letters + '.'

C = torch.randn((vocab_size, n_embd))
emb = C[X] # shape: (batch_size, 3, 10)
emb_cat = emb.view(emb.shape[0], -1) # concatenate into (batch_size, 30)`,

  step3Text:
    'Step 3 (Hidden Layer, W1, b1, BatchNorm & tanh): Multiply the 30D input by W1 (30×200) + b1, normalize pre-activations with BatchNorm so neurons do not saturate, and apply the tanh activation function.',
  step3Code: `n_hidden = 200
W1 = torch.randn((block_size * n_embd, n_hidden)) * 0.2
b1 = torch.randn(n_hidden) * 0.01

# BatchNorm scale (gamma) and shift (beta)
bngain = torch.ones((1, n_hidden))
bnbias = torch.zeros((1, n_hidden))

h_preact = emb_cat @ W1 + b1
# Standardize each neuron across the mini-batch
h_norm = bngain * (h_preact - h_preact.mean(0, keepdim=True)) / h_preact.std(0, keepdim=True) + bnbias
h = torch.tanh(h_norm) # shape: (batch_size, 200) in (-1, +1)`,

  step4Text:
    'Step 4 (Output Logits, Cross-Entropy Loss & Sampling): Project the 200 hidden units to 43 logits via W2 (200×43) + b2, compute F.cross_entropy(logits, Y), update weights, and sample new Kazakh names!',
  step4Code: `import torch.nn.functional as F

W2 = torch.randn((n_hidden, vocab_size)) * 0.01
b2 = torch.zeros(vocab_size)

logits = h @ W2 + b2 # shape: (batch_size, 43)
loss = F.cross_entropy(logits, Y)

# Sampling from the trained MLP:
context = [0] * block_size
out = []
while True:
    emb = C[torch.tensor([context])] # (1, 3, 10)
    h = torch.tanh(batchnorm(emb.view(1, -1) @ W1 + b1))
    logits = h @ W2 + b2
    probs = F.softmax(logits, dim=1)
    ix = torch.multinomial(probs, num_samples=1).item()
    context = context[1:] + [ix]
    out.append(itos[ix])
    if ix == 0:
        break`,
  generatedNamesRaw: MLP_GENERATED_KAZAKH_NAMES.join('\n'),
}

export function MLPMultistepTutorial() {
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null)
  const [data, setData] = useState<MLPTutorialSavedData>(() => {
    try {
      const raw = localStorage.getItem(MLP_TUTORIAL_STORAGE_KEY)
      if (raw) return { ...DEFAULT_MLP_TUTORIAL_DATA, ...JSON.parse(raw) }
    } catch {}
    return DEFAULT_MLP_TUTORIAL_DATA
  })
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  // Interactive states for visualizations
  const [sampleWord, setSampleWord] = useState<'абай' | 'айжан' | 'алтын'>('абай')
  const [useBatchNorm, setUseBatchNorm] = useState<boolean>(true)
  const [mlpGeneratedCount, setMlpGeneratedCount] = useState<number>(0)

  useEffect(() => {
    try {
      localStorage.setItem(MLP_TUTORIAL_STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  const activeLayer: MLPLayerInfo =
    MLP_LAYERS.find((l) => l.id === hoveredLayerId) || GENERAL_MLP_INFO

  const updateField = <K extends keyof MLPTutorialSavedData>(
    key: K,
    val: MLPTutorialSavedData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: val }))
  }

  const handleCopyCodeForChapter = () => {
    const snippet = `// Copy-paste into src/components/playgrounds/lmb/LMBMLPTutorialPlayground.tsx (DEFAULT_MLP_TUTORIAL_DATA):
export const DEFAULT_MLP_TUTORIAL_DATA = ${JSON.stringify(data, null, 2)};`
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2400)
  }

  // Sliding context examples for Step 1 visualization
  const contextExamples = (() => {
    const chars = Array.from(sampleWord)
    const full = [...chars, '.']
    const rows: { ctx: string[]; target: string }[] = []
    let ctx = ['.', '.', '.']
    for (const ch of full) {
      rows.push({ ctx: [...ctx], target: ch })
      ctx = [ctx[1], ctx[2], ch]
    }
    return rows
  })()

  const generatedList = data.generatedNamesRaw
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="my-8 rounded-2xl border border-[#f6e9c7]/30 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · End-to-End MLP Language Model Architecture & Tutorial
          </span>
        </div>

        {ENABLE_EDITING && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isEditing
                  ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7]'
                  : 'bg-[#22211d] text-[#f6e9c7] border-[#f6e9c7]/35 hover:bg-[#f6e9c7]/15'
              }`}
            >
              {isEditing ? <Eye size={13} /> : <Pencil size={13} />}
              <span>{isEditing ? 'Preview Mode' : 'Edit Texts & Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.setItem(MLP_TUTORIAL_STORAGE_KEY, JSON.stringify(data))
                setSaved(true)
                setTimeout(() => setSaved(false), 1800)
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22211d] text-[#fdfbf7] border border-white/10 hover:border-[#f6e9c7]/50 flex items-center gap-1.5 cursor-pointer"
            >
              {saved ? <Check size={13} className="text-[#10b981]" /> : <Save size={13} />}
              <span>{saved ? 'Saved!' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCodeForChapter}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 hover:bg-[#10b981]/25 flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy for ch... File'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* ── PART 1: INTERACTIVE HOVERABLE MLP GRAPH (CIRCLES CONNECTED WITH LINES) ── */}
        <div
          className="p-4 rounded-xl bg-[#0f0f12] border border-white/10 space-y-4"
          onMouseLeave={() => setHoveredLayerId(null)}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#f6e9c7] uppercase tracking-wider">
              MLP Neural Network Graph — Move cursor over any layer of neurons to inspect it
            </span>
            <span className="font-mono text-[11px] text-[#a8a29e]">
              {hoveredLayerId ? `Inspecting: ${activeLayer.shortLabel}` : 'Showing General MLP Info'}
            </span>
          </div>

          {/* Classical MLP Diagram: columns of circular neurons, fully-connected synapses, ⋮ for hidden units, +1 bias nodes */}
          {(() => {
            type Slot =
              | { kind: 'node'; label?: string; color: string; group?: number; curve?: boolean }
              | { kind: 'ellipsis' }
              | { kind: 'gap' }

            const CHAR_COLORS = ['#60a5fa', '#a78bfa', '#f472b6'] // c₁, c₂, c₃ (traced through embedding → concat)
            const HIDDEN_COLOR = '#f6e9c7'
            const OUTPUT_COLOR = '#fb923c'
            const LOSS_COLOR = '#10b981'
            const CENTER_Y = 175

            const node = (color: string, extra: Partial<Omit<Extract<Slot, { kind: 'node' }>, 'kind'>> = {}): Slot => ({
              kind: 'node',
              color,
              ...extra,
            })
            const ELLIPSIS: Slot = { kind: 'ellipsis' }
            const GAP: Slot = { kind: 'gap' }

            const layers: {
              id: string
              x: number
              topTitle: string
              bottomSub: string
              spacing: number
              radius: number
              slots: Slot[]
            }[] = [
              {
                id: 'input',
                x: 60,
                topTitle: 'Input (X)',
                bottomSub: '3 Char IDs',
                spacing: 60,
                radius: 13,
                slots: [0, 1, 2].map((g) => node(CHAR_COLORS[g], { label: `c${'₁₂₃'[g]}`, group: g })),
              },
              {
                id: 'embedding',
                x: 185,
                topTitle: 'Embedding',
                bottomSub: 'C[X] (3×10)',
                spacing: 22,
                radius: 8,
                slots: [0, 1, 2].flatMap((g) => [
                  ...(g > 0 ? [GAP] : []),
                  node(CHAR_COLORS[g], { group: g }),
                  node(CHAR_COLORS[g], { group: g }),
                  node(CHAR_COLORS[g], { group: g }),
                ]),
              },
              {
                id: 'concat',
                x: 310,
                topTitle: 'Concat',
                bottomSub: '30D Vector',
                spacing: 24,
                radius: 8,
                slots: [0, 1, 2].flatMap((g) => [0, 1, 2].map(() => node(CHAR_COLORS[g], { group: g }))),
              },
              {
                id: 'hidden',
                x: 450,
                topTitle: 'Hidden (Σ)',
                bottomSub: 'W1·x + b1 (200)',
                spacing: 32,
                radius: 11,
                slots: [
                  node(HIDDEN_COLOR, { label: 'Σ' }),
                  node(HIDDEN_COLOR, { label: 'Σ' }),
                  node(HIDDEN_COLOR, { label: 'Σ' }),
                  ELLIPSIS,
                  node(HIDDEN_COLOR, { label: 'Σ' }),
                  node(HIDDEN_COLOR, { label: 'Σ' }),
                  node(HIDDEN_COLOR, { label: 'Σ' }),
                ],
              },
              {
                id: 'batchnorm_tanh',
                x: 580,
                topTitle: 'BN + tanh',
                bottomSub: 'h ∈ (-1, 1)',
                spacing: 32,
                radius: 11,
                slots: [
                  node(HIDDEN_COLOR, { curve: true }),
                  node(HIDDEN_COLOR, { curve: true }),
                  node(HIDDEN_COLOR, { curve: true }),
                  ELLIPSIS,
                  node(HIDDEN_COLOR, { curve: true }),
                  node(HIDDEN_COLOR, { curve: true }),
                  node(HIDDEN_COLOR, { curve: true }),
                ],
              },
              {
                id: 'output',
                x: 720,
                topTitle: 'Output',
                bottomSub: '43 Logits',
                spacing: 30,
                radius: 11,
                slots: [
                  node(OUTPUT_COLOR, { label: 'а' }),
                  node(OUTPUT_COLOR, { label: 'ә' }),
                  node(OUTPUT_COLOR, { label: 'б' }),
                  ELLIPSIS,
                  node(OUTPUT_COLOR, { label: 'ю' }),
                  node(OUTPUT_COLOR, { label: 'я' }),
                  node(OUTPUT_COLOR, { label: '.' }),
                ],
              },
              {
                id: 'loss',
                x: 850,
                topTitle: 'Loss',
                bottomSub: 'Cross-Entropy',
                spacing: 0,
                radius: 18,
                slots: [node(LOSS_COLOR, { label: 'L' })],
              },
            ]

            // Vertical position of every slot (centered around CENTER_Y)
            const slotY = (layer: (typeof layers)[number], i: number) =>
              CENTER_Y + (i - (layer.slots.length - 1) / 2) * layer.spacing

            // Only real neurons (no gaps / ellipses), with their computed coordinates
            const neuronsOf = (layer: (typeof layers)[number]) =>
              layer.slots
                .map((s, i) => ({ s, y: slotY(layer, i) }))
                .filter((n): n is { s: Extract<Slot, { kind: 'node' }>; y: number } => n.s.kind === 'node')

            // Bias "+1" nodes feeding the dense layers (hovering them inspects the layer they feed)
            const biasNodes = [
              { id: 'b1', x: 380, y: 44, label: 'b1', targetId: 'hidden' },
              { id: 'b2', x: 650, y: 44, label: 'b2', targetId: 'output' },
            ]

            // Weight-matrix captions placed between the fully-connected columns
            const weightCaptions = [
              { x: 122, text: 'lookup C' },
              { x: 380, text: 'W1 (30×200)' },
              { x: 650, text: 'W2 (200×43)' },
            ]

            // Bottom brackets grouping columns into classical Input / Hidden / Output layers
            const layerGroups = [
              { from: 60, to: 310, label: 'INPUT LAYER' },
              { from: 450, to: 580, label: 'HIDDEN LAYER' },
              { from: 720, to: 850, label: 'OUTPUT LAYER' },
            ]

            return (
              <div className="w-full overflow-x-auto rounded-xl bg-[#131317] border border-white/5 p-2">
                <svg
                  viewBox="0 0 910 350"
                  className="w-full min-w-[680px] h-auto select-none block"
                  onMouseLeave={() => setHoveredLayerId(null)}
                >
                  {/* 1. Synapses (connection lines) between adjacent columns */}
                  {layers.slice(0, -1).map((curr, lIdx) => {
                    const next = layers[lIdx + 1]
                    const highlighted = hoveredLayerId === curr.id || hoveredLayerId === next.id
                    const isLookup = curr.id === 'input' && next.id === 'embedding'
                    const isOneToOne =
                      (curr.id === 'embedding' && next.id === 'concat') ||
                      (curr.id === 'hidden' && next.id === 'batchnorm_tanh')
                    const from = neuronsOf(curr)
                    const to = neuronsOf(next)

                    return (
                      <g key={`edges-${curr.id}`}>
                        {from.map((a, i) =>
                          to.map((b, j) => {
                            // Lookup: each char only feeds its own embedding row
                            if (isLookup && a.s.group !== b.s.group) return null
                            // Reshape / activation: neuron i maps only to neuron i
                            if (isOneToOne && i !== j) return null
                            return (
                              <line
                                key={`${i}-${j}`}
                                x1={curr.x + curr.radius}
                                y1={a.y}
                                x2={next.x - next.radius}
                                y2={b.y}
                                stroke={highlighted ? '#f6e9c7' : 'rgba(255, 255, 255, 0.12)'}
                                strokeWidth={highlighted ? 1.3 : 0.8}
                                strokeOpacity={highlighted ? 0.7 : 1}
                                className="transition-all duration-150"
                              />
                            )
                          })
                        )}
                      </g>
                    )
                  })}

                  {/* 2. Bias edges (dashed) */}
                  {biasNodes.map((b) => {
                    const target = layers.find((l) => l.id === b.targetId)!
                    const highlighted = hoveredLayerId === b.targetId
                    return (
                      <g key={`bias-edges-${b.id}`}>
                        {neuronsOf(target).map((n, i) => (
                          <line
                            key={i}
                            x1={b.x}
                            y1={b.y + 9}
                            x2={target.x - target.radius}
                            y2={n.y}
                            stroke={highlighted ? '#f6e9c7' : 'rgba(255, 255, 255, 0.1)'}
                            strokeWidth={highlighted ? 1.1 : 0.7}
                            strokeDasharray="3 3"
                            className="transition-all duration-150"
                          />
                        ))}
                      </g>
                    )
                  })}

                  {/* 3. Columns: hover zone, title, neurons, ellipses, sub-label */}
                  {layers.map((layer) => {
                    const isHovered = hoveredLayerId === layer.id
                    return (
                      <g
                        key={layer.id}
                        onMouseEnter={() => setHoveredLayerId(layer.id)}
                        onMouseMove={() => {
                          if (hoveredLayerId !== layer.id) setHoveredLayerId(layer.id)
                        }}
                        className="cursor-pointer"
                      >
                        {/* Wide hit-area so the cursor switches layers smoothly */}
                        <rect
                          x={layer.x - 52}
                          y={50}
                          width={104}
                          height={272}
                          rx={12}
                          fill={isHovered ? 'rgba(246, 233, 199, 0.06)' : 'transparent'}
                          stroke={isHovered ? 'rgba(246, 233, 199, 0.3)' : 'transparent'}
                          strokeDasharray="3 3"
                        />

                        {/* Column title */}
                        <text
                          x={layer.x}
                          y={22}
                          textAnchor="middle"
                          fill={isHovered ? '#f6e9c7' : '#e4e4e7'}
                          fontSize="11"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {layer.topTitle}
                        </text>

                        {layer.slots.map((slot, i) => {
                          const cy = slotY(layer, i)
                          if (slot.kind === 'gap') return null
                          if (slot.kind === 'ellipsis') {
                            // Vertical "⋮" = many more neurons not drawn
                            return (
                              <g key={i}>
                                {[-7, 0, 7].map((dy) => (
                                  <circle key={dy} cx={layer.x} cy={cy + dy} r={1.7} fill={isHovered ? '#f6e9c7' : '#71717a'} />
                                ))}
                              </g>
                            )
                          }
                          const r = layer.radius
                          return (
                            <g key={i}>
                              {isHovered && (
                                <circle cx={layer.x} cy={cy} r={r + 4} fill="none" stroke={slot.color} strokeOpacity={0.4} strokeWidth={2} />
                              )}
                              {/* Neuron body */}
                              <circle
                                cx={layer.x}
                                cy={cy}
                                r={r}
                                fill={isHovered ? slot.color : '#1c1c22'}
                                stroke={isHovered ? '#ffffff' : slot.color}
                                strokeWidth={isHovered ? 2 : 1.5}
                                className="transition-all duration-150"
                              />
                              {/* Tinted inner fill when idle */}
                              {!isHovered && (
                                <circle cx={layer.x} cy={cy} r={r - 1} fill={slot.color} fillOpacity={0.12} pointerEvents="none" />
                              )}
                              {/* tanh activation glyph */}
                              {slot.curve && (
                                <path
                                  d={`M ${layer.x - 6} ${cy + 4} C ${layer.x - 1} ${cy + 4}, ${layer.x + 1} ${cy - 4}, ${layer.x + 6} ${cy - 4}`}
                                  fill="none"
                                  stroke={isHovered ? '#141416' : slot.color}
                                  strokeWidth={1.5}
                                  strokeLinecap="round"
                                  pointerEvents="none"
                                />
                              )}
                              {slot.label && (
                                <text
                                  x={layer.x}
                                  y={cy + (layer.id === 'loss' ? 4.5 : 3.5)}
                                  textAnchor="middle"
                                  fill={isHovered ? '#141416' : slot.color}
                                  fontSize={layer.id === 'loss' ? '13' : '10'}
                                  fontWeight="700"
                                  fontFamily="monospace"
                                  pointerEvents="none"
                                >
                                  {slot.label}
                                </text>
                              )}
                            </g>
                          )
                        })}

                        {/* Column sub-label */}
                        <text
                          x={layer.x}
                          y={312}
                          textAnchor="middle"
                          fill={isHovered ? '#f6e9c7' : '#a1a1aa'}
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          {layer.bottomSub}
                        </text>
                      </g>
                    )
                  })}

                  {/* 4. Bias nodes (+1) */}
                  {biasNodes.map((b) => {
                    const isHovered = hoveredLayerId === b.targetId
                    return (
                      <g
                        key={b.id}
                        onMouseEnter={() => setHoveredLayerId(b.targetId)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={b.x}
                          cy={b.y}
                          r={9}
                          fill={isHovered ? '#f6e9c7' : '#1c1c22'}
                          stroke="#f6e9c7"
                          strokeWidth={1.2}
                          strokeDasharray="2 2"
                        />
                        <text x={b.x} y={b.y + 3} textAnchor="middle" fill={isHovered ? '#141416' : '#f6e9c7'} fontSize="8.5" fontWeight="700" fontFamily="monospace" pointerEvents="none">
                          +1
                        </text>
                        <text x={b.x + 14} y={b.y + 3} fill="#a1a1aa" fontSize="8.5" fontFamily="monospace" pointerEvents="none">
                          {b.label}
                        </text>
                      </g>
                    )
                  })}

                  {/* 5. Weight captions between columns */}
                  {weightCaptions.map((w) => (
                    <text key={w.text} x={w.x} y={296} textAnchor="middle" fill="#71717a" fontSize="8.5" fontStyle="italic" fontFamily="monospace" pointerEvents="none">
                      {w.text}
                    </text>
                  ))}

                  {/* 6. Classical layer-group brackets */}
                  {layerGroups.map((g) => (
                    <g key={g.label} pointerEvents="none">
                      <path
                        d={`M ${g.from - 30} 322 V 327 H ${g.to + 30} V 322`}
                        fill="none"
                        stroke="rgba(246, 233, 199, 0.35)"
                        strokeWidth={1}
                      />
                      <text x={(g.from + g.to) / 2} y={342} textAnchor="middle" fill="#a8a29e" fontSize="9.5" fontWeight="700" letterSpacing="1.5" fontFamily="monospace">
                        {g.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )
          })()}

          {/* Dynamic Layer Description Box (Appears below; shows general MLP info by default) */}
          <div className="p-4 rounded-xl bg-[#18181d] border border-[#f6e9c7]/35 transition-all space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-[#f6e9c7]">{activeLayer.title}</h4>
              <span className="px-2.5 py-0.5 rounded-full bg-[#111113] border border-white/10 font-mono text-[11px] text-[#10b981]">
                Shape: {activeLayer.shape}
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-[#111113] border border-white/5 font-mono text-xs text-[#f6e9c7]">
              {activeLayer.formula}
            </div>

            <p className="text-xs text-[#d6d3d1] leading-relaxed">{activeLayer.description}</p>

            <div className="text-[11px] font-mono text-[#a8a29e] pt-1 border-t border-white/5">
              {activeLayer.visualDetail}
            </div>
          </div>
        </div>

        {/* ── PART 2: STEP-BY-STEP MLP TUTORIAL WINDOWS WITH VISUALIZATIONS & SIMPLE CODE ── */}

        {/* STEP 1: INPUT & SLIDING 3-CHAR CONTEXT */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
              1. Input Layer · 3-Character Context Window (X, Y)
            </span>
            <div className="flex items-center gap-1">
              {(['абай', 'айжан', 'алтын'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSampleWord(w)}
                  className={`px-2.5 py-0.5 rounded text-xs font-mono cursor-pointer ${
                    sampleWord === w
                      ? 'bg-[#f6e9c7] text-[#1a1813] font-bold'
                      : 'bg-[#111113] text-[#a8a29e] hover:text-white'
                  }`}
                >
                  "{w}"
                </button>
              ))}
            </div>
          </div>

          {isEditing ? (
            <textarea
              value={data.step1Text}
              onChange={(e) => updateField('step1Text', e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-[#111113] border border-[#f6e9c7]/30 p-2.5 text-xs text-[#fdfbf7]"
            />
          ) : (
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{data.step1Text}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-6 flex flex-col">
              <div className="px-3 py-1.5 rounded-t-lg bg-[#111113] border border-b-0 border-white/10 text-[10px] font-mono text-[#f6e9c7] flex items-center gap-1.5">
                <Code2 size={12} /> Python · Building X and Y Tensors
              </div>
              <textarea
                value={data.step1Code}
                onChange={(e) => updateField('step1Code', e.target.value)}
                readOnly={!isEditing}
                rows={7}
                spellCheck={false}
                className="w-full flex-1 rounded-b-lg bg-[#0c0c0e] border border-white/10 p-3 font-mono text-xs text-[#f6e9c7] focus:outline-none"
              />
            </div>

            {/* Step 1 Visualization: Sliding Window Table */}
            <div className="lg:col-span-6 p-3.5 rounded-xl bg-[#111113] border border-white/10 flex flex-col justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#f6e9c7] mb-2">
                Sliding 3-Char Contexts for "{sampleWord}."
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {contextExamples.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#18181d] border border-white/5"
                  >
                    <div className="flex items-center gap-1.5">
                      {row.ctx.map((c, ci) => (
                        <span
                          key={ci}
                          className="w-6 h-6 rounded bg-[#24231e] border border-[#f6e9c7]/30 flex items-center justify-center text-[#f6e9c7] font-bold"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    <span className="text-[#8e8e93]">predicts ──►</span>
                    <span className="px-2.5 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 font-bold">
                      "{row.target}"
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: EMBEDDING LAYER & CONCATENATION */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            2. Embedding Layer C[X] & Concatenation (.view(-1, 30))
          </div>

          {isEditing ? (
            <textarea
              value={data.step2Text}
              onChange={(e) => updateField('step2Text', e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-[#111113] border border-[#f6e9c7]/30 p-2.5 text-xs text-[#fdfbf7]"
            />
          ) : (
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{data.step2Text}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-6 flex flex-col">
              <div className="px-3 py-1.5 rounded-t-lg bg-[#111113] border border-b-0 border-white/10 text-[10px] font-mono text-[#f6e9c7] flex items-center gap-1.5">
                <Code2 size={12} /> Python · Embedding Lookup & Concatenation
              </div>
              <textarea
                value={data.step2Code}
                onChange={(e) => updateField('step2Code', e.target.value)}
                readOnly={!isEditing}
                rows={6}
                spellCheck={false}
                className="w-full flex-1 rounded-b-lg bg-[#0c0c0e] border border-white/10 p-3 font-mono text-xs text-[#f6e9c7] focus:outline-none"
              />
            </div>

            {/* Step 2 Visualization: 3x10 -> 1x30 Concatenation Diagram */}
            <div className="lg:col-span-6 p-3.5 rounded-xl bg-[#111113] border border-white/10 flex flex-col justify-between space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#f6e9c7]">
                Visualizing C[X] Lookup (3 × 10) → Concatenated Vector (30D)
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                {[
                  { ch: 'а', id: 1, vals: '[+0.4, -0.2, ... 10D]' },
                  { ch: 'б', id: 3, vals: '[-0.7, +0.9, ... 10D]' },
                  { ch: 'а', id: 1, vals: '[+0.4, -0.2, ... 10D]' },
                ].map((slot, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2 rounded-lg bg-[#18181d] border border-[#f6e9c7]/25 text-center"
                  >
                    <div className="font-bold text-[#f6e9c7]">
                      Slot {sIdx + 1}: "{slot.ch}" (id={slot.id})
                    </div>
                    <div className="text-[#a8a29e] mt-1">{slot.vals}</div>
                  </div>
                ))}
              </div>

              <div className="text-center text-[11px] font-mono text-[#a8a29e]">
                ▼ <code>emb.view(-1, 30)</code> stitches all 3 slots side-by-side ▼
              </div>

              <div className="p-2.5 rounded-lg bg-[#10b981]/15 border border-[#10b981]/40 text-center font-mono text-xs text-[#10b981] font-bold">
                Concatenated Input Vector x_cat: shape (1, 30) = [10D ∥ 10D ∥ 10D]
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: HIDDEN LAYER (W1, b1), BATCHNORM & TANH */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
              3. Hidden Layer (W1, b1), BatchNorm & tanh Activation
            </span>
            <button
              type="button"
              onClick={() => setUseBatchNorm((v) => !v)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer border ${
                useBatchNorm
                  ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50'
                  : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/50'
              }`}
            >
              {useBatchNorm ? 'BatchNorm: ON (Healthy tanh)' : 'BatchNorm: OFF (Saturated Tails!)'}
            </button>
          </div>

          {isEditing ? (
            <textarea
              value={data.step3Text}
              onChange={(e) => updateField('step3Text', e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-[#111113] border border-[#f6e9c7]/30 p-2.5 text-xs text-[#fdfbf7]"
            />
          ) : (
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{data.step3Text}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-6 flex flex-col">
              <div className="px-3 py-1.5 rounded-t-lg bg-[#111113] border border-b-0 border-white/10 text-[10px] font-mono text-[#f6e9c7] flex items-center gap-1.5">
                <Code2 size={12} /> Python · Hidden Layer + BatchNorm + tanh
              </div>
              <textarea
                value={data.step3Code}
                onChange={(e) => updateField('step3Code', e.target.value)}
                readOnly={!isEditing}
                rows={8}
                spellCheck={false}
                className="w-full flex-1 rounded-b-lg bg-[#0c0c0e] border border-white/10 p-3 font-mono text-xs text-[#f6e9c7] focus:outline-none"
              />
            </div>

            {/* Step 3 Visualization: tanh Curve & BatchNorm Effect */}
            <div className="lg:col-span-6 p-3.5 rounded-xl bg-[#111113] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                <span className="text-[#f6e9c7] font-bold">
                  h = tanh(z) Activation & Gradient Flow
                </span>
                <span className={useBatchNorm ? 'text-[#10b981]' : 'text-[#ef4444]'}>
                  {useBatchNorm ? 'Active linear zone (grad > 0.4)' : 'Flat tails (grad ≈ 0.00!)'}
                </span>
              </div>

              <svg viewBox="0 0 260 120" className="w-full h-36 overflow-visible">
                {/* Axes */}
                <line x1="15" y1="60" x2="245" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <line x1="130" y1="12" x2="130" y2="108" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <text x="235" y="55" fontSize="8" fontFamily="monospace" fill="#8e8e93">z</text>
                <text x="134" y="18" fontSize="8" fontFamily="monospace" fill="#8e8e93">+1</text>
                <text x="134" y="106" fontSize="8" fontFamily="monospace" fill="#8e8e93">-1</text>

                {/* tanh S-curve */}
                <path
                  d="M 20,102 C 75,102 95,98 130,60 C 165,22 185,18 240,18"
                  fill="none"
                  stroke="#f6e9c7"
                  strokeWidth="2.2"
                />

                {/* Sampled neuron pre-activations */}
                {(useBatchNorm
                  ? [-1.1, -0.6, -0.2, 0.3, 0.7, 1.2]
                  : [-3.6, -3.1, -2.7, 2.8, 3.3, 3.7]
                ).map((z, i) => {
                  const px = 130 + z * 26
                  const tVal = Math.tanh(z)
                  const py = 60 - tVal * 42
                  return (
                    <circle
                      key={i}
                      cx={px}
                      cy={py}
                      r="4"
                      fill={useBatchNorm ? '#10b981' : '#ef4444'}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  )
                })}
              </svg>

              <p className="text-[11px] text-[#a8a29e] leading-relaxed">
                {useBatchNorm
                  ? 'With BatchNorm ON, pre-activations stay centered around [-1.5, +1.5] (green dots) where the tanh slope is steep and neurons learn rapidly.'
                  : 'With BatchNorm OFF, large matrix products push neurons to the extreme ±1 flat tails (red dots) where derivatives vanish into dead neurons!'}
              </p>
            </div>
          </div>
        </div>

        {/* STEP 4: OUTPUT LOGITS, LOSS FUNCTION & GENERATING NAMES */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            4. Output Logits (W2, b2), Cross-Entropy Loss & MLP Name Generator
          </div>

          {isEditing ? (
            <textarea
              value={data.step4Text}
              onChange={(e) => updateField('step4Text', e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-[#111113] border border-[#f6e9c7]/30 p-2.5 text-xs text-[#fdfbf7]"
            />
          ) : (
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{data.step4Text}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-6 flex flex-col">
              <div className="px-3 py-1.5 rounded-t-lg bg-[#111113] border border-b-0 border-white/10 text-[10px] font-mono text-[#f6e9c7] flex items-center gap-1.5">
                <Code2 size={12} /> Python · Output Logits, Cross-Entropy Loss & Sampling
              </div>
              <textarea
                value={data.step4Code}
                onChange={(e) => updateField('step4Code', e.target.value)}
                readOnly={!isEditing}
                rows={10}
                spellCheck={false}
                className="w-full flex-1 rounded-b-lg bg-[#0c0c0e] border border-white/10 p-3 font-mono text-xs text-[#f6e9c7] focus:outline-none"
              />
            </div>

            {/* Step 4 Visualization: Loss Comparison + MLP Generated Names (Empty by Default) */}
            <div className="lg:col-span-6 p-3.5 rounded-xl bg-[#111113] border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-[#a8a29e]">Negative Log-Likelihood Loss:</span>
                  <span className="text-[#10b981] font-bold">
                    Bi-gram: 2.51 ──► MLP: 2.08
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f6e9c7]">
                    MLP Generated Kazakh Names ({mlpGeneratedCount} / {generatedList.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMlpGeneratedCount(generatedList.length)}
                      className="px-3 py-1 rounded-lg bg-[#f6e9c7] text-[#1a1813] font-bold text-xs flex items-center gap-1.5 hover:bg-[#fdfbf7] cursor-pointer"
                    >
                      <Sparkles size={12} />
                      <span>Generate with MLP</span>
                    </button>
                    {mlpGeneratedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setMlpGeneratedCount(0)}
                        className="px-2 py-1 rounded-lg bg-[#1c1c20] text-[#a8a29e] hover:text-white text-xs border border-white/10 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    value={data.generatedNamesRaw}
                    onChange={(e) => updateField('generatedNamesRaw', e.target.value)}
                    rows={6}
                    className="w-full rounded-lg bg-[#18181c] border border-[#10b981]/40 p-2 font-mono text-xs text-white"
                  />
                ) : mlpGeneratedCount === 0 ? (
                  <div className="h-44 rounded-lg bg-[#0b0b0d] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-[#8e8e93] font-mono">
                      Output is empty. Press &ldquo;Generate with MLP&rdquo; to sample Kazakh names!
                    </p>
                  </div>
                ) : (
                  <div className="h-44 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1.5 rounded-lg bg-[#0b0b0d] p-2.5 border border-white/5 font-mono text-xs">
                    {generatedList.slice(0, mlpGeneratedCount).map((name, i) => (
                      <div
                        key={i}
                        className="px-2 py-1 rounded bg-[#16161a] border border-white/5 text-[#10b981] flex items-center justify-between"
                      >
                        <span className="truncate">{name}</span>
                        <span className="text-[9px] text-[#71717a]">#{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ColabNotebookCardProps {
  storageId: string
  defaultTitle: string
  defaultDescription: string
  defaultUrl: string
}

export function ColabNotebookCard({
  storageId,
  defaultTitle,
  defaultDescription,
  defaultUrl,
}: ColabNotebookCardProps) {
  const storageKey = `qairu-colab-link-${storageId}`
  const [url, setUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) || defaultUrl
    } catch {
      return defaultUrl
    }
  })
  const [editingUrl, setEditingUrl] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSaveUrl = (newUrl: string) => {
    setUrl(newUrl)
    try {
      localStorage.setItem(storageKey, newUrl)
    } catch {}
  }

  return (
    <div className="my-6 p-5 rounded-2xl border border-[#f6e9c7]/35 bg-[#161618] text-[#fdfbf7] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#f6e9c7]/15 text-[#f6e9c7] border border-[#f6e9c7]/35 font-mono text-[10px] font-bold uppercase tracking-wider">
            Interactive Google Colab Notebook
          </span>
          {ENABLE_EDITING && (
            <button
              type="button"
              onClick={() => setEditingUrl((v) => !v)}
              className="text-[11px] text-[#a8a29e] hover:text-[#f6e9c7] flex items-center gap-1 cursor-pointer"
            >
              <Pencil size={11} />
              <span>{editingUrl ? 'Done' : 'Edit Colab Link'}</span>
            </button>
          )}
        </div>

        <h4 className="text-sm font-bold text-white">{defaultTitle}</h4>
        <p className="text-xs text-[#a8a29e] leading-relaxed">{defaultDescription}</p>

        {editingUrl && (
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => handleSaveUrl(e.target.value)}
              placeholder="https://colab.research.google.com/drive/..."
              className="flex-1 rounded-lg bg-[#0f0f11] border border-[#f6e9c7]/40 px-3 py-1.5 text-xs font-mono text-[#f6e9c7] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 1800)
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#22211d] text-xs font-mono text-[#f6e9c7] border border-white/10 cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f6e9c7] text-[#1a1813] hover:bg-[#fdfbf7] font-bold text-xs transition-all shadow-md"
        >
          <span>Open in Google Colab</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}

