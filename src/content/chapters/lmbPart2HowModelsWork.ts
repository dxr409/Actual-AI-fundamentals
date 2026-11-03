// Language Model Builder — Part III · How models work (Unabridged text materials)

export const lmb105 = {
  id: 105,
  sections: [
    {
      title: 'Anatomy of a Transformer: Structure',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          We've done a lot of preparation: text becomes tokens, and tokens become learned vectors shaped by how they appear in text. In this chapter, we meet the machinery that reads those vectors and computes predictions for the next token — the <strong class="text-white font-semibold">transformer</strong>.
        </p>
        <p class="mb-4">
          The transformer has a fearsome reputation. It's the dominant architecture behind modern large language models, one of the inventions that set off the current AI boom, and it tends to get described in language that suggests only a few hundred people on earth truly understand it. Luckily for us learners, the core design fits on a napkin. There are only a few parts, most of them are simple, and the most important one just repeats. We'll spend this chapter walking through the machine one component at a time.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">Structure</h3>
        <p class="mb-4">
          Before we look at any single component, it helps to see the general structure. A transformer is a pipeline: vectors go in one end, a prediction comes out the other. In between, the data flows through a fixed sequence of stages, every time, with no branching in the routing. Here's the whole trip:
        </p>
        <h4 class="text-xs font-bold text-[#f6e9c7] uppercase tracking-wider mt-4 mb-1">Step: Tokenize and embed</h4>
        <p class="mb-4">
          We've already met this piece: text is chopped into tokens, each token becomes an ID, and each ID is looked up in the embedding table. From here on, the model only ever sees a sequence of vectors. (Where a token <em>sits</em> enters the picture inside the blocks, during attention — we'll get there.)
        </p>
        <h4 class="text-xs font-bold text-[#f6e9c7] uppercase tracking-wider mt-4 mb-1">Step: Run the blocks</h4>
        <p class="mb-4">
          The vectors flow through a stack of <strong>N blocks with the same design</strong> <em>(The letter N is math shorthand for an unspecified number. Every model picks its own: a tiny one might stack 4 blocks, GPT-3 stacked 96.)</em>, where most of the work happens. Each block performs the same operations, but carries its own independently learned weights. A <strong>block</strong> is one repeating unit of the machine: a fixed bundle of arithmetic that takes in the sequence of vectors and hands back the same sequence, slightly improved. Along the way, it lets the tokens exchange information with each other, then does a bit of processing on each token alone. A small model stacks a handful of these; the biggest stack a hundred or more.
        </p>
        <h4 class="text-xs font-bold text-[#f6e9c7] uppercase tracking-wider mt-4 mb-1">Step: Normalize and score</h4>
        <p class="mb-4">
          After the last block, one final normalization tidies up the numbers, and then a final projection called the <strong class="text-white font-semibold">output head</strong> gives every token in the vocabulary a score for "how likely are you to come next."
        </p>
        <h4 class="text-xs font-bold text-[#f6e9c7] uppercase tracking-wider mt-4 mb-1">Step: Turn scores into odds</h4>
        <p class="mb-4">
          The scores are squashed into probabilities that add up to one: a full set of odds over the next token. It's exactly the next-token game from the first chapter, played by a much better player.
        </p>
        <p class="mb-4">
          Given the amazing things done and enabled by LLMs, you might expect the core concept to be full of specialized machinery, a grammar module here, a fact store there, something clever for arithmetic. Instead, there's one block design, repeated with a fresh set of learned weights in every block. The leading labs have started to improve the design in advanced ways: some replace its thinking half with a whole panel of them and let a small router pick which specialists handle each token (a trick called "mixture of experts"), and most use leaner variants of attention to save memory. That said, it's still the same core architecture. What separates the leading labs from their competition is usually less found in the blueprint (which tends to become public knowledge quickly anyway) and much more the things around it: the data, the sheer amount of compute, and finesse in post-training.
        </p>
        <p class="mb-4">
          So let's focus on this block I keep talking about: if you understand it, you understand the entire model. Everything else is either the input plumbing or a little arithmetic at the end.
        </p>

        <!-- INTERACTIVE:transformer-pipeline -->
      `,
    },
    {
      title: 'Attention: Multi-Head Attention',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Back in the first chapter, when we talked about the transformer leap, I introduced attention as the trick that gives each token a direct way to gather information from the relevant tokens in its context, using queries, keys, and values. As a reminder, the one-line version: each token asks a question (its <strong class="text-white font-semibold">query</strong>), each token advertises what it has to offer (its <strong class="text-white font-semibold">key</strong>), and where a question and an offer line up, information (the <strong class="text-white font-semibold">value</strong>) flows. It all happens as a handful of big matrix multiplications, which is why training can process all positions in parallel.
        </p>
        <p class="mb-4">
          I left out two details:
        </p>
        <p class="mb-4">
          First, the model is only allowed to look <em>backward</em> but we didn't really discuss why that's the case. When it's working on the token in position five, it may attend to positions one through five and nothing after, because the whole job is to predict what comes next, and at prediction time the future doesn't exist yet. This backward-only rule is called <strong class="text-white font-semibold">causal</strong> attention (the "cause" has to come before the effect), implemented as a mask that simply blanks out every forward-looking connection. It has a positive side effect: because no position can peek ahead, a single pass over a sentence gives the model a prediction exercise at <em>every</em> position at once, so each sentence of training text delivers dozens of lessons in one go. That's a big part of why training on billions of words is even feasible.
        </p>
        <p class="mb-4">
          The second detail is that attention runs as several parallel conversations at once. Each conversation is called an <strong class="text-white font-semibold">attention head</strong>, usually shortened to <strong class="text-white font-semibold">head</strong> when the context is clear. Each head gets its own learned slices of the queries, keys, and values, so each is free to detect different relationships. Researchers have found individual heads whose behavior correlates with patterns such as pronoun references, closing quotation marks, or the previous token, but those roles are not fixed job titles: behavior can vary by context and can be distributed across several heads. After all the heads have done their looking, their results are stitched back together into one vector per token.
        </p>
        <p class="mb-4">
          So that's attention in full: every token gathers information from itself and the tokens before it, through several specialized channels at once. It's the only place in the entire model where tokens interact with each other. Everything else happens to each token privately.
        </p>

        <!-- INTERACTIVE:attention-matrix-explorer -->

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>Each token's vector is projected into a query, a key, and a value. The score between two tokens is the dot product of one's query with the other's key, scaled down by the square root of the key dimension so the numbers stay in a reasonable range, masked so no token can see the future, and softmaxed so each token's incoming weights sum to one:</p>
            <div class="my-4 p-3 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
              $$\\text{Attention}(Q, K, V) = \\operatorname{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}} + M\\right) V$$
            </div>
            <p><code>M</code> is the causal mask: zero where looking is allowed, negative infinity where it isn't, so the softmax drives forbidden weights to exactly zero. In a Python/MLX teaching sketch:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code>q, k, v = mx.split(self.c_attn(x), 3, axis=-1)      # one projection makes Q, K, V
hd = C // self.n_head                                # each head gets an equal slice
q = q.reshape(B, T, self.n_head, hd).transpose(0, 2, 1, 3)
k = k.reshape(B, T, self.n_head, hd).transpose(0, 2, 1, 3)
v = v.reshape(B, T, self.n_head, hd).transpose(0, 2, 1, 3)
q = self.rope(q)                                     # rotate by position (RoPE)
k = self.rope(k)

y = mx.fast.scaled_dot_product_attention(            # softmax(qk/√hd)v, fused,
    q, k, v, scale=1.0 / math.sqrt(hd), mask="causal"  # with the causal mask
)                                                      # built in

y = y.transpose(0, 2, 1, 3).reshape(B, T, C)</code></pre>
            <p>Two modern touches are visible here. The <code>rope</code> lines are <strong>rotary position embeddings</strong> (RoPE): instead of adding a learned position vector to each token back at the embedding stage, every query and key is rotated by an angle that grows with its position, so the query-key dot product depends on the <em>relative distance</em> between two tokens. And the formula above runs as one <strong>fused kernel</strong> — <code>scaled_dot_product_attention</code> computes exactly softmax(QKᵀ/√d + M)V, just without materializing the big score matrix in memory, which is dramatically faster.</p>
          </div>
        </details>
      `,
    },
  ],
}

export const lmb106 = {
  id: 106,
  sections: [
    {
      title: 'Inside One Block: Feed-Forward Networks & Residuals',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Each repeated unit is a <strong class="text-white font-semibold">transformer block</strong>, also commonly called a <strong class="text-white font-semibold">transformer layer</strong>. Attention is only half of one. If attention is where the tokens talk to each other, the other half is where each token sits alone and digests what it just heard. That half is a small, ordinary neural network, applied to every token's vector separately. "Neural network" sounds grand, but the recipe has just two ingredients. A <strong class="text-white font-semibold">linear layer</strong> mixes a vector's entries using a grid of learned numbers, so that every number coming out is a weighted blend of every number going in. That grid is the layer's <strong class="text-white font-semibold">weight matrix</strong>. A <strong class="text-white font-semibold">nonlinearity</strong> (practitioners call it an <strong class="text-white font-semibold">activation function</strong>) is something far smaller: a fixed rule applied to each number between two linear layers, and the common ones amount to little more than "if it's negative, squash it." That rule looks too simple to matter until you notice what happens without it. Without the nonlinearity, stacking linear layers buys you nothing: one weighted blend followed by another is still just a weighted blend, so two linear layers behave like one. The activation function between them prevents that collapse, letting the pair compute things no single linear layer could. So: two linear layers, with a nonlinearity in between.
        </p>

        <!-- INTERACTIVE:activation-function-lab -->

        <p class="mb-4">
          This little network goes by <strong class="text-white font-semibold">MLP</strong> (for multi-layer perceptron, a name from the 1960s) or "feed-forward network," and although attention gets all the press, the MLP is where roughly two thirds of a block's parameters live. It briefly expands each token's vector to several times its width, works on it in that roomier space, and squeezes it back down. A useful (if loose) way to hold the pair in your head: attention moves information <em>between</em> positions, and the MLP transforms information <em>at</em> each position.
        </p>
        <p class="mb-4">
          So a block is attention followed by the MLP. A shallow stack of just those two would train fine, but pile up more than a few and training starts to fall apart — so every block carries two small additions that make deep stacks trainable.
        </p>
        <p class="mb-4">
          The first is the <strong class="text-white font-semibold">residual connection</strong>. Instead of letting each sublayer replace a token's vector with whatever it computed, the model <em>adds</em> the sublayer's output onto the vector it already had. Picture a highway running straight through the whole model, from the embeddings to the output head, with each sublayer as an on-ramp that merges a little adjustment into the traffic rather than a tollbooth that stops and rebuilds every car. The vector that arrives at the top is the original embedding plus dozens of small refinements. This sounds like bookkeeping, but it's one of the quiet breakthroughs of modern deep learning: before <em>Deep Residual Learning for Image Recognition</em> (He et al., 2016), networks beyond a couple dozen layers were nearly untrainable, because the learning signal degraded on its way back down through the stack. The highway gives that signal a clean, direct path, making residual connections one essential reason — alongside normalization, initialization, and the optimizer — that very deep stacks can learn.
        </p>
        <p class="mb-4">
          The second is <strong class="text-white font-semibold">normalization</strong>. Each sublayer gets a small operation right before its input that takes a vector and rescales it to a consistent, well-behaved range. It earns its place because numbers flowing through a deep stack of multiplications like to drift, some exploding and some collapsing toward zero, and once they drift far enough, training falls apart. Normalization keeps everything in a comfortable middle. The idea comes from <em>Layer Normalization</em> (Ba, Kiros, and Hinton, 2016); modern models, ours included, use a leaner descendant called <strong class="text-white font-semibold">RMSNorm</strong> that does the same job with less arithmetic — rescale by the vector's average magnitude, skip the rest.
        </p>
        <p class="mb-4">
          Put together, one block does exactly four things: normalize, attend, and add the result onto the highway; then normalize, run the MLP, and add that on too. The next block performs the same four operations with its own learned weights, and the next does it again. There's no finale, no special last block where the answer gets assembled. The model gets its power from repetition, each block nudging every token's vector a little closer to "the kind of vector whose next token is easy to predict."
        </p>

        <!-- INTERACTIVE:transformer-block-inspector -->

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>In a Python/MLX teaching sketch, a whole block is a handful of lines. The <code>x = x + ...</code> pattern <em>is</em> the residual connection:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code>def __call__(self, x):
    x = x + self.attn(self.ln_1(x))                        # talk: attention
    h = self.ln_2(x)                                       # think: the MLP —
    x = x + self.down(nn.silu(self.gate(h)) * self.up(h))  # gated, aka SwiGLU
    return x</code></pre>
            <p>The MLP here uses <strong>SwiGLU</strong>, a shape popularized in modern language models such as LLaMA (2023), though it is not universal: <code>up</code> expands the vector into a wider hidden space, <code>gate</code> — passed through a smooth kink called SiLU — decides how much of each hidden number gets through, and <code>down</code> projects back. Three matrices instead of the classic two, so the hidden width shrinks from 4x to about 8/3x to keep the parameter count similar. Normalizing <em>before</em> each sublayer (rather than after, as the 2017 paper did) is called <strong>pre-norm</strong>. It became common with models such as GPT-2 and generally makes deep stacks easier to optimize, though careful initialization and learning-rate warm-up still matter.</p>
          </div>
        </details>
      `,
    },
  ],
}

export const lmb107 = {
  id: 107,
  sections: [
    {
      title: 'Back to Words: Output Head & Softmax',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          After the last block, every token's vector has been refined by the entire stack, and the vector at the final position is the model's whole opinion about what should come next. One step remains: turning that final vector into a score for every one of the thousands of tokens in the vocabulary. The final projection that does this is called the <strong class="text-white font-semibold">output head</strong>, and it's just one more matrix multiplication, comparing the final vector against a row of numbers for each vocabulary token and producing one score apiece. A <strong class="text-white font-semibold">softmax</strong> turns those scores into probabilities, and the loop this whole app is built around closes: we're back at the next-token odds from the first chapter.
        </p>
        <p>
          In many models, including the kind this app builds, the output head reuses the embedding table — the very same numbers that turned token IDs into vectors on the way in. This is called <strong class="text-white font-semibold">weight tying</strong> (Press and Wolf, 2017). On the way in, a token selects one row from the table. On the way out, the model takes a dot product between its final contextual representation and every token row, producing one score per possible next token. Sharing the table gives both jobs a common learned geometry, often improves generalization, and saves a lot of parameters.
        </p>
      `,
    },
    {
      title: 'Sizing It Up: Hyperparameters & Scaling',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Now we've seen every part: an embedding table in front, a stack of blocks with the same design but independent weights, a final norm, and an output head that shares its weights with the embeddings. Within this shared recipe, a handful of numbers called <strong class="text-white font-semibold">hyperparameters</strong> set the model's size and shape. ("Hyper" just distinguishes them from the ordinary parameters the model learns; these are the ones <em>we</em> choose, before training starts.) The five you should know:
        </p>
        <ul class="space-y-2 mb-4 text-[#cbd5e1] list-disc list-inside text-xs leading-relaxed">
          <li><strong class="text-white font-semibold">Transformer blocks:</strong> how many blocks to stack. Model specifications often call this the number of <strong>layers</strong>, so a model listed with 12 layers has 12 transformer blocks. More blocks means more rounds of refinement and more capacity for complicated patterns, at more compute per step.</li>
          <li><strong class="text-white font-semibold">Width:</strong> how many numbers in each token's vector. A wider model moves more information per token, and cost grows fast with width.</li>
          <li><strong class="text-white font-semibold">Attention heads:</strong> how many parallel attention conversations run in each block, splitting the width between them.</li>
          <li><strong class="text-white font-semibold">Context length:</strong> how many tokens the model can look back over. During full-sequence training or the first pass over a prompt, standard attention compares every token with every earlier one, so attention work grows with the <em>square</em> of this number. With a key-value cache, generating each later token grows roughly linearly with the context already stored. Context length is fairly visible in AI products and often advertised.</li>
          <li><strong class="text-white font-semibold">Vocabulary:</strong> how many distinct tokens the tokenizer produces, which sets the size of the embedding table (and, via weight tying, the output head).</li>
        </ul>
        <p class="mb-4">
          Scaling those choices has the numbers climb in a hurry. Even a deliberately small model, the kind that trains comfortably on a laptop, lands in the millions of parameters. GPT-2, in 2019, used this same recipe — with the era's older fittings, like a learned position table and a slightly different MLP — at 12 layers, width 768, and a 1,024-token context, for 124 million parameters (Radford et al., 2019). GPT-3 pushed the same recipe to 96 layers, width 12,288, and 96 attention heads, and arrived at 175 <em>billion</em> (Brown et al., 2020). Across that entire stretch, the architecture barely changed.
        </p>
        <p class="mb-4">
          Many of today's largest models complicate that comparison. They use <strong class="text-white font-semibold">mixture of experts</strong> (MoE): instead of sending every token through every part of the model, a router sends each token through a few specialized parts. That gives us two different measures of size. <strong class="text-white font-semibold">Total parameters</strong> tells us how many learned numbers the model stores; <strong class="text-white font-semibold">active parameters</strong> tells us roughly how many take part for each token. Inkling, an open-weight model released in 2026, has 975 billion parameters in total but activates 41 billion at a time. The sandbox below counts dense models, where every block parameter is active. Its largest preset borrows Llama 3.1 405B's published outer dimensions — layers, width, query heads, and context — but still uses this app's simpler attention, MLP, vocabulary, and tied head, so its component breakdown is not Llama's.
        </p>
        <p class="mb-4">
          In computing and software engineering, it's pretty rare that you can build "miniatures" that even remotely resemble the thing you're trying to learn about, but a simple language model can (at least in 2026) still be built with a single computer. The model this app builds differs from the famous ones in size, training data, and polish, but not in fundamental kind.
        </p>

        <!-- INTERACTIVE:model-size-sandbox -->

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>The parameter count is arithmetic you can do on a napkin. Per block: attention has one matrix making Q, K, and V (<code>d × 3d</code>) and one projecting back (<code>d × d</code>), so about $4d^2$; the SwiGLU MLP has three matrices (gate, up, down) between width <code>d</code> and a hidden width $h \\approx 8d/3$ (rounded up to a multiple of 64), so about $3dh \\approx 8d^2$. Call it $12d^2$ per block. The embedding side is just <code>vocab × d</code>: the tied output head adds nothing, and with rotary positions there's no position table to pay for either. For an example configuration of 8 blocks, width 256 (so a hidden width of 704), and a 10,000-token vocabulary:</p>
            <div class="my-4 p-3 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
              $$\\underbrace{8 \\times (4 \\times 256^2 + 3 \\times 256 \\times 704)}_{\\text{blocks} \\;\\approx\\; 6.4\\text{M}} \\; + \\; \\underbrace{10{,}000 \\times 256}_{\\text{embeddings} \\;\\approx\\; 2.6\\text{M}} \\;\\approx\\; 9\\text{M}$$
            </div>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code>hidden = 64 * ((int(8 * n_embd / 3) + 63) // 64)   # SwiGLU width, rounded to 64
per_block = 4 * n_embd * n_embd + 3 * n_embd * hidden
emb = vocab_size * n_embd
total = emb + n_layer * per_block</code></pre>
            <p>Note the split: in a model this small, the embedding table is nearly a third of all parameters, which is exactly why tying the output head to it (instead of paying for a second <code>vocab × d</code> matrix) is worth doing. As models get wider and deeper, the $12 d^2 \\times \\text{blocks}$ term takes over, which is why the giant models are, overwhelmingly, made of transformer blocks.</p>
          </div>
        </details>
      `,
    },
  ],
}

export const lmb108 = {
  id: 108,
  sections: [
    {
      title: 'Training Data: Web Corpora & Curation',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          In order to predict what text looks like, language models need to be trained against a dataset. While large language models trained by the big AI labs use enormous datasets, we'll constrain ourselves to smaller, open-source datasets that you can easily download and process on a single laptop.
        </p>
        <p class="mb-4">
          A modest model trained on clean, well-chosen text will beat a fancier one fed garbage. Generally speaking, we want to consider three phases: We'll <strong class="text-white font-semibold">acquire</strong> some text, <strong class="text-white font-semibold">clean</strong> it up, and <strong class="text-white font-semibold">split</strong> it into a part the model learns from and a part we hold back to check on it.
        </p>
        <p class="mb-4">
          It's hard to overstate how vast the datasets are that frontier models train on. Assuming you can clean it, more data is generally better. Published frontier recipes commonly use large web-derived mixtures alongside books, articles, code, and curated specialist sources; exact compositions vary and are often only partly disclosed. A modern large model may see the rough equivalent of millions of books, more text than any person could read in a thousand lifetimes.
        </p>
        <p class="mb-4">
          A frequent backbone is a <strong class="text-white font-semibold">web crawl</strong> — the Common Crawl project, for instance, has been downloading a large slice of the web every month for over a decade. On top of that may go cleaner, higher-trust sources: Wikipedia, digitized books, news, scientific papers, and source code. If you want to see what an openly documented version looks like, the team behind The Pile wrote up exactly which sources they mixed together and why.
        </p>
        <p class="mb-4">
          That scale is a big part of why these models are expensive, and it's a big part of why <em>your</em> model will be humble by comparison. We're not going to download the internet onto your laptop.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">How much data is enough?</h3>
        <p class="mb-4">
          Good news: Since 2022, there's a handy rule of thumb. Researchers at DeepMind trained more than four hundred models of different sizes on different amounts of text and measured which combinations made the best use of a fixed compute budget. The result, published as <em>Training Compute-Optimal Large Language Models</em> and better known as the <strong class="text-white font-semibold">Chinchilla</strong> paper (after the model they built to prove the point), was that model size and dataset size should grow together: for every parameter in the model, plan on training with roughly twenty tokens. So when somebody mentions "Chinchilla-optimal" to you, they're talking about optimizing training cost.
        </p>
        <p class="mb-4">
          Before Chinchilla, the trend had been to make models bigger while their datasets barely grew, and the paper showed that many of those models would have scored better had they been smaller and trained on more text. Chinchilla itself, at 70 billion parameters, outperformed a model four times its size.
        </p>
        <p class="mb-4">
          I've setup similar defaults for this app. Our default configuration (eight transformer blocks at a width of 256) works out to about nine million parameters, so twenty tokens each calls for a training set of roughly 180 million tokens. The default pretraining run goes a bit further than that: 20,000 steps, each a batch of 32 windows of 512 tokens, shows the model about 330 million tokens, or roughly 37 per parameter. Training past the Chinchilla point is fine: the twenty-token figure describes the best use of a fixed training budget, and a small model keeps improving beyond it, only more slowly.
        </p>
        <p class="mb-4">
          For what it's worth, most labs have since moved past this rule. It optimizes for training cost, but if you plan on serving your model, inference cost matters, so fewer parameters trained far beyond Chinchilla results in a "better" model.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">Cleaning it up</h3>
        <p class="mb-4">
          Even a tidy-looking dataset tends to be full of things you don't want the model to learn: stray HTML tags, broken encodings where a quote mark became <code>â€™</code>, the same paragraph repeated forty times, blocks of navigation menus and cookie banners that have nothing to do with the actual writing. If you hand all of that to the model as-is, it dutifully learns it. Garbage in, garbage out.
        </p>
        <p class="mb-4">
          Cleaning involves <strong class="text-white font-semibold">normalizing</strong> the text (fixing encodings, standardizing whitespace and quotes) so the same word always looks like the same word, and filtering out obvious junk: empty lines, HTML tags, documents too short or too repetitive to teach anything. Interestingly, we also need to worry about deduplication.
        </p>
        <p class="mb-4">
          <strong class="text-white font-semibold">Deduplication</strong> is a lovely example of quality beating quantity. When the same passage appears many times in the data, the model spends its limited capacity memorizing that passage instead of learning the general patterns of language — and at sampling time it'll parrot the thing back. A group of researchers showed in <em>Deduplicating Training Data Makes Language Models Better</em> that simply removing duplicate text gives you a better model from <em>less</em> data.
        </p>

        <!-- INTERACTIVE:data-cleaning-diff -->

        <h3 class="text-sm font-bold text-white mt-6 mb-2">From clean text to training files</h3>
        <p class="mb-4">
          Once the source text is ready, the final encoding step resembles data plumbing: the trainer turns it into token IDs in the format it expects. Counterintuitively, we don't give the model all of the data right away: we separate those IDs into a <strong class="text-white font-semibold">training set</strong> and a smaller <strong class="text-white font-semibold">validation set</strong>.
        </p>
        <p class="mb-4">
          If a downloaded dataset already provides named training and validation files, the trainer preserves that split. If you bring a corpus without one, it uses the final portion as a fallback validation slice. The model's weight updates use only the training side; the validation side is held back so we can check how well those learned patterns carry over to unseen text.
        </p>
        <p class="mb-4">
          Practically, Language Model Builder saves the encoded training and validation data in the project, so resuming a run does not require encoding a large corpus all over again. The original text remains the source of truth.
        </p>

        <!-- INTERACTIVE:train-val-split-packer -->

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>For a corpus without its own validation file, the fallback path encodes the documents and carves a validation slice off the end. A Python/NumPy teaching sketch of that preparation looks like this:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code>data = encode_documents_to_array(tokenizer, documents, dtype=np.uint16)
n_val = max(1, min(int(len(data) * 0.1), 2_000_000))
train_ids, val_ids = data[:-n_val], data[-n_val:]

np.save("token-cache/train.npy", train_ids)
np.save("token-cache/val.npy", val_ids)</code></pre>
            <p>Saving the arrays means a later training run can reuse the token IDs instead of encoding the corpus again. The native Swift data pipeline writes this <code>.npy</code> layout and memory-maps its payload directly, reading the pieces it needs without copying the whole cache into memory; NumPy does not run inside the app. In the teaching sketch, each training batch then grabs random windows of <code>block_size</code> tokens:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code>train = np.load("token-cache/train.npy", mmap_mode="r")
i = np.random.randint(len(train) - block_size - 1)
x = train[i : i + block_size]                 # the context
y = train[i + 1 : i + 1 + block_size]         # shifted by one = the targets</code></pre>
            <p>That shift-by-one is the whole training signal: at every position, the next token <em>is</em> the right answer. We've quietly turned a pile of text into millions of free, self-labeled prediction problems — exactly the kind of signal gradient descent needs, and exactly what pre-training will run.</p>
          </div>
        </details>
      `,
    },
  ],
}

export const lmb109 = {
  id: 109,
  sections: [
    {
      title: 'How Models Learn: Objective & Weights',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          We've spent the last few chapters covering the core structure of the "machine" underpinning a language model. Text becomes tokens, tokens become vectors, and a stack of transformer blocks turns those vectors into a guess about the next token. I've mentioned it before, but let me reiterate that most of the magic inside language models isn't found in the structure itself - but in all the numbers that are inside those models. Naturally, we'll spend a lot of time talking about where good numbers come from.
        </p>
        <p class="mb-4">
          A language model, for all its apparent cleverness, is a long list of numbers and nothing else. People call them <strong class="text-white font-semibold">parameters</strong>, or <strong class="text-white font-semibold">weights</strong>. In the summer of 2026, a big model can have up to a trillion parameters. In a smaller model with nine million parameters, the embedding table alone can hold about 2.6 million of them. Across its eight blocks, the attention projections account for another 2.1 million, and the MLPs for the remaining 4.3 million. Add it all up and you have a whole model: numbers, plus the fixed recipe for combining them with your input that we walked through in Anatomy of a Transformer.
        </p>
        <p class="mb-4">
          "Training a model" changes only those numbers. The architecture stays exactly the same, before and after. Training never rewrites the code; it only turns the knobs. Whatever wisdom a finished model seems to have lives in a calculator with a predetermined number of dials, and learning is the search for a good setting of the dials.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">A checkpoint is a snapshot of the numbers</h3>
        <p class="mb-4">
          Knowing that trained models are just models with tuned numbers, it's time to learn about a key term: The <strong class="text-white font-semibold">checkpoint</strong>. A checkpoint is a bundle the trainer writes to disk so you can close your laptop and pick up training later. Its heart is a snapshot of every model parameter, or the current position of every knob. A resumable checkpoint also carries the optimizer's running state and a little metadata such as the training step, model shape, tokenizer, and data source. Load all of that back and both the model and its training process can continue from where they stopped. When this app talks about your model living on disk as a kind of save file, the learned part of that save file is the numbers.
        </p>
        <p>
          If a model is nothing but numbers, then learning means finding <em>good</em> numbers — the particular millions of values that make the machine predict text well instead of babbling. Nobody chooses them by hand. It's for that reason, too, that people intimately familiar with model training describe their work in terms of "growing a model", which is different from how software engineers normally talk about their work. First, though, we need something more basic: a way to tell good numbers from bad ones.
        </p>
      `,
    },
    {
      title: 'Watch It Learn: Live Training Demonstration',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          To step downhill you have to know which way is down. "Down" here means answering, for <em>each</em> of nine million knobs, "would nudging this one up or down lower the loss, and by how much?". Answering that by wiggling each knob one at a time and re-measuring would take nine million evaluations per step. We'd never finish a single step.
        </p>
        <p class="mb-4">
          To make that possible at scale, we use a process called <strong class="text-white font-semibold">backpropagation</strong>. Because a prediction is built from the input through a known sequence of arithmetic steps, you can run that sequence <em>backward</em> from the loss, handing each knob its exact share of the blame as you go. One pass forward to make a prediction and score it, one pass backward to assign blame, and you have the downhill direction for every knob at once. For a transformer, the backward pass usually costs about twice as much arithmetic as the forward pass, so forward plus backward is roughly three forward passes in total. The idea was worked out for neural networks by Rumelhart, Hinton, and Williams in <em>Learning representations by back-propagating errors</em> (1986), and these days the framework computes it for you automatically. If you wrote training code from scratch using any of the modern frameworks, you wouldn't write this manually, but it's worth knowing how the walk downhill is possible.
        </p>
        <p class="mb-4">
          And with that, the engine is complete. Run the model forward to get a prediction, measure the loss against the true next token, run the blame backward to get every knob's gradient, and take one small step downhill. Picture a dance instructor saying "Forward, loss, backward, step". Most language models you have talked to were built with those four steps repeated across enormous amounts of training data.
        </p>
        <p class="mb-4">
          Below is a little example running the four-step-loop above. It's deliberately tiny: its entire job is to predict the next <em>letter</em> from the current one, so it has a ridiculously small 729 weights. Press train and watch all three panels at once — the loss falling, the weights organizing themselves into structure, and the model's writing improving from random static toward something almost pronounceable. It'll remain gibberish though, it's just too small to produce real text.
        </p>

        <!-- INTERACTIVE:watch-model-learn -->

        <h3 class="text-sm font-bold text-white mt-6 mb-2">What thousands of tiny steps add up to</h3>
        <p class="mb-4">
          If you watch the timeline of samples, you can see the order in which structure appears. Nothing magical happens in one step, and honestly, very little happens in a hundred. The corrections compound, though. First the model discovers spaces and the rough frequencies of letters, so the static starts to come in word-sized bursts. Then the strong pairs emerge — <code>th</code>, <code>he</code>, <code>an</code>, a <code>q</code> that insists on <code>u</code> — and the bursts start to look pronounceable. Give it a few thousand steps and it writes confident nonsense with the unmistakable <em>texture</em> of English. For a human-made version of that effect, listen to Adriano Celentano's "Prisencolinensinainciusol", an Italian pop song whose nonsense lyrics were written to sound like English. The transformer you can build with this app will climb the same ladder during pre-training, only further: characters to words, words to phrases, phrases to little stories that almost hold together.
        </p>
        <p class="mb-4">
          Notice also what the loss curve does at the end: it flattens well above zero, against a floor it can never pass. The floor is the best this model could <em>ever</em> do, because a single letter of context only tells you so much about the next one. The model has learned everything its architecture allows, and the leftover loss is the irreducible uncertainty of the task. Give a model more context, and that floor moves down: it has more evidence about what comes next. The transformer you'll build with this app later can look across many tokens instead of one letter, so it has much more to learn before it reaches its own limit.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">Learning, memorization, and validation</h3>
        <p class="mb-4">
          A low loss on training text can come from learning reusable patterns, memorizing particular passages, or — as is usually the case — some mixture of both. Training loss alone cannot tell us how much of that learning will carry over to new text. That's why we held back a validation set in the training data chapter.
        </p>
        <p class="mb-4">
          During pre-training you'll watch two curves. When training and validation loss trend downward together, the model is improving on both the text it learns from and text it never trains on, though that does not prove it memorized nothing. When training loss keeps falling while validation loss stops improving or rises across several measurements, the widening gap is evidence of <strong class="text-white font-semibold">overfitting</strong>. Validation is inherently noisy, so an occasional bump is not the end of the world. A more useful signal is a sustained divergence. During pre-training, the lowest point on the validation curve is a useful place to stop. It tells us when continuing that particular run stopped improving predictions on held-out text — not that the model had nothing left to learn.
        </p>
        <p class="mb-4">
          So, let's summarize and review: A model is a pile of numbers, loss measures how wrong they are, gradient descent nudges them downhill, and backpropagation computes the nudge for every number at once.
        </p>

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>The demo above and the trainer in this app run the same four beats; only the model and the bookkeeping differ. Stripped to its essentials, the training step reads:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code>def loss_fn(model, x, y):
    return model.loss(x, y)                  # forward prediction and cross-entropy loss

loss_and_grad = nn.value_and_grad(model, loss_fn)

loss, grads = loss_and_grad(model, x, y)     # backward: backprop, done for you
grads, _ = clip_gradients(grads, args.grad_clip)
optimizer.update(model, grads)               # step: nudge every weight downhill</code></pre>
            <p><code>value_and_grad</code> is backpropagation as a library call: hand it the loss function and it returns the loss <em>and</em> the gradient of every parameter, computed in one backward pass. The <code>optimizer</code> applies the update rule — AdamW here, plain gradient descent in the letter demo above, same loop either way.</p>
            <p>The letter model in the playground is a 27×27 table of logits (26 letters plus space). Its floor, the dashed line the loss approaches, is the conditional entropy of the corpus's letter pairs: the average surprise that remains even with perfect knowledge of the statistics. No amount of training moves it, because it's a property of the task rather than the weights — only more context (a better architecture) lowers the floor.</p>
          </div>
        </details>
      `,
    },
  ],
}

export const lmb110 = {
  id: 110,
  sections: [
    {
      title: 'Loss: A Score for Being Wrong',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          If learning is the search for a good setting of millions of knobs, the first thing we need is a way to score any given setting — a single number that says "this is how wrong you are right now." That number is called the <strong class="text-white font-semibold">loss</strong>, and the entire training process is the hunt for knob settings that make it smaller. On the same kind of data, lower loss means better predictions.
        </p>
        <p class="mb-4">
          So how do you score a prediction? Remember from the very first chapter that the model never outputs one word; it outputs a probability for every token in the vocabulary. That makes grading easy. We take real text, look at what the next token <em>actually</em> was, and ask the model a single question: how much probability did you put on the right answer? If it was confident and correct, the loss is tiny. If it spread its bets thinly and gave the truth only a modest chance, the loss is middling. And if it confidently bet on the wrong token, the loss is large. Loss is, in a word, surprise: it measures how surprised the model was by what came next.
        </p>

        <!-- INTERACTIVE:cross-entropy-cliff -->

        <p class="mb-4">
          The shape of that curve explains a lot of model behavior. Near the right edge, the curve is nearly flat: once you're putting most of your probability on the truth, being a little more confident barely changes your score. Near the left edge, though, the curve turns into a cliff. Giving the true word almost no probability costs an enormous amount, and giving it zero probability would cost an infinite amount. In other words, once you're picking the correct answer, being more confident doesn't improve your score all that much.
        </p>
        <p class="mb-4">
          Mathematically, <strong class="text-white font-semibold">softmax</strong> gives every token a positive probability when all scores are finite, although finite-precision arithmetic can round an extremely tiny value to zero. As we train the model, we make it increasingly confident in correctly predicting the next "true" token — but rarely actually certain. Similar contexts can have several plausible continuations, and no model predicts language perfectly. Language is, after all, inherently ambiguous. As we humans struggle to communicate and express ourselves, the mathematical models are never absolutely sure what we would say next.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">Averaging over the whole dataset</h3>
        <p class="mb-4">
          One prediction isn't enough to judge a model; it might have gotten lucky on one word. So we don't judge on one. We run the model across a big batch of real text, score its prediction at <em>every</em> position, and average all of those losses into a single number. That average is what people mean when they say "the loss," and it's the number you'll watch fall, step by step, on the live chart during pre-training.
        </p>
        <p class="mb-4">
          There's a consequence hiding in that averaging, and it connects straight back to the training data chapter: because the loss is an average over your text, the model becomes good at predicting <em>whatever you showed it</em>. Show it clean little stories and it learns to write clean little stories. Show it junk and it will learn, with equal diligence, to predict junk.
        </p>

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>The exact loss used to train language models is <strong>cross-entropy</strong>: the negative logarithm of the probability the model assigned to the true next token, averaged over every position in the batch:</p>
            <div class="my-4 p-3 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
              $$\\mathcal{L} = -\\frac{1}{N} \\sum_{i=1}^{N} \\log p_\\theta(\\text{true token}_i \\mid \\text{context}_i)$$
            </div>
            <p>A perfect prediction (probability 1 on the truth) contributes $-\\log 1 = 0$; the less probability the model put on the right answer, the larger its $-\\log$ grows, without bound. The logarithm is natural log by convention, so the units are "nats" rather than bits.</p>
            <p>If this smells like the Claude Shannon material from the first chapter, that's because it is — cross-entropy is Shannon's "surprise" from <em>A Mathematical Theory of Communication</em>, measured the same way. A model with low cross-entropy is, in Shannon's terms, a model that finds real text unsurprising, and the link between "predicts text well" and "compresses text well" is not a metaphor but the same math.</p>
          </div>
        </details>
      `,
    },
    {
      title: 'Rolling Downhill: Gradient Descent & Learning Rates',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          A model is a pile of knobs, and the loss scores any particular setting of them. Learning is connecting the two: turn the knobs in whatever direction makes the score go down. Before I show you the method that does this automatically, I want you to feel the problem in your hands, so I've built the smallest language model I could get away with: one context, five knobs.
        </p>

        <!-- INTERACTIVE:manual-five-knobs -->

        <p class="mb-4">
          If you got there, you probably got there the way everyone does: nudge a slider, watch the number, nudge it back, try a different one. And that was five knobs, with the answer sheet printed right next to them. Your model has around nine million knobs, no answer sheet, and every knob changes what every other knob ought to be. Tuning that by hand is hopeless from the start.
        </p>
        <p class="mb-4">
          The fix is one of the oldest tricks in applied mathematics: <strong class="text-white font-semibold">gradient descent</strong>. Imagine the loss as a landscape. Every possible setting of the knobs is a spot on the ground, and the height of the ground at that spot is how wrong the model is there. Somewhere in that landscape is a low valley, the setting we want. You can't see the whole landscape (it has millions of dimensions, and you have no map), but standing in any one spot, you <em>can</em> feel which way the ground slopes. So you take a small step downhill. Then you feel again, and step again. The method is nothing more than that: don't solve anything in one shot, keep stepping downhill until the ground stops dropping.
        </p>
        <p class="mb-4">
          Like temperature back in the first chapter, this wasn't invented for AI. Augustin-Louis Cauchy wrote the method down in a short note in 1847, well over a century before anyone pointed it at a neural network. The new part is doing it on millions of knobs at once.
        </p>

        <!-- INTERACTIVE:gradient-descent-landscape -->

        <h3 class="text-sm font-bold text-white mt-6 mb-2">The learning rate is the size of your step</h3>
        <p class="mb-4">
          The one control in that playground that isn't part of the model is the <strong class="text-white font-semibold">learning rate</strong>: how big a step you take downhill each time. It's worth playing with because you can immediately see what happens when the learning rate is too low or too high. Set it too small and learning crawls; you'll get to the valley, eventually, but you'll be waiting all day. Set it too large and you overshoot, leaping across the valley to the far slope, sometimes landing <em>higher</em> than where you started and bouncing off to infinity. The art is a step bold enough to make progress but careful enough not to leap past the bottom, and when you later see a loss curve that drops fast and then settles gently, that's the sign of a step size chosen well.
        </p>

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>One step of gradient descent updates every weight $w$ in the model simultaneously:</p>
            <div class="my-4 p-3 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
              $$w \\leftarrow w - \\eta \\, \\frac{\\partial \\mathcal{L}}{\\partial w}$$
            </div>
            <p>The fraction is the <strong>gradient</strong>: how the loss changes as you wiggle that one weight, which is precisely "which way is uphill for this knob." Subtracting it moves downhill, and the Greek letter η ("eta") is the learning rate, scaling the step.</p>
            <p>For the line-fitting playground the loss is the mean squared error $\\mathcal{L}(m, b) = \\frac{1}{N}\\sum_i (m x_i + b - y_i)^2$, and the two partial derivatives have tidy closed forms — which is why the playground can draw the whole landscape. A production-sized model's loss surface can't be drawn (nine million dimensions), but the step rule is identical.</p>
            <p>Production trainers, including the one in this app, often use a refinement called <strong>AdamW</strong> rather than the plain rule above. It tracks running averages of both the gradient and its square, using them to give each parameter an adaptive step size, while a separate weight-decay term gently shrinks selected weights. It's the same loop with a smarter stride and an added form of regularization.</p>
          </div>
        </details>
      `,
    },
  ],
}

export const lmb111 = {
  id: 111,
  sections: [
    {
      title: 'How Models Learn Behavior: The Base Model Limitation',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          The model we've been describing (the one pre-training gives you) learns through a single objective: given some text, guess what comes next. A capable base model can still answer questions, translate, summarize, and pick up new tasks from instructions or examples in its prompt, because all of those can be expressed as text continuation. What it has not learned reliably is how to behave like an assistant: when you ask a question, you probably want an answer rather than three more questions in the same style. In this chapter, we'll discuss how to make that behavior much more dependable.
        </p>
        <p class="mb-4">
          The teaching happens in two passes: First we show the model example after example of the behavior we want, until answering in that shape becomes the natural thing for it to do — that's <strong class="text-white font-semibold">supervised fine-tuning</strong>. Then, for qualities that are often easier to judge than to demonstrate consistently, we let the model learn from comparisons instead: two answers side by side, and a human pointing at the better one, called <strong class="text-white font-semibold">preference tuning</strong>. Neither pass changes the model's machinery or its basic task of predicting the next token. They change which kinds of continuations the model learns to favor.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">A base model is not an assistant</h3>
        <p class="mb-4">
          At the risk of over-explaining the limitations of what we've built so far, a base model is a gifted mimic with no sense of occasion. It continues whatever pattern your prompt suggests. Write <code>Question: Why is the sky blue? Answer:</code> and it might give you a tidy paragraph about scattered light, but it might just as easily tack on another question, echo the label back at you, or wander into a small story about a child squinting up at the sky. It learned text; manners were never on the syllabus. The colon after <code>Answer</code> is a faint hint, and the model feels no obligation to obey it.
        </p>
        <p>
          So a prompt can elicit a behavior, sometimes impressively, but not always reliably — especially from a model as small as ours. Post-training takes the pattern we want and makes it familiar enough that the model reaches for it more consistently. (When people talk about an "instruction-tuned" or "chat" model, this is the step they mean — the same move OpenAI made when they fine-tuned GPT-3 to follow instructions.)
        </p>
      `,
    },
    {
      title: 'Supervised Fine-Tuning (SFT)',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          First up, good news for learners: teaching behavior uses the same next-token prediction from the last chapter, pointed at a different kind of example. Under the hood the model keeps doing what pre-training taught it — predicting one token at a time. To fine-tune its behavior, we narrow our focus in the data we feed it. Instead of a broad stream of stories and articles, we show it example after example of the pattern we want. If you wanted to build a chatbot assistant, you'd feed the model a constant stream of examples involving a person asking something and an assistant answering. If the model sees that shape often enough, it'll start treating it as the natural thing to do — so that later, when you prompt it with a <code>&lt;|user|&gt;</code> turn, answering as a helpful <code>&lt;|assistant|&gt;</code> is simply what it expects to come next.
        </p>

        <!-- INTERACTIVE:sft-by-example -->

        <h3 class="text-sm font-bold text-white mt-6 mb-2">Teaching by example</h3>
        <p class="mb-4">
          The interactive example above is a simulation, small enough that you can watch one behavior-training step by hand without waiting on the full trainer, but the loop is the same one the big version uses. First the toy predicts which response seems likely. Then the training example tells it which assistant answer should have come next. The grade lands on that assistant answer, and one update nudges our knobs so that answer becomes more likely. Do that enough times and the preference flips: the assistant-style reply becomes the one it reaches for.
        </p>
        <p class="mb-4">
          So far, fine-tuning sounds a lot like normal pre-training, just with different data. There is one important difference: In supervised fine-tuning we show the model the whole exchange, prompt and all, but we only grade it on the part we care about. The user's message is context, and we are not trying to teach the model to write the questions, so the loss lands only on the assistant's reply. Or, in other words, we let it read the question, but grade it on the answer. No points are awarded for really good question prediction.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">What behavior tuning can and cannot do</h3>
        <p class="mb-4">
          It's easy to ask too much of this process. Fine-tuning by example is very good at teaching shapes: formats, styles, and routines. It can make a base model reliably answer in a question-and-answer form, rewrite a sentence when you ask it to rewrite instead of continue, or settle into a particular house voice.
        </p>
        <p class="mb-4">
          Fine-tuning can also improve a model's performance on specific tasks, especially when the examples teach useful ways of answering or solving problems. That said, fine-tuning a small model on a few thousand conversations cannot make up for gaps in broad knowledge or reasoning abilities it failed to develop during pre-training.
        </p>

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>The interactive example above simplifies fine-tuning to a choice between two candidate responses: a base-model-style continuation and the assistant answer we want. It scores both responses, uses softmax to turn those scores into probabilities, and calculates the loss from how much probability it assigned to the desired answer.</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code>probabilities = softmax(logits(prompt_features))
loss = -log(probabilities[correct_assistant_answer])
weight += learning_rate * (target - probability) * prompt_feature</code></pre>
            <p>The full trainer is bigger in every direction, but the bookkeeping tells the same story: format the conversation, mask the prompt tokens so they don't count toward the loss, compute the next-token loss on the assistant's side, backpropagate, and save a new checkpoint. The difference is mostly scale. The trainer nudges millions of transformer weights where this toy nudges a tiny table of response scores.</p>
          </div>
        </details>
      `,
    },
    {
      title: 'Direct Preference Optimization (DPO)',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Teaching by example has a limit: someone has to write down what a good answer looks like. But much of what separates a good answer from a mediocre one — warmer, more on-topic, less prone to trailing off into nonsense — is nearly impossible to specify as a rule, and yet you recognize it instantly when you see two answers side by side. That gap, between what we can't specify and what we can easily compare, is what preference tuning is for.
        </p>
        <p class="mb-4">
          The technique I'm using in this app is called <strong class="text-white font-semibold">direct preference optimization</strong> (DPO for short). We'll sample two answers from the model, ask you to point at the one you like better, and let the training step nudge the model toward the winning answer. There is no answer key to grade against. The training signal is human taste, expressed one comparison at a time.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">Learning from comparisons</h3>
        <p class="mb-4">
          The idea of training on human judgments instead of right answers has a nice lineage. In 2017, researchers at OpenAI and DeepMind showed that you could teach an agent to do a backflip in a physics simulator purely from people clicking which of two video clips looked more backflip-like — for this example, nobody defined a backflip mathematically. A few years later the same trick, applied to text, produced InstructGPT and the modern chatbot era: humans ranked model outputs, a second "reward model" was trained to imitate those rankings, and a reinforcement-learning algorithm then optimized the chatbot against that learned score. The whole pipeline goes by <strong class="text-white font-semibold">RLHF</strong>, reinforcement learning from human feedback.
        </p>
        <p class="mb-4">
          That pipeline works, but it's heavy: it needs a reward model, a reference model, a delicate reinforcement-learning loop, and plenty of tuning. In 2023, a group at Stanford derived something for the usual KL-constrained formulation of that problem: under its modeling assumptions, the desired policy can be trained with a single classification-style loss directly on the comparisons. That's DPO. It removes the separately trained reward model and the reinforcement-learning loop, but it is not mathematically interchangeable with every form of RLHF. It is a different, simpler road that starts from the same preference data and aims for a similar destination.
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">What DPO actually does</h3>
        <p class="mb-4">
          Once you have a handful of preferences, we keep two copies of the model: the one being trained (the <strong class="text-white font-semibold">policy</strong>), and a frozen snapshot of it from before we started (the <strong class="text-white font-semibold">reference</strong>). For every preference pair, we ask both copies the same question: how likely would you be to produce the chosen answer, and how likely the rejected one?
        </p>
        <p class="mb-4">
          The loss then pushes on the gap between those two answers. It rewards the policy for favoring the chosen answer more strongly, relative to the rejected answer, than the reference does. The frozen reference is a safety rope: measuring changes against it discourages unconstrained drift, although it cannot guarantee that the trained model stays otherwise unchanged. A setting called <strong class="text-white font-semibold">beta</strong> controls how strongly the objective anchors this tradeoff to the reference: at higher values, departures are penalized more strongly; at lower values, the preferences can pull harder.
        </p>
        <p class="mb-4">
          In the "build your model" portion of this app you'll run exactly this — sample two answers from your own fine-tuned checkpoint, pick the better one a handful of times, and watch a real DPO step nudge the model toward your taste.
        </p>

        <!-- INTERACTIVE:dpo-preference-lab -->

        <details class="my-6 p-4 rounded-xl bg-[#16161c] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#cbd5e1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>For each preference pair, we format the prompt plus each answer with the same special chat tokens supervised fine-tuning used. The prompt is masked out, exactly like SFT's loss mask. Canonical DPO scores a complete answer with its sequence log-probability — the sum of its token log-probabilities. The DPO trainer in this app uses a deliberate <strong>length-normalized variant</strong> instead, averaging over the answer tokens:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code>token_count = mx.maximum(mask.sum(axis=-1), 1)
answer_logprob = -(token_losses * mask).sum(axis=-1) / token_count</code></pre>
            <p>That little division changes the standard objective, but makes this small experiment easier to read: a long answer otherwise accumulates more negative log-probability simply because it contains more tokens, so the preference margin can become partly a length contest. Here we compare how natural each answer is per target token instead.</p>
            <p>Those averaged scores give four numbers per pair (policy and reference, chosen and rejected) and the loss is one line:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#0e0e12] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#fdfbf7]"><code># how much more the policy likes each answer than the reference does
chosen_gap   = policy_logprob_chosen   - reference_logprob_chosen
rejected_gap = policy_logprob_rejected - reference_logprob_rejected

loss = -log_sigmoid(beta * (chosen_gap - rejected_gap))</code></pre>
            <p>If the policy prefers the chosen answer more strongly than the reference does (relative to the rejected one), the sigmoid saturates and the loss falls toward zero. The reference model's weights are frozen and its log-probabilities are computed outside the gradient, so all of the learning pressure lands on the policy. Since those reference scores never change, the trainer computes them once for every preference pair, keeps the scores, and releases the reference model before loading the trainable policy; only one copy of the model needs to stay in memory. Because these length-normalized scores have a different scale from canonical summed sequence scores, the trainer uses a beta of <code>2.0</code>; that number should not be compared directly with beta values from standard DPO recipes.</p>
            <p>The DPO trainer reuses the same tiny GPT, tokenizer, and masking helpers as the SFT trainer; the new ingredient is the preference loss above.</p>
          </div>
        </details>
      `,
    },
  ],
}
