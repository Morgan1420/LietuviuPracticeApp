# CLAUDE.md - Lithuanian Listening App Guidelines

This repository is a **bare React Native** application designed for A1 Lithuanian listening, repeat, and conversational practice. Follow the conventions below when modifying code or generating new components.

---

## 1. Core Architecture & Tech Stack

* **Framework:** React Native (Bare Workflow - TypeScript)
* **Audio Playback:** `react-native-track-player` or `expo-av` (via Expo modules in bare workflow)
* **Speech-to-Text (STT):** `@react-native-voice/voice` or API-based STT (e.g., OpenAI Whisper for robust non-native Lithuanian phonetics)
* **State Management:** React Context or Zustand for exercise queues and user audio preferences
* **UI Utilities:** NativeWind / Tailwind CSS or standard `StyleSheet.create` with consistent tokens

---

## 2. Exercise Modes Specification

### Mode 1: Conversation Listening Practice
* **Core Flow:** Plays a short A1 dialogue audio clip (2–3 sentences) $\rightarrow$ presents a multiple-choice question with 4 options.
* **Audio Controls:** Must support Replay (1.0x speed) and Slow Replay (0.75x speed).
* **Text Visibility:** Transcripts (Lithuanian and English) **MUST BE HIDDEN BY DEFAULT**. Only render text when the user explicitly taps "Show Text".
* **Feedback:** Selecting an answer gives instant audio/visual feedback. Advance to the next question on correct selection.

### Mode 2: Repeat Practice (Pronunciation)
* **Core Flow:** Plays an audio clip (word or phrase) $\rightarrow$ sounds a beep indicator $\rightarrow$ starts microphone listening $\rightarrow$ compares user speech to source text.
* **STT Comparison Logic:** Clean transcriptions (ignore punctuation/case). If correct: trigger success sound/haptics and auto-advance.
* **Fail-Safe Mechanism:** On failure, repeat the target audio. **Never loop infinitely.** Max 3 failed attempts before offering an automatic "Skip" option or phonetic breakdown.

### Mode 3: Interactive Q&A Practice (Future Phase)
* **Core Flow:** Plays an AI-generated/prompt audio question in Lithuanian $\rightarrow$ user speaks a response $\rightarrow$ response is evaluated for contextual accuracy and basic A1 correctness.
* **Evaluation:** Uses lightweight LLM evaluation (e.g., Claude 3.5 Haiku) checking intent/keywords rather than exact string matching.

---

## 3. General Engineering Principles

* **Atomic Implementations:** Write small, single-purpose components and utility functions.
* **Types First:** Never implement an exercise feature without first updating or referencing `types/learning.ts`.
* **Zero Speculative Native Dependencies:** Do NOT introduce new native packages without explicit confirmation. Stick strictly to standard JavaScript/TypeScript utilities or existing native modules.
* **Error Handling & Logs:** Wrap all audio initializations and STT event listeners in try/catch blocks. Always log context-rich error messages (e.g., `[AudioPlayback Error]: ...`).

---

## 4. Audio & STT Implementation Rules

### Audio Playback
* Always ensure audio controls (Play, Pause, Replay, Play at 0.75x) cleanup their listeners on unmount.
* Keep audio source URLs abstracted in mock data or environment configurations.
* Implement a playback speed toggle utility (`setRate(0.75)` / `setRate(1.0)`) for A1 listening aids.

### Speech-to-Text (STT) & Speech Recognition
* Handle recognition states cleanly: `idle` | `listening` | `processing` | `matched` | `failed`.
* Include a fallback safety rule: Never trap the user in an infinite failure loop. Always expose a "Skip" mechanism or auto-bypass after 3 unsuccessful STT attempts.
* Accurately clean user transcription strings (strip whitespace, normalize diacritical marks if needed) before performing similarity comparison.

---

## 5. Design & UI Guidelines

* **Text Hiding Default:** In Mode 1 (Conversational Practice), hide Lithuanian transcripts and translations by default. Text must only render when the user explicitly triggers the "Show Text" toggle.
* **Auditory Feedback:** Trigger distinct, cheerful haptic/audio cues for correct answers and gentle, low-friction feedback for incorrect attempts.
* **Large Touch Targets:** Audio play buttons, repeat buttons, and recording triggers must be prominent and easily tappable.

---

## 6. Coding Conventions & Syntax

* Use standard React Native components (`View`, `Text`, `TouchableOpacity`, `Pressable`).
* Use functional components with hooks (`useState`, `useEffect`, `useCallback`, `useRef`).
* Write full TypeScript types for props, state, and API returns. Avoid `any`.

```typescript
// Good Example: Component Contract Structure
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DialogueExercise } from '../types/learning';

interface DialoguePlayerProps {
  exercise: DialogueExercise;
  onComplete: () => void;
}

export const DialoguePlayer: React.FC<DialoguePlayerProps> = ({ exercise, onComplete }) => {
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  // ... audio logic here
};
```


## 7. Data & Content Storage Guidelines
* **JSON-First Content:** All exercises must be stored in structured JSON format under `assets/data/`.
* **Schema Validation:** Ensure all JSON files conform strictly to the TypeScript interfaces defined in `exercisesTemplates.ts`.
* **Decoupled Assets:** Keep audio URLs or audio file references abstracted inside the JSON schema rather than hardcoding audio paths inside React Native components.