# QAIRU AI Platform

An interactive educational desktop app that teaches university students how language models work — from tokenization to transformers.

Built with **Electron + React + TypeScript + FastAPI**.

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 20+
- Python 3.11+
- npm 10+

### 1. Install frontend dependencies
```bash
npm install
```

### 2. Install backend dependencies
```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

### 3. Run in development mode

**Option A — Web only (no Electron, fastest):**
```bash
# Terminal 1: backend
python3 backend/main.py

# Terminal 2: frontend
npm run dev:web
# Open http://localhost:5173
```

**Option B — Full Electron app:**
```bash
# Terminal 1: backend
python3 backend/main.py

# Terminal 2: Vite dev server
npm run dev:web

# Terminal 3: Electron
npx electron .
```

---

## 📦 Building for Distribution

```bash
# Build the React frontend
npm run build

# Package the Electron app
npm run build:electron
```

Outputs:
- **macOS**: `dist-electron/QAIRU AI Platform.dmg`
- **Windows**: `dist-electron/QAIRU AI Platform Setup.exe`
- **Linux**: `dist-electron/QAIRU AI Platform.AppImage`

---

## 🔌 Connecting the University AI API

The AI Helper widget is ready and waiting. To activate it:

1. Open `backend/routers/chat.py`
2. Replace the stub response (marked with `# TODO`) with your university API call
3. Set your API key in an `.env` file:
   ```
   UNIVERSITY_AI_API_URL=https://your-api.qairu.kz/chat
   UNIVERSITY_API_KEY=your-key-here
   ```

The request schema is already defined — no refactoring needed.

---

## 🗂 Project Structure

```
qairu-ai-platform/
├── electron/           # Electron shell (spawns backend, opens window)
├── src/
│   ├── components/
│   │   ├── auth/       # Login page
│   │   ├── layout/     # AppShell, Sidebar, HomePage, ProgressPage
│   │   ├── textbook/   # ChapterPage
│   │   ├── playgrounds/# 5 interactive demos
│   │   └── helper/     # AI Helper chat widget
│   ├── content/        # Chapter text content
│   ├── i18n/           # English + Kazakh translations
│   └── lib/            # Zustand stores, API client
└── backend/
    ├── main.py         # FastAPI app entry
    ├── database.py     # SQLite setup
    └── routers/
        ├── auth.py     # Login / auto-register
        ├── progress.py # Chapter completion sync
        └── chat.py     # AI Helper (stub → wire up your API here)
```

---

## 📚 Chapters

| # | Title | Playground |
|---|-------|-----------|
| 1 | Language Models | N-gram predictor |
| 2 | Tokenization | Live BPE tokenizer |
| 3 | Embeddings | 2D embedding space |
| 4 | Attention | Attention heatmap |
| 5 | The Transformer | — |
| 6 | Training Data | — |
| 7 | Loss & Gradient Descent | Loss curve demo |
| 8 | Fine-tuning (SFT + DPO) | — |

---

## 🌐 Languages
- English (`en`)
- Kazakh (`kk`) — switch in sidebar or login screen

---

## 🔮 Phase 2 (Training Workbench)
The FastAPI backend is already structured to support a PyTorch-based training pipeline. Phase 2 will add:
- Dataset selection UI
- Pre-training with live loss curve
- Supervised fine-tuning (SFT)
- Direct preference optimisation (DPO)
- Chat with your trained model
