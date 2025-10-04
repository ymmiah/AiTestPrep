import { LiveServerMessage } from '@google/genai';

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: Role;
  text: string;
}

export interface Feedback {
  grammar: string;
  vocabulary: string;
  fluency: string;
  pronunciation: string;
}

export interface GeminiResponse {
  response: string;
  feedback: Feedback;
  pointsAwarded?: number;
}

export interface StudyPlan {
  [week: string]: {
    title: string;
    tasks: string[];
  };
}

export interface TopicQA {
  question: string;
  answer: string;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
}

export interface ListeningQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface ListeningExercise {
  audioSrc: string; // Placeholder for audio file URL
  title: string;
  questions: ListeningQuestion[];
}

export interface CommonMistake {
  incorrect: string;
  correct: string;
  explanation: string;
}

export interface ProgressStats {
  sessionsCompleted: number;
  avgPronunciationScore: number;
  listeningScore: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface GrammarQuiz {
  title: string;
  questions: QuizQuestion[];
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'AcademicCapIcon' | 'CardStackIcon' | 'ChatBubbleIcon';
}

export interface VocabularyItem {
  srsStage: number;
  nextReviewDate: string; // ISO date string
}

export interface UserProfile {
  name: string;
  points: number;
  badges: Badge[];
  referenceNumber: string | null;
  progressStats: ProgressStats;
  conversationHistory?: {
    [scenario: string]: Message[];
  };
  vocabularyProgress?: { [word: string]: VocabularyItem };
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isCurrentUser: boolean;
}

// Mock Test Types
export interface FinalAssessment {
  overallScore: number;
  feedback: Feedback;
  strengths: string;
  areasForImprovement: string;
}


// Notification System Types
export type NotificationType = 'success' | 'info' | 'achievement';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  action?: NotificationAction;
}
