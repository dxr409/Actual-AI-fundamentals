// Language Model Builder — Part II · Foundations (Unabridged text materials with inline interactive window markers)

export const lmb101 = {
  id: 101,
  sections: [
    {
      title: 'Welcome & Introduction',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          <em>Let's build a language model</em>
        </p>
        <p class="mb-4">
          Unless you've been living under a rock, you probably noticed that AI is everywhere. For many of us, it's changing how we do our jobs, what we expect from computers, or even the hopes and worries we might carry about the future. In the mainstream, artificial intelligence has become synonymous with large language models, or LLMs. These are the systems that power chatbots, code assistants, and other tools that generate text.
        </p>
        <p class="mb-4">
          I believe that the best way to better understand a system — any system, really — is to build a small version yourself. This app walks you through building a language model from scratch. By the end, you'll have a working model you can experiment with and learn from. As much as possible, I've tried to keep things simple and intuitive without straying far away from how production-sized language models are made. As an example, I ended up creating an app (and not just a website) because I wanted to use real-life training frameworks rather than just toy examples.
        </p>
        <p class="mb-4">
          Before we begin, a few notes about limitations: This is not a course in machine learning, mathematics, or programming. I wanted to create an experience that teaches how language models work over the course of a few hours, which naturally means that we'll stay rather surface-level in the underlying theory. I'll offer some optional technical details along the way for those who are curious. Also, do know that your model will be <em>dramatically</em> less capable than those from the big AI labs, which train theirs at great expense for millions of compute hours on the best chips ever made.
        </p>
        <div class="my-4 p-3.5 rounded-xl bg-[rgba(246,233,199,0.08)] border-l-4 border-[#f6e9c7] text-xs leading-relaxed text-[#e7e5e4]">
          If you're interested in the underlying code and math, open the <code>Under the hood</code> drawer. Read it or skip it; either way works.
        </div>
        <h3 class="text-sm font-bold text-white mt-4 mb-2">The path</h3>
        <p>
          Broadly speaking, this app contains both a teaching element (Foundations & How models work) as well as a workbench to train models (Build your model). If you already know how models work, you can jump straight to the workbench - but know that the ideas and vocabulary used there are explained in the prior chapters.
        </p>
      `,
    },
    {
      title: 'What is a Language Model?',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          The big and famous language models of the AI boom (as well as the small ones this app builds) are, at their core, a <strong class="text-white font-semibold">next-token predictor</strong>. Given a sequence of text pieces, they produce a probability for every piece of text that could come next. We call those text pieces <strong class="text-white font-semibold">tokens</strong>. To create text, we pick one of those predictions, append it to the text, and repeat the prediction cycle.
        </p>
        <p class="mb-4">
          This core idea isn't all that new. Some of the first language-model features most people encountered were forms of auto-complete: you gave a model "world wide" and it guessed that a good next word might be "web." A lot of inventions allowed us to go from simple auto-complete machinery to today's capabilities, but the central task remains the same: calculate odds for what token might follow a given input.
        </p>
        <p class="mb-4">
          Let's dive right in and try this ourselves. We'll start by building a tiny statistical model that predicts the next word in a short text. Below is a small example text — a "dataset," if you like. You're welcome to edit it. This isn't the model we'll train later, it's a warm-up to show how statistical next-word prediction works.
        </p>
        <p class="mb-4">
          To make the model, we walk through the text one word at a time. As it moves through the text, the model builds a record of which words follow which contexts, such as <strong class="text-white font-semibold">found</strong> after <strong class="text-white font-semibold">little cat</strong>. Below is an interactive view of that "training": counting, for every word in the text, which words follow which contexts. Those counts are all the model will remember.
        </p>
        <p class="mb-4">
          Context comes in different forms. We track three different kinds: A <strong class="text-white font-semibold">unigram</strong> row has no context; it only asks which words are common anywhere in the text. A <strong class="text-white font-semibold">bigram</strong> row uses one previous word, like <strong class="text-white font-semibold">little -&gt; cat</strong>. A <strong class="text-white font-semibold">trigram</strong> row uses two, like <strong class="text-white font-semibold">the little -&gt; cat</strong>. To predict, the model tries the most specific trigram first, falls back to a bigram, and finally to plain word frequency if it has never seen the context before.
        </p>

        <!-- INTERACTIVE:ngram-count-trainer -->

        <p class="mb-4">
          Now the model can turn those counts into next-word odds. It could always pick the single most likely word, but it can also <em>sample</em> from the distribution. In most models, a value named <strong class="text-white font-semibold">temperature</strong> controls how boldly it samples. Lower temperature concentrates more of the probability on the top word; higher temperature spreads it toward less likely words.
        </p>
        <p class="mb-4">
          You might be wondering why we would want to introduce randomness into the model's predictions. The answer goes back to the probabilistic view of language itself. Claude Shannon, the founder of information theory, showed in <em>A Mathematical Theory of Communication</em> that language can be treated as a source producing symbols with certain probabilities, and in <em>Prediction and Entropy of Printed English</em> he measured how predictable the next letter really is. Randomness is the model saying, "there are several plausible continuations, with different odds."
        </p>
        <p class="mb-4">
          Language models borrowed the term <strong class="text-white font-semibold">temperature</strong> from physics. In statistical mechanics, the <em>Boltzmann distribution</em> uses temperature to control how often a system visits higher-energy states. Machine learning uses the same shape of equation: lowering temperature sharpens the distribution around the best-scoring word, raising it flattens the distribution so lower-scoring words get more chances. That's why the metaphor works: a "cold" model settles into the safest choice, while a "hotter" model explores.
        </p>
        <p class="mb-4">
          Type a prompt below, and the model looks up the last two words it has seen. Click a predicted word to append it, or let temperature decide how boldly to sample.
        </p>

        <!-- INTERACTIVE:ngram-temperature-sampler -->

        <p class="mb-4">
          Two things to notice here: The predictions are <strong class="text-white font-semibold">probabilities</strong>. The model only ever has odds. <strong class="text-white font-semibold">Temperature</strong> controls how adventurously it picks, with low values concentrating probability around the likeliest word. That sounds intuitively like a good choice, but in practice often results in text that loops through the same words and sequences over and over again. High values sample rarer words, which, taken to the extreme, produces outright strange text. This same operation is widely used when generating from modern language models, although an interface may hide it or combine it with other sampling controls.
        </p>

        <details class="my-6 p-4 rounded-xl bg-[#161618] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#d6d3d1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>This playground is a tiny <strong>n-gram language model</strong>. It stores three count tables:</p>
            <ul class="list-disc list-inside space-y-1 my-2">
              <li><strong>unigram:</strong> how often each word appears anywhere,</li>
              <li><strong>bigram:</strong> how often each word follows one previous word,</li>
              <li><strong>trigram:</strong> how often each word follows two previous words.</li>
            </ul>
            <p>Training is just filling those tables:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code>for i, word in enumerate(words):
    unigram[word] += 1                         # word frequency
    if i >= 1:
        bigram[words[i - 1]][word] += 1        # previous word -> next
    if i >= 2:
        context = (words[i - 2], words[i - 1])
        trigram[context][word] += 1            # previous pair -> next</code></pre>
            <p>Prediction starts with the most specific table. If the prompt ends with <code>the little</code>, the model first looks for trigram rows whose context is <code>the little</code>. If it has never seen that pair, it backs off to the bigram table for <code>little</code>. If that also fails, it uses unigram word frequency.</p>
            <div class="my-4 p-3 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#fdfbf7] border border-[rgba(255,255,255,0.08)]">
              $$P(\\text{next word} \\mid \\text{context}) = \\frac{\\text{count}(\\text{context} \\rightarrow \\text{next word})}{\\sum_{\\text{word}} \\text{count}(\\text{context} \\rightarrow \\text{word})}$$
            </div>
            <p>Temperature changes the sampling distribution after those probabilities exist. In a neural language model this is usually done to the model's raw scores before softmax:</p>
            <div class="my-4 p-3 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#fdfbf7] border border-[rgba(255,255,255,0.08)]">
              $$P(\\text{word}) = \\operatorname{softmax}\\left(\\frac{\\text{score}(\\text{word})}{T}\\right)$$
            </div>
            <p>Our tiny count model does the same idea directly to probabilities:</p>
            <div class="my-4 p-3 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#fdfbf7] border border-[rgba(255,255,255,0.08)]">
              $$\\text{adjusted\\_weight}(\\text{word}) = P(\\text{word})^{1/T}$$
            </div>
            <p>Low temperature makes the biggest probability dominate. High temperature flattens the distribution, so less likely words have a better chance to be sampled.</p>
          </div>
        </details>

        <!-- INTERACTIVE:colab-link-bigram -->
      `,
    },
  ],
}

export const lmb102 = {
  id: 102,
  sections: [
    {
      title: 'Earlier Language Models: N-Grams to RNNs & LSTMs',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          The counter you just used is a real language model using an idea from the 1950s: the <strong class="text-white font-semibold">n-gram</strong> model. For decades, this family of approaches was the state of the art. You may have already noticed one big limitation when we discussed unigram, bigram, and trigram: the model only ever looks back a few words, so it can't use the broader context of a sentence or paragraph, which is often exactly what you need to predict what comes next.
        </p>
        <p class="mb-4">
          Consider the sentence "The boy who grew up in France speaks fluent". We'd like our language model to automatically predict the next word, which is obviously "French". However, an n-gram model would only look at the last few words, such as "speaks fluent...", and would not have any information about the earlier part of the sentence. As a result, it would not be able to make an accurate prediction about what comes next. That limitation is what drove the next generation of models in the 1990s and 2000s: recurrent neural networks (RNNs) and long short-term memory networks (LSTMs).
        </p>
        <h3 class="text-sm font-bold text-white mt-6 mb-2">RNNs and LSTMs: a running summary</h3>
        <p class="mb-4">
          Instead of a fixed window, these read text one word at a time while keeping a <em>hidden state</em>: a running summary of everything seen so far. In principle, that summary could carry "France" all the way to "French."
        </p>
        <p class="mb-4">
          In practice they struggled with two things. First, <strong class="text-white font-semibold">long-range memory</strong>: cramming a whole paragraph into one fixed-size summary means early details get blurred or lost. Second, <strong class="text-white font-semibold">speed</strong>: because each word depends on the summary from the word before it, training is inherently <em>sequential</em>. You can't process word 100 until you've finished words 1 through 99, which made these models slow to train on large amounts of text.
        </p>
        <div class="my-5 p-4 rounded-xl bg-[rgba(246,233,199,0.08)] border-l-4 border-[#f6e9c7] text-xs leading-relaxed text-[#e7e5e4]">
          <strong class="text-white font-semibold">The two problems to remember:</strong> older models either see only a small fixed window or squeeze the past through a sequential running state. In 2017, the transformer addressed both limitations: attention created direct paths to earlier tokens, and its training computations could run in parallel across positions. Transformers became the foundation for today's leading language models and chatbots. Researchers continue to explore recurrent and state-space alternatives, but Transformers continue to rule the AI boom.
        </div>
      `,
    },
    {
      title: 'The Transformer Leap',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          In 2017, a paper titled <em>"Attention Is All You Need"</em> introduced the <strong class="text-white font-semibold">transformer</strong>, the architecture that became the dominant foundation for modern large language models, including the one you'll train in this app.
        </p>
        <h3 class="text-sm font-bold text-white mt-4 mb-2">Attention: each token can reach into its context</h3>
        <p class="mb-4">
          The key idea is <strong class="text-white font-semibold">attention</strong>. Instead of a small fixed window or a single running summary, each token can gather information directly from relevant tokens in its available context. In the causal language model we'll build, "available" means the current token and the tokens before it; a mask hides anything later. When predicting the token after "speaks fluent," the final position can reach straight back to "France" and weight it heavily, no matter how many tokens earlier it appeared.
        </p>
        <p class="mb-4">
          How does it "look" at the other tokens? Each token is first turned into a list of numbers called a <strong class="text-white font-semibold">vector</strong>. The model then makes three small projections of that vector, traditionally called a <strong class="text-white font-semibold">query</strong>, a <strong class="text-white font-semibold">key</strong>, and a <strong class="text-white font-semibold">value</strong>. You can think of the query as "what this token is looking for," the key as "what this other token offers," and the value as "the information this other token can contribute."
        </p>
        <p class="mb-4">
          For every permitted pair of positions, the model compares the query from one token with the key from another. If they line up, the attention score is high; if they do not, the score is low. Those scores are turned into weights, and the model uses them to blend together the value vectors from relevant earlier tokens. So after attention runs, each token's vector has been updated with a weighted mixture of information from the context it was allowed to see.
        </p>
        <p class="mb-4">
          The training speed comes from batching those comparisons: the queries for every position form one big matrix, the keys form another, and multiplying them produces all permitted pairwise scores together — exactly the kind of work GPUs are very good at. Unlike an RNN, training does not wait for a running summary to crawl forward one token at a time. Generation is still sequential, though: the model produces one new token, adds it to the context, and then predicts again.
        </p>
        <p class="mb-4">
          This removes the old fixed-size summary bottleneck and gives distant tokens a direct connection. It does not make memory unlimited: information still has to fit inside the context window, and training still has to teach the model when a distant connection is useful.
        </p>

        <p>
          So far, we've been glossing over the exact definition of the text pieces used by models. We kept saying "word," but computers don't naturally understand words. A model works on numbers. Before attention can compare vectors, the raw text has to be chopped into pieces and assigned identifiers, and models don't chop at word boundaries. Their unit of meaning is the <strong class="text-white font-semibold">token</strong>: maybe a whole word, maybe part of one, maybe a punctuation mark or a bit of whitespace. Tokenization is the bridge between human text and model math — it decides what the model is allowed to see as one unit. That choice matters a lot, so next we'll slow down and build a tokenizer by hand.
        </p>

        <!-- INTERACTIVE:mlp-multistep-tutorial -->

        <!-- INTERACTIVE:colab-link-mlp -->
      `,
    },
  ],
}

export const lmb103 = {
  id: 103,
  sections: [
    {
      title: 'Tokenization',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          A language model cannot actually read text. It can only do math on numbers, so before a sentence can enter the model, we have to turn it into a sequence of little text pieces, and then turn those pieces into identifiers. Those little pieces are called <strong class="text-white font-semibold">tokens</strong>.
        </p>
        <p class="mb-4">
          At first, tokens can feel like an unnecessary complication. Why not use letters? Why not use whole words? Letters are wonderfully simple, but they make the underlying sequences very long: even a short paragraph becomes hundreds or thousands of steps to compute. Whole words are tempting, but there are too many of them, and the model would panic every time it saw a new name, a typo, or a word it had never met before (which is all the time, because language is rude like that).
        </p>
        <p class="mb-4">
          Tokens are a compromise. A tokenized sentence can have more pieces than the same sentence counted as words, but the reusable vocabulary can be much smaller than the set of possible whole words. Common words can become one token, while rare words can be split into familiar pieces. The model you build later will have its own tokenizer, but first I want you to see how a tiny one works.
        </p>

        <!-- INTERACTIVE:bpe-merge-tokenizer -->

        <p class="mb-4">
          At zero merges, every character is its own token — the most literal possible tokenizer, and painfully inefficient. As you run merges, the tokenizer discovers the building blocks of <em>this</em> text on its own: tiny pairs like <code>th</code> first, then larger pieces, and eventually common whole words like <code>·the</code> and <code>·little</code>.
        </p>
        <p class="mb-4">
          You might be surprised to see dots (<code>·</code>). Those mean "there was a space before this piece," so <code>·cat</code> and <code>cat</code> are different tokens — one starts a word, the other continues one. Spaces are part of text too, and the tokenizer has to put them somewhere.
        </p>
        <p class="mb-4">
          Many real BPE tokenizers run tens of thousands of merges over enormous amounts of text, producing vocabularies of tens to hundreds of thousands of tokens. They may begin from bytes or Unicode characters, and other tokenizer families learn their pieces in different ways. For BPE, though, the central idea is the one you're playing with here: find common neighboring pieces, merge them, give the results identifiers, and let the model work with those pieces instead of raw characters.
        </p>

        <details class="my-6 p-4 rounded-xl bg-[#161618] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#d6d3d1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>The whole training loop is: count adjacent pairs, merge the most frequent one, repeat.</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code>def step():
    pairs = count_adjacent_pairs(words)  # frequency-weighted
    best = most_frequent(pairs)          # e.g. ("t", "h")
    if best.count < 2:
        return None                      # nothing worth merging

    # Replace every adjacent "t h" with the new symbol "th".
    words[:] = [merge(word, best.a, best.b) for word in words]

    vocab.add(best.a + best.b)
    merges.append(best)</code></pre>
            <p>After $k$ merges, the vocabulary is the original character vocabulary plus the learned merged symbols:</p>
            <div class="my-3 p-3 bg-[#141418] rounded-xl text-center font-mono text-xs overflow-x-auto text-[#fdfbf7] border border-[rgba(255,255,255,0.08)]">
              $$|V_k| = |V_0| + k$$
            </div>
            <p>To tokenize new text, we replay the merges in the order they were learned. A later merge can only happen after earlier merges have created the pieces it expects.</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code>def encode_word(word):
    symbols = ["▁", *word]  # start from characters
    for rule in merges:      # apply learned merges in order
        symbols = apply_merge(symbols, rule.a, rule.b)
    return symbols</code></pre>
            <p>The project tokenizer you'll train later begins from raw bytes rather than these simple characters, which lets it represent any text without an "unknown character" escape hatch. GPT-style byte-level BPE tokenizers make a similar choice; other production tokenizers operate on Unicode text or use different subword algorithms. All of them add considerable bookkeeping to make encoding fast and edge cases predictable.</p>
          </div>
        </details>
      `,
    },
  ],
}

export const lmb104 = {
  id: 104,
  sections: [
    {
      title: 'Embeddings',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Once it's done, the tokenizer hands us a list of <strong class="text-white font-semibold">integer identifiers</strong>. But you can't do math on an identifier. "Token 5089" isn't 5089 of anything: it's just a name, a numbered drawer. Doubling it, or adding two identifiers together, is meaningless.
        </p>
        <p class="mb-4">
          The model needs a more useful form than a bare ID, so it looks each one up in a table and gets back a list of numbers: a vector. The model keeps one big table with a row for every token in the vocabulary. To embed a token, you take its identifier and grab that row, which contains the vector.
        </p>
        <p class="mb-4">
          Each row is a point in a space with as many axes as there are numbers in the vector. In our example, we'll use 50, but a production-sized model would use hundreds or thousands. Right now, picture those numbers as random. When training begins the whole table is noise, and "cat" is no closer to "dog" than to "Tuesday."
        </p>
        <p class="mb-4">
          Training slowly nudges those numbers into positions that help the model make better predictions. To play the "predict the next token" game well, it has to discover that "cat" and "dog" behave alike, and that "Paris" and "Rome" are the same kind of thing. One place it stores that knowledge is in the vectors, so similar words drift together. Strictly speaking, large language models embed tokens, which are rarely whole words. We're using words here to make the concepts easier to explain and understand.
        </p>

        <details class="my-6 p-4 rounded-xl bg-[#161618] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#d6d3d1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>The embedding table is a matrix of shape <code>(vocab_size, dim)</code>, and "embedding" is just indexing rows out of it:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code># vocab_size rows, one dim-length vector each. These numbers are learned.
embedding = nn.Embedding(vocab_size, dim)

ids = tokenizer.encode("the cat sat")    # e.g. [464, 5089, 3332]
x   = embedding(ids)                     # shape: (3, dim), one row per token</code></pre>
            <p>There's no multiplication and no activation, just a lookup. The values in that matrix are ordinary model parameters, tuned by gradient descent like every other weight.</p>
          </div>
        </details>

        <h3 class="text-sm font-bold text-white mt-6 mb-2">Closeness is similarity of use</h3>
        <p class="mb-4">
          Try <code>cat</code> and you'll get other animals. Try <code>red</code> and you'll get other colors; <code>three</code> and you'll get other numbers. The model worked out these families purely from seeing text, matching the famous line about language: <em>you shall know a word by the company it keeps.</em>
        </p>
        <p class="mb-4">
          Zoom out and the whole space organizes itself into neighborhoods. Below, a handful of words are flattened from 50 dimensions down to 2 so they fit on screen.
        </p>

        <!-- INTERACTIVE:embedding-space-explorer -->

        <h3 class="text-sm font-bold text-white mt-6 mb-2">Directions mean things too</h3>
        <p class="mb-4">
          Static word embeddings sometimes contain approximate directions that line up with relationships between words. In GloVe, the offset from "man" to "king" points roughly the same way as the offset from "woman" to "queen." That makes a famous analogy work:
        </p>
        <p class="mb-4 font-bold text-[#f6e9c7]">
          king − man + woman ≈ queen.
        </p>
        <p class="mb-4">
          Take the vector for "king," subtract the vector for "man," add the vector for "woman," and a nearest-neighbor search often lands near "queen." This is an approximate geometric regularity, not literal subtraction of "man-ness." Try it:
        </p>

        <!-- INTERACTIVE:embedding-vector-arithmetic -->

        <div class="my-5 p-4 rounded-xl bg-[rgba(246,233,199,0.08)] border-l-4 border-[#f6e9c7] text-xs leading-relaxed text-[#e7e5e4]">
          <strong class="text-white font-semibold">Approximate meaning based on training data:</strong> These analogies are a little wobbly: the model doesn't actually know anything or make judgments. The analogies are just the <em>nearest</em> vector, with no guarantee of truth, and on harder ones it misses. They also reflect their training data, biases and all: a model that reads the whole internet picks up our stereotypes about jobs and gender right next to our facts. The same geometry that makes embeddings useful also stores whatever was in the text, which is why they're worth handling with care.
        </div>

        <details class="my-6 p-4 rounded-xl bg-[#161618] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#d6d3d1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>Similarity is the <strong>cosine</strong> of the angle between two vectors, a dot product once they're unit-length:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code>from math import sqrt

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    length_a = sqrt(sum(x * x for x in a))
    length_b = sqrt(sum(y * y for y in b))
    return dot / (length_a * length_b)  # 1 = same direction</code></pre>
            <p>An analogy is just that arithmetic plus a nearest-neighbor lookup:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code># "a is to b as c is to ?" -> target = b - a + c, then find the closest word
a_vec = vec(a_word)
b_vec = vec(b_word)
c_vec = vec(c_word)
target = [b - a + c for a, b, c in zip(a_vec, b_vec, c_vec)]

excluded = {a_word, b_word, c_word}
candidates = (word for word in vocab if word not in excluded)
answer = max(candidates, key=lambda word: cosine(vec(word), target))</code></pre>
          </div>
        </details>

        <h3 class="text-sm font-bold text-white mt-6 mb-2">Add position to the picture</h3>
        <p class="mb-4">
          There's one thing the lookup table <em>can't</em> tell the model: <strong class="text-white font-semibold">where</strong> a word is. The vector for "dog" is the same whether it's the first word or the tenth. But order is meaning: "dog bites man" and "man bites dog" use identical words and mean opposite things.
        </p>
        <p class="mb-4">
          To fix that, early GPT models kept a second table of <strong class="text-white font-semibold">position</strong> embeddings alongside the table of <strong class="text-white font-semibold">token</strong> embeddings: one vector for "slot 0," one for "slot 1," and so on, added on before anything else happened:
        </p>
        <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code>input = token_embedding[id] + position_embedding[slot]</code></pre>
        <p class="mb-4">
          So the "dog" in slot 0 and the "dog" in slot 9 entered the model as different vectors, even though they shared the same token row. Order was baked into the numbers.
        </p>
        <p class="mb-4">
          A token embedding tells the model which token it is looking at, but not where that token appears. Modern models (including the ones built by Language Model Builder) often supply that missing information with <strong class="text-white font-semibold">rotary position embeddings</strong> (RoPE). Rather than adding a position vector to each embedding, RoPE rotates the vectors used when tokens compare themselves with one another. The angle depends on position, making each comparison sensitive to relative distance. As an example, "three tokens back", rather than simply "slot 7." This often extends beyond the positions seen during training more gracefully than a table of learned position vectors. Those comparisons happen in attention, the star of Anatomy of a Transformer. For now, the important point is simple: token embeddings do not encode order on their own, so the model needs another way to represent position.
        </p>
        <div class="my-5 p-4 rounded-xl bg-[rgba(246,233,199,0.08)] border-l-4 border-[#f6e9c7] text-xs leading-relaxed text-[#e7e5e4]">
          <strong class="text-white font-semibold">Why the model needs to be told at all:</strong> A recurrent network — the older kind from the first chapter — processes tokens one at a time, so order is built into the path the computation takes. During training, a transformer processes all positions in parallel, and self-attention alone does not distinguish their order. Position embeddings (learned tables or rotations) supply that missing information, while a causal mask prevents each position from seeing the future. Generation still happens one token at a time.
        </div>
        <p class="mb-4">
          To summarize: A token becomes an identifier, the identifier retrieves a learned vector, and the result is the sequence of vectors the transformer actually works on — with position folded in a little later, when tokens start comparing notes. The embedding is a useful starting point; the later transformer blocks turn it into a representation shaped by the surrounding context.
        </p>
        <p>
          Later, we'll meet the machinery that mixes these vectors: <strong class="text-white font-semibold">attention</strong>, which lets each position reach out to itself and every earlier position.
        </p>

        <details class="my-6 p-4 rounded-xl bg-[#161618] border border-[rgba(255,255,255,0.09)] shadow-lg">
          <summary class="font-bold text-xs text-[#f6e9c7] cursor-pointer flex items-center gap-2 select-none hover:text-[#fdfbf7]">
            <span>🔬</span><span>Under the Hood (Technical Deep Dive)</span>
          </summary>
          <div class="mt-4 space-y-3 text-xs leading-relaxed text-[#d6d3d1] border-t border-[rgba(255,255,255,0.06)] pt-3">
            <p>The token embedding table is learned; the forward pass is just a lookup:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code>tok = nn.Embedding(vocab_size, dim)   # what the token is

ids = tokenizer.encode(text)          # [464, 5089, 3332]
x = tok(ids)                          # (len, dim)</code></pre>
            <p>Position enters inside each block's attention sublayer. RoPE treats each pair of numbers in a query or key vector as coordinates and rotates them by an angle proportional to the token's position (with a different frequency per pair). Two rotated vectors' dot product then depends only on the <em>difference</em> of their positions:</p>
            <pre class="my-3 p-3.5 rounded-lg bg-[#111113] border border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-mono text-[#f6e9c7]"><code>rope = nn.RoPE(head_dim)
q = rope(q)                           # rotate by "how far along am I?"
k = rope(k)</code></pre>
            <p>The older scheme — a second learned table, <code>x = tok(ids) + pos(positions)</code>, as in GPT-2 — works too, and you'll still meet it in classic codebases. The idea is unchanged either way: the model has to be told the order somehow.</p>
          </div>
        </details>
      `,
    },
  ],
}
