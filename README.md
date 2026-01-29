# SoundPage

**Your documents, spoken beautifully.**

SoundPage is a privacy-focused web application that transforms documents into natural speech using [Supertonic](https://github.com/supertone-inc/supertonic), an open-source TTS model by Supertone. All processing happens entirely in your browser via ONNX Runtime Web — your documents never leave your device.

## Features

- **Document Import** — Drag & drop support for `.txt`, `.md`, `.docx`, `.pdf`, and `.epub`
- **10 Voice Presets** — 5 male and 5 female voices with preview audio
- **5 Languages** — English, Korean, Spanish, Portuguese, French
- **Real-time Streaming** — Audio plays as it generates, chunk by chunk
- **Word Sync** — Highlighted text follows along with playback
- **Session Management** — Documents and sessions persist in your browser until you delete them
- **Offline Support** — Works offline after initial model download
- **WAV Export** — Download original documents or generated audio anytime
- **WebGPU Accelerated** — Fast inference with automatic WASM fallback

## Tech Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS 4 + Radix UI
- ONNX Runtime Web (Supertonic TTS)
- Zustand + IndexedDB (idb)
- Framer Motion

## Getting Started

This repository uses [Git LFS](https://git-lfs.com/) to store ONNX model files. You must install Git LFS before cloning:

```bash
# Install Git LFS (macOS)
brew install git-lfs

# Install Git LFS (Ubuntu/Debian)
sudo apt install git-lfs

# Initialize Git LFS
git lfs install

# Clone the repository
git clone https://github.com/jingcheng-chen/soundpage.git
cd soundpage
```

Then install dependencies and run:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app runs at `http://localhost:4000` by default.

## Browser Support

Requires a modern **desktop** browser with WebGPU (Chrome 113+, Edge 113+, Safari 17+) or WebAssembly support.

**Note:** Mobile browsers are not supported due to memory constraints and limited WebGPU availability.

## License

MIT
