// Chapters 101-104: Language Model Builder — Part I: Foundations

export const ch101 = {
  id: 101,
  sections: [
    {
      title: 'What is a Language Model?',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          The big and famous language models of the AI boom (as well as the small ones this app builds) are, at their core, a <strong class="text-white font-semibold">next-token predictor</strong>. Given a sequence of text pieces, they produce a probability for every piece of text that could come next. We call those text pieces <strong class="text-white font-semibold">tokens</strong>. To create text, we pick one of those predictions, append it to the text, and repeat the prediction cycle.
        </p>
        <p class="mb-4">
          This core idea isn't all that new. Some of the first language-model features most people encountered were forms of auto-complete: you gave a model <em>"world wide"</em> and it guessed that a good next word might be <em>"web."</em> A lot of inventions allowed us to go from simple auto-complete machinery to today's capabilities, but the central task remains the same: calculate odds for what token might follow a given input.
        </p>
        <p>
          Let's dive right in and try this ourselves. We'll start by building a tiny statistical model that predicts the next word in a short text. Below is an interactive playground where you can train and sample from a tiny n-gram model.
        </p>
      `,
    },
    {
      title: 'Training the Model: N-Gram Contexts',
      body: `
        <p class="mb-4">
          To make the model, we walk through the text one word at a time. As it moves through the text, the model builds a record of which words follow which contexts, such as <strong class="text-white font-semibold">found</strong> after <strong class="text-white font-semibold">little cat</strong>. Those counts are all the model remembers.
        </p>
        <p class="mb-4">
          Context comes in different forms. We track three different kinds:
        </p>
        <ul class="space-y-2 mb-4 text-[#cbd5e1] list-disc list-inside">
          <li><strong class="text-white font-semibold">Unigram:</strong> has no context; it only asks which words are common anywhere in the text.</li>
          <li><strong class="text-white font-semibold">Bigram:</strong> uses one previous word, like <code class="px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-xs">little -&gt; cat</code>.</li>
          <li><strong class="text-white font-semibold">Trigram:</strong> uses two previous words, like <code class="px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-xs">the little -&gt; cat</code>.</li>
        </ul>
        <p>
          To predict, the model tries the most specific trigram first, falls back to a bigram, and finally to plain unigram word frequency if it has never seen the context before.
        </p>
      `,
    },
    {
      title: 'Temperature & Boltzmann Distribution',
      body: `
        <p class="mb-4">
          Now the model can turn those counts into next-word odds. It could always pick the single most likely word (greedy sampling), but it can also <em>sample</em> from the distribution. In most models, a value named <strong class="text-white font-semibold">temperature (T)</strong> controls how boldly it samples. Lower temperature concentrates more probability on the top word; higher temperature spreads it toward less likely words.
        </p>
        <p class="mb-4">
          Language models borrowed the term <em>temperature</em> from physics. In statistical mechanics, the <strong>Boltzmann distribution</strong> uses temperature to control how often a system visits higher-energy states. Lowering temperature sharpens the distribution around the safest choice; raising it flattens the distribution so rarer words get explored.
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
          $$P(\\text{word}) = \\operatorname{softmax}\\left(\\frac{\\text{score}(\\text{word})}{T}\\right) \\quad \\text{or} \\quad \\text{weight}(\\text{word}) = P(\\text{word})^{1/T}$$
        </div>
      `,
    },
  ],
}

export const ch102 = {
  id: 102,
  sections: [
    {
      title: 'Earlier Language Models: Limitations of N-Grams',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          For decades, n-gram models were the state of the art. But their big limitation is obvious: the model only ever looks back a couple of words, so it cannot use the broader context of a paragraph.
        </p>
        <p class="mb-4">
          Consider the sentence: <em>"The boy who grew up in France speaks fluent..."</em>. We would like our language model to automatically predict the next word, which is clearly <strong>"French"</strong>. However, an n-gram model looking only at <em>"speaks fluent..."</em> has zero information about "France" from earlier in the sentence.
        </p>
      `,
    },
    {
      title: 'RNNs and LSTMs: Sequential Bottlenecks',
      body: `
        <p class="mb-4">
          To overcome fixed windows, the 1990s and 2000s introduced <strong>Recurrent Neural Networks (RNNs)</strong> and <strong>Long Short-Term Memory networks (LSTMs)</strong>. Instead of a fixed window, these read text one word at a time while updating a <em>hidden state</em>—a running summary of everything seen so far.
        </p>
        <p class="mb-4">
          In practice, they struggled with two major bottlenecks:
        </p>
        <ol class="space-y-2 mb-4 text-[#cbd5e1] list-decimal list-inside">
          <li><strong class="text-white">Long-range memory loss:</strong> Cramming a whole paragraph into one fixed-size vector means early details get blurred or forgotten.</li>
          <li><strong class="text-white">Sequential speed bottleneck:</strong> Because each word depends on the hidden state of the word before it, training is strictly sequential. Word 100 cannot be computed until words 1 through 99 are finished, making parallel GPU training impossible.</li>
        </ol>
      `,
    },
    {
      title: 'The Transformer Leap (2017)',
      body: `
        <p class="mb-4">
          In 2017, the seminal paper <em>"Attention Is All You Need"</em> introduced the <strong>Transformer</strong>.
        </p>
        <p class="mb-4">
          The key idea is <strong>self-attention</strong>: Instead of squeezing the past through a sequential running summary, every token can reach directly into its available context and gather information from any relevant earlier token, no matter how far back it appeared!
        </p>
        <div class="my-4 p-4 rounded-xl bg-[rgba(56,189,248,0.08)] border-l-4 border-[#38bdf8] text-xs leading-relaxed text-[#e0e0e0]">
          <strong>The breakthrough:</strong> Queries, Keys, and Values for all positions form large matrices that multiply simultaneously across parallel GPU tensor cores. Training computes comparisons across entire sequences at once, removing the sequential bottleneck of RNNs!
        </div>
      `,
    },
  ],
}

export const ch103 = {
  id: 103,
  sections: [
    {
      title: 'Tokenization: The Bridge Between Text and Math',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          A language model cannot read text directly. It can only do linear algebra on numbers. Before a sentence enters the model, we must chop it into small pieces called <strong class="text-white font-semibold">tokens</strong>, and assign each piece an integer ID.
        </p>
        <p class="mb-4">
          Why not use letters? Letters are simple, but sequences become too long—even a short paragraph takes thousands of computation steps. Why not whole words? There are millions of possible words, and the model would fail every time it saw a typo, a new name, or a compound word.
        </p>
        <p>
          Tokens are the ideal compromise: common words become single tokens (like <code class="px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-xs">·the</code>), while rare or unfamiliar words are split into known subword pieces.
        </p>
      `,
    },
    {
      title: 'Byte Pair Encoding (BPE)',
      body: `
        <p class="mb-4">
          The dominant tokenization algorithm in modern LLMs (including GPT-4 and Llama) is <strong>Byte Pair Encoding (BPE)</strong>.
        </p>
        <p class="mb-4">
          BPE starts by breaking text into individual characters (or raw bytes). Then, it repeatedly counts adjacent pairs and merges the single most frequent pair into a new token symbol:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
          $$\\text{Vocabulary Size: } |V_k| = |V_0| + k \\quad (k \\text{ merges})$$
        </div>
        <p>
          Notice the dot symbol (<code class="text-[#38bdf8] font-mono">·</code>): it denotes a preceding space. So <code class="text-[#38bdf8] font-mono">·cat</code> and <code class="text-[#38bdf8] font-mono">cat</code> are distinct tokens—one starts a word, the other continues one.
        </p>
      `,
    },
  ],
}

export const ch104 = {
  id: 104,
  sections: [
    {
      title: 'Embeddings: Numbers with Meaning',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          The tokenizer outputs integer IDs like <code class="px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-xs">[464, 5089, 3332]</code>. But you cannot do math on raw IDs—token 5089 isn't 5089 of anything, it's just a numbered drawer.
        </p>
        <p class="mb-4">
          The model looks each token ID up in an <strong>Embedding Table</strong> (a matrix of shape <code class="text-[#38bdf8] font-mono">vocab_size × d_model</code>) and retrieves a vector of floating-point numbers.
        </p>
        <p>
          At initialization, these numbers are pure noise. But through gradient descent, words used in similar contexts drift together in high-dimensional vector space: <em>cat</em> drifts toward <em>dog</em>, and <em>Paris</em> drifts toward <em>Rome</em>.
        </p>
      `,
    },
    {
      title: 'Cosine Similarity & Semantic Arithmetic',
      body: `
        <p class="mb-4">
          In embedding space, closeness corresponds to similarity of meaning. We measure the angle between two word vectors using <strong>cosine similarity</strong>:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#f2f2f7] border border-[rgba(255,255,255,0.08)]">
          $$\\operatorname{cosine}(u, v) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|}$$
        </div>
        <p class="mb-4">
          Remarkably, geometric directions also carry semantic relationships. The classic analogy works via vector addition and subtraction:
        </p>
        <div class="my-4 p-3.5 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#38bdf8] border border-[rgba(255,255,255,0.08)]">
          $$\\mathbf{v}_{\\text{king}} - \\mathbf{v}_{\\text{man}} + \\mathbf{v}_{\\text{woman}} \\approx \\mathbf{v}_{\\text{queen}}$$
        </div>
      `,
    },
    {
      title: 'Encoding Position: From Positional Tables to RoPE',
      body: `
        <p class="mb-4">
          Embedding tables lack one critical piece of information: <strong>where</strong> a word sits in a sentence. "Dog bites man" and "man bites dog" use identical tokens but mean opposite things!
        </p>
        <p>
          Early transformers added a learned position table (<code class="text-[#38bdf8] font-mono">x = tok[id] + pos[slot]</code>). Modern models use <strong>Rotary Position Embeddings (RoPE)</strong>, which rotate the query and key vectors in complex 2D planes by angles proportional to their sequence position, making attention sensitive to relative distance.
        </p>
      `,
    },
  ],
}

