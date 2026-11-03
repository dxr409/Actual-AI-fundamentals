// Chapters 112-114: Language Model Builder — Part III: Workbench

export const ch112 = {
  id: 112,
  sections: [
    {
      title: 'Project Setup & Special Tokens',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Before training begins, we lock in the model shape: tokenizer, context length, width, depth, and attention heads. Once a checkpoint is saved, this architecture cannot be altered.
        </p>
        <p class="mb-4">
          The tokenizer reserves special control tokens that ordinary text can never produce:
        </p>
        <div class="flex flex-wrap gap-2 my-4 font-mono text-xs">
          <span class="px-2.5 py-1 rounded-lg bg-[#202026] text-[#38bdf8] border border-white/10">&lt;|system|&gt;</span>
          <span class="px-2.5 py-1 rounded-lg bg-[#202026] text-[#ff9f0a] border border-white/10">&lt;|user|&gt;</span>
          <span class="px-2.5 py-1 rounded-lg bg-[#202026] text-[#30d158] border border-white/10">&lt;|assistant|&gt;</span>
          <span class="px-2.5 py-1 rounded-lg bg-[#202026] text-[#ff453a] border border-white/10">&lt;|end|&gt;</span>
        </div>
      `,
    },
    {
      title: 'Open-Source Base Models Catalog',
      body: `
        <p class="mb-4">
          Pre-training from scratch on a laptop produces a tiny, humble model. In production, most teams import an open-source base model pre-trained on billions or trillions of tokens:
        </p>
        <ul class="space-y-2 mb-4 text-[#cbd5e1] list-disc list-inside text-xs">
          <li><strong class="text-white">SmolLM2 135M:</strong> Compact, fluent, fast on Apple Silicon / consumer GPUs.</li>
          <li><strong class="text-white">Supra 50M:</strong> Ultra-lightweight for memory-constrained environments.</li>
          <li><strong class="text-white">Qwen2.5 0.5B:</strong> Multilingual support with vast vocabulary coverage.</li>
        </ul>
      `,
    },
  ],
}

export const ch113 = {
  id: 113,
  sections: [
    {
      title: 'The Pre-Training Recipe',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Our pre-training loop uses AdamW with weight decay restricted to 2D matrix weights (attention and MLP projections), while RMSNorm scale and tied embeddings remain un-decayed.
        </p>
        <p class="mb-4">
          <strong>Learning Rate Schedule:</strong> Linear warmup over the first 200 steps to <code class="text-[#38bdf8] font-mono">5e-4</code>, followed by a cosine decay down to <code class="text-[#38bdf8] font-mono">5e-5</code>. Warmup protects wild initial gradients, while decay helps the model settle smoothly into a sharp valley.
        </p>
      `,
    },
    {
      title: 'Inference Sampling: Temperature, Top-p, and Min-p',
      body: `
        <p class="mb-4">
          During text generation, sampling controls how probabilities are filtered before choosing the next token:
        </p>
        <ul class="space-y-2 mb-4 text-[#cbd5e1] list-disc list-inside text-xs">
          <li><strong class="text-white">Temperature (T):</strong> Rescales logits before softmax ($z_i / T$).</li>
          <li><strong class="text-white">Top-k:</strong> Retains only the $k$ likeliest candidate tokens.</li>
          <li><strong class="text-white">Top-p (Nucleus):</strong> Retains the smallest set of tokens whose cumulative probability reaches $p$.</li>
          <li><strong class="text-white">Min-p:</strong> Dynamically discards any token whose probability is below $\\text{min\\_p} \\times p_{\\max}$.</li>
        </ul>
      `,
    },
  ],
}

export const ch114 = {
  id: 114,
  sections: [
    {
      title: 'Supervised Fine-Tuning & Taste Testing',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Fine-tuning loads your pre-trained weights and saves a distinct checkpoint. Testing with <em>Before & After</em> prompts side-by-side demonstrates the shift from mindless text completion to purposeful assistant answers.
        </p>
      `,
    },
    {
      title: 'Chat Transcript & Token X-Ray Inspection',
      body: `
        <p class="mb-4">
          The chat UI looks conversational, but under the hood the model simply reads the entire transcript flattened into one long string and predicts the next token.
        </p>
        <p class="mb-4">
          <strong>Token X-Ray:</strong> Every generated token can be inspected to reveal the probability it received and the competing alternative tokens that survived the sampling filter!
        </p>
        <p class="text-xs text-neutral-400">
          Explore the interactive chat playground below to switch checkpoints (Base, SFT, DPO) and inspect token probabilities!
        </p>
      `,
    },
  ],
}

