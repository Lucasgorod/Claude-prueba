import { useState, useEffect, useCallback } from 'react';
import { sessionService } from '../services/sessionService';
import { QuizSession, Participant, QuestionResponse } from '../types';
import { useAuth } from './useAuth';

interface SessionState {
  session: QuizSession | null;
  participants: Participant[];
  responses: QuestionResponse[];
  loading: boolean;
  error: string | null;
}

export const useSession = (sessionId?: string) => {
  const { user } = useAuth();
  const [sessionState, setSessionState] = useState<SessionState>({
    session: null,
    participants: [],
    responses: [],
    loading: false,
    error: null,
  });

  // Subscribe to session updates
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = sessionService.subscribeToSession(sessionId, (session) => {
      setSessionState(prev => ({
        ...prev,
        session,
        loading: false,
      }));
    });

    return unsubscribe;
  }, [sessionId]);

  // Subscribe to participants updates
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = sessionService.subscribeToParticipants(sessionId, (participants) => {
      setSessionState(prev => ({
        ...prev,
        participants,
      }));
    });

    return unsubscribe;
  }, [sessionId]);

  const createSession = async (quizId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      setSessionState(prev => ({ ...prev, loading: true, error: null }));
      const newSessionId = await sessionService.createSession(quizId, user.id);
      return newSessionId;
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create session',
      }));
      throw error;
    }
  };

  const joinSession = async (sessionCode: string, studentName: string): Promise<{ sessionId: string; participantId: string }> => {
    try {
      setSessionState(prev => ({ ...prev, loading: true, error: null }));
      
      // Find session by code
      const session = await sessionService.getSessionByCode(sessionCode);
      if (!session) {
        throw new Error('Session not found. Please check the code and try again.');
      }

      if (session.status === 'completed') {
        throw new Error('This session has already ended.');
      }

      // Add participant to session
      const participantId = await sessionService.addParticipant(session.id, {
        name: studentName,
        sessionId: session.id,
        status: 'connected',
        currentQuestionIndex: 0,
        score: 0,
      });

      setSessionState(prev => ({
        ...prev,
        session,
        loading: false,
      }));

      return { sessionId: session.id, participantId };
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to join session',
      }));
      throw error;
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      await sessionService.updateSession(sessionId, {
        status: 'active',
        startTime: new Date(),
      });
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to start session',
      }));
      throw error;
    }
  };

  const pauseSession = async (sessionId: string) => {
    try {
      await sessionService.updateSession(sessionId, {
        status: 'paused',
      });
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to pause session',
      }));
      throw error;
    }
  };

  const resumeSession = async (sessionId: string) => {
    try {
      await sessionService.updateSession(sessionId, {
        status: 'active',
      });
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to resume session',
      }));
      throw error;
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      await sessionService.endSession(sessionId);
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to end session',
      }));
      throw error;
    }
  };

  const nextQuestion = async (sessionId: string) => {
    try {
      const currentIndex = sessionState.session?.currentQuestionIndex || 0;
      await sessionService.updateSession(sessionId, {
        currentQuestionIndex: currentIndex + 1,
      });
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to advance question',
      }));
      throw error;
    }
  };

  const previousQuestion = async (sessionId: string) => {
    try {
      const currentIndex = sessionState.session?.currentQuestionIndex || 0;
      if (currentIndex > 0) {
        await sessionService.updateSession(sessionId, {
          currentQuestionIndex: currentIndex - 1,
        });
      }
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to go to previous question',
      }));
      throw error;
    }
  };

  const submitResponse = async (
    sessionId: string,
    participantId: string,
    questionId: string,
    answer: string | string[],
    timeSpent: number,
    isCorrect: boolean,
    points: number
  ) => {
    try {
      await sessionService.submitResponse({
        participantId,
        questionId,
        answer,
        isCorrect,
        points,
        timeSpent,
      });
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to submit response',
      }));
      throw error;
    }
  };

  const updateParticipantStatus = async (participantId: string, status: 'connected' | 'disconnected') => {
    try {
      await sessionService.updateParticipant(participantId, { status });
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to update participant status',
      }));
      throw error;
    }
  };

  const getSessionByCode = async (code: string): Promise<QuizSession | null> => {
    try {
      return await sessionService.getSessionByCode(code);
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to find session',
      }));
      return null;
    }
  };

  const getTeacherSessions = async (): Promise<QuizSession[]> => {
    if (!user) return [];

    try {
      return await sessionService.getTeacherSessions(user.id);
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to get sessions',
      }));
      return [];
    }
  };

  const subscribeToQuestionResponses = useCallback((questionId: string, callback: (responses: QuestionResponse[]) => void) => {
    if (!sessionId) return () => {};

    return sessionService.subscribeToQuestionResponses(sessionId, questionId, callback);
  }, [sessionId]);

  const getSessionStats = async (sessionId: string) => {
    try {
      return await sessionService.getSessionStats(sessionId);
    } catch (error: any) {
      setSessionState(prev => ({
        ...prev,
        error: error.message || 'Failed to get session stats',
      }));
      return null;
    }
  };

  const clearError = () => {
    setSessionState(prev => ({ ...prev, error: null }));
  };

  return {
    ...sessionState,
    createSession,
    joinSession,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    nextQuestion,
    previousQuestion,
    submitResponse,
    updateParticipantStatus,
    getSessionByCode,
    getTeacherSessions,
    subscribeToQuestionResponses,
    getSessionStats,
    clearError,
  };
};