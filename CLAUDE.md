# CLAUDE.md - Lithuanian Learning App Guidelines

This repository is a bare React Native application (v0.86+) designed for A1 Lithuanian practice, with a current focus on Listening and Speaking skills. Follow the conventions below when modifying code or generating new components.

## 1. Core Architecture & Tech Stack

* **Framework:** React Native (bare workflow, TypeScript) pinned to v0.86.3.
* **Audio Playback:** `expo-audio` (Note: `expo-av` is deprecated).
* **File Caching:** `expo-file-system` (Disk cache for audio files, surviving restarts).
* **Speech-to-Text (STT):** `@react-native-voice/voice` or API-based STT (e.g., OpenAI Whisper).
* **State Management:** Currently Local State + React Navigation parameters. Future migration to `Zustand` for global progress tracking.
* **Navigation:** React Navigation (`react-native-screens`).

## 2. Directory & Data Structure

* **Types:** All exercise interfaces and global types must be defined in `types/exercises.ts`. Delete or ignore legacy files like `types/learning.ts` or `exercisesTemplates.ts`.
* **Data Storage:** JSON-first content. Files must be placed strictly in:
  `assets/data/listening/{dialogues,numbers,drops}/{easy,medium,hard}_*.json`
* **Validation:** Every JSON file must be validated on load against `types/exercises.ts`. Errors must log the exact item ID and missing field.

## 3. Exercise Modes Specification

### Listening Module (Current Focus)
* **Mode 1: Dialogues:** Plays A1 dialogue audio. Transcripts (Lithuanian/English) **MUST BE HIDDEN BY DEFAULT**. Must support Replay (1.0x) and Slow (0.75x). Includes multiple-choice comprehension questions with immediate green/red feedback.
* **Mode 2: Numbers:** Randomized numeric practice. "Easy" uses 4-option multiple choice. "Medium" and "Hard" require typed inputs.
* **Mode 3: Drops (Passive Listening):** Background playback mode with auto-play. Plays a chime (`beepbeepbeep.mp3`) between drops. Includes full Lithuanian transcript and optional line-by-line English translation. Requires a draggable progress bar and timer (no quiz).

### Speaking Module (Upcoming)
* **Mode 4: Repeat (Shadowing):** Plays target audio $\rightarrow$ beep indicator $\rightarrow$ starts STT microphone listening. Requires a 3-attempt fail-safe before showing a "Skip" button.
* **Mode 5: AI Q&A:** Plays a Lithuanian prompt, records user response, evaluates via lightweight LLM for intent/keywords rather than exact string matching.

## 4. Audio & Background Implementation Rules

* **Player Status:** Always use the `usePlayerStatus` hook for audio to properly catch the "ready" signal, especially for files already stored in the `expo-file-system` cache.
* **Missing Audio:** If an item has an empty `audioUrl`, gracefully skip it and log a warning. Never crash the queue.
* **Background Playback:** Drops mode must utilize a single audio player for the whole session, driven by audio events, with lock-screen controls enabled so playback continues when the app is backgrounded.
* **Cache Management:** Downloaded audio files must fall back to streaming if the download fails. (Future requirement: Implement a cache size limit and cleanup routine).

## 5. Coding Conventions

* **Types First:** Never implement a feature without updating `types/exercises.ts`. Avoid `any`.
* **Atomic Components:** Keep UI components small.
* **Dependencies:** Zero speculative native dependencies. Ask for explicit approval before adding packages that require native linking or storage (like MMKV or AsyncStorage).
* **Linting & Tests:** Code must pass `eslint`, `tsc`, and `jest` tests cleanly. (Ensure Jest worker graceful exit warnings are addressed).
