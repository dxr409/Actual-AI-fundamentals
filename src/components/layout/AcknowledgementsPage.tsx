export default function AcknowledgementsPage() {
  return (
    <div className="max-w-2xl mx-auto px-10 py-14 animate-fade-in">

      <p style={{ color: '#5a7080', fontSize: 13, marginBottom: 8 }}>QAIRU AI Platform</p>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f0ece8', letterSpacing: '-0.5px', marginBottom: 6 }}>
        Acknowledgements
      </h1>
      <div style={{ height: 1, background: '#2a3a4a', marginBottom: 32 }} />

      <div className="prose-qairu space-y-8">

        <section>
          <h3 style={{ color: '#e8a488', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
            Inspiration
          </h3>
          <p>
            This platform was directly inspired by{' '}
            <a href="https://languagemodelbuilder.com" target="_blank" rel="noreferrer"
              style={{ color: '#e8a488', textDecoration: 'underline' }}>
              Language Model Builder
            </a>{' '}
            by Felix Rieseberg — a beautifully designed free app that teaches how language models are built from scratch.
            We are grateful for the clarity and care of that work.
          </p>
        </section>

        <section>
          <h3 style={{ color: '#e8a488', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
            Foundational Research
          </h3>
          <p>
            The concepts taught in this course stand on the shoulders of landmark research papers:
          </p>
          <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Vaswani et al. (2017) — "Attention Is All You Need"',
              'Devlin et al. (2018) — "BERT: Pre-training of Deep Bidirectional Transformers"',
              'Radford et al. (2019) — "Language Models are Unsupervised Multitask Learners" (GPT-2)',
              'Brown et al. (2020) — "Language Models are Few-Shot Learners" (GPT-3)',
              'Hoffmann et al. (2022) — "Training Compute-Optimal Large Language Models" (Chinchilla)',
              'Rafailov et al. (2023) — "Direct Preference Optimization"',
            ].map((paper) => (
              <li key={paper} style={{ display: 'flex', gap: 10, color: '#7a9aaa', fontSize: 13 }}>
                <span style={{ color: '#e8a488', flexShrink: 0 }}>›</span>
                {paper}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 style={{ color: '#e8a488', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
            Open Source
          </h3>
          <p>
            This platform is built on open-source tools: React, Vite, FastAPI, Tailwind CSS, Zustand,
            D3.js, Lucide Icons, and Electron. We are grateful to the communities that maintain them.
          </p>
        </section>

        <section>
          <h3 style={{ color: '#e8a488', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
            QAIRU University
          </h3>
          <p>
            Developed for the students of{' '}
            <a href="https://qairu.kz" target="_blank" rel="noreferrer"
              style={{ color: '#e8a488', textDecoration: 'underline' }}>
              Qazaq AI Research University (QAIRU)
            </a>{' '}
            — the first AI-focused university in Central Asia, based in Astana, Kazakhstan.
          </p>
        </section>

      </div>
    </div>
  )
}
