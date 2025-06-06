import { useState, useEffect } from 'react';
import { quizService } from '../services/quizService';
import { Quiz } from '../types';
import { useAuth } from './useAuth';

interface QuizState {
  quizzes: Quiz[];
  loading: boolean;
  error: string | null;
}

export const useQuiz = () => {
  const { user, isTeacher } = useAuth();
  const [quizState, setQuizState] = useState<QuizState>({
    quizzes: [],
    loading: false,
    error: null,
  });

  // Load quizzes when user changes
  useEffect(() => {
    if (user && isTeacher) {
      loadUserQuizzes();
    } else {
      setQuizState({ quizzes: [], loading: false, error: null });
    }
  }, [user, isTeacher]);

  const loadUserQuizzes = async () => {
    if (!user) return;
    
    try {
      setQuizState(prev => ({ ...prev, loading: true, error: null }));
      const quizzes = await quizService.getUserQuizzes(user.uid);
      setQuizState({ quizzes, loading: false, error: null });
    } catch (error: any) {
      console.error('Error loading quizzes:', error);
      setQuizState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load quizzes',
      }));
    }
  };

  const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      
      setQuizState(prev => ({ ...prev, loading: true, error: null }));
      
      // Validate quiz before saving
      if (!quizService.validateQuiz(quizData)) {
        throw new Error('Quiz validation failed. Please check all required fields.');
      }

      const quizId = await quizService.createQuiz({
        ...quizData,
        createdBy: user.uid,
      });
      
      // Reload quizzes after creation
      await loadUserQuizzes();
      
      return quizId;
    } catch (error: any) {
      setQuizState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to create quiz',
      }));
      throw error;
    }
  };

  const updateQuiz = async (quizId: string, updates: Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setQuizState(prev => ({ ...prev, loading: true, error: null }));
      
      await quizService.updateQuiz(quizId, updates);
      
      // Reload quizzes after update
      await loadUserQuizzes();
    } catch (error: any) {
      setQuizState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to update quiz',
      }));
      throw error;
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      setQuizState(prev => ({ ...prev, loading: true, error: null }));
      
      await quizService.deleteQuiz(quizId);
      
      // Remove quiz from local state immediately
      setQuizState(prev => ({
        ...prev,
        quizzes: prev.quizzes.filter(quiz => quiz.id !== quizId),
        loading: false,
      }));
    } catch (error: any) {
      setQuizState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to delete quiz',
      }));
      throw error;
    }
  };

  const duplicateQuiz = async (quizId: string, newTitle: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setQuizState(prev => ({ ...prev, loading: true, error: null }));
      
      const newQuizId = await quizService.duplicateQuiz(quizId, newTitle, user.uid);
      
      // Reload quizzes after duplication
      await loadUserQuizzes();
      
      return newQuizId;
    } catch (error: any) {
      setQuizState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to duplicate quiz',
      }));
      throw error;
    }
  };

  const getQuiz = async (quizId: string): Promise<Quiz | null> => {
    try {
      return await quizService.getQuiz(quizId);
    } catch (error: any) {
      setQuizState(prev => ({
        ...prev,
        error: error.message || 'Failed to get quiz',
      }));
      return null;
    }
  };

  const getQuizStats = async (quizId: string) => {
    try {
      return await quizService.getQuizStats(quizId);
    } catch (error: any) {
      setQuizState(prev => ({
        ...prev,
        error: error.message || 'Failed to get quiz stats',
      }));
      return null;
    }
  };

  const clearError = () => {
    setQuizState(prev => ({ ...prev, error: null }));
  };

  return {
    ...quizState,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    duplicateQuiz,
    getQuiz,
    getQuizStats,
    loadUserQuizzes,
    clearError,
  };
};