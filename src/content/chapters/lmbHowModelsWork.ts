// Chapters 105-111: Language Model Builder — Part II: How Models Work

export const ch105 = {
  id: 105,
  sections: [
    {
      title: 'Anatomy of a Transformer: Pipeline Structure',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          A transformer is an uninterrupted pipeline: vectors enter one end, and probability predictions for the next token come out the other. The pipeline flows through four stages:
        </p>
        <ol class="space-y-3 mb-4 text-[#cbd5e1] list-decimal list-inside text-xs leading-relaxed">
          <li><strong class="text-white">Tokenize & Embed:</strong> Text is sliced into token IDs, each looked up in the embedding matrix.</li>
          <li><strong class="text-white">Run the Stack of N Blocks:</strong> The vectors flow through a stack of N identical transformer blocks, each carrying independently learned weights.</li>
          <li><strong class="text-white">Normalize and Score (Output Head):</strong> A final RMSNorm tidies the numbers, and the output head (tied to the embedding weights) projects vectors back into vocabulary scores (logits).</li>
          <li><strong class="text-white">Softmax into Odds:</strong> Logits are squashed into valid probabilities that sum to 1.</li>
        </ol>
      `,
    },
    {
      title: 'Multi-Head Attention: Queries, Keys, and Values',
      body: `
        <p class="mb-4">
          Inside attention, each token generates three linear projections: a <strong>Query (Q)</strong> ("what this token is looking for"), a <strong>Key (K)</strong> ("what this token offers"), and a <strong>Value (V)</strong> ("the information this token contributes").
        </p>
        <p class="mb-4">
          For every permitted pair of positions, the query of one token multiplies the key of another. We scale down by $\\sqrt{d_k}$, apply the causal mask, and run softmax:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
          $$\\text{Attention}(Q, K, V) = \\operatorname{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}} + M\\right) V$$
        </div>
        <p>
          <strong>Causal Masking ($M$):</strong> The model is only allowed to look backward. Tokens at position 5 cannot peek at position 6, ensuring the future remains hidden during autoregressive training.
        </p>
      `,
    },
  ],
}

export const ch106 = {
  id: 106,
  sections: [
    {
      title: 'Inside One Block: The Thinking Half (SwiGLU MLP)',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          If attention is where tokens talk to each other across the sequence, the <strong>Feed-Forward Network (MLP)</strong> is where each token sits alone and digests what it just heard.
        </p>
        <p class="mb-4">
          Although attention receives the most fame, the MLP contains roughly <strong>two-thirds</strong> of all parameters in a transformer block! Modern models use <strong>SwiGLU</strong>: the vector expands to a hidden width ($h \\approx 8/3 \\times d_{\\text{model}}$), passes through a smooth SiLU gate, and projects back down:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#bf5af2] border border-[rgba(255,255,255,0.08)]">
          $$\\text{SwiGLU}(x) = W_{\\text{down}} \\cdot \\Big(\\operatorname{SiLU}(W_{\\text{gate}} x) \\odot W_{\\text{up}} x\\Big)$$
        </div>
      `,
    },
    {
      title: 'The Residual Highway & RMSNorm',
      body: `
        <p class="mb-4">
          A deep stack of transformer blocks without skip connections is nearly untrainable due to vanishing gradients. Two essential components make deep stacks learn:
        </p>
        <ul class="space-y-3 mb-4 text-[#cbd5e1] list-disc list-inside text-xs leading-relaxed">
          <li><strong class="text-white">Residual Connections:</strong> Instead of replacing a token's vector, the model <em>adds</em> each sublayer's output onto the existing vector (<code class="text-[#38bdf8] font-mono">x = x + Sublayer(x)</code>). This creates an uninterrupted gradient highway from the final loss directly to the input embeddings!</li>
          <li><strong class="text-white">RMSNorm:</strong> Before each sublayer (Pre-Norm), vectors are rescaled by their root-mean-square magnitude, preventing activations from exploding or collapsing toward zero.</li>
        </ul>
      `,
    },
  ],
}

export const ch107 = {
  id: 107,
  sections: [
    {
      title: 'Sizing It Up: The 5 Core Hyperparameters',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Hyperparameters determine the model's architecture before training starts. The five primary ones are:
        </p>
        <ul class="space-y-2 mb-4 text-[#cbd5e1] list-disc list-inside text-xs">
          <li><strong class="text-white">Transformer Blocks (Layers):</strong> Number of stacked blocks (e.g. 8 in TinyStories, 96 in GPT-3).</li>
          <li><strong class="text-white">Embedding Width ($d_{\\text{model}}$):</strong> Vector size for each token (e.g. 256 for toy models, 12,288 for GPT-3).</li>
          <li><strong class="text-white">Attention Heads ($h$):</strong> Number of parallel attention channels splitting the width.</li>
          <li><strong class="text-white">Context Length ($T$):</strong> Number of tokens the model can look back over (attention work scales as $O(T^2)$).</li>
          <li><strong class="text-white">Vocabulary Size ($V$):</strong> Total number of distinct tokens in the tokenizer.</li>
        </ul>
      `,
    },
    {
      title: 'Napkin Parameter Arithmetic',
      body: `
        <p class="mb-4">
          You can estimate parameter counts on a napkin:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
          $$\\text{Total Parameters} \\approx \\underbrace{V \\times d}_{\\text{Embeddings}} + \\underbrace{\\text{Layers} \\times 12 d^2}_{\\text{Transformer Blocks}}$$
        </div>
        <p class="text-xs text-neutral-400">
          In small models, embeddings take up ~30% of parameters, making weight tying (sharing the embedding table with the output head) crucial. In giant models, the $12d^2 \\times \\text{layers}$ block term dominates completely.
        </p>
      `,
    },
  ],
}

export const ch108 = {
  id: 108,
  sections: [
    {
      title: 'Training Data: Quality Over Quantity',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          A language model is what it eats. A modest model trained on clean, well-curated text will sound vastly smarter than a giant model fed raw web garbage.
        </p>
        <p class="mb-4">
          Frontier models ingest trillions of tokens from web crawls (Common Crawl), curated books, Wikipedia, code, and scientific papers.
        </p>
        <p>
          <strong>The Chinchilla Optimal Rule:</strong> Research at DeepMind established that for every parameter in a model, one should train on roughly <strong>20 tokens</strong>. For our default 9M parameter model, this corresponds to approximately 180 million tokens.
        </p>
      `,
    },
    {
      title: 'Data Curation & The Shift-by-One Signal',
      body: `
        <p class="mb-4">
          Raw web text requires aggressive cleaning: stripping HTML navigation, standardizing unicode encodings, and crucially, <strong>deduplication</strong>. Deduplicating passages prevents models from memorizing specific lines verbatim and forces them to learn general language rules.
        </p>
        <p class="mb-4">
          <strong>The Shift-by-One Signal:</strong> When we cut tokenized text into a context window $x = [t_1, t_2, \\dots, t_k]$, the target is simply $y = [t_2, t_3, \\dots, t_{k+1}]$ shifted by one. Every token serves as the ground truth answer for the preceding sequence—yielding millions of free, self-supervised prediction tasks!
        </p>
      `,
    },
  ],
}

export const ch109 = {
  id: 109,
  sections: [
    {
      title: 'How Models Learn: Objective & Weights',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          A trained language model is a long list of numbers and nothing else. We call these numbers <strong>parameters</strong>, or <strong>weights</strong>.
        </p>
        <p class="mb-4">
          Training never rewrites code or algorithms; it only turns dials. The learning process is the automated search for the exact setting of millions of dials that makes the model predict real text instead of babbling.
        </p>
        <p>
          A <strong>checkpoint</strong> is simply a disk snapshot of every model parameter and optimizer state at a specific training step, allowing runs to be paused and resumed seamlessly.
        </p>
      `,
    },
  ],
}

export const ch110 = {
  id: 110,
  sections: [
    {
      title: 'Loss: A Score for Being Wrong',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          To turn knobs in the right direction, we need a single number scoring how wrong the model is right now: the <strong class="text-white font-semibold">loss</strong>.
        </p>
        <p class="mb-4">
          Language models use <strong>Cross-Entropy Loss</strong>—the negative logarithm of the probability assigned to the true next token:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#ff453a] border border-[rgba(255,255,255,0.08)]">
          $$\\mathcal{L} = -\\frac{1}{N} \\sum_{i=1}^N \\log p_\\theta(\\text{true token}_i \\mid \\text{context}_i)$$
        </div>
        <p class="text-xs text-neutral-300">
          <strong>The Cliff Near Zero:</strong> If the model assigns 90% vs 95% to the truth, loss changes very little. But if it assigns 0.001% to the truth, $-\\ln(p)$ explodes violently toward infinity!
        </p>
      `,
    },
    {
      title: 'Gradient Descent & Backpropagation',
      body: `
        <p class="mb-4">
          Tuning millions of knobs by hand is impossible. Through <strong>backpropagation</strong> (calculating partial derivatives backward from the loss via the chain rule), the computer feels which way is uphill for all parameters at once.
        </p>
        <p>
          <strong>Gradient Descent:</strong> The weights step downhill scaled by the learning rate $\\eta$:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#30d158] border border-[rgba(255,255,255,0.08)]">
          $$w \\leftarrow w - \\eta \\frac{\\partial \\mathcal{L}}{\\partial w}$$
        </div>
      `,
    },
  ],
}

export const ch111 = {
  id: 111,
  sections: [
    {
      title: 'How Models Learn Behavior: The Base Model Limitation',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          A pre-trained base model is a gifted mimic with no sense of occasion. If prompted with <code class="text-[#38bdf8] font-mono">Question: Why is the sky blue? Answer:</code>, it might explain scattered light, but it might just as easily generate five more questions or start writing a poem. It learned text continuation, not assistant behavior.
        </p>
      `,
    },
    {
      title: 'Supervised Fine-Tuning (SFT) & Loss Masking',
      body: `
        <p class="mb-4">
          In <strong>Supervised Fine-Tuning (SFT)</strong>, we feed the model paired conversations with role tokens (<code class="text-[#38bdf8] font-mono">&lt;|user|&gt;</code> and <code class="text-[#38bdf8] font-mono">&lt;|assistant|&gt;</code>).
        </p>
        <p class="mb-4">
          Crucially, we use <strong>loss masking</strong>: The user prompt is visible as context, but its loss mask is set to 0. Gradients only flow from the assistant's response tokens!
        </p>
      `,
    },
    {
      title: 'Direct Preference Optimization (DPO)',
      body: `
        <p class="mb-4">
          Much of good writing cannot be specified by rules, but humans easily recognize the better of two answers.
        </p>
        <p class="mb-4">
          <strong>DPO</strong> trains the model on comparisons (chosen $y_w$ vs rejected $y_l$) directly, optimizing against a frozen copy of the reference model without needing a complex reinforcement-learning reward model:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#38bdf8] border border-[rgba(255,255,255,0.08)]">
          $$\\mathcal{L}_{\\text{DPO}} = -\\log \\sigma\\left(\\beta \\left[\\log \\frac{\\pi_\\theta(y_w \\mid x)}{\\pi_{\\text{ref}}(y_w \\mid x)} - \\log \\frac{\\pi_\\theta(y_l \\mid x)}{\\pi_{\\text{ref}}(y_l \\mid x)}\\right]\\right)$$
        </div>
      `,
    },
  ],
}

