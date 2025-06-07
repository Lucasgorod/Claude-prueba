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

// Raw database row types returned by Supabase
export interface DatabaseQuiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DatabaseSession {
  id: string;
  quiz_id: string;
  code: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  current_question_index: number;
  start_time?: string;
  end_time?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseParticipant {
  id: string;
  name: string;
  session_id: string;
  joined_at: string;
  status: 'connected' | 'disconnected';
  current_question_index: number;
  score: number;
}

export interface DatabaseResponse {
  id: string;
  participant_id: string;
  question_id: string;
  session_id: string;
  answer: string | string[];
  is_correct: boolean;
  points: number;
  time_spent: number;
  submitted_at: string;
}