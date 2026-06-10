# Streamlit Architecture Audit

**Date:** 2026-06-10  
**Commit:** `8cc6793`  
**Scope:** Full codebase review — structure, state management, components, build, performance, security

---

## Executive Summary

Streamlit is a browser-based audio research platform with impressive feature breadth (stem separation, transcription, analysis, export). However, the codebase has accumulated significant structural debt from rapid feature growth. The biggest risks are **unmaintainable page sizes**, **scattered state stores**, **duplicate audio processing logic**, and **zero test coverage**.

| Area | Grade | Risk |
|------|-------|------|
| File Organization | D | Pages 500–1,300+ lines; no feature modules |
| State Management | D | 5 overlapping stores; `file-store.ts` is a god object |
| Component Design | C | Massive components; no shared page shells |
| Audio Processing | C | 6 duplicate AudioContext patterns; no service layer |
| Build & Deploy | B | Clean builds; stale config remnants |
| Performance | C | Notes page = 245KB; no code splitting |
| Testing | F | 0 test files |
| Security | B | Good headers; stale env vars in config |

---

## 1. File Organization & Architecture

### Findings

- **22 pages**, average ~500 lines, max 1,346 (`stem-separation/page.tsx`)
- **34 lib files**, average ~280 lines, max 984 (`audio-analysis.ts`)
- **21 components**, average ~360 lines, max 1,071 (`advanced-settings.tsx`)
- **No feature modules.** Every page is a flat file in `src/app/`. Logic, UI, state, and data fetching live together.
- **No hooks directory.** Custom logic is inlined in pages or buried in lib files.
- **UI components are raw shadcn.** All 50+ UI primitives live in `components/ui/` — correct for shadcn, but there's no app-specific component layer between primitives and pages.

### Impact
- Pages are impossible to unit test.
- Code review is painful (1,000+ line PRs for single-page changes).
- Logic is not reusable across pages (e.g., audio decoding is copy-pasted 6 times).

### Recommendations

| Priority | Action |
|----------|--------|
| **P0** | Extract every page into `features/{feature}/` with `page.tsx`, `hooks/`, `components/`, `lib/`, `types.ts` |
| **P0** | Cap page files at **150 lines**. Move all logic to hooks and sub-components. |
| **P1** | Create `src/hooks/` for shared logic (audio decoding, file upload, progress tracking). |
| **P1** | Create `src/services/` for audio processing orchestration (see §4). |

---

## 2. State Management

### Findings

- **5 Zustand stores** with overlapping concerns:
  - `file-store.ts` (406 lines) — files, notes, processing flags, transcription results, local folders, piano roll, file lifecycle, stats
  - `job-store.ts` (358 lines) — job tracking with IDB persistence
  - `stem-store.ts` (24 lines) — minimal; mostly dead
  - `transcription-store.ts` (15 lines) — minimal; overlaps file-store
  - `project-storage.ts` (434 lines) — project metadata; orphaned after removing auth

- **`file-store.ts` is a god object.** It handles:
  - File upload & persistence
  - Audio base64 encoding/decoding
  - Local folder connections
  - Piano roll note sharing
  - Transcription result flags
  - File lifecycle & stats

- **Stores don't compose.** `job-store` tracks jobs separately from `file-store`'s lifecycle, creating two sources of truth for "is this file done?"

### Impact
- Adding a new field requires touching the monolith store.
- Race conditions possible between job progress and file status updates.
- `file-store.ts` serializes entire audio files as base64 into IndexedDB — memory bloat.

### Recommendations

| Priority | Action |
|----------|--------|
| **P0** | **Split `file-store.ts` into 3 stores:** `audioFileStore`, `workflowStore`, `playbackStore` |
| **P0** | **Merge or delete** `job-store`, `stem-store`, `transcription-store` into `workflowStore` |
| **P1** | Stop storing base64 audio in IndexedDB. Use OPFS or keep only metadata + file handles. |
| **P1** | Make stores reactive with computed selectors, not manual stats calculations. |

---

## 3. Component Design

### Findings

- **All 22 pages are `'use client'`.** Zero server components. Every page ships JS for the full render.
- **Largest components:**
  - `advanced-settings.tsx` — 1,071 lines
  - `audio-tools.tsx` — 1,003 lines
  - `audio-effects-processor.tsx` — 857 lines
  - `audio-processor.tsx` — 737 lines
- **No shared page layout for workflow pages.** Each page reinvents its own header, file selector, and progress UI.
- **`collaboration.tsx` (530 lines)** references auth/collaboration features that were removed. Likely dead code.

### Impact
- Bundle sizes are inflated because every page hydrates everything.
- `notes/page.tsx` = 245KB — bigger than many entire SPAs.
- UI inconsistencies across pages (different upload widgets, different progress indicators).

### Recommendations

| Priority | Action |
|----------|--------|
| **P0** | Create `WorkflowPageShell` component: shared header, file selector, step navigation, progress bar. Every workflow page wraps it. |
| **P0** | Convert static pages (`/help`, `/privacy`, `/terms`, `/home`) to Server Components. |
| **P1** | Cap component files at **200 lines**. Extract table rows, forms, and modals into sub-components. |
| **P1** | Audit and delete dead components (`collaboration.tsx`, `StemSeparationViewer.tsx` if unused). |

---

## 4. Audio Processing Layer

### Findings

- **6 different patterns** for creating/decoding AudioContext across pages:
  ```ts
  // Pattern A: Direct instantiation
  const audioContext = new AudioContext();
  
  // Pattern B: Window fallback
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Pattern C: Singleton in audio-processor.ts
  let audioContext: AudioContext | null = null;
  export function getAudioContext() { ... }
  
  // Pattern D: Temporary + close
  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(arrayBuffer);
  await ctx.close();
  
  // Pattern E: OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(channels, length, sampleRate);
  
  // Pattern F: Tone.js (audio-playback.ts)
  ```
- **No shared `AudioService`.** Every page does its own file → ArrayBuffer → AudioBuffer pipeline.
- **Worker usage is inconsistent.** `demucs.worker.ts` exists but `demucs-service.ts` runs WASM in the main thread too.

### Impact
- Memory leaks from unclosed AudioContexts.
- Inconsistent error handling (some pages catch decode errors, others don't).
- Can't swap audio backends (e.g., use Web Audio vs. WASM) without editing 6+ files.

### Recommendations

| Priority | Action |
|----------|--------|
| **P0** | Create `src/services/audio-engine.ts` — singleton for AudioContext lifecycle, decode, resample. All pages import from here. |
| **P0** | Standardize on **Pattern D** (temp context + close) for decoding, or the singleton for playback. Never mix. |
| **P1** | Move all heavy processing (Demucs, FFT, pitch detection) into Web Workers. Main thread should only orchestrate. |
| **P1** | Add `AudioBuffer` caching layer. Don't re-decode the same file on every page. |

---

## 5. Data Flow & Workflow Orchestration

### Findings

- **File lifecycle is tracked** (uploaded → stems → transcribed → analyzed → exported), but the workflow is not enforced.
- **Pages don't know about each other.** A user can jump from Upload straight to Export, skipping steps, with no guardrails.
- **No pipeline/job queue.** If you drop 10 files, each page processes them sequentially on the main thread. No background processing.
- **Export formats are hardcoded** per page. `export-service.ts`, `music-export.ts`, `pdf-export.ts`, `csv-utils.ts`, `academic-export.ts`, `musicxml-export.ts`, `visual-export.ts`, `zip-utils.ts` — 8+ export modules with no unified interface.

### Impact
- Users can easily produce broken exports (e.g., export MIDI before transcription).
- No batch queue means large jobs freeze the UI.
- Export code is scattered and inconsistent.

### Recommendations

| Priority | Action |
|----------|--------|
| **P0** | Create a `WorkflowEngine` that enforces step order: Upload → Separate → Transcribe → Analyze → Export. |
| **P0** | Build a `JobQueue` (Web Worker + IDB). Files are queued; processing happens off-thread; dashboard shows real progress. |
| **P1** | Create `src/services/export-engine.ts` with a unified interface: `export(fileId, format, options)`. All formats register as plugins. |
| **P1** | Add step-gates: disable Transcribe button until stems are extracted; disable Export until transcription exists. |

---

## 6. Build, Performance & Deployment

### Findings

- **Build succeeds** (0 errors, 0 vulnerabilities).
- **`next.config.ts` has stale config:**
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars referenced but packages removed.
  - `images.domains` hardcodes `streamlit.in4metrix.dev`.
  - `output: 'standalone'` but start script uses `bun` which isn't available on Vercel.
- **COOP/COEP headers** are set globally. This is required for Demucs WASM SharedArrayBuffer, but it breaks any cross-origin embeds, CDN fonts, or iframe integrations.
- **No code splitting.** Pages like `/notes` (245KB) and `/transcription` (299KB) are monolithic.
- **No bundle analyzer** configured.

### Impact
- Vercel deployment had lockfile sync issues (already fixed).
- Global COOP/COEP will cause subtle bugs with third-party assets.
- Large initial JS loads hurt mobile performance.

### Recommendations

| Priority | Action |
|----------|--------|
| **P0** | Remove stale env vars from `next.config.ts`. Use `process.env` directly where needed. |
| **P0** | Fix `package.json` scripts: replace `bun` with `node` for Vercel compatibility. |
| **P1** | Scope COOP/COEP to `/stem-separation` only, or detect WASM need at runtime. |
| **P1** | Add `@next/bundle-analyzer` to identify largest chunks. |
| **P1** | Lazy-load heavy libraries (`tone`, `demucs-wasm`, `basic-pitch`) with `dynamic import`. |

---

## 7. Testing

### Findings

- **0 test files.** No unit tests, no integration tests, no E2E tests.
- **No testing framework** in devDependencies.
- Audio processing is inherently hard to test, but there's not even structural testing for UI components.

### Recommendations

| Priority | Action |
|----------|--------|
| **P1** | Add Vitest + React Testing Library. Start with store logic (pure functions) — easiest wins. |
| **P1** | Add Playwright for E2E: upload file → extract stems → transcribe → export. |
| **P2** | Create mock `AudioBuffer` fixtures for testing audio processing functions in isolation. |

---

## 8. Security & Configuration

### Findings

- **Good:** Security headers are configured (X-Frame-Options, X-Content-Type-Options, CSP-like Permissions-Policy).
- **Bad:** `env-template.txt` still mentions Supabase. `next.config.ts` references removed env vars.
- **Risk:** Base64 audio data is stored in IndexedDB without encryption. Not a critical issue for a local-only app, but worth noting.

### Recommendations

| Priority | Action |
|----------|--------|
| **P1** | Audit all env references. Remove `SUPABASE_*` from `next.config.ts` and docs. |
| **P2** | Add a `SECURITY.md` documenting the local-only privacy model. |

---

## Prioritized Roadmap

### Phase 1: Foundation (Week 1–2)
1. **Restructure into feature modules:** `features/stem-separation/`, `features/transcription/`, etc.
2. **Split `file-store.ts`** into focused stores.
3. **Create `AudioEngine` service** and replace all 6 decode patterns.
4. **Delete dead code** (`collaboration.tsx`, `project-storage.ts`, auth remnants).

### Phase 2: Workflow Engine (Week 3–4)
1. **Build `WorkflowEngine`** with step validation.
2. **Create `WorkflowPageShell`** shared across all processing pages.
3. **Unify export system** behind a single `ExportEngine` interface.

### Phase 3: Performance & Quality (Week 5–6)
1. **Move processing to Web Workers.**
2. **Add lazy loading** for heavy libraries.
3. **Add Vitest + Playwright** test scaffolding.
4. **Add bundle analyzer** and optimize largest chunks.

### Phase 4: Polish (Week 7)
1. **Fix COOP/COEP scoping.**
2. **Clean env vars and docs.**
3. **Accessibility audit** (ARIA labels, keyboard nav, focus traps).

---

## Bottom Line

The app **works** and builds cleanly, but it's one feature away from becoming unmaintainable. The two highest-leverage changes are:

1. **Feature module architecture** — stop writing 1,000-line pages.
2. **Unified audio service + workflow engine** — stop copy-pasting AudioContext logic and enforce the pipeline.

Everything else (tests, bundle splitting, dead code removal) becomes easy once those two are in place.
