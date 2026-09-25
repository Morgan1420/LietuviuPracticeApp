export type ExerciseType = 'dialogue' | 'repeat' | 'qa';

export interface DialogueQuestion {
  id: string;
  questionText: string; // e.g. "At what time are they meeting?"
  options: [string, string, string, string]; // Exactly 4 options
  correctOptionIndex: number;
  explanation?: string;
}

export interface DialogueExercise {
  id: string;
  type: 'dialogue';
  title: string;
  topic: string; // e.g. "Greetings", "At the Cafe"
  audioUrl: string; // Remote URL or local asset path
  transcriptLt: string;
  transcriptEn: string;
  keyVocabulary: Array<{ lt: string; en: string }>;
  questions: DialogueQuestion[];
}

export interface RepeatExercise {
  id: string;
  type: 'repeat';
  phraseLt: string;
  phraseEn: string;
  phoneticHint: string;
  audioUrl: string;
}

export type Exercise = DialogueExercise | RepeatExercise;