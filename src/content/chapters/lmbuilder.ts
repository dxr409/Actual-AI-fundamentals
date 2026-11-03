export const lmbuilder = {
  id: 100,
  sections: [
    {
      title: 'Introduction & Welcome',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Welcome to the Language Model Builder tutorial. This material walks you through the fundamentals of language models, tokenization, embeddings, and the transformer architecture.
        </p>
        <p>
          The goal is to give you a hands‑on experience building a tiny n‑gram model and then transition to modern transformers.
        </p>`
    },
    {
      title: 'What is a Language Model?',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          A language model is a next‑token predictor: given a sequence of tokens it outputs a probability distribution over the next possible token.
        </p>
        <p>
          Early models used n‑grams (unigram, bigram, trigram) while modern models use deep neural networks (transformers).
        </p>`
    },
    {
      title: 'Tokenization',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Tokenization converts raw text into a sequence of discrete symbols (tokens) that the model can process.
        </p>
        <p>
          Tokens can be whole words, sub‑word pieces, or characters. The choice affects model size and ability to handle rare words.
        </p>`
    },
    {
      title: 'Embeddings',
      body: `
        <p class="text-sm font-medium leading-relaxed text-[#f4f4f5] mb-4">
          Embeddings map each token to a high‑dimensional vector, allowing the model to capture semantic relationships.
        </p>
        <p>
          The tutorial later explores how embeddings are learned during training.
        </p>`
    }
  ]
};

