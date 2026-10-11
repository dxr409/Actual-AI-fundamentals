export interface SocraticTierInfo {
  tier: 1 | 2 | 3
  title: string
  subtitle: string
  question: string
  explanation: string
  socraticPrompt?: string
  socraticAnswer?: string
}

export interface SocraticDiagnostic {
  symbolKey: string
  displayLabel: string
  isMath: boolean
  category: 'calculus' | 'linear_algebra' | 'transformer' | 'training' | 'nlp' | 'code' | 'general'
  tiers: {
    1: SocraticTierInfo
    2: SocraticTierInfo
    3: SocraticTierInfo
  }
}

// ── Curated Machine Learning & LLM Encyclopedia ──────────────────────────────
const CURATED_KNOWLEDGE_GRAPH: Record<string, SocraticDiagnostic> = {
  // ── 1. Linear Algebra & Matrix Notation ──
  transpose: {
    symbolKey: 'transpose',
    displayLabel: 'Wᵀ / Kᵀ (Matrix Transpose)',
    isMath: true,
    category: 'linear_algebra',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Matrix Transpose Operator',
        question: 'What is the matrix transpose (superscript T)?',
        explanation:
          'The transpose operation flips a matrix over its main diagonal, interchanging its row and column indices: if matrix A has dimension (m × n), then Aᵀ has dimension (n × m), with (Aᵀ)ᵢⱼ = Aⱼᵢ.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Why is transpose necessary in transformers?',
        question: 'Why must matrices like W₂ or K be transposed during attention and backprop?',
        explanation:
          'Matrix multiplication (A · B) requires the inner dimensions to match: (B, d_in) × (d_in, d_out). During forward attention QKᵀ, Q has shape (N, d_k) and K has shape (N, d_k). Multiplying Q by K directly is invalid; transposing K to (d_k, N) produces the valid (N × N) pairwise token attention matrix. In backpropagation, transposing weights redistributes gradients back to the original input dimension.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Dimension alignment inquiry',
        question: 'If vector h has shape (1, 64) and weight matrix W has shape (64, 128), what happens if you attempt h · Wᵀ without checking shapes?',
        explanation:
          'h is (1, 64) and Wᵀ is (128, 64). Multiplying (1, 64) by (128, 64) violates the inner dimension rule (64 ≠ 128), causing PyTorch to throw a RuntimeError. The transpose must only be applied when inverting backward directions.',
        socraticPrompt: 'Check inner dimensions: (A × B) · (C × D) is only valid if B == C.',
        socraticAnswer: 'Dimension mismatch: 64 ≠ 128. Transposing is only valid when aligning inverted axes.',
      },
    },
  },

  dot_product: {
    symbolKey: 'dot_product',
    displayLabel: 'Dot Product (q · k)',
    isMath: true,
    category: 'linear_algebra',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Vector Inner Product',
        question: 'What is the dot product between two vectors?',
        explanation:
          'The dot product (inner product) sums the element-wise products of two vectors: u · v = ∑ uᵢvᵢ = ||u|| ||v|| cos(θ). It yields a single scalar reflecting both vector magnitudes and their directional alignment.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Measuring similarity in attention',
        question: 'Why is the dot product used to score token relevance in attention?',
        explanation:
          'When Query and Key vectors point in similar directions in embedding space, cos(θ) approaches 1, producing a large positive scalar. Unrelated vectors are orthogonal (dot product = 0), and opposing meanings produce negative values, directly driving softmax attention weights.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Active recall inquiry',
        question: 'If two normalized embedding vectors are completely orthogonal (perpendicular), what is their dot product, and what attention weight do they receive?',
        explanation:
          'Orthogonal vectors have dot product = 0. In softmax, e⁰ = 1.0, giving them a baseline neutral score compared to vectors with positive alignments.',
        socraticPrompt: 'Recall cos(90°) = 0.',
        socraticAnswer: 'Dot product is 0.0, representing complete linear independence.',
      },
    },
  },

  // ── 2. Sequential Architectures (RNN, LSTM, GRU) ──
  gru: {
    symbolKey: 'gru',
    displayLabel: 'GRU (Gated Recurrent Unit)',
    isMath: false,
    category: 'nlp',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Gated Recurrent Unit Architecture',
        question: 'What is a GRU (Gated Recurrent Unit)?',
        explanation:
          'A Gated Recurrent Unit (Cho et al., 2014) is a gating mechanism for Recurrent Neural Networks designed to capture long-range sequential dependencies. It uses two learnable gates—an Update Gate (z_t) and a Reset Gate (r_t)—to control how memory is retained across time.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Gating vs. Vanishing Gradients',
        question: 'How do GRU gates prevent the vanishing gradient problem of simple RNNs?',
        explanation:
          'In standard RNNs, hidden states are repeatedly multiplied by the recurrent matrix W_hh, causing gradients to decay exponentially. The GRU uses an additive linear interpolation: h_t = (1 - z_t) ⊙ h_{t-1} + z_t ⊙ h̃_t. When z_t ≈ 0, the previous hidden state is copied forward with an effective derivative of 1, allowing gradients to travel back dozens of steps unimpeded.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Recurrence vs. Transformers',
        question: 'If GRUs solved vanishing gradients, why did Transformers replace them in modern LLMs?',
        explanation:
          'GRUs have an inherent sequential bottleneck: token t cannot be computed until token t-1 finishes, preventing GPU parallelization. Transformers compute self-attention across all tokens simultaneously in parallel matrix multiplications, scaling effortlessly to billions of parameters.',
        socraticPrompt: 'Consider parallel compute: can a recurrent loop process token 500 without computing tokens 1 through 499 first?',
        socraticAnswer: 'Sequential dependency: O(T) recurrent steps prevent GPU parallelization across sequence length.',
      },
    },
  },

  lstm: {
    symbolKey: 'lstm',
    displayLabel: 'LSTM (Long Short-Term Memory)',
    isMath: false,
    category: 'nlp',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Long Short-Term Memory Network',
        question: 'What is an LSTM and how does it store memory?',
        explanation:
          'Long Short-Term Memory (Hochreiter & Schmidhuber, 1997) is a gated recurrent architecture that splits memory into two vectors: a hidden state (h_t) and an uninterrupted cell state (c_t), regulated by three gates: Forget Gate (f_t), Input Gate (i_t), and Output Gate (o_t).',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Cell State Conveyor Belt',
        question: 'Why does the LSTM cell state allow error signals to propagate hundreds of steps?',
        explanation:
          'The cell state acts like a linear conveyor belt: c_t = f_t ⊙ c_{t-1} + i_t ⊙ c̃_t. Because information is accumulated via pure addition rather than repeated matrix multiplication, the derivative ∂c_t / ∂c_{t-1} ≈ f_t. If f_t ≈ 1, error gradients flow back hundreds of steps with virtually zero attenuation.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Architecture comparison',
        question: 'What are the two key architectural differences between an LSTM and a GRU?',
        explanation:
          'LSTMs maintain two separate state vectors (cell state c_t and hidden state h_t) with 3 gates. GRUs merge cell and hidden state into a single vector h_t and combine forget/input gates into a single update gate, using ~25% fewer parameters.',
        socraticPrompt: 'Count the gates and states: LSTM has 3 gates + 2 states. What about GRU?',
        socraticAnswer: 'GRU has 2 gates (update/reset) and only 1 hidden state vector, making it faster and lighter.',
      },
    },
  },

  rnn: {
    symbolKey: 'rnn',
    displayLabel: 'Recurrent Neural Network (RNN)',
    isMath: false,
    category: 'nlp',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Sequential Neural Network',
        question: 'What is a Recurrent Neural Network (RNN)?',
        explanation:
          'An RNN is a class of neural network that processes sequential data token by token, maintaining a recurrent hidden state vector h_t = tanh(W_hh · h_{t-1} + W_xh · x_t + b) that acts as working memory of past context.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Why vanilla RNNs fail on long contexts',
        question: 'Why do vanilla RNNs suffer from the vanishing gradient problem?',
        explanation:
          'During Backpropagation Through Time (BPTT), computing gradients for early tokens requires repeatedly multiplying by W_hhᵀ: ∂ℒ/∂h_1 = (∂ℒ/∂h_T) · ∏ (W_hhᵀ · diag(1 - tanh²)). If the eigenvalues of W_hh are less than 1, the gradient decays exponentially to zero within 15–20 steps.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Context comparison',
        question: 'How does an RNN’s memory mechanism differ fundamentally from self-attention in a Transformer?',
        explanation:
          'An RNN compresses all prior context into a single fixed-size vector h_t (creating an information bottleneck). Attention allows every token to directly query and inspect any specific prior token across the entire context window without lossy compression.',
        socraticPrompt: 'Think about compression: can a 512-dim vector hold all information from an entire 50-page chapter?',
        socraticAnswer: 'Compression bottleneck: RNNs squeeze all history into one vector; Transformers retain full token history.',
      },
    },
  },

  vanishing_gradient: {
    symbolKey: 'vanishing_gradient',
    displayLabel: 'Vanishing Gradient Problem',
    isMath: true,
    category: 'calculus',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Exponential Decay of Error Signals',
        question: 'What is the vanishing gradient problem?',
        explanation:
          'The vanishing gradient problem occurs during backpropagation when the error gradients computed by the chain rule shrink exponentially as they propagate backward through layers or sequence steps, decaying to virtually zero.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Mathematical cause of vanishing gradients',
        question: 'Why do gradients shrink to zero when backpropagating through deep or recurrent networks?',
        explanation:
          'By the calculus chain rule, the gradient is the product of Jacobian matrices across each layer: ∏ Jᵢ. If the spectral radius of the weights is < 1, or if activation functions have derivatives < 1 (e.g. tanh derivative ≤ 1.0, sigmoid ≤ 0.25), the product decays exponentially: (0.5)²⁰ ≈ 0.00000095.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Modern architectural solutions',
        question: 'How do Residual Connections (x + f(x)) in Transformers mathematically guarantee that gradients cannot vanish?',
        explanation:
          'Differentiating y = x + f(x) with respect to x gives ∂y/∂x = I + ∂f/∂x. The identity matrix I creates an uninterrupted gradient highway where gradients flow back through 100+ layers without diminishing.',
        socraticPrompt: 'Differentiate y = x + f(x). Notice the constant term that can never equal zero.',
        socraticAnswer: '∂(x + f(x))/∂x = 1 + f\'(x). The constant 1 ensures error signals always have a direct path back.',
      },
    },
  },

  // ── 3. Attention & Transformer Anatomy ──
  attention: {
    symbolKey: 'attention',
    displayLabel: 'Attention(Q, K, V)',
    isMath: true,
    category: 'transformer',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Scaled Dot-Product Attention',
        question: 'What is the Attention mechanism in Transformers?',
        explanation:
          'Attention is a mechanism that computes a dynamic weighted sum of Value vectors (V) based on the pairwise compatibility between Query vectors (Q) and Key vectors (K): Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'How information is routed between tokens',
        question: 'What roles do Queries, Keys, and Values play in routing meaning?',
        explanation:
          'Query (Q) represents what the current token is seeking (e.g., "I am a verb looking for my subject"). Key (K) describes what each candidate token represents. Value (V) is the actual semantic payload retrieved and blended into the token representation when Q and K match.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Why separate Value from Key?',
        question: 'Why does the Transformer project tokens into separate Key and Value matrices instead of using the same vector for both?',
        explanation:
          'Separating K and V decouples "how to find a token" from "what information to extract". A token may need to be addressed by grammatical category (Key), but transmit substantive semantic content (Value).',
        socraticPrompt: 'Consider database search: is the index key (e.g. employee ID) identical to the payload record (salary, address)?',
        socraticAnswer: 'Decoupling addressing from payload: Keys match queries, while Values provide the transformed content.',
      },
    },
  },

  softmax: {
    symbolKey: 'softmax',
    displayLabel: 'softmax(·) Normalization',
    isMath: true,
    category: 'transformer',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Normalized Exponential Function',
        question: 'What is the softmax function?',
        explanation:
          'Softmax converts an arbitrary real-valued vector of logits z into a categorical probability distribution: softmax(z)ᵢ = exp(zᵢ) / ∑ exp(zⱼ). All outputs are strictly in the range (0, 1) and sum exactly to 1.0.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Why exponentiate logits?',
        question: 'Why does softmax exponentiate scores instead of just dividing raw numbers by their sum?',
        explanation:
          'Exponentiation ensures all values become strictly positive (even for negative logits) and exponentially accentuates differences, rewarding the highest logit while suppressing smaller competitors into clean probability weights.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Temperature modulation',
        question: 'What happens to the softmax output when all input logits are divided by temperature T as T approaches 0 vs infinity?',
        explanation:
          'As T → 0, softmax collapses to an argmax (one-hot selection of the top token). As T → ∞, all exponentiated values converge to 1, producing a completely uniform random distribution across the entire vocabulary.',
        socraticPrompt: 'Consider exp(z / T). As T shrinks to 0.0001, what happens to the gap between the largest logit and others?',
        socraticAnswer: 'At T→0, distribution becomes a sharp one-hot argmax. At T→∞, distribution becomes flat and uniform.',
      },
    },
  },

  scaled_dot_product: {
    symbolKey: 'scaled_dot_product',
    displayLabel: '1 / √dₖ Scaling Factor',
    isMath: true,
    category: 'transformer',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Attention Variance Normalizer',
        question: 'What is the √d_k term in scaled dot-product attention?',
        explanation:
          'd_k is the dimension of the key vectors (typically 64 or 128). Dividing dot products by √d_k scales down their variance before passing them to the softmax function.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Preventing softmax gradient saturation',
        question: 'Why do attention dot products blow up without √d_k scaling?',
        explanation:
          'For two independent vectors with zero mean and unit variance, their dot product has mean 0 and variance d_k (standard deviation √d_k). For d_k = 64, dot products reach ±30. Softmax saturated at e³⁰ has near-zero derivatives, causing gradients to vanish and stalling training.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Active recall inquiry',
        question: 'If you trained a Transformer without the 1/√d_k factor on d_k = 128, what symptom would you see in training loss curves?',
        explanation:
          'Loss would plateau or diverge early on because softmax saturates into hard 1-hot selections immediately, causing gradients flowing back to Q and K projection matrices to vanish to zero.',
        socraticPrompt: 'Recall the derivative of softmax: Sᵢ(δᵢⱼ - Sⱼ). What happens to the derivative when Sᵢ = 0.9999?',
        socraticAnswer: 'Vanishing gradients and early loss plateau due to extreme softmax saturation.',
      },
    },
  },

  causal_mask: {
    symbolKey: 'causal_mask',
    displayLabel: 'Causal Mask (Autoregressive)',
    isMath: false,
    category: 'transformer',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Autoregressive Attention Mask',
        question: 'What is a causal attention mask?',
        explanation:
          'A causal mask is an upper-triangular matrix of -∞ values added to the pre-softmax attention scores, preventing token at position i from attending to any future token at position j > i.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Enforcing the autoregressive property',
        question: 'How does the causal mask prevent language models from "cheating" during training?',
        explanation:
          'Because exp(-∞) = 0, the softmax weights for all future token positions evaluate to exactly 0.0. This enforces the autoregressive factorization P(w₁...w_T) = ∏ P(w_t | w_{<t}), ensuring the model cannot look ahead at the label it is trying to predict.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Failure mode inquiry',
        question: 'What would happen during inference generation if a model was accidentally pretrained without a causal mask (like BERT)?',
        explanation:
          'Without the mask, the model would learn to depend on future bidirectional context during training. During autoregressive inference (where future tokens do not yet exist), it fails catastrophically because its expected future cues are missing.',
        socraticPrompt: 'Inference generates one token at a time. Are future tokens available at step t?',
        socraticAnswer: 'Catastrophic failure: the model was trained relying on future context that is absent at generation time.',
      },
    },
  },

  multi_head: {
    symbolKey: 'multi_head',
    displayLabel: 'Multi-Head Attention',
    isMath: true,
    category: 'transformer',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Parallel Attention Subspaces',
        question: 'What is Multi-Head Attention?',
        explanation:
          'Multi-Head Attention linearly projects Queries, Keys, and Values h times into lower-dimensional subspaces of size d_k = d_model / h, runs attention in parallel across all h heads, and concatenates the outputs.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Attending to multiple relationships',
        question: 'Why are multiple attention heads superior to a single large attention head?',
        explanation:
          'A single attention head can only produce one attention distribution per token. Multi-head attention allows the model to simultaneously attend to information at different positions from different representation subspaces (e.g. Head 1 tracks syntax, Head 2 tracks pronoun reference, Head 3 tracks factual association).',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Compute invariance',
        question: 'If d_model = 512 and you use h = 8 heads with d_k = 64, how does the computational cost compare to a single head with d_k = 512?',
        explanation:
          'The total FLOPs are virtually identical! Computing 8 heads of dimension 64 requires 8 × (N × 64 × N) = 512N² operations, exactly the same as one head of dimension 512 (N × 512 × N). Multi-head attention provides greater representational expressiveness at zero extra compute cost.',
        socraticPrompt: 'Multiply: 8 heads × 64 dimensions = ?',
        socraticAnswer: 'Identical computational complexity (O(N² · d_model)), but vastly higher representational capacity.',
      },
    },
  },

  residual: {
    symbolKey: 'residual',
    displayLabel: 'Residual Connection (x + f(x))',
    isMath: true,
    category: 'transformer',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Skip / Shortcut Connection',
        question: 'What is a residual (skip) connection?',
        explanation:
          'A residual connection adds the original input of a block directly to its processed output: x_{out} = x_{in} + SubLayer(x_{in}).',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Gradient superhighway',
        question: 'Why are residual connections mandatory in modern deep transformers?',
        explanation:
          'Differentiating x + f(x) yields ∂(x + f(x))/∂x = I + f\'(x). The identity matrix I guarantees that error gradients can flow backward through 100+ layers without being repeatedly multiplied down by small layer weights, eliminating vanishing gradients.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Ensemble interpretation',
        question: 'How do residual connections make a 32-layer transformer behave like an exponential ensemble of shallower networks?',
        explanation:
          'With skip connections at every layer, information can traverse any combination of skipped or included layers (2³² possible paths through the network), making the model remarkably robust to perturbation in individual blocks.',
        socraticPrompt: 'Think of binary choices: at each layer, signal either takes the residual path or the transformed path.',
        socraticAnswer: 'Creates 2^L parallel paths through the network, allowing shallow and deep sub-networks to collaborate.',
      },
    },
  },

  layer_norm: {
    symbolKey: 'layer_norm',
    displayLabel: 'Layer Normalization (LayerNorm)',
    isMath: true,
    category: 'transformer',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Channel-Wise Normalization',
        question: 'What is Layer Normalization (LayerNorm)?',
        explanation:
          'LayerNorm normalizes activation values across the hidden features dimension for each token independently: LN(x) = ((x - μ) / √(σ² + ε)) ⊙ γ + β, where μ and σ are the mean and standard deviation across channels.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Stabilizing forward and backward passes',
        question: 'Why is LayerNorm used instead of BatchNorm in language models?',
        explanation:
          'Batch Normalization computes statistics across the batch dimension, which fluctuates erratically with variable sequence lengths and fails during single-token autoregressive generation. LayerNorm normalizes solely across the hidden dimension of each token independently, making it invariant to batch size.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Pre-LN vs Post-LN',
        question: 'Why do modern LLMs (like Llama and GPT-3) use Pre-LN (LayerNorm before attention) instead of Post-LN (original 2017 Transformer)?',
        explanation:
          'Post-LN normalizes the residual stream after addition, which shrinks the gradient flowing through the residual highway, requiring careful learning rate warmup. Pre-LN keeps the residual stream unnormalized and clean, allowing stable training of deep networks without warmups.',
        socraticPrompt: 'In Pre-LN, does the residual highway x = x + SubLayer(LN(x)) ever get normalized directly?',
        socraticAnswer: 'Pre-LN leaves the main residual stream unconstrained, allowing pure gradient passthrough.',
      },
    },
  },

  // ── 4. Tokenization & Linguistics ──
  token: {
    symbolKey: 'token',
    displayLabel: 'Tokens & Subwords',
    isMath: false,
    category: 'nlp',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Atomic Language Unit',
        question: 'What is a token in language models?',
        explanation:
          'A token is the atomic unit of text consumed and generated by a language model. Tokens can be single characters, subwords, or full words, each mapped to a unique integer ID in the model vocabulary.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Why subwords over words or characters',
        question: 'Why do LLMs use subword tokens instead of pure characters or whole words?',
        explanation:
          'Character tokenization creates excessively long sequences (diluting attention and increasing quadratic compute). Whole-word tokenization creates an infinite vocabulary that cannot handle typos, morphology, or new words. Subword tokenization balances compact sequence length with open-vocabulary flexibility.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Multilingual token efficiency',
        question: 'Why did GPT-2 take 39 tokens for "Сәлем, әлем! 123 + 456" while GPT-4o takes only 15 tokens?',
        explanation:
          'GPT-2 used a 50k vocabulary with limited non-Latin coverage, shattering Cyrillic/Kazakh letters into individual raw byte tokens. GPT-4o uses a 200k vocabulary (o200k_base) that compresses entire Kazakh words into single tokens, reducing API latency and cost by over 60%.',
        socraticPrompt: 'Remember: quadratic attention O(N²) depends on sequence length N. What happens when N is reduced by 60%?',
        socraticAnswer: 'Massive compute and cost savings: shorter token sequences mean faster inference and fairer multilingual pricing.',
      },
    },
  },

  bpe: {
    symbolKey: 'bpe',
    displayLabel: 'Byte-Pair Encoding (BPE)',
    isMath: false,
    category: 'nlp',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Subword Tokenization Algorithm',
        question: 'What is Byte-Pair Encoding (BPE)?',
        explanation:
          'Byte-Pair Encoding (Sennrich et al., 2016) is a data-driven subword tokenization algorithm that iteratively merges the most frequent adjacent character or byte pairs in a training corpus into new composite tokens.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'How merge tables are constructed',
        question: 'How does BPE train its vocabulary?',
        explanation:
          'BPE starts with base character/byte tokens. It counts all adjacent pairs across the entire text corpus, selects the most frequent pair (e.g. "t" + "h" → "th"), adds it to the vocabulary, and replaces all occurrences. It repeats this merge process until reaching the target vocabulary size (e.g. 50k or 100k).',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Out-of-vocabulary handling',
        question: 'How does byte-level BPE guarantee that an LLM will never encounter an "Out of Vocabulary" (OOV) error?',
        explanation:
          'Because the base alphabet includes all 256 possible bytes (0x00 to 0xFF), any arbitrary unicode character, emoji, or corrupted text can always be decomposed back into its raw byte sequence as a fallback.',
        socraticPrompt: 'What is the base floor of byte-level tokenization?',
        socraticAnswer: 'The 256 fundamental UTF-8 byte values guarantee 100% coverage with zero OOV tokens.',
      },
    },
  },

  // ── 5. N-grams & Statistical Foundations ──
  ngram: {
    symbolKey: 'ngram',
    displayLabel: 'N-gram Language Model',
    isMath: true,
    category: 'nlp',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Markov Sequence Predictor',
        question: 'What is an N-gram language model?',
        explanation:
          'An n-gram model predicts the probability of the next word using a fixed window of the preceding n-1 words: P(w_t | w_{t-n+1}...w_{t-1}) = Count(w_{t-n+1}...w_t) / Count(w_{t-n+1}...w_{t-1}). Unigrams (n=1), bigrams (n=2), and trigrams (n=3) are common examples.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Counting vs. Deep Learning',
        question: 'How do n-gram models learn from text corpora?',
        explanation:
          'N-gram models do not have weights or gradient descent. They simply construct a multidimensional frequency table counting occurrences of prefix-continuation tuples. Transition probabilities are calculated by normalizing each row of counts to sum to 1.0.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'The curse of dimensionality',
        question: 'What happens to the transition count matrix when scaling an n-gram model from trigrams (n=3) to 10-grams (n=10)?',
        explanation:
          'Sparsity explodes exponentially: a 10-gram model requires a table of size V¹⁰. Almost all 10-word combinations have count 0 in any finite corpus, leaving the model unable to generalize to phrases it hasn’t seen verbatim.',
        socraticPrompt: 'Consider V = 50,000. What is 50,000^10?',
        socraticAnswer: 'Extreme sparsity: combinatorial explosion V^n makes tables impossible to store and leaves 99.999% of transitions unobserved.',
      },
    },
  },

  // ── 6. Embeddings & Representation ──
  embedding: {
    symbolKey: 'embedding',
    displayLabel: 'Word & Token Embeddings',
    isMath: true,
    category: 'linear_algebra',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Dense Vector Representation',
        question: 'What is an embedding vector?',
        explanation:
          'An embedding is a continuous, low-dimensional vector (e.g. 768 or 4096 dimensions) that represents a discrete token in geometric space, where spatial proximity and geometric direction encode semantic and syntactic relationships.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Embedding lookup matrix',
        question: 'How is an embedding looked up in PyTorch code?',
        explanation:
          'An nn.Embedding layer is a weight matrix W_E of shape (vocab_size, hidden_dim). Looking up token ID 42 simply slices row 42 of W_E: W_E[42, :]. It is computationally identical to multiplying a 1-hot vector by W_E, but runs in O(1) without matrix multiplication.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Vector arithmetic in semantic space',
        question: 'Why does vector arithmetic work in embedding spaces (e.g., vector("King") - vector("Man") + vector("Woman") ≈ vector("Queen"))?',
        explanation:
          'Linear projection layers learn to align parallel semantic shifts along specific directional axes in hyperspace. The vector difference ("King" - "Man") isolates the concept of "Royalty", which when added to "Woman" points directly to "Queen".',
        socraticPrompt: 'Think of direction: what concept is isolated when subtracting "Man" from "King"?',
        socraticAnswer: 'Linear semantic regularities: directional shifts represent conceptual relationships like gender, tense, or royalty.',
      },
    },
  },

  pca: {
    symbolKey: 'pca',
    displayLabel: 'PCA (Principal Component Analysis)',
    isMath: true,
    category: 'linear_algebra',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Dimensionality Reduction Technique',
        question: 'What is Principal Component Analysis (PCA)?',
        explanation:
          'PCA is an orthogonal linear dimensionality reduction algorithm that projects high-dimensional data onto a lower-dimensional subspace (e.g. 50D → 2D) along the directions of maximum variance (principal components).',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'How 50D vectors flatten into 2D maps',
        question: 'How does PCA compute 2D coordinates from 50-dimensional word vectors?',
        explanation:
          'PCA computes the covariance matrix of all word embeddings and finds its eigenvectors and eigenvalues. The top 2 eigenvectors with the largest eigenvalues form the 2D basis axes that capture the largest spread of semantic variation across the dataset.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Emergence of semantic clusters',
        question: 'Why do words like animals (cat, dog, lion) cluster together on the 2D PCA map even though the model was never told what an "animal" is?',
        explanation:
          'Words that share similar linguistic contexts and co-occurrence statistics receive similar embedding vectors during training. Projecting into 2D preserves these distances, causing semantically related words to naturally clump into distinct islands.',
        socraticPrompt: 'Distributional Hypothesis: "You shall know a word by the company it keeps" (Firth, 1957).',
        socraticAnswer: 'Contextual similarity: words appearing in similar linguistic contexts receive close geometric coordinates.',
      },
    },
  },

  // ── 7. Training, Loss & Optimization ──
  loss: {
    symbolKey: 'loss',
    displayLabel: 'Cross-Entropy Loss (ℒ)',
    isMath: true,
    category: 'training',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Next-Token Negative Log-Likelihood',
        question: 'What is cross-entropy loss in next-token prediction?',
        explanation:
          'Cross-entropy loss measures the performance of a classification model outputting probability distributions: ℒ = -log(P(y_true)), penalizing low probabilities assigned to the true next token.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Log loss and clean gradients',
        question: 'Why is negative log loss used instead of Mean Squared Error (MSE) for language models?',
        explanation:
          'Log loss heavily penalizes confident wrong predictions (if P(target) = 0.001, loss = 6.9; if P = 0.99, loss ≈ 0.01). Furthermore, taking the derivative of cross-entropy combined with softmax produces a clean linear gradient: ∂ℒ/∂zᵢ = pᵢ - yᵢ.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Expected initial loss calculation',
        question: 'If a language model has a vocabulary of 50,000 tokens and makes uniform random guesses at initialization, what is its exact expected loss?',
        explanation:
          'For uniform random guessing, P = 1 / 50,000 for every token. The cross-entropy loss is -ln(1 / 50,000) = ln(50,000) ≈ 10.82. Watching loss decrease from ~10.8 toward ~2.0 is how engineers verify training.',
        socraticPrompt: 'Calculate ln(50,000).',
        socraticAnswer: 'ln(50,000) ≈ 10.82. Any well-initialized LLM starts with loss near ln(vocab_size).',
      },
    },
  },

  gradient: {
    symbolKey: 'gradient',
    displayLabel: '∂ℒ / ∂h (Loss Gradient)',
    isMath: true,
    category: 'calculus',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Multivariate Chain Rule Gradient',
        question: 'What does the gradient ∂ℒ / ∂h represent?',
        explanation:
          '∂ℒ / ∂h is the partial derivative vector of the scalar loss ℒ with respect to the hidden state vector h, quantifying how a nudge in each dimension of h alters prediction error.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Backward gradient flow',
        question: 'How does ∂ℒ/∂h propagate backward through linear projection layers?',
        explanation:
          'By the multivariate chain rule: ∂ℒ/∂h = (∂ℒ/∂logits) · (∂logits/∂h). Because logits = h · W₂, the derivative ∂logits/∂h is W₂. Transposing to W₂ᵀ distributes the error gradient back into the dimension of h.',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Zero gradient implications',
        question: 'If ∂ℒ/∂h evaluates to zero for a token position, what happens during weight update?',
        explanation:
          'Under gradient descent (W_new = W_old - η · ∇W), zero gradient means zero parameter change. The model weights receive no update from that token position.',
        socraticPrompt: 'Recall W = W - lr * grad. If grad = 0, what is ΔW?',
        socraticAnswer: 'Zero parameter update occurs for paths flowing through that node.',
      },
    },
  },

  temperature: {
    symbolKey: 'temperature',
    displayLabel: 'Temperature (Sampling Parameter)',
    isMath: true,
    category: 'nlp',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: 'Logit Scaling Hyperparameter',
        question: 'What is sampling temperature?',
        explanation:
          'Temperature (T) is a positive hyperparameter that scales raw logits before applying softmax: Pᵢ = exp(zᵢ / T) / ∑ exp(zⱼ / T), controlling the entropy and randomness of generation.',
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: 'Modulating distribution sharpness',
        question: 'How does adjusting temperature from 0.2 to 1.5 alter model behavior?',
        explanation:
          'When T < 1 (e.g. 0.2), logit differences are magnified, causing the softmax distribution to peak sharply around the top candidate (deterministic, focused output). When T > 1 (e.g. 1.5), differences are compressed, flattening the distribution and giving lower-probability words a higher chance of selection (creative, diverse output).',
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Extreme limits inquiry',
        question: 'What mathematical distribution does an LLM sample from when temperature T approaches 0 vs when T approaches infinity?',
        explanation:
          'As T → 0, the probability of the highest logit approaches 1.0 (pure argmax greedy search). As T → ∞, all logits approach zᵢ / ∞ = 0, making e⁰ = 1 for all tokens, yielding a completely flat uniform distribution.',
        socraticPrompt: 'Evaluate lim T→0 (exp(z / T)) versus lim T→∞ (exp(z / T)).',
        socraticAnswer: 'At T→0: deterministic greedy argmax. At T→∞: uniform random guessing across all tokens.',
      },
    },
  },
}

// ── Smart Dynamic Semantic Engine for Arbitrary Text ────────────────────────
function buildDynamicSocraticAnalysis(
  rawText: string,
  contextSentence: string
): SocraticDiagnostic {
  const clean = rawText.trim()
  const lower = clean.toLowerCase()

  // 1. Check if it is a Cyrillic Kazakh name or phrase from Chapter 1 dataset
  const isCyrillic = /[а-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ]/.test(clean)
  if (isCyrillic) {
    return {
      symbolKey: 'cyrillic_token_' + lower,
      displayLabel: `"${clean}" (Training Token)`,
      isMath: false,
      category: 'nlp',
      tiers: {
        1: {
          tier: 1,
          title: 'Definitional',
          subtitle: 'Dataset Sample Token',
          question: `What is "${clean}" in this language model?`,
          explanation: `"${clean}" is a Kazakh sequence from the Chapter 1 training dataset. In character-level n-gram models, words like "${clean}" are broken down into prefix-suffix character transitions (e.g. bigrams or trigrams) so the model can learn empirical conditional probability distributions.`,
        },
        2: {
          tier: 2,
          title: 'Mechanistic',
          subtitle: 'Conditional probability tracking',
          question: `How does the model learn to generate "${clean}"?`,
          explanation: `During training, the sliding context window scans "${clean}" character by character. For each prefix (e.g. "${clean.slice(0, 3)}"), it increments the transition count for the next character ("${clean.slice(3, 4) || '⟨EOS⟩'}"). When sampling with the Generate button, the model reproduces these learned statistical patterns.`,
        },
        3: {
          tier: 3,
          title: 'Socratic Probe',
          subtitle: 'Sparsity & generalization inquiry',
          question: `What happens if a student asks the n-gram model to generate a character sequence that never appeared in "${clean}" or any other name in the dataset?`,
          explanation: `A pure n-gram model assigns an empirical count of 0, making that transition impossible (0% probability) unless smoothing (like Laplace smoothing) is applied. This illustrates the fundamental limitation of count-based models compared to neural embeddings.`,
          socraticPrompt: 'Consider count tables: if count(prefix, next_char) == 0, what is P(next_char | prefix)?',
          socraticAnswer: 'Zero probability! The model cannot generate or tolerate unseen combinations without smoothing.',
        },
      },
    }
  }

  // 2. Check if it is code / Python identifier
  const isCode =
    /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(clean) &&
    (clean.includes('_') || /^[A-Z]/.test(clean) || ['def', 'return', 'import', 'self', 'torch', 'tensor'].includes(lower))

  if (isCode) {
    return {
      symbolKey: 'code_' + lower,
      displayLabel: `\`${clean}\` (Code Construct)`,
      isMath: false,
      category: 'code',
      tiers: {
        1: {
          tier: 1,
          title: 'Definitional',
          subtitle: 'Code Identifier / Variable',
          question: `What is \`${clean}\` in this implementation?`,
          explanation: `\`${clean}\` represents an executable variable, module, or method in the model pipeline. In deep learning architectures, identifiers like \`${clean}\` handle tensor operations, parameter definitions, or training loop state.`,
        },
        2: {
          tier: 2,
          title: 'Mechanistic',
          subtitle: 'Execution mechanics',
          question: `How does \`${clean}\` operate in the forward or backward pass?`,
          explanation: `During execution, \`${clean}\` coordinates tensor data flow—ensuring input shapes, parameter dimensions, and autograd gradient histories remain mathematically consistent across layers.`,
        },
        3: {
          tier: 3,
          title: 'Socratic Probe',
          subtitle: 'PyTorch autograd inquiry',
          question: `If \`${clean}\` undergoes an in-place mutation (e.g. tensor modification in-place), how could that disrupt PyTorch backward autograd?`,
          explanation: `In-place tensor modifications can overwrite values needed by autograd to compute backward gradients, leading to RuntimeError during .backward(). Variables should be transformed through pure operations.`,
          socraticPrompt: 'Recall PyTorch autograd: what happens when intermediate activations needed for the backward pass are modified in-place?',
          socraticAnswer: 'Autograd error: in-place modification destroys values required for chain rule gradient computation.',
        },
      },
    }
  }

  // 3. Robust domain-informed breakdown for general concepts
  const displaySnippet = clean.length > 30 ? clean.slice(0, 28) + '...' : clean

  return {
    symbolKey: 'concept_' + lower.replace(/[^a-z0-9]/g, '_').slice(0, 16),
    displayLabel: displaySnippet,
    isMath: /[\^_{}\\\/+=*∂ℒλθ]/.test(clean),
    category: 'general',
    tiers: {
      1: {
        tier: 1,
        title: 'Definitional',
        subtitle: `Definition of "${displaySnippet}"`,
        question: `What is "${displaySnippet}" in language model architecture?`,
        explanation: `In language model systems, "${displaySnippet}" represents a core component that governs how sequences are tokenized, represented as geometric vectors, or processed through neural attention layers.`,
      },
      2: {
        tier: 2,
        title: 'Mechanistic',
        subtitle: `Operational mechanism`,
        question: `Why does the model rely on "${displaySnippet}"?`,
        explanation: `This component establishes the transformation rules between input text and probability distributions. Without it, the network would either lose context across sequence steps or fail to optimize its loss landscape.`,
      },
      3: {
        tier: 3,
        title: 'Socratic Probe',
        subtitle: 'Systemic inquiry',
        question: `What architectural compromise or failure mode arises if "${displaySnippet}" is misconfigured or omitted?`,
        explanation: `Reflect on the trade-offs: altering this parameter directly shifts the balance between training compute efficiency, memory overhead (such as KV-cache or attention matrices), and downstream generation quality.`,
        socraticPrompt: 'Consider the trade-offs: latency, parameter count, and loss convergence.',
        socraticAnswer: 'Directly impacts representation capacity, sequence length limits, or optimization stability.',
      },
    },
  }
}

// ── Matcher Function ─────────────────────────────────────────────────────────
export function diagnoseSelection(
  rawText: string,
  contextSentence: string = ''
): SocraticDiagnostic {
  const clean = rawText.trim().toLowerCase()

  // 1. Exact or Substring Matching against Curated Knowledge Graph
  if (
    clean === 'w^t' ||
    clean === 'w_2^t' ||
    clean === 'k^t' ||
    clean === 'qk^t' ||
    clean.includes('transpose') ||
    clean === 't' ||
    clean === 'wᵀ' ||
    clean === 'kᵀ' ||
    clean === 'qkᵀ'
  ) {
    return CURATED_KNOWLEDGE_GRAPH.transpose
  }

  if (
    clean === 'gru' ||
    clean === 'grus' ||
    clean.includes('gated recurrent')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.gru
  }

  if (
    clean === 'lstm' ||
    clean === 'lstms' ||
    clean.includes('long short-term')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.lstm
  }

  if (
    clean === 'rnn' ||
    clean === 'rnns' ||
    clean.includes('recurrent neural network') ||
    clean.includes('recurrent')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.rnn
  }

  if (
    clean.includes('vanishing') ||
    clean.includes('exploding gradient')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.vanishing_gradient
  }

  if (
    clean.includes('attention') ||
    clean.includes('query') ||
    clean.includes('key') ||
    clean.includes('value') ||
    clean === 'q' ||
    clean === 'k' ||
    clean === 'v'
  ) {
    return CURATED_KNOWLEDGE_GRAPH.attention
  }

  if (
    clean.includes('multi-head') ||
    clean.includes('multihead')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.multi_head
  }

  if (
    clean.includes('mask') ||
    clean.includes('causal') ||
    clean.includes('autoregressive')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.causal_mask
  }

  if (
    clean.includes('softmax') ||
    clean.includes('exp(') ||
    clean.includes('logits')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.softmax
  }

  if (
    clean.includes('√d') ||
    clean.includes('sqrt') ||
    clean.includes('scale') ||
    clean.includes('d_k')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.scaled_dot_product
  }

  if (
    clean.includes('residual') ||
    clean.includes('skip connection')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.residual
  }

  if (
    clean.includes('layernorm') ||
    clean.includes('layer norm') ||
    clean.includes('normalization')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.layer_norm
  }

  if (
    clean.includes('bpe') ||
    clean.includes('byte-pair') ||
    clean.includes('byte pair')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.bpe
  }

  if (
    clean.includes('token') ||
    clean.includes('vocab') ||
    clean.includes('subword')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.token
  }

  if (
    clean.includes('ngram') ||
    clean.includes('n-gram') ||
    clean.includes('bigram') ||
    clean.includes('trigram')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.ngram
  }

  if (
    clean.includes('embed') ||
    clean.includes('vector') ||
    clean.includes('dimension')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.embedding
  }

  if (
    clean.includes('pca') ||
    clean.includes('principal component')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.pca
  }

  if (
    clean.includes('loss') ||
    clean.includes('cross-entropy') ||
    clean.includes('ℒ') ||
    clean.includes('perplexity')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.loss
  }

  if (
    clean.includes('gradient') ||
    clean.includes('∂') ||
    clean.includes('\\partial') ||
    clean.includes('derivative')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.gradient
  }

  if (
    clean.includes('temperature') ||
    clean === 'temp'
  ) {
    return CURATED_KNOWLEDGE_GRAPH.temperature
  }

  if (
    clean.includes('dot product') ||
    clean.includes('inner product')
  ) {
    return CURATED_KNOWLEDGE_GRAPH.dot_product
  }

  // 2. Use domain-specific dynamic deconstructor
  return buildDynamicSocraticAnalysis(rawText, contextSentence)
}
