# SoundPage: Browser-Based Document-to-Speech Application

## Implementation Plan & Status

**Current Version:** 0.1.2
**Status:** MVP Complete

---

## 1. Concept

### 1.1 Vision

**SoundPage** is a refined, privacy-focused web application that transforms written documents into natural, expressive speech using Supertonic AI technology. It empowers users to listen to their documents — reports, articles, ebooks, scripts — with high-quality voice synthesis, all processed entirely in the browser with zero server dependencies.

### 1.2 Core Value Proposition

| Value                     | Description                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| **Privacy First**         | All processing happens in-browser — documents never leave the user's device |
| **Professional Quality**  | Leverages Supertonic's lightning-fast TTS for natural, multilingual speech  |
| **Effortless Experience** | Drag, drop, listen — minimal friction from document to audio                |
| **Zero Infrastructure**   | Runs entirely client-side with ONNX Runtime Web — no server required        |
| **Accessible**            | Makes written content accessible to those who prefer or need audio          |

### 1.3 Target Users

- **Artists & Designers** — Generate voiceovers for creative projects with beautiful, intuitive UI
- **Content Creators** — Quick audio generation for videos, podcasts, presentations
- **Professionals** — Listen to reports and documents during commute
- **Students & Researchers** — Convert papers and study materials to audio
- **Accessibility Users** — Those with visual impairments or reading difficulties

### 1.4 Tagline

> _"Your documents, spoken beautifully."_

---

## 2. Design Philosophy

### 2.1 Design Principles

#### Minimal

- **Reduce to essential**: Only show what's needed, when it's needed
- **White space is sacred**: Let the interface breathe
- **One primary action per screen**: Guide users with clear hierarchy

#### Modern

- **Contemporary aesthetics**: Clean lines, subtle shadows, refined typography
- **Motion with purpose**: Smooth transitions that provide feedback, not decoration
- **Apple Music-inspired**: Light mode with elegant glassmorphic effects

#### Elegant

- **Attention to detail**: Pixel-perfect alignment, consistent spacing
- **Premium feel**: Quality interactions that feel refined and intentional
- **Invisible complexity**: Powerful features that don't overwhelm

### 2.2 Visual Identity (Implemented)

```
Color Palette (Apple Music-Inspired Light Theme)
─────────────────────────────────
Background:     #FFFFFF (white)
Surface:        #F5F5F7 (Apple gray)
Surface Glass:  rgba(255, 255, 255, 0.8) + backdrop-blur
Border:         #E5E5EA (subtle dividers)
─────────────────────────────────
Text Primary:   #1D1D1F (near black)
Text Secondary: #6E6E73 (muted gray)
Text Tertiary:  #86868B (disabled/hints)
─────────────────────────────────
Accent:         #FA243C (Apple Music red — primary actions)
Accent Hover:   #FF3B30 (lighter red on hover)
Success:        #34C759 (Apple green)
Warning:        #FF9500 (Apple orange)
Error:          #FF3B30 (Apple red)
─────────────────────────────────
Highlight:      #FFE066 (yellow — current word highlight)
Active Word:    rgba(250, 36, 60, 0.15) (subtle red background)
```

```
Typography
─────────────────────────────────
Font Family:    System fonts (-apple-system, SF Pro, etc.)
─────────────────────────────────
Display:        2.5rem / 700 weight / -0.02em tracking
Heading 1:      1.5rem / 600 weight / -0.01em tracking
Heading 2:      1.125rem / 600 weight / -0.01em tracking
Body:           1rem / 400 weight / normal tracking
Body Small:     0.875rem / 400 weight / normal tracking
Caption:        0.75rem / 500 weight / 0.02em tracking
Mono:           0.875rem / 400 weight / normal (JetBrains Mono)
```

```
Spacing Scale (4px base)
─────────────────────────────────
xs:   4px    md:  16px    2xl:  48px
sm:   8px    lg:  24px    3xl:  64px
base: 12px   xl:  32px    4xl:  96px
```

```
Border Radius
─────────────────────────────────
Small:    8px   (buttons, inputs)
Medium:  12px   (cards)
Large:   16px   (modals, panels)
XL:      24px   (large containers)
Full:   9999px  (pills, avatars)
```

```
Glassmorphic Effects
─────────────────────────────────
.glass:     background: rgba(255,255,255,0.8)
            backdrop-filter: blur(20px) saturate(180%)
            border: 1px solid rgba(255,255,255,0.3)

.glow:      box-shadow: 0 0 20px rgba(250, 36, 60, 0.3)
.glow-lg:   box-shadow: 0 0 40px rgba(250, 36, 60, 0.4)
```

### 2.3 Motion Design (Framer Motion)

```
Timing Functions
─────────────────────────────────
ease-out:      cubic-bezier(0.16, 1, 0.3, 1)     — entering elements (expo)
ease-in:       cubic-bezier(0.7, 0, 0.84, 0)     — exiting elements
ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1)    — moving elements

Animation Variants (motion.ts)
─────────────────────────────────
fadeIn:     opacity 0→1, y 10→0 (0.3s ease-out)
scaleIn:    scale 0.95→1, opacity 0→1 (0.2s ease-out)
pulse:      scale 1→1.05→1 (loop, 2s)

Durations
─────────────────────────────────
instant:    50ms    (micro-interactions)
fast:      150ms    (buttons, toggles)
normal:    250ms    (panels, cards)
slow:      400ms    (modals, page transitions)
slower:    600ms    (complex orchestrations)
```

---

## 3. Core Features

### 3.1 Feature Overview (Implemented)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CORE FEATURES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📄 Document Import          🎙️ Voice Synthesis                 │
│  ├─ Drag & drop upload       ├─ 10 voice presets (M1-M5, F1-F5)│
│  ├─ Multi-format support     ├─ 5 languages supported          │
│  │   (.txt, .md, .docx,      ├─ Streaming generation           │
│  │    .pdf, .epub)           ├─ Real-time progress             │
│  ├─ Browser-based parsing    └─ In-browser ONNX inference      │
│  └─ Manual text input                                          │
│                                                                 │
│  🎛️ Voice Controls           🔊 Audio Playback                  │
│  ├─ Voice selection          ├─ Streaming audio player         │
│  ├─ Voice preview audio      ├─ Play/pause/seek                │
│  ├─ Speed control (0.6-1.5x) ├─ Word-level sync highlighting   │
│  ├─ Quality steps (2-16)     ├─ Follow mode (auto-scroll)      │
│  └─ Language selector        └─ Export (WAV)                   │
│                                                                 │
│  ⚙️ Model Management         💾 Session Management              │
│  ├─ WebGPU acceleration      ├─ IndexedDB persistence          │
│  ├─ WASM fallback            ├─ Recent sessions sidebar        │
│  ├─ Progress indicators      ├─ Session create/load/delete     │
│  └─ Lazy model loading       └─ Original file download         │
│                                                                 │
│  🎨 Aesthetic Experience                                        │
│  ├─ Apple Music-inspired UI                                    │
│  ├─ Glassmorphic effects                                       │
│  ├─ Framer Motion animations                                   │
│  └─ Responsive design (mobile + desktop)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Feature Specifications (Implemented)

#### F1: Document Import

| Requirement       | Specification                                                   |
| ----------------- | --------------------------------------------------------------- |
| Supported formats | `.txt`, `.md`, `.docx` (Mammoth), `.pdf` (PDF.js), `.epub`      |
| Max text length   | 50,000 characters                                               |
| Text processing   | Unicode normalization, smart chunking (300 chars EN, 120 KO)    |
| Drag & drop       | Full window drop zone with visual feedback                      |
| Manual input      | Auto-resizing textarea with character count                     |
| File storage      | Original file saved to IndexedDB for re-download                |

#### F2: Voice Synthesis (Supertonic)

| Requirement     | Specification                                       |
| --------------- | --------------------------------------------------- |
| Runtime         | ONNX Runtime Web 1.23.2 (WebGPU primary, WASM fallback) |
| Voice presets   | 10 voices: M1-M5 (male), F1-F5 (female) with names  |
| Languages       | English, Korean, Spanish, Portuguese, French        |
| Generation mode | Streaming with chunk-by-chunk audio output          |
| Cancellation    | Graceful stop support with cleanup                  |
| Output          | 16-bit PCM WAV at 44.1kHz sample rate              |
| Performance     | Up to 167x faster than realtime on capable hardware |

#### F3: Voice Controls

| Parameter   | Range          | Default | UI Element                           |
| ----------- | -------------- | ------- | ------------------------------------ |
| Voice       | M1-M5, F1-F5   | M1      | Dropdown with preview audio button   |
| Language    | en/ko/es/pt/fr | en      | Button group selector                |
| Speed       | 0.6 – 1.5      | 1.0     | Slider with value display            |
| Total Steps | 2 – 16         | 8       | Slider (quality vs speed tradeoff)   |

**Voice Names:**

```
Male:   M1=Alex, M2=James, M3=Robert, M4=Daniel, M5=Thomas
Female: F1=Sarah, F2=Emma, F3=Olivia, F4=Sophia, F5=Isabella
```

#### F4: Audio Playback

| Requirement       | Specification                                    |
| ----------------- | ------------------------------------------------ |
| Player            | StreamingAudioPlayer (Web Audio API)             |
| Controls          | Play, Pause, Seek (click progress bar)           |
| Text Sync         | Word-by-word highlighting during playback        |
| Follow Mode       | Auto-scroll to current word (toggleable)         |
| Locate Button     | Jump to current word position                    |
| Export            | WAV download with session/text-based filename    |

#### F5: Model Management

| Requirement       | Specification                                |
| ----------------- | -------------------------------------------- |
| Loading           | Progressive loading with status messages     |
| Backend detection | Auto-detect WebGPU, fallback to WASM         |
| Asset hosting     | Models in /public/assets/onnx/               |
| Voice styles      | JSON embeddings in /public/assets/voice_styles/ |
| Caching           | Browser cache for model files                |

#### F6: Session Management (NEW)

| Requirement       | Specification                                |
| ----------------- | -------------------------------------------- |
| Storage           | IndexedDB via idb library                    |
| Session data      | id, name, text, fileName, fileType, timestamps |
| Original file     | Blob storage for re-download                 |
| Sidebar           | Recent sessions list with load/delete        |
| Auto-save         | Debounced text saving on edit                |

### 3.3 Implementation Status (v0.1.2)

**Completed:**

- [x] Text input (paste/type) with auto-resize
- [x] File upload (TXT, MD, DOCX, PDF, EPUB)
- [x] Text preview and editing
- [x] Voice selection (10 presets with names)
- [x] Voice preview audio samples
- [x] Language selection (5 languages)
- [x] Speed adjustment (0.6-1.5x)
- [x] Quality steps adjustment (2-16)
- [x] Streaming audio generation
- [x] Audio playback with progress bar
- [x] Word-level text synchronization
- [x] Follow mode (auto-scroll)
- [x] Export to WAV
- [x] Session management (IndexedDB)
- [x] Recent sessions sidebar
- [x] Original file download
- [x] Light mode UI (Apple Music-inspired)
- [x] WebGPU/WASM support with detection
- [x] Responsive design (mobile + desktop)
- [x] Framer Motion animations

**Deferred to v1.1+:**

- [ ] MP3 export (via browser encoder)
- [ ] Dark mode theme toggle
- [ ] Batch processing
- [ ] Keyboard shortcuts (Space play/pause, arrows seek)
- [ ] Waveform visualization (WaveSurfer.js)
- [ ] Audio bookmarks/annotations
- [ ] Cloud sync

---

## 4. UI/UX Design

### 4.1 Information Architecture (Implemented)

```
App Structure
─────────────────────────────────
├── LoadingScreen (shown during model init)
│   ├── Logo animation
│   ├── Progress bar
│   ├── Status messages
│   └── Error display with details
│
├── LandingPage (empty state)
│   ├── Mode Toggle (Text Input / Files)
│   ├── Text Input Mode
│   │   └── Auto-resizing textarea
│   └── File Upload Mode
│       ├── Drag & drop zone
│       └── File browser button
│
├── ContentPage (document loaded)
│   ├── Header Bar
│   │   ├── Back button
│   │   ├── Session name
│   │   └── Original file download
│   │
│   ├── Main Content (split view)
│   │   ├── Edit Mode: Editable textarea
│   │   └── Playback Mode: HighlightedText
│   │       ├── Word-by-word sync
│   │       ├── Click-to-seek
│   │       └── Auto-follow scroll
│   │
│   ├── Controls Panel (collapsible)
│   │   ├── Voice selector with preview
│   │   ├── Language selector (button group)
│   │   ├── Quality slider (2-16 steps)
│   │   └── Speed slider (0.6-1.5x)
│   │
│   ├── Secondary Toolbar (playback mode)
│   │   ├── Locate button (jump to word)
│   │   ├── Follow toggle
│   │   └── Stop button
│   │
│   └── AudioPlayerBar (bottom fixed)
│       ├── Play/Pause button
│       ├── Progress bar with seek
│       ├── Time display (current / total)
│       ├── Download button
│       └── Cancel button (during generation)
│
└── Sidebar (persistent)
    ├── Logo + "SoundPage" branding
    ├── New Session button
    ├── Recent Sessions list
    │   ├── Session name
    │   ├── Delete button (hover)
    │   └── Click to load
    └── Version footer
```

### 4.2 User Flows (Implemented)

#### Flow 1: First-Time User

```
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│  Visit  │───▶│   Loading   │───▶│   Models    │───▶│ Landing  │
│  Page   │    │   Screen    │    │   Loaded    │    │   Page   │
└─────────┘    └─────────────┘    └─────────────┘    └──────────┘
                    │                    │
                    │  • Logo animation  │  • Progress bar
                    │  • Detect WebGPU   │  • Status messages
                    │  • First-load msg  │  • Backend indicator
```

#### Flow 2: Text to Audio (Streaming)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Input   │───▶│  Session │───▶│  Config  │───▶│ Generate │───▶│  Listen  │
│  Text    │    │  Created │    │  Voice   │    │ Streaming│    │  Follow  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
     │  Text/file    │  Auto-save    │  Voice +      │  Chunks play  │  Word
     │  input        │  to IndexedDB │  settings     │  as generated │  highlight
     │               │               │               │               │  + download
```

#### Flow 3: Resume Session

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Sidebar │───▶│   Load   │───▶│  Content │
│  Click   │    │  Session │    │   Page   │
└──────────┘    └──────────┘    └──────────┘
     │               │               │
     │  Select from  │  Restore      │  Continue
     │  recent list  │  text/file    │  editing/playing
```

### 4.3 Wireframes (Actual Implementation)

#### Landing Page — Text Input Mode

```
┌──────────┬─────────────────────────────────────────────────────────────────┐
│          │                                                                 │
│  ◉ Sound │                    SoundPage                                    │
│    Page  │                                                                 │
│          │              Your documents, spoken beautifully.                │
│ ─────────│                                                                 │
│          │         ┌─────────────────┬─────────────────┐                   │
│ + New    │         │  Text Input ●   │     Files       │                   │
│          │         └─────────────────┴─────────────────┘                   │
│ Recent   │                                                                 │
│ ─────────│         ┌─────────────────────────────────────────────────┐     │
│          │         │                                                 │     │
│ My doc   │         │  Paste or type your text here...               │     │
│ Report   │         │                                                 │     │
│ Article  │         │                                                 │     │
│          │         │                                                 │     │
│          │         │                                                 │     │
│          │         │                                                 │     │
│          │         └─────────────────────────────────────────────────┘     │
│          │                                                    0 chars      │
│          │                                                                 │
│          │                    ┌─────────────────┐                          │
│ ─────────│                    │   Get Started   │                          │
│ v0.1.2   │                    └─────────────────┘                          │
│          │                                                                 │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

#### Landing Page — File Upload Mode

```
┌──────────┬─────────────────────────────────────────────────────────────────┐
│          │                                                                 │
│  ◉ Sound │                    SoundPage                                    │
│    Page  │                                                                 │
│          │              Your documents, spoken beautifully.                │
│ ─────────│                                                                 │
│          │         ┌─────────────────┬─────────────────┐                   │
│ + New    │         │   Text Input    │    Files ●      │                   │
│          │         └─────────────────┴─────────────────┘                   │
│ Recent   │                                                                 │
│ ─────────│         ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │
│          │                                                                 │
│ My doc   │         │              📄                                 │     │
│ Report   │                                                                 │
│ Article  │         │         Drop your file here                     │     │
│          │                   or click to browse                            │
│          │         │                                                 │     │
│          │                                                                 │
│          │         │   Supports: .txt, .md, .docx, .pdf, .epub       │     │
│          │                                                                 │
│          │         └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘     │
│ ─────────│                                                                 │
│ v0.1.2   │                                                                 │
│          │                                                                 │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

#### Content Page — Edit Mode

```
┌──────────┬─────────────────────────────────────────────────────────────────┐
│          │  ◀ Back              My Document               ⬇ Download       │
│  ◉ Sound ├─────────────────────────────────────────────────────────────────┤
│    Page  │                                                                 │
│          │  The quarterly results exceeded expectations with a 23%         │
│ ─────────│  increase in revenue compared to the same period last year.     │
│          │  This growth was primarily driven by our expansion into         │
│ + New    │  new markets and the successful launch of our premium           │
│          │  product line.                                                  │
│ Recent   │                                                                 │
│ ─────────│  Customer acquisition costs decreased by 15% while              │
│          │  retention rates improved to 94%.                               │
│ My doc ● │                                                                 │
│ Report   │  Key highlights include...                                      │
│ Article  │                                                        2,847    │
│          ├─────────────────────────────────────────────────────────────────┤
│          │  Voice    ┌──────────────┐  Quality         Speed               │
│          │           │ M1 - Alex  ▾ │  ●───────  8     ────●────  1.0x     │
│          │           └──────────────┘                                      │
│          │  Language  EN  KO  ES  PT  FR                                   │
│ ─────────├─────────────────────────────────────────────────────────────────┤
│ v0.1.2   │   ▶  ────────────────────────────────────  0:00 / --:--   ⬇     │
│          │                     [ Generate Audio ]                          │
└──────────┴─────────────────────────────────────────────────────────────────┘
```

#### Content Page — Playback Mode (with word highlighting)

```
┌──────────┬─────────────────────────────────────────────────────────────────┐
│          │  ◀ Back              My Document               ⬇ Download       │
│  ◉ Sound ├─────────────────────────────────────────────────────────────────┤
│    Page  │                                                                 │
│          │  The quarterly results exceeded expectations with a 23%         │
│ ─────────│  increase in revenue compared to the same period last year.     │
│          │  This [GROWTH] was primarily driven by our expansion into       │
│ + New    │  new markets and the successful launch of our premium           │
│          │  product line.                                                  │
│ Recent   │                                                                 │
│ ─────────│  Customer acquisition costs decreased by 15% while              │
│          │  retention rates improved to 94%.                               │
│ My doc ● │                                                                 │
│ Report   │  Key highlights include...                                      │
│ Article  │                                                                 │
│          ├─────────────────────────────────────────────────────────────────┤
│          │                                                                 │
│          │            📍 Locate       👁 Follow ●       ⬛ Stop             │
│          │                                                                 │
│ ─────────├─────────────────────────────────────────────────────────────────┤
│ v0.1.2   │   ⏸  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0:32 / 1:47   ⬇     │
│          │                                                                 │
└──────────┴─────────────────────────────────────────────────────────────────┘

[GROWTH] = highlighted current word (yellow background)
```

### 4.4 Component Specifications (Implemented)

#### Voice Selector Dropdown (VoiceSelector.tsx)

```
┌───────────────────────────────────────┐
│  M1 - Alex                     🔊  ▾  │  ← Preview button
├───────────────────────────────────────┤
│                                       │
│  Male Voices                          │
│  ─────────────────────────────────    │
│  ● M1 - Alex       [Male]   🔊   ✓    │  ← Badge + Preview
│  ○ M2 - James      [Male]   🔊        │
│  ○ M3 - Robert     [Male]   🔊        │
│  ○ M4 - Daniel     [Male]   🔊        │
│  ○ M5 - Thomas     [Male]   🔊        │
│                                       │
│  Female Voices                        │
│  ─────────────────────────────────    │
│  ○ F1 - Sarah      [Female] 🔊        │
│  ○ F2 - Emma       [Female] 🔊        │
│  ○ F3 - Olivia     [Female] 🔊        │
│  ○ F4 - Sophia     [Female] 🔊        │
│  ○ F5 - Isabella   [Female] 🔊        │
│                                       │
└───────────────────────────────────────┘
```

#### AudioPlayerBar (AudioPlayerBar.tsx)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ▶/⏸    ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0:32 / 1:47     ⬇     │
│    │            │                                         │          │     │
│  Play/     Progress bar                               Time      Download   │
│  Pause     (click to seek)                          display      WAV       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

During generation:
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ⏸    ████████░░░░░░░░░░░░░░░░  Generating: 45%   0:32 / --:--      ✕     │
│                                      │                               │     │
│                              Progress indicator              Cancel btn    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

#### HighlightedText (HighlightedText.tsx)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  The quarterly results exceeded expectations with a 23% increase           │
│  in revenue compared to the same period last year. This                    │
│  ╔═════════╗                                                               │
│  ║ GROWTH  ║  was primarily driven by our expansion into new               │
│  ╚═════════╝                                                               │
│  markets and the successful launch of our premium product line.            │
│                                                                            │
│  ↑ Current word highlighted with yellow background + red border            │
│  ↑ Auto-scrolls to keep in view when Follow mode is ON                     │
│  ↑ Click any word to seek to that position                                 │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Sidebar (Sidebar.tsx)

```
┌────────────────────┐
│                    │
│  ◉ SoundPage       │  ← Logo + branding
│                    │
│ ─────────────────  │
│                    │
│  + New Session     │  ← Creates new session
│                    │
│  Recent            │
│ ─────────────────  │
│                    │
│  My Document    ×  │  ← Active session (●)
│  Report.pdf     ×  │  ← Hover shows delete
│  Article        ×  │
│  Notes          ×  │
│                    │
│                    │
│                    │
│ ─────────────────  │
│  v0.1.2            │  ← Version footer
│                    │
└────────────────────┘
```

### 4.5 Interaction Details (Implemented)

| Element          | Hover                     | Click                  | Notes                   |
| ---------------- | ------------------------- | ---------------------- | ----------------------- |
| Drop zone        | Border color change       | Open file picker       | Drag enter/leave states |
| Voice dropdown   | —                         | Open dropdown          | Preview button inside   |
| Voice preview    | Background highlight      | Play voice sample      | Stops other previews    |
| Slider           | —                         | Drag to adjust         | Real-time value update  |
| Generate btn     | —                         | Start streaming gen    | Disabled during gen     |
| Progress bar     | —                         | Seek to position       | Click anywhere to seek  |
| Play/Pause       | —                         | Toggle playback        | Icon changes state      |
| Highlighted word | Subtle background         | Seek to word position  | Click-to-seek feature   |
| Session item     | Show delete button        | Load session           | Delete on × click       |
| Locate button    | —                         | Scroll to current word | —                       |
| Follow toggle    | —                         | Toggle auto-scroll     | Visual state change     |

### 4.6 Responsive Behavior (Implemented)

| Viewport   | Layout                                              |
| ---------- | --------------------------------------------------- |
| ≥ 1024px   | Sidebar fixed left, content area fills remaining    |
| < 1024px   | Sidebar overlay (fixed), content full width         |

**Sidebar Behavior:**
- Desktop (≥1024px): Static sidebar, always visible
- Mobile (<1024px): Fixed overlay, toggle visibility

**Controls Panel:**
- Inline layout on larger screens
- Stacked on smaller screens

Minimum supported width: **375px** (iPhone SE)

---

## 5. Technical Architecture

### 5.1 Tech Stack (Implemented)

```
┌─────────────────────────────────────────────────────────────────┐
│                         TECH STACK                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (SPA)                         │  │
│  │                                                           │  │
│  │  Framework:     React 19.2.4 + TypeScript                 │  │
│  │  Build:         Vite 7                                    │  │
│  │  Styling:       Tailwind CSS 4 + Radix UI primitives      │  │
│  │  State:         Zustand 5.0.10                            │  │
│  │  Audio:         StreamingAudioPlayer (Web Audio API)      │  │
│  │  Icons:         Lucide React 0.563.0                      │  │
│  │  Animations:    Framer Motion 12.29.2                     │  │
│  │  Database:      idb 8.0.3 (IndexedDB wrapper)             │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ Direct JS Calls                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               TTS ENGINE (In-Browser)                     │  │
│  │                                                           │  │
│  │  Runtime:       ONNX Runtime Web 1.23.2                   │  │
│  │  Acceleration:  WebGPU (primary) / WASM (fallback)        │  │
│  │  Models:        Supertonic 2 (66M parameters)             │  │
│  │  Audio:         StreamingAudioPlayer + WAV encoder        │  │
│  │  FFT:           fft.js 4.0.4 for signal processing        │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               FILE PARSING LIBRARIES                      │  │
│  │                                                           │  │
│  │  DOCX:          mammoth 1.11.0                            │  │
│  │  PDF:           pdfjs-dist 5.4.530                        │  │
│  │  EPUB:          epubjs 0.3.93                             │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ASSETS                                 │  │
│  │                                                           │  │
│  │  Models:        /public/assets/onnx/ (ONNX model files)   │  │
│  │  Voices:        /public/assets/voice_styles/ (JSON)       │  │
│  │  Previews:      /public/assets/voice_previews/ (MP3)      │  │
│  │  Fonts:         System fonts (SF Pro, etc.)               │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Project Structure (Actual)

```
soundpage/
├── src/
│   ├── components/
│   │   ├── ui/                      # Radix-based primitives
│   │   │   ├── button.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   ├── Container.tsx
│   │   │   └── index.ts
│   │   ├── AudioPlayerBar.tsx       # Bottom audio player
│   │   ├── ContentPage.tsx          # Main content view
│   │   ├── ControlsPanel.tsx        # Voice/speed/quality controls
│   │   ├── DropZone.tsx             # File drag-and-drop
│   │   ├── GenerateButton.tsx       # Generate audio button
│   │   ├── HighlightedText.tsx      # Word-sync text display
│   │   ├── InputToggle.tsx          # Text/File mode toggle
│   │   ├── LandingPage.tsx          # Initial text/file input
│   │   ├── LanguageSelector.tsx     # Language button group
│   │   ├── LoadingScreen.tsx        # Model loading screen
│   │   ├── ProgressOverlay.tsx      # Generation progress
│   │   ├── Sidebar.tsx              # Session sidebar
│   │   ├── TextEditor.tsx           # Text editing area
│   │   ├── VoiceSelector.tsx        # Voice dropdown with preview
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── audio/
│   │   │   └── streamingPlayer.ts   # Web Audio streaming player
│   │   ├── tts/
│   │   │   ├── engine.ts            # TTSEngine class
│   │   │   ├── models.ts            # ONNX model loading
│   │   │   ├── processor.ts         # UnicodeProcessor, chunking
│   │   │   ├── audio.ts             # WAV encoding, audio utils
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   └── index.ts
│   │   ├── db.ts                    # IndexedDB session storage
│   │   ├── fileParser.ts            # Multi-format file parsing
│   │   ├── motion.ts                # Framer Motion variants
│   │   └── utils.ts                 # cn(), formatDuration()
│   │
│   ├── stores/
│   │   ├── audioStore.ts            # Playback state
│   │   ├── documentStore.ts         # Text content state
│   │   ├── engineStore.ts           # TTS engine state
│   │   ├── sessionStore.ts          # Session management
│   │   ├── settingsStore.ts         # Voice/speed/quality settings
│   │   └── textSyncStore.ts         # Word synchronization
│   │
│   ├── hooks/
│   │   ├── useAudioPlayer.ts        # Playback controls
│   │   ├── useEngine.ts             # Engine initialization
│   │   └── useGeneration.ts         # TTS generation
│   │
│   ├── styles/
│   │   └── globals.css              # Tailwind + custom styles
│   │
│   ├── App.tsx                      # Main app component
│   └── main.tsx                     # React entry point
│
├── public/
│   └── assets/
│       ├── onnx/                    # ONNX model files
│       │   ├── duration_predictor.onnx
│       │   ├── text_encoder.onnx
│       │   ├── vector_estimator.onnx
│       │   └── vocoder.onnx
│       ├── voice_styles/            # Voice embedding JSON
│       │   ├── M1.json ... F5.json
│       └── voice_previews/          # Voice preview MP3s
│           ├── M1.mp3 ... F5.mp3
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts                   # Vite + React + Tailwind
└── soundpage-plan.md                # This document
```

### 5.3 TTS Engine Interface (Implemented)

```typescript
// lib/tts/types.ts
export interface TTSConfig {
  voice: string;           // M1-M5, F1-F5
  language: 'en' | 'ko' | 'es' | 'pt' | 'fr';
  speed: number;           // 0.6 - 1.5
  totalSteps: number;      // 2 - 16
  temperature?: number;    // default 0.3
}

export interface GenerationProgress {
  step: number;
  totalSteps: number;
  chunk: number;
  totalChunks: number;
  percentage: number;
}

export interface GenerationResult {
  audioBuffer: Float32Array;
  duration: number;        // seconds
  sampleRate: number;
  generationTime: number;  // ms
}

export interface ChunkResult {
  audioBuffer: Float32Array;
  duration: number;
  sampleRate: number;
  chunkIndex: number;
  totalChunks: number;
  text: string;            // Original chunk text
}

// lib/tts/engine.ts
export class TTSEngine {
  private textToSpeech: TextToSpeech | null = null;
  private voiceStyles: Map<string, Style> = new Map();
  private isReady: boolean = false;
  private backend: 'webgpu' | 'wasm' = 'wasm';
  private isCancelled: boolean = false;

  async initialize(
    onProgress?: (status: string, progress: number) => void
  ): Promise<void>;

  async loadVoice(voiceId: string): Promise<void>;

  // Batch generation (returns full audio)
  async generate(
    text: string,
    config: TTSConfig,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult>;

  // Streaming generation (yields chunks)
  async generateStreaming(
    text: string,
    config: TTSConfig,
    onChunk: (chunk: ChunkResult) => void,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult>;

  cancel(): void;
  getBackend(): 'webgpu' | 'wasm';
  isInitialized(): boolean;
}

// lib/audio/streamingPlayer.ts
export class StreamingAudioPlayer {
  constructor(
    sampleRate: number,
    onStateChange?: (state: 'playing' | 'paused' | 'stopped') => void,
    onTimeUpdate?: (currentTime: number) => void
  );

  addChunk(audioData: Float32Array, silenceGap?: number): void;
  play(): void;
  pause(): void;
  stop(): void;
  seek(time: number): void;
  getFullBuffer(): Float32Array;
  getDuration(): number;
  getCurrentTime(): number;
  isPlaying(): boolean;
  cleanup(): void;
}
```

### 5.4 State Management (Implemented)

```typescript
// stores/documentStore.ts
interface DocumentState {
  text: string;
  characterCount: number;
  isFromFile: boolean;
  fileName: string | null;
  fileType: string | null;

  // Actions
  setText: (text: string) => void;
  setFromFile: (fileName: string, fileType: string) => void;
  clear: () => void;
}

// stores/audioStore.ts
interface AudioState {
  duration: number;
  currentTime: number;
  isPlaying: boolean;

  generation: {
    isGenerating: boolean;
    progress: number;           // 0-100 percentage
    error: string | null;
    voice: string | null;
    language: string | null;
    totalSteps: number | null;
    generationTime: number | null;
  };

  // Actions
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setGenerating: (generating: boolean) => void;
  setProgress: (progress: number) => void;
  setGenerationMeta: (meta: {...}) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// stores/settingsStore.ts (persisted to localStorage)
interface SettingsState {
  voice: string;               // M1-M5, F1-F5
  language: 'en' | 'ko' | 'es' | 'pt' | 'fr';
  speed: number;               // 0.6 - 1.5
  totalSteps: number;          // 2 - 16

  // Actions
  setVoice: (voice: string) => void;
  setLanguage: (lang: string) => void;
  setSpeed: (speed: number) => void;
  setTotalSteps: (steps: number) => void;
}

// stores/engineStore.ts
interface EngineState {
  isInitializing: boolean;
  isReady: boolean;
  backend: 'webgpu' | 'wasm' | null;
  loadingStatus: string;
  loadingProgress: number;
  error: string | null;

  // Actions
  setInitializing: (init: boolean) => void;
  setReady: (ready: boolean) => void;
  setBackend: (backend: string) => void;
  setLoadingStatus: (status: string) => void;
  setLoadingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
}

// stores/sessionStore.ts (NEW - IndexedDB backed)
interface Session {
  id: string;
  name: string;
  text: string;
  fileName?: string;
  fileType?: string;
  originalFile?: Blob;
  createdAt: Date;
  updatedAt: Date;
  audioBlob?: Blob;
}

interface SessionState {
  sessions: Session[];
  currentSessionId: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  createSession: (text: string, fileName?: string, ...) => Promise<string>;
  loadSession: (id: string) => Promise<Session | null>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentSession: (id: string | null) => void;
}

// stores/textSyncStore.ts (NEW - word synchronization)
interface ChunkInfo {
  text: string;
  startTime: number;
  endTime: number;
  startIndex: number;
  endIndex: number;
}

interface TextSyncState {
  chunks: ChunkInfo[];
  totalDuration: number;

  // Actions
  addChunk: (chunk: ChunkInfo) => void;
  clear: () => void;
  getWordAtTime: (time: number) => { wordIndex: number; ... } | null;
}
```

---

## 6. Development Plan

### 6.1 Completed Phases (v0.1.2)

```
┌─────────────────────────────────────────────────────────────────┐
│                       DEVELOPMENT PHASES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: Foundation ✓ COMPLETE                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│  ✓ Project setup (Vite 7 + React 19 + TypeScript + Tailwind 4)  │
│  ✓ Design system (Apple Music-inspired, glassmorphic)           │
│  ✓ Core UI components (buttons, sliders, selects, badges)       │
│  ✓ Layout structure (Sidebar, LandingPage, ContentPage)         │
│                                                                 │
│  Phase 2: TTS Integration ✓ COMPLETE                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                 │
│  ✓ TTSEngine class with streaming support                       │
│  ✓ ONNX Runtime Web integration (WebGPU + WASM)                 │
│  ✓ Model loading with progress indicators                       │
│  ✓ Text chunking and Unicode processing                         │
│  ✓ StreamingAudioPlayer for chunk-by-chunk playback             │
│                                                                 │
│  Phase 3: UI Implementation ✓ COMPLETE                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                               │
│  ✓ File drop zone with multi-format support                     │
│  ✓ Text editor with auto-resize                                 │
│  ✓ Voice selector with preview audio                            │
│  ✓ Language selector (button group)                             │
│  ✓ Controls panel (quality, speed sliders)                      │
│  ✓ Progress indicators during generation                        │
│                                                                 │
│  Phase 4: Audio & Polish ✓ COMPLETE                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│  ✓ Streaming audio player with progress bar                     │
│  ✓ Word-level text synchronization                              │
│  ✓ Follow mode (auto-scroll to current word)                    │
│  ✓ WAV export functionality                                     │
│  ✓ Framer Motion animations                                     │
│  ✓ Responsive design (mobile + desktop)                         │
│                                                                 │
│  Phase 5: Session Management ✓ COMPLETE (BONUS)                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                        │
│  ✓ IndexedDB session storage                                    │
│  ✓ Sidebar with recent sessions                                 │
│  ✓ Session create/load/update/delete                            │
│  ✓ Original file storage and re-download                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Future Roadmap (v1.1+)

```
┌─────────────────────────────────────────────────────────────────┐
│                       FUTURE ENHANCEMENTS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Audio Features                                                 │
│  ─────────────────                                              │
│  • Waveform visualization (WaveSurfer.js)                       │
│  • MP3 export option                                            │
│  • Playback speed adjustment (post-generation)                  │
│  • Audio bookmarks/annotations                                  │
│                                                                 │
│  UX Improvements                                                │
│  ────────────────                                               │
│  • Dark mode theme toggle                                       │
│  • Keyboard shortcuts (Space, arrows, etc.)                     │
│  • Undo/redo for text edits                                     │
│  • Batch processing (multiple files)                            │
│                                                                 │
│  Advanced Features                                              │
│  ─────────────────                                              │
│  • Cloud sync (optional account)                                │
│  • Share audio via link                                         │
│  • Voice cloning (future Supertonic feature)                    │
│  • SSML support for pronunciation control                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Technical Specifications

### 7.1 Browser Requirements

| Browser | Minimum Version | Notes                |
| ------- | --------------- | -------------------- |
| Chrome  | 113+            | WebGPU support       |
| Edge    | 113+            | WebGPU support       |
| Firefox | 121+            | WebGPU (behind flag) |
| Safari  | 17+             | WebGPU support       |

**WASM Fallback:** All modern browsers with WebAssembly support (99%+ coverage)

### 7.2 Performance Targets

| Metric                 | Target | Notes                                |
| ---------------------- | ------ | ------------------------------------ |
| Initial load           | < 3s   | Before model download                |
| Model load             | < 10s  | On fast connection                   |
| Generation RTF         | < 0.1x | On WebGPU (10x faster than realtime) |
| UI responsiveness      | < 50ms | All interactions                     |
| First contentful paint | < 1s   | Perceived performance                |

### 7.3 Error Handling (Implemented)

| Error Type          | User Message                                          | Recovery         |
| ------------------- | ----------------------------------------------------- | ---------------- |
| WebGPU unavailable  | Auto-fallback to WASM (shown in status)               | Auto-fallback    |
| Model load failed   | Error details shown on loading screen                 | Retry available  |
| Text too long       | Auto-chunking (300 chars EN, 120 chars KO)            | Auto-chunk       |
| Generation failed   | Error shown in audio store                            | Retry option     |
| File parse failed   | "Unable to extract text from this file type"          | Try another file |
| Unsupported format  | "Unsupported file type. Please use .txt, .md, ..."    | List formats     |

### 7.4 Deployment

| Aspect           | Value                             |
| ---------------- | --------------------------------- |
| Hosting          | Static site (any CDN)             |
| Build output     | `/dist` folder                    |
| Build command    | `npm run build`                   |
| Dev server       | `npm run dev` (port 4000)         |
| Preview          | `npm run preview`                 |
| Current host     | ywt.ch                            |

---

## 8. References

- [Supertonic Official Repository](https://github.com/supertone-inc/supertonic)
- [Supertonic Web Example](https://github.com/supertone-inc/supertonic/tree/main/web)
- [Supertonic Models on Hugging Face](https://huggingface.co/Supertone/supertonic-2)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [idb (IndexedDB wrapper)](https://github.com/jakearchibald/idb)
- [Mammoth.js (DOCX parsing)](https://github.com/mwilliamson/mammoth.js)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [epub.js](https://github.com/futurepress/epub.js)

---

_Document Version: 3.0_
_Last Updated: January 2026_
_Status: MVP Complete (v0.1.2)_
