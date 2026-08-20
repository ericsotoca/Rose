/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Slide {
  title: string;
  content: string[];
  visualType?: 'neuro' | 'timeline' | 'container' | 'metrics' | 'interweave' | 'body' | 'closure' | 'reval';
}

export interface Module {
  id: number;
  title: string;
  subtitle: string;
  phases: string;
  summary: string;
  slides: Slide[];
  verbatim: { therapist: string; patient: string }[];
  pitfalls: string[];
  quiz: QuizQuestion[];
}

export interface GlossaryEntry {
  term: string;
  definition: string;
  category: 'Neurobiologie' | 'Échelles' | 'Protocoles' | 'Techniques' | 'Général';
}

export interface TargetingData {
  id: string;
  date: string;
  situation: string;
  cognitionNegative: string;
  cognitionPositive: string;
  voc: number; // 1 to 7
  sud: number; // 0 to 10
  emotions: string;
  somatization: string;
  somatizationLocation: string; // localized body part
}

export interface LoversPhrase {
  id: string;
  category: 'Romance' | 'Désir' | 'Intime' | 'Après';
  french: string;
  english: string;
  thai: string;
  thaiPhonetic: string;
  frenchPhoneticForThai?: string; // Phonetics of French for Thai speaker
}

export interface CustomPhrase {
  id: string;
  french: string;
  english: string;
  thai: string;
  thaiPhonetic: string;
}
