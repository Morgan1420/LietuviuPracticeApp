export type ExerciseType = 'dialogue' | 'number' | 'drop' | 'repeat' | 'completeDialogue' | 'qa';

/** Listening module modes; also the keys of the remote content config. */
export type ListeningMode = 'dialogues' | 'numbers' | 'drops';

/** Where a loaded exercise set came from (remote first, then fallbacks). */
export type ContentSource = 'remote' | 'cache' | 'bundled';

export type Difficulty = 'easy' | 'medium' | 'hard';

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

export interface NumberChoices {
  options: DialogueOptions;
  correctOptionIndex: OptionIndex;
}

/**
 * Listening > Numbers. Easy files provide `choices` (multiple choice);
 * medium/hard are answered by typing, compared on digits only.
 */
export interface NumberExercise {
  id: string;
  type: 'number';
  context: string; // e.g. "Phone number", "Price"
  prompt: string; // e.g. "What number do you hear?"
  audioUrl: string;
  transcriptLt: string;
  answer: string; // Display form, e.g. "12,50 €" or "+370 698 76543"
  choices?: NumberChoices;
}

export interface DropLine {
  lt: string;
  en: string;
}

/** Listening > Drops: passive listening with a line-by-line transcript. */
export interface DropExercise {
  id: string;
  type: 'drop';
  title: string;
  topic: string;
  audioUrl: string;
  lines: DropLine[];
}

/** Speaking > Repeat (Shadowing) (stub — not implemented yet). */
export interface RepeatExercise {
  id: string;
  type: 'repeat';
  phraseLt: string;
  phraseEn: string;
  phoneticHint: string;
  audioUrl: string;
}

/** Speaking > Complete Dialogue (stub — not implemented yet). */
export interface CompleteDialogueExercise {
  id: string;
  type: 'completeDialogue';
  audioUrl: string;
  /** Dialogue lines; the learner says the line at `missingLineIndex`. */
  linesLt: string[];
  missingLineIndex: number;
}

/** Speaking > AI Q&A (stub — not implemented yet). */
export interface QAExercise {
  id: string;
  type: 'qa';
  promptLt: string;
  promptEn: string;
  audioUrl: string;
  expectedKeywords: string[];
}

export type Exercise =
  | DialogueExercise
  | NumberExercise
  | DropExercise
  | RepeatExercise
  | CompleteDialogueExercise
  | QAExercise;
