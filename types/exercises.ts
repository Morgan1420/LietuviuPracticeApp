export type ExerciseType = 'dialogue' | 'repeat' | 'qa';

/** Index into a DialogueQuestion's 4-option tuple. */
export type OptionIndex = 0 | 1 | 2 | 3;

export type DialogueOptions = [string, string, string, string];

export interface VocabularyItem {
  lt: string;
  en: string;
}

export interface DialogueQuestion {
  id: string;
  questionText: string; // e.g. "At what time are they meeting?"
  options: DialogueOptions; // Exactly 4 options
  correctOptionIndex: OptionIndex;
  explanation: string;
}

/** Mode 1: Conversation Listening Practice. */
export interface DialogueExercise {
  id: string;
  type: 'dialogue';
  title: string;
  topic: string; // e.g. "Greetings", "At the Cafe"
  audioUrl: string; // Remote URL; resolved via src/audio/resolveAudioSource
  transcriptLt: string;
  transcriptEn: string;
  keyVocabulary: VocabularyItem[];
  questions: DialogueQuestion[];
}

/** Mode 2: Repeat Practice (stub — not implemented yet). */
export interface RepeatExercise {
  id: string;
  type: 'repeat';
  phraseLt: string;
  phraseEn: string;
  phoneticHint: string;
  audioUrl: string;
}

/** Mode 3: Interactive Q&A (stub — not implemented yet). */
export interface QAExercise {
  id: string;
  type: 'qa';
  promptLt: string;
  promptEn: string;
  audioUrl: string;
  expectedKeywords: string[];
}

export type Exercise = DialogueExercise | RepeatExercise | QAExercise;
