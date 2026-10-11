import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { knowledgeApi, TopicNode, GraphEdge, KnowledgeGraphData } from './api'

export const DEFAULT_NODES: TopicNode[] = [
  {
    id: 'llm_core',
    title: 'LLMs & Modern AI Hub',
    category: 'core',
    description: 'The central nexus connecting mathematical foundations, attention mechanics, large-scale training, and agentic reasoning.',
    prerequisites: ['transformer_arch'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.15,
    x: 0,
    y: 0,
    chapter_link: 1,
    content_page: 'Large Language Models (LLMs) synthesize deep multi-head attention transformers, scalable self-supervised pre-training, and reinforcement alignment into probabilistic reasoning engines.',
    questions: [
      {
        id: 'llm_q1',
        bloom_level: 'remember',
        question: 'What primary objective function do modern autoregressive LLMs optimize during pre-training?',
        options: [
          'Next-token prediction using cross-entropy loss',
          'Pixel contrastive similarity',
          'Static embedding clustering',
          'Supervised class label matching'
        ],
        correct_index: 0,
        explanation: 'Autoregressive LLMs are trained on causal language modeling to predict the conditional probability of the next token given preceding context.',
        socratic_hint: 'Recall the fundamental training objective of GPT-style models over causal text corpora.'
      },
      {
        id: 'llm_q2',
        bloom_level: 'understand',
        question: 'Why is the transition from raw base models to instruction-tuned models crucial for real-world usability?',
        options: [
          'Base models only predict text continuations without adhering to conversational intent',
          'Base models have no vocabulary embeddings',
          'Base models can only process numerical data',
          'Instruction tuning reduces parameter count by 90%'
        ],
        correct_index: 0,
        explanation: 'Base models naturally complete prompts (e.g., generating more quiz questions instead of answering one). Instruction tuning aligns the model to act as a responsive assistant.',
        socratic_hint: 'Think about what happens if you ask a pure completion model: "What is the capital of Kazakhstan?" Does it answer or continue listing similar questions?'
      },
      {
        id: 'llm_q3',
        bloom_level: 'apply',
        question: 'If an LLM exhibits high perplexity on a downstream domain test set, what is the most appropriate next step?',
        options: [
          'Perform domain-adaptive continual pre-training or fine-tuning on domain data',
          'Decrease the temperature to 0.0 immediately',
          'Delete the tokenizer vocab list',
          'Increase the batch size during inference'
        ],
        correct_index: 0,
        explanation: 'High perplexity indicates the test distribution diverges significantly from training data; domain-specific pre-training or fine-tuning shifts model weights to adapt.',
        socratic_hint: 'Consider how model uncertainty (cross-entropy perplexity) relates to data distribution shift.'
      }
    ]
  },
  {
    id: 'math_foundations',
    title: 'Linear Algebra & Vectors',
    category: 'theory',
    description: 'Matrix transformations, dot products, vector spaces, and projection operations that underpin neural representations.',
    prerequisites: [],
    status: 'unlocked',
    mastery_score: 0,
    brightness: 0.65,
    x: -280,
    y: -160,
    chapter_link: 3,
    content_page: 'Vectors encode semantic coordinates in multi-dimensional space. The inner product (dot product) quantifies directional alignment and cosine similarity between representations.',
    questions: [
      {
        id: 'math_q1',
        bloom_level: 'remember',
        question: 'What does the dot product of two normalized unit vectors represent?',
        options: [
          'Cosine of the angle between them',
          'Euclidean distance squared',
          'Matrix determinant',
          'Orthogonal null space'
        ],
        correct_index: 0,
        explanation: 'For unit vectors u and v, u · v = ||u|| ||v|| cos(theta) = cos(theta), measuring directional alignment.',
        socratic_hint: 'Think of the geometric definition of the dot product when magnitudes equal 1.'
      },
      {
        id: 'math_q2',
        bloom_level: 'understand',
        question: 'How does multiplying a token vector by a weight matrix W physically alter its position in vector space?',
        options: [
          'Applies a linear transformation consisting of rotation, scaling, and shear',
          'Randomizes all dimensional components uniformly',
          'Discards all semantic relationships',
          'Forces all values to be strictly non-negative'
        ],
        correct_index: 0,
        explanation: 'Matrix multiplication performs linear transformation, mapping coordinates from one dimensional basis into another.',
        socratic_hint: 'Recall linear transformations from geometry: how do basis vectors transform under matrix multiplication?'
      },
      {
        id: 'math_q3',
        bloom_level: 'apply',
        question: 'Given query vector q and key vector k with dimension d_k = 64, why is their dot product scaled by 1/sqrt(d_k)?',
        options: [
          'To prevent large dot product magnitudes from pushing softmax into vanishing gradient regions',
          'To convert the result into discrete integer tokens',
          'To ensure the vector has zero mean and unit variance',
          'To reduce floating-point memory bandwidth'
        ],
        correct_index: 0,
        explanation: 'As dimension d_k grows, dot product variance grows proportionally to d_k; scaling by 1/sqrt(d_k) stabilizes the variance around 1, keeping softmax gradients healthy.',
        socratic_hint: 'What happens to the derivative of softmax when logits are extremely large?'
      }
    ]
  },
  {
    id: 'gradient_descent',
    title: 'Gradient Descent & Loss',
    category: 'theory',
    description: 'Loss surfaces, convex vs non-convex optimization, stochastic gradient descent (SGD), and adaptive optimizers (AdamW).',
    prerequisites: ['math_foundations'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: -420,
    y: -270,
    chapter_link: 6,
    content_page: 'Gradient descent minimizes empirical loss by iteratively shifting parameter weights opposite to the gradient vector: theta = theta - eta * grad(L).',
    questions: [
      {
        id: 'gd_q1',
        bloom_level: 'remember',
        question: 'In standard gradient descent, in which direction are parameters updated relative to the gradient?',
        options: [
          'Opposite to the gradient vector (steepest descent)',
          'Parallel to the gradient vector (steepest ascent)',
          'Orthogonal to the gradient vector',
          'Along the tangent of the parameter norm'
        ],
        correct_index: 0,
        explanation: 'The gradient points in the direction of steepest rate of increase; we step in the negative gradient direction to minimize loss.',
        socratic_hint: 'To climb down a valley, do you walk towards where elevation climbs fastest or in the opposite direction?'
      },
      {
        id: 'gd_q2',
        bloom_level: 'understand',
        question: 'Why is AdamW preferred over standard SGD for training deep transformers?',
        options: [
          'AdamW maintains per-parameter adaptive learning rates and decoupled weight decay',
          'AdamW requires zero hyperparameter tuning',
          'AdamW guarantees reaching the global minimum of non-convex landscapes',
          'AdamW computes second-order Hessian inverses exactly'
        ],
        correct_index: 0,
        explanation: 'AdamW combines first and second moment estimations with correctly decoupled L2 weight decay, ensuring stable convergence in sparse and deep architectures.',
        socratic_hint: 'Consider why different attention weights and embeddings require distinct effective step sizes.'
      },
      {
        id: 'gd_q3',
        bloom_level: 'apply',
        question: 'If training loss suddenly oscillates wildly and turns to NaN during backprop, what adjustment is most immediate?',
        options: [
          'Implement gradient clipping and reduce the learning rate',
          'Double the learning rate to skip the anomaly',
          'Remove all layer normalization modules',
          'Increase batch size to infinity'
        ],
        correct_index: 0,
        explanation: 'Exploding gradients produce numerical overflow; gradient clipping truncates norm spikes, and reducing learning rate restores stable updates.',
        socratic_hint: 'What prevents gradient norms from exploding into floating-point overflow?'
      }
    ]
  },
  {
    id: 'backpropagation',
    title: 'Backpropagation & Chain Rule',
    category: 'theory',
    description: 'Reverse-mode automatic differentiation through computational graphs, applying the multivariable chain rule.',
    prerequisites: ['gradient_descent'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: -530,
    y: -140,
    chapter_link: 6,
    content_page: 'Backpropagation systematically propagates output loss gradients backward through intermediate activations using the chain rule: dL/dx = (dL/dy) * (dy/dx).',
    questions: [
      {
        id: 'bp_q1',
        bloom_level: 'remember',
        question: 'What mathematical principle enables backpropagation to compute partial derivatives layer by layer?',
        options: [
          'The multivariable chain rule of calculus',
          'Fourier frequency decomposition',
          'Taylor series remainder theorem',
          'Bayes theorem of conditional probability'
        ],
        correct_index: 0,
        explanation: 'Backpropagation is reverse-mode automatic differentiation built directly upon the chain rule of differentiation.',
        socratic_hint: 'How do you differentiate a composition of functions f(g(h(x)))?'
      },
      {
        id: 'bp_q2',
        bloom_level: 'understand',
        question: 'Why is reverse-mode differentiation dramatically faster than forward-mode for neural networks?',
        options: [
          'Neural networks have millions of parameters (inputs) but a single scalar loss (output)',
          'Forward mode requires imaginary numbers',
          'Reverse mode bypasses matrix operations entirely',
          'Forward mode cannot handle non-linear activation functions'
        ],
        correct_index: 0,
        explanation: 'When a function has many inputs and one scalar output, reverse mode computes all input gradients in a single backward pass.',
        socratic_hint: 'Compare the dimension of model weights (billions) with the dimension of scalar training loss (single float).'
      },
      {
        id: 'bp_q3',
        bloom_level: 'apply',
        question: 'In a linear layer y = W*x + b with loss gradient dL/dy, what is the exact gradient with respect to weight matrix W?',
        options: [
          '(dL/dy) * x^T',
          'W^T * (dL/dy)',
          '(dL/dy) + x',
          'x * (dL/dy)^T'
        ],
        correct_index: 0,
        explanation: 'By matrix calculus, dL/dW = (dL/dy) * x^T, matching outer product dimensionality between error signals and incoming activations.',
        socratic_hint: 'Check the dimensions: if dL/dy is (out_dim, 1) and x is (in_dim, 1), how do you form (out_dim, in_dim)?'
      }
    ]
  },
  {
    id: 'mlp',
    title: 'Multi-Layer Perceptrons (MLP)',
    category: 'theory',
    description: 'Feed-forward layers, non-linear activation functions (ReLU, GELU, SwiGLU), and universal function approximation.',
    prerequisites: ['backpropagation'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: -370,
    y: 10,
    chapter_link: 4,
    content_page: 'MLP blocks in modern transformers expand hidden dimensions (typically 4x) with non-linear gating functions like SwiGLU before projecting back to embedding space.',
    questions: [
      {
        id: 'mlp_q1',
        bloom_level: 'remember',
        question: 'Why are non-linear activation functions strictly required between linear layers?',
        options: [
          'Without non-linearities, multiple linear layers collapse mathematically into a single linear transformation',
          'Non-linearities are only needed to prevent negative numbers',
          'To speed up GPU memory bus transfers',
          'To reduce the number of parameters by half'
        ],
        correct_index: 0,
        explanation: 'The composition of linear functions W2(W1 x) is equivalent to (W2 W1) x = W_eff x, providing no expressivity over a single matrix.',
        socratic_hint: 'What is the result of multiplying two matrices together? Is it still a matrix?'
      },
      {
        id: 'mlp_q2',
        bloom_level: 'understand',
        question: 'What advantage does GELU or SwiGLU have over classical step activations in deep language models?',
        options: [
          'Smooth, non-monotonic gradients allow continuous propagation without dead zones',
          'They eliminate the need for matrix multiplications',
          'They force all neurons to fire simultaneously',
          'They guarantee 100% sparsity in activations'
        ],
        correct_index: 0,
        explanation: 'Smooth activations prevent the "dead neuron" problem of hard thresholds, maintaining informative gradients across the full distribution.',
        socratic_hint: 'Think about what derivative value a flat step function produces everywhere.'
      },
      {
        id: 'mlp_q3',
        bloom_level: 'apply',
        question: 'In a modern transformer block, if embedding dimension is d_model = 4096, what is the standard intermediate dimension of the MLP?',
        options: [
          '11008 to 16384 (roughly 2.7x to 4x expansion)',
          '512 (compression to save memory)',
          '4096 (must strictly remain equal)',
          '64 (extreme bottleneck compression)'
        ],
        correct_index: 0,
        explanation: 'Standard architectures expand dimension by 4x (or ~8/3 with SwiGLU) to provide ample high-dimensional space for factual association storage.',
        socratic_hint: 'Recall the ratio between d_model and d_ff in LLaMA or standard GPT configurations.'
      }
    ]
  },
  {
    id: 'nlp_rnn',
    title: 'NLP & Recurrent Networks',
    category: 'architecture',
    description: 'Sequential processing, hidden states, LSTM/GRU gating, and vanishing gradient bottlenecks over long sequences.',
    prerequisites: ['math_foundations'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: -170,
    y: -300,
    chapter_link: 1,
    content_page: 'Recurrent neural networks process sequential tokens step-by-step, carrying an evolving hidden vector h_t = tanh(W_h h_{t-1} + W_x x_t).',
    questions: [
      {
        id: 'rnn_q1',
        bloom_level: 'remember',
        question: 'What is the primary computational bottleneck that prevented RNNs from scaling to massive sequence lengths?',
        options: [
          'Sequential O(T) recurrence prevents parallel processing across tokens during training',
          'Inability to compute cross-entropy loss',
          'Lack of support for floating point operations',
          'Excessive parameter size compared to transformers'
        ],
        correct_index: 0,
        explanation: 'Because token t depends strictly on hidden state t-1, RNNs cannot parallelize computation along the time dimension across GPU tensor cores.',
        socratic_hint: 'Can you compute the 1000th step of an RNN without computing steps 1 through 999 first?'
      },
      {
        id: 'rnn_q2',
        bloom_level: 'understand',
        question: 'How do LSTM memory cells mitigate vanishing gradients compared to vanilla RNNs?',
        options: [
          'Linear cell state conveyor belt regulated by additive forget and input gates',
          'By discarding previous time steps completely',
          'Using fixed non-trainable random matrices',
          'By replacing recurrent steps with convolutional kernels'
        ],
        correct_index: 0,
        explanation: 'The LSTM cell state updates additively (c_t = f_t * c_{t-1} + i_t * c~_t), allowing error gradients to flow across steps without exponential decay.',
        socratic_hint: 'Contrast repeated matrix multiplications (A^T) with an additive skip connection.'
      },
      {
        id: 'rnn_q3',
        bloom_level: 'apply',
        question: 'When translating a 50-word sentence with a sequence-to-sequence RNN, what failure mode commonly occurs near the end of the sentence?',
        options: [
          'Information from early tokens degrades due to vector compression in the fixed-size bottleneck',
          'Vocabulary size decreases automatically',
          'The model outputs only numbers',
          'Batch normalization crashes'
        ],
        correct_index: 0,
        explanation: 'Compressing an arbitrarily long sequence into a single fixed-size hidden vector causes catastrophic forgetting of early context.',
        socratic_hint: 'Can a single vector of 512 numbers preserve every semantic detail of an entire book page?'
      }
    ]
  },
  {
    id: 'attention_mechanism',
    title: 'Self-Attention Mechanism',
    category: 'architecture',
    description: 'Scaled dot-product attention, Queries, Keys, Values, Multi-Head Attention, and pairwise relevance routing.',
    prerequisites: ['nlp_rnn', 'math_foundations'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: -30,
    y: -360,
    chapter_link: 4,
    content_page: 'Attention allows every token to query all other tokens in O(1) sequential paths: Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V.',
    questions: [
      {
        id: 'att_q1',
        bloom_level: 'remember',
        question: 'What is the standard formula for Scaled Dot-Product Attention?',
        options: [
          'softmax(Q K^T / sqrt(d_k)) * V',
          'sigmoid(Q * K) + V',
          'relu(Q + K^T) * V',
          'norm(Q) * norm(K) / V'
        ],
        correct_index: 0,
        explanation: 'Attention computes similarity scores between Queries and Keys, normalizes them via softmax, and computes a weighted sum over Values.',
        socratic_hint: 'Remember: Queries match Keys to route Values.'
      },
      {
        id: 'att_q2',
        bloom_level: 'understand',
        question: 'Why does Multi-Head Attention divide the model dimension into multiple subspace heads?',
        options: [
          'Allows the model to jointly attend to information from different representation subspaces and positions',
          'Multiplies total training FLOPs by 100x',
          'Ensures all tokens receive identical attention weights',
          'Eliminates the need for linear projections'
        ],
        correct_index: 0,
        explanation: 'Multiple heads allow tokens to track syntactic agreement, coreference resolution, and semantic associations simultaneously.',
        socratic_hint: 'Can a single set of attention weights track both grammatical subject-verb agreement and distant pronoun resolution?'
      },
      {
        id: 'att_q3',
        bloom_level: 'apply',
        question: 'For a sequence of length N, what is the computational and memory complexity of standard full self-attention?',
        options: [
          'O(N^2) quadratic with sequence length',
          'O(N) strictly linear',
          'O(log N) logarithmic',
          'O(1) constant'
        ],
        correct_index: 0,
        explanation: 'Computing pairwise dot products between all N queries and N keys forms an N x N attention matrix, yielding O(N^2) complexity.',
        socratic_hint: 'How many cells are in a matrix whose rows and columns both have length N?'
      }
    ]
  },
  {
    id: 'transformer_arch',
    title: 'Transformer Architecture',
    category: 'architecture',
    description: 'Residual connections, Pre-LayerNorm / RMSNorm, Rotary Positional Embeddings (RoPE), and deep decoder stacks.',
    prerequisites: ['attention_mechanism', 'mlp'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: 140,
    y: -280,
    chapter_link: 4,
    content_page: 'Modern decoder-only transformers stack identical blocks comprising RMSNorm, Multi-Head Attention with RoPE, residual add, and SwiGLU MLPs.',
    questions: [
      {
        id: 'tr_q1',
        bloom_level: 'remember',
        question: 'What is the purpose of residual skip connections (x + SubLayer(x)) in deep transformer layers?',
        options: [
          'Provide clean gradient highways that prevent vanishing gradients through dozens of stacked layers',
          'Reduce the vocabulary size by half',
          'Eliminate the need for floating point precision',
          'Convert decoders into encoders'
        ],
        correct_index: 0,
        explanation: 'Skip connections allow identities to pass unaltered, enabling gradients to backpropagate directly to initial layers.',
        socratic_hint: 'What prevents a 70-layer deep network from losing signal as activations propagate forward?'
      },
      {
        id: 'tr_q2',
        bloom_level: 'understand',
        question: 'How does Rotary Position Embedding (RoPE) inject positional awareness into attention computation?',
        options: [
          'Rotates query and key vectors in 2D coordinate planes such that their dot product depends strictly on relative token distance',
          'Adds static integer indexes directly to token IDs',
          'Sorts input sentences alphabetically before embedding',
          'Applies random noise masks to token embeddings'
        ],
        correct_index: 0,
        explanation: 'RoPE applies complex planar rotations, encoding relative token displacement (m - n) directly into the inner product <R_m q, R_n k>.',
        socratic_hint: 'Recall Euler\'s formula and rotation matrices: how does rotating two vectors by angles m and n affect their angle difference?'
      },
      {
        id: 'tr_q3',
        bloom_level: 'apply',
        question: 'Why do modern LLMs adopt Pre-LN or RMSNorm instead of the original Post-LN architecture?',
        options: [
          'Pre-LN stabilizes gradient variance at initialization, removing the need for fragile warmup schedules',
          'Pre-LN doubles the context window automatically',
          'Post-LN is not supported on NVIDIA GPUs',
          'RMSNorm requires calculating mean activations'
        ],
        correct_index: 0,
        explanation: 'Pre-LN keeps the residual path unnormalized, preventing gradient blowup in early training steps and enabling massive scale.',
        socratic_hint: 'Where is the normalization layer placed relative to the residual addition in stable modern LLMs?'
      }
    ]
  },
  {
    id: 'pretraining',
    title: 'Self-Supervised Pre-training',
    category: 'training',
    description: 'Massive web corpora curation, deduplication, Chinchilla scaling laws, compute budgets, and distributed data parallelism.',
    prerequisites: ['llm_core'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: 270,
    y: -150,
    chapter_link: 5,
    content_page: 'Pre-training consumes trillions of tokens to build foundational world models. Chinchilla scaling laws dictate balanced parameter and token scaling.',
    questions: [
      {
        id: 'pre_q1',
        bloom_level: 'remember',
        question: 'According to Chinchilla scaling laws, how should training tokens scale relative to model parameters under compute-optimal training?',
        options: [
          'Model parameters and training token count should scale equally in roughly a 1:1 proportion',
          'Parameters should scale 100x faster than tokens',
          'Token count should remain fixed at 10 billion tokens',
          'Parameters should be frozen while only context window scales'
        ],
        correct_index: 0,
        explanation: 'Hoffmann et al. (Chinchilla) demonstrated that for optimal compute allocation, parameter count and dataset size should be scaled in equal proportion.',
        socratic_hint: 'Did Chinchilla argue that models like Gopher were under-trained on tokens or over-trained?'
      },
      {
        id: 'pre_q2',
        bloom_level: 'understand',
        question: 'Why is rigorous data deduplication and synthetic quality filtering critical before pre-training?',
        options: [
          'Reduces memorization of boilerplate text and prevents catastrophic gradient updates from web scrape artifacts',
          'Ensures all training documents have exactly the same length',
          'Eliminates the requirement for a vocabulary tokenizer',
          'Makes GPU memory usage zero'
        ],
        correct_index: 0,
        explanation: 'Repeated web artifacts lead to verbatim memorization and degrade reasoning capabilities; clean data maximizes sample efficiency.',
        socratic_hint: 'What happens when an LLM sees identical SEO spam millions of times during training?'
      },
      {
        id: 'pre_q3',
        bloom_level: 'apply',
        question: 'When training an 8B model on 3 trillion tokens, what distributed parallelism strategy is most appropriate for a cluster of 64 H100 GPUs?',
        options: [
          'Fully Sharded Data Parallel (FSDP / ZeRO-3) combined with FlashAttention',
          'Single-device serial execution with CPU offloading',
          'Replicating the entire model on every GPU without sharding weights or optimizer states',
          'Training each layer on a separate computer over public internet'
        ],
        correct_index: 0,
        explanation: 'FSDP shards model weights, gradients, and optimizer states across ranks, fitting large models comfortably across high-speed interconnect clusters.',
        socratic_hint: 'Consider ZeRO memory sharding: how do you distribute optimizer states and gradients across multiple GPUs?'
      }
    ]
  },
  {
    id: 'sft_lora',
    title: 'SFT & Parameter-Efficient LoRA',
    category: 'training',
    description: 'Instruction fine-tuning, Low-Rank Adaptation (LoRA: W = W_0 + B*A), quantized QLoRA, and task steering.',
    prerequisites: ['pretraining'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: 380,
    y: -40,
    chapter_link: 8,
    content_page: 'LoRA freezes base weights W_0 and trains low-rank decomposition matrices B (d x r) and A (r x k) where rank r << d, slashing VRAM footprint by 80%.',
    questions: [
      {
        id: 'lora_q1',
        bloom_level: 'remember',
        question: 'What is the core mathematical formulation of LoRA weight adaptation during inference?',
        options: [
          'W = W_0 + (alpha / r) * (B * A)',
          'W = W_0 * B + A',
          'W = (W_0 + B) / A',
          'W = softmax(B * A)'
        ],
        correct_index: 0,
        explanation: 'LoRA decomposes the weight update delta W = B * A into rank-r matrices, scaled by alpha/r and added to frozen weights W_0.',
        socratic_hint: 'Recall how rank-r decomposition expresses a large matrix as the product of two slim matrices.'
      },
      {
        id: 'lora_q2',
        bloom_level: 'understand',
        question: 'Why does LoRA add zero latency to inference once weights are finalized for deployment?',
        options: [
          'The low-rank delta matrices can be algebraically merged into W_0: W_merged = W_0 + delta W',
          'LoRA bypasses the neural network during inference',
          'LoRA converts floating points to 1-bit booleans',
          'LoRA removes all hidden layers from the network'
        ],
        correct_index: 0,
        explanation: 'Because matrix addition is associative, delta W can be pre-added directly to base weights W_0 before serving.',
        socratic_hint: 'What happens when you add B*A into W_0 once at model load time?'
      },
      {
        id: 'lora_q3',
        bloom_level: 'apply',
        question: 'If fine-tuning a 70B parameter model on a single 80GB GPU, what configuration makes this physically possible?',
        options: [
          'QLoRA: 4-bit NormalFloat base model quantization + 16-bit LoRA adapter matrices',
          'Standard full parameter fp32 AdamW training',
          'Increasing the learning rate by 1000x',
          'Disabling backward passes completely'
        ],
        correct_index: 0,
        explanation: 'QLoRA stores frozen base weights in 4-bit NF4 format, requiring only ~35GB VRAM, while gradients are computed only for lightweight LoRA adapters.',
        socratic_hint: 'How do you reduce the 140GB fp16 footprint of 70 billion parameters down to under 40GB?'
      }
    ]
  },
  {
    id: 'rlhf_alignment',
    title: 'RLHF & DPO Alignment',
    category: 'training',
    description: 'Preference optimization, reward modeling, PPO vs Direct Preference Optimization (DPO), and helpfulness/safety Pareto frontiers.',
    prerequisites: ['sft_lora'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: 420,
    y: 90,
    chapter_link: 7,
    content_page: 'DPO simplifies alignment by expressing preference probabilities directly through policy model log-ratios, bypassing unstable external reward models.',
    questions: [
      {
        id: 'rlhf_q1',
        bloom_level: 'remember',
        question: 'What key component of traditional RLHF does Direct Preference Optimization (DPO) mathematically eliminate?',
        options: [
          'Training a separate reward model and running online PPO reinforcement loops',
          'The tokenizer',
          'Pairwise preference comparison datasets',
          'The reference policy model'
        ],
        correct_index: 0,
        explanation: 'DPO analytically reparametrizes the reward function using the policy itself, optimizing directly with a binary cross-entropy loss on preferred vs dispreferred completions.',
        socratic_hint: 'Why is DPO hailed as simpler than PPO? What complex actor-critic infrastructure does it remove?'
      },
      {
        id: 'rlhf_q2',
        bloom_level: 'understand',
        question: 'Why is a KL-divergence penalty incorporated into RLHF and DPO objectives?',
        options: [
          'To prevent the policy model from drifting too far from the reference model and degenerating into reward hacking',
          'To force the model to output identical responses for every prompt',
          'To speed up matrix multiplication',
          'To make the model deterministic at runtime'
        ],
        correct_index: 0,
        explanation: 'Without the KL penalty, optimization exploits imperfections in the reward model, producing repetitive or nonsensical high-scoring gibberish.',
        socratic_hint: 'What happens when an optimizer exploits an imperfect scoring proxy without constraints?'
      },
      {
        id: 'rlhf_q3',
        bloom_level: 'apply',
        question: 'A model fine-tuned with aggressive safety alignment begins refusing benign medical biology inquiries. How is this alignment failure diagnosed?',
        options: [
          'Alignment over-generalization (exaggerated safety / false-positive refusal)',
          'Catastrophic gradient explosion',
          'Quantization bit-shift failure',
          'Token vocabulary corruption'
        ],
        correct_index: 0,
        explanation: 'Over-conservative preference datasets cause safety refusal patterns to trigger on benign contextual keywords without semantic nuance.',
        socratic_hint: 'Think about why overly strict filters refuse harmless academic questions like "How does a virus replicate?"'
      }
    ]
  },
  {
    id: 'rag_systems',
    title: 'Retrieval-Augmented Generation',
    category: 'systems',
    description: 'Chunking strategies, dense vector embeddings, HNSW semantic search, hybrid re-ranking, and grounded generation.',
    prerequisites: ['llm_core'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: 280,
    y: 200,
    chapter_link: 2,
    content_page: 'RAG injects external factual evidence directly into the LLM context window at runtime, solving hallucination and knowledge cutoff limitations.',
    questions: [
      {
        id: 'rag_q1',
        bloom_level: 'remember',
        question: 'What is the primary advantage of RAG over fine-tuning for dynamic enterprise knowledge bases?',
        options: [
          'Immediate factual updates without retraining and transparent verifiable source citation',
          'Zero inference cost',
          'Permanently alters model weights',
          'Removes the context window limit'
        ],
        correct_index: 0,
        explanation: 'RAG updates knowledge instantly by changing the database index and allows ground-truth citation by pointing to retrieved chunks.',
        socratic_hint: 'If company policy changes today, do you want to spend days retraining weights or update an indexed document?'
      },
      {
        id: 'rag_q2',
        bloom_level: 'understand',
        question: 'Why does hybrid search (combining dense vector embeddings with sparse BM25) outperform pure semantic search?',
        options: [
          'BM25 captures exact keyword matches (part numbers, IDs) while embeddings capture conceptual semantics',
          'BM25 translates text into English automatically',
          'Dense vectors cannot handle sentences longer than 5 words',
          'Hybrid search cuts memory usage by 90%'
        ],
        correct_index: 0,
        explanation: 'Pure vector search often misses rare exact tokens or identifiers, whereas BM25 excels at keyword precision, creating a complementary pair.',
        socratic_hint: 'How well does a dense embedding model distinguish between error code "ERR-4091" and "ERR-4092"?'
      },
      {
        id: 'rag_q3',
        bloom_level: 'apply',
        question: 'When retrieved chunks contain contradictory facts, what technique best prevents the LLM from synthesizing inaccurate information?',
        options: [
          'Cross-encoder re-ranking with source date weighting and explicit provenance prompting',
          'Disabling temperature controls',
          'Passing 100 raw unranked chunks into prompt',
          'Dropping all punctuation from the query'
        ],
        correct_index: 0,
        explanation: 'Cross-encoders evaluate deep context-query interactions to prioritize highest-authority chunks, and prompt instructions enforce source adjudication.',
        socratic_hint: 'How do human researchers adjudicate between outdated draft reports and verified final reports?'
      }
    ]
  },
  {
    id: 'tool_calling',
    title: 'Tool Calling & Function Execution',
    category: 'systems',
    description: 'JSON schema validation, API execution sandboxes, error self-correction, and tool-augmented reasoning loops.',
    prerequisites: ['rag_systems'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: 120,
    y: 300,
    content_page: 'Tool calling bridges pure text prediction and deterministic action. The model produces structured arguments conforming to strict schemas.',
    questions: [
      {
        id: 'tool_q1',
        bloom_level: 'remember',
        question: 'In function calling, what does the LLM emit when it decides to call an external API?',
        options: [
          'A structured JSON payload specifying tool name and validated parameter arguments',
          'Compiled x86 assembly binary',
          'Direct HTTP socket connections from the GPU core',
          'An image screenshot of the target website'
        ],
        correct_index: 0,
        explanation: 'The model outputs text conforming to a JSON schema describing the requested function invocation; the client environment executes the call.',
        socratic_hint: 'Does the neural network physically execute code, or does it output structured specifications for the environment to run?'
      },
      {
        id: 'tool_q2',
        bloom_level: 'understand',
        question: 'What happens in a tool calling loop if an external API returns a 400 Bad Request error?',
        options: [
          'The error response is passed back into conversation history as an observation, allowing the model to repair its arguments',
          'The model permanently stops generating any text',
          'The model reverts back to pre-training',
          'The GPU halts execution and reboots'
        ],
        correct_index: 0,
        explanation: 'In ReAct-style agentic loops, errors are environmental feedback tokens that prompt the model to diagnose invalid parameters and retry.',
        socratic_hint: 'Think of an interactive terminal: what does a developer do when a command outputs an error flag?'
      },
      {
        id: 'tool_q3',
        bloom_level: 'apply',
        question: 'To protect a production database from an agent armed with SQL query execution tools, what architecture is essential?',
        options: [
          'Read-only scoped connection credentials, parametrized query validation, and human-in-the-loop approval for write operations',
          'Giving the agent root database admin access',
          'Removing all database passwords',
          'Running queries without transaction timeouts'
        ],
        correct_index: 0,
        explanation: 'Defensive agent architecture enforces least-privilege scoping, read-only permissions, and confirmation gates for state-altering transactions.',
        socratic_hint: 'Apply the principle of least privilege: what is the safest scope of database credentials to hand an autonomous system?'
      }
    ]
  },
  {
    id: 'autonomous_agents',
    title: 'Autonomous Multi-Agent Harness',
    category: 'systems',
    description: 'Hierarchical planning, ReAct loops, state reflection, multi-agent collaboration, and execution environment isolation.',
    prerequisites: ['tool_calling'],
    status: 'locked',
    mastery_score: 0,
    brightness: 0.12,
    x: -80,
    y: 280,
    content_page: 'Autonomous agent harness systems coordinate multi-turn task execution, stateful memory reflection, subagent delegation, and goal verification.',
    questions: [
      {
        id: 'agent_q1',
        bloom_level: 'remember',
        question: 'What does the ReAct framework interleave during multi-step problem solving?',
        options: [
          'Reasoning traces ("Thoughts") and task-specific Actions ("Action + Observation")',
          'Recurrent layers and Activation functions',
          'Reinforcement learning and Autoencoders',
          'Random sampling and Activation decay'
        ],
        correct_index: 0,
        explanation: 'ReAct stands for Reason + Act, alternating explicit chain-of-thought plans with concrete tool actions and sensory observations.',
        socratic_hint: 'Break down the acronym Re-Act: Reasoning and Action.'
      },
      {
        id: 'agent_q2',
        bloom_level: 'understand',
        question: 'Why is hierarchical agent decomposition (Planner -> Worker Subagents) superior for complex programming tasks?',
        options: [
          'Keeps individual subagent context windows focused while the manager tracks overarching milestones',
          'Eliminates all token costs',
          'Ensures no code needs unit testing',
          'Guarantees 100% bug-free compilation on first attempt'
        ],
        correct_index: 0,
        explanation: 'Hierarchical delegation prevents context window clutter and hallucination by scoping each subagent to a single discrete objective.',
        socratic_hint: 'How do large engineering teams organize work: does one person do everything, or are specific tasks delegated?'
      },
      {
        id: 'agent_q3',
        bloom_level: 'apply',
        question: 'An autonomous coding agent is stuck in an infinite debugging loop modifying the same file repeatedly. What harness mechanism fixes this?',
        options: [
          'Loop detection with trajectory reflection and step budget constraints',
          'Increasing the context window to infinite tokens',
          'Clearing the file contents to an empty string',
          'Restarting without saving error messages'
        ],
        correct_index: 0,
        explanation: 'Modern agent harnesses monitor action entropy and repetition, interrupting cyclic loops with automated reflection interventions.',
        socratic_hint: 'What circuit breaker pattern detects when an agent repeats the same failing action multiple times?'
      }
    ]
  }
]

export const DEFAULT_EDGES: GraphEdge[] = [
  { source: 'math_foundations', target: 'gradient_descent', label: 'requires' },
  { source: 'gradient_descent', target: 'backpropagation', label: 'requires' },
  { source: 'backpropagation', target: 'mlp', label: 'requires' },
  { source: 'math_foundations', target: 'nlp_rnn', label: 'requires' },
  { source: 'nlp_rnn', target: 'attention_mechanism', label: 'requires' },
  { source: 'attention_mechanism', target: 'transformer_arch', label: 'requires' },
  { source: 'mlp', target: 'transformer_arch', label: 'requires' },
  { source: 'transformer_arch', target: 'llm_core', label: 'connects' },
  { source: 'llm_core', target: 'pretraining', label: 'requires' },
  { source: 'pretraining', target: 'sft_lora', label: 'requires' },
  { source: 'sft_lora', target: 'rlhf_alignment', label: 'requires' },
  { source: 'llm_core', target: 'rag_systems', label: 'requires' },
  { source: 'rag_systems', target: 'tool_calling', label: 'requires' },
  { source: 'tool_calling', target: 'autonomous_agents', label: 'requires' },
  { source: 'autonomous_agents', target: 'llm_core', label: 'enhances' }
]

function recalculateCascade(nodes: TopicNode[]): { updatedNodes: TopicNode[]; newlyUnlocked: string[] } {
  const statusMap = new Map<string, string>()
  nodes.forEach((n) => statusMap.set(n.id, n.status))

  const newlyUnlocked: string[] = []
  let changed = true

  while (changed) {
    changed = false
    for (const node of nodes) {
      const current = statusMap.get(node.id) || 'locked'
      if (current === 'locked' && node.prerequisites.length > 0) {
        // Unlocks when all prerequisites are mastered
        const allMastered = node.prerequisites.every((p) => statusMap.get(p) === 'mastered')
        if (allMastered) {
          statusMap.set(node.id, 'unlocked')
          newlyUnlocked.push(node.id)
          changed = true
        }
      }
    }
  }

  const updatedNodes = nodes.map((node) => {
    const status = (statusMap.get(node.id) as TopicNode['status']) || node.status
    let brightness = node.brightness

    if (status === 'mastered') {
      brightness = Math.min(1.0, Math.max(0.85, 0.75 + (node.mastery_score / 100) * 0.25))
    } else if (status === 'needs_review') {
      brightness = Math.min(0.55, Math.max(0.35, 0.25 + (node.mastery_score / 100) * 0.25))
    } else if (status === 'unlocked') {
      brightness = 0.65
    } else {
      brightness = 0.12
    }

    return {
      ...node,
      status,
      brightness,
    }
  })

  return { updatedNodes, newlyUnlocked }
}

interface KnowledgeGraphState {
  nodes: TopicNode[]
  edges: GraphEdge[]
  selectedTopicId: string | null
  isLoading: boolean
  isQuizOpen: boolean
  activeQuizTopic: TopicNode | null
  lastUnlockedNodes: string[]

  fetchGraph: () => Promise<void>
  selectTopic: (id: string | null) => void
  openQuiz: (topic: TopicNode) => void
  closeQuiz: () => void
  recordQuizScore: (topicId: string, score: number) => Promise<{ success: boolean; newlyUnlocked: string[] }>
  resetGraph: () => void
}

export const useKnowledgeGraphStore = create<KnowledgeGraphState>()(
  persist(
    (set, get) => ({
      nodes: DEFAULT_NODES,
      edges: DEFAULT_EDGES,
      selectedTopicId: 'math_foundations',
      isLoading: false,
      isQuizOpen: false,
      activeQuizTopic: null,
      lastUnlockedNodes: [],

      fetchGraph: async () => {
        set({ isLoading: true })
        try {
          const res = await knowledgeApi.getGraph()
          if (res?.data?.nodes && res.data.nodes.length > 0) {
            set({
              nodes: res.data.nodes,
              edges: res.data.edges || DEFAULT_EDGES,
              isLoading: false,
            })
            return
          }
        } catch {
          // Graceful fallback: maintain local persistent state
        }
        set({ isLoading: false })
      },

      selectTopic: (id) => set({ selectedTopicId: id }),

      openQuiz: (topic) => set({ isQuizOpen: true, activeQuizTopic: topic }),

      closeQuiz: () => set({ isQuizOpen: false, activeQuizTopic: null }),

      recordQuizScore: async (topicId, score) => {
        // 1. Try server sync first
        try {
          const res = await knowledgeApi.recordQuizResult(topicId, score)
          if (res?.data?.graph?.nodes) {
            const unlocked = res.data.unlocked_nodes || []
            set({
              nodes: res.data.graph.nodes,
              edges: res.data.graph.edges || get().edges,
              lastUnlockedNodes: unlocked,
            })
            return { success: true, newlyUnlocked: unlocked }
          }
        } catch {
          // Server offline, execute local progression engine
        }

        // 2. Local fallback calculation
        const currentNodes = get().nodes
        const updated = currentNodes.map((n) => {
          if (n.id === topicId) {
            const status: TopicNode['status'] = score >= 70 ? 'mastered' : 'needs_review'
            return {
              ...n,
              status,
              mastery_score: score,
            }
          }
          return n
        })

        const { updatedNodes, newlyUnlocked } = recalculateCascade(updated)
        set({
          nodes: updatedNodes,
          lastUnlockedNodes: newlyUnlocked,
        })

        return { success: true, newlyUnlocked }
      },

      resetGraph: () => {
        set({
          nodes: DEFAULT_NODES,
          edges: DEFAULT_EDGES,
          selectedTopicId: 'math_foundations',
          lastUnlockedNodes: [],
        })
      },
    }),
    {
      name: 'qairu-knowledge-graph-v1',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        selectedTopicId: state.selectedTopicId,
      }),
    }
  )
)
