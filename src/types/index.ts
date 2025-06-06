export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  timeLimit?: number;
}

export type QuestionType = 'true-false' | 'multiple-choice' | 'match-columns' | 'open-text' | 'fill-in-blank';

export interface QuizSession {
  id: string;
  quizId: string;
  code: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  currentQuestionIndex: number;
  startTime?: Date;
  endTime?: Date;
  participants: Participant[];
  createdBy: string;
}

export interface Participant {
  id: string;
  name: string;
  sessionId: string;
  joinedAt: Date;
  status: 'connected' | 'disconnected';
  currentQuestionIndex: number;
  score: number;
}

export interface QuestionResponse {
  id: string;
  participantId: string;
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
  timeSpent: number;
  submittedAt: Date;
}

export interface LiveSessionData {
  session: QuizSession;
  participants: Participant[];
  responses: QuestionResponse[];
  currentQuestion: Question;
}

export interface MatchColumn {
  left: string[];
  right: string[];
  correctMatches: { [key: string]: string };
}