// FIX: Moved View type here from A2App.tsx to make it globally available and resolve import errors.
export type View = 'dashboard' | 'simulator' | 'vocabulary' | 'listening' | 'grammar' | 'planner' | 'topicPractice' | 'leaderboard' | 'mockTest' | 'pronunciation';
export type Module = 'landing' | 'a2' | 'ielts' | 'academic' | 'profile';

export type Theme = 'light' | 'dark' | 'oceanic';

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
  rawJson?: string;
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
  type: string; // e.g., 'noun', 'verb'
  pronunciation: string; // e.g., /dɪˈlɪʃəs/
}

// New types for the story-based Vocabulary Builder
export interface VocabularyChallenge {
  word: string;
  definition: string;
  type: string;
  pronunciation: string;
  distractors: string[]; // Incorrect words for multiple-choice
}

export type StoryChunk = string | { challenge: VocabularyChallenge };

export interface VocabularyStory {
  title: string;
  chunks: StoryChunk[];
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

// Deprecated, use A2Progress instead. Kept for migration.
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

// New Centralized Progress Types
export interface A2Progress {
    sessionsCompleted: number;
    avgPronunciationScore: number;
    listeningScore: number;
}
export interface IELTSProgress {
    writingTasksCompleted: number;
    avgWritingBand: number;
    listeningExercisesCompleted: number;
    avgListeningScore: number; // as a percentage
    readingExercisesCompleted: number;
    avgReadingScore: number; // as a percentage
    speakingSessionsCompleted: number;
    avgSpeakingBand: number;
}
export interface AcademicProgress {
    assignmentsChecked: number;
}

export interface UserProfile {
  name: string;
  points: number;
  badges: Badge[];
  referenceNumber: string | null;
  theme: Theme;
  progressStats?: ProgressStats; // Kept for migration from old structure
  progress: {
      a2: A2Progress;
      ielts: IELTSProgress;
      academic: AcademicProgress;
  };
  conversationHistory?: {
    [scenario: string]: Message[];
  };
  vocabularyProgress?: { [word: string]: VocabularyItem };
  isDeveloperMode?: boolean;
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

export interface TranscriptAnalysis {
    pictureDescriptionAnalysis: {
        modelAnswer: string;
        userPerformanceFeedback: string;
    };
    conversationAnalysis: Array<{
        userTurn: string;
        feedback: string;
        suggestion: string;
    }>;
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

// Pronunciation Practice Types
export interface WordFeedback {
    word: string;
    feedback: string;
    isCorrect: boolean;
}

export interface PronunciationFeedback {
    overallFeedback: string;
    wordAnalysis: WordFeedback[];
}

// New type for Topic Practice answer analysis
export interface AnswerAnalysis {
    feedback: string;
    suggestion: string;
}


// IELTS Types
export interface IELTSWritingFeedback {
  overallBand: number;
  taskAchievement: { score: number; feedback: string; };
  coherenceAndCohesion: { score: number; feedback:string; };
  lexicalResource: { score: number; feedback: string; };
  grammaticalRangeAndAccuracy: { score: number; feedback: string; };
  suggestedImprovements: string;
}

export interface IELTSListeningFormQuestion {
    questionType: 'FORM';
    questionNumber: number;
    questionText: string; // e.g., "Name of caller: _____"
    correctAnswer: string;
}

export interface IELTSListeningMCQ {
    questionType: 'MCQ';
    questionNumber: number;
    questionText: string;
    options: string[];
    correctAnswer: string; // The text of the correct option
}

export type IELTSListeningQuestion = IELTSListeningFormQuestion | IELTSListeningMCQ;


export interface IELTSListeningExercise {
    title: string;
    audioDuration: number; // Estimated duration in seconds
    script: string;
    questions: IELTSListeningQuestion[];
}

// IELTS Reading Types
export interface IELTSReadingMCQ {
    questionType: 'MCQ';
    questionText: string;
    options: string[];
    correctAnswer: string; // The text of the correct option
}

export interface IELTSReadingTFNG {
    questionType: 'TFNG';
    statement: string;
    correctAnswer: 'TRUE' | 'FALSE' | 'NOT GIVEN';
}

export type IELTSReadingQuestion = IELTSReadingMCQ | IELTSReadingTFNG;

export interface IELTSReadingExercise {
    title: string;
    passage: string;
    questions: IELTSReadingQuestion[];
}

// IELTS Speaking Types
export interface IELTSCueCard {
    topic: string;
    points: string[]; // e.g., ["Describe...", "Say who...", "Explain why..."]
}

export interface IELTSSpeakingScript {
    part1Questions: string[];
    part2CueCard: IELTSCueCard;
    part3Questions: string[];
}

export interface IELTSSpeakingFeedback {
  overallBand: number;
  fluencyAndCoherence: { score: number; feedback: string; };
  lexicalResource: { score: number; feedback: string; };
  grammaticalRangeAndAccuracy: { score: number; feedback: string; };
  pronunciation: { score: number; feedback: string; };
  suggestedImprovements: string;
}

// Academic Writing Helper Types
export interface BritishEnglishCorrection {
    original_us: string;
    corrected_uk: string;
    explanation: string;
}

export interface WritingSuggestion {
    original_excerpt: string;
    suggestion_for_improvement: string;
}

export interface AcademicFeedback {
    overall_assessment: string;
    structural_feedback: string;
    clarity_and_style_feedback: string;
    improvement_suggestions: WritingSuggestion[];
    corrections: BritishEnglishCorrection[];
}

export interface AcademicSource {
    title: string;
    uri: string;
}
