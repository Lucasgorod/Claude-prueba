import { supabase } from './supabase';
import { Quiz, Question } from '../types';
import { logger } from './logger';

export interface DatabaseQuiz extends Omit<Quiz, 'createdAt' | 'updatedAt'> {
  created_at: string;
  updated_at: string;
  created_by: string;
}

class QuizService {
  private readonly table = 'quizzes';

  // Convert database quiz to application format
  private convertDatabaseQuiz(dbQuiz: any): Quiz {
    return {
      ...dbQuiz,
      createdAt: new Date(dbQuiz.created_at),
      updatedAt: new Date(dbQuiz.updated_at),
      createdBy: dbQuiz.created_by,
    };
  }

  // Create a new quiz
  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      logger.debug('Creating quiz with data:', quiz);
      
      const now = new Date().toISOString();
      const quizData = {
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        created_by: quiz.createdBy,
        created_at: now,
        updated_at: now,
      };

      logger.debug('Formatted quiz data:', quizData);

      const { data, error } = await supabase
        .from(this.table)
        .insert([quizData])
        .select('id')
        .single();

      logger.debug('Supabase response:', { data, error });

      if (error) {
        logger.error('Supabase error details:', error);
        throw error;
      }
      
      return data.id;
    } catch (error) {
      logger.error('Error creating quiz:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create quiz: ${error.message}`);
      }
      throw new Error('Failed to create quiz');
    }
  }

  // Update an existing quiz
  async updateQuiz(quizId: string, updates: Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.questions) updateData.questions = updates.questions;
      if (updates.createdBy) updateData.created_by = updates.createdBy;

      const { error } = await supabase
        .from(this.table)
        .update(updateData)
        .eq('id', quizId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error updating quiz:', error);
      throw new Error('Failed to update quiz');
    }
  }

  // Delete a quiz
  async deleteQuiz(quizId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', quizId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting quiz:', error);
      throw new Error('Failed to delete quiz');
    }
  }

  // Get a specific quiz by ID
  async getQuiz(quizId: string): Promise<Quiz | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        throw error;
      }

      return this.convertDatabaseQuiz(data);
    } catch (error) {
      logger.error('Error getting quiz:', error);
      throw new Error('Failed to get quiz');
    }
  }

  // Get all quizzes for a specific user
  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('created_by', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(quiz => this.convertDatabaseQuiz(quiz));
    } catch (error) {
      logger.error('Error getting user quizzes:', error);
      throw new Error('Failed to get quizzes');
    }
  }

  // Get all quizzes (for admin/public access)
  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(quiz => this.convertDatabaseQuiz(quiz));
    } catch (error) {
      logger.error('Error getting all quizzes:', error);
      throw new Error('Failed to get quizzes');
    }
  }

  // Subscribe to real-time updates for user's quizzes
  subscribeToUserQuizzes(userId: string, callback: (quizzes: Quiz[]) => void): () => void {
    const channel = supabase
      .channel('user-quizzes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.table,
          filter: `created_by=eq.${userId}`
        },
        () => {
          // Fetch updated data when changes occur
          this.getUserQuizzes(userId).then(callback).catch(err => logger.error(err));
        }
      )
      .subscribe();

    // Initial fetch
    this.getUserQuizzes(userId).then(callback).catch(err => logger.error(err));

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Subscribe to real-time updates for all quizzes
  subscribeToAllQuizzes(callback: (quizzes: Quiz[]) => void): () => void {
    const channel = supabase
      .channel('all-quizzes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.table
        },
        () => {
          // Fetch updated data when changes occur
          this.getAllQuizzes().then(callback).catch(err => logger.error(err));
        }
      )
      .subscribe();

    // Initial fetch
    this.getAllQuizzes().then(callback).catch(err => logger.error(err));

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Duplicate a quiz (for creating templates or copies)
  async duplicateQuiz(quizId: string, newTitle: string, userId: string): Promise<string> {
    try {
      const originalQuiz = await this.getQuiz(quizId);
      if (!originalQuiz) {
        throw new Error('Quiz not found');
      }

      const duplicatedQuiz = {
        title: newTitle,
        description: originalQuiz.description,
        createdBy: userId,
        // Generate new IDs for all questions
        questions: originalQuiz.questions.map(question => ({
          ...question,
          id: this.generateQuestionId(),
        })),
      };

      return await this.createQuiz(duplicatedQuiz);
    } catch (error) {
      logger.error('Error duplicating quiz:', error);
      throw new Error('Failed to duplicate quiz');
    }
  }

  // Helper method to generate question IDs
  private generateQuestionId(): string {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validate quiz data before saving
  validateQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): boolean {
    if (!quiz.title?.trim()) return false;
    if (!quiz.questions || quiz.questions.length === 0) return false;
    
    // Validate each question
    return quiz.questions.every(question => {
      if (!question.question?.trim()) return false;
      if (question.points <= 0) return false;
      
      // Type-specific validations
      switch (question.type) {
        case 'multiple-choice':
          return question.options && 
                 question.options.length >= 2 && 
                 question.correctAnswer &&
                 question.options.includes(question.correctAnswer as string);
        
        case 'true-false':
          return ['true', 'false'].includes(question.correctAnswer as string);
        
        case 'fill-in-blank':
          return question.correctAnswer && (question.correctAnswer as string).trim().length > 0;
        
        case 'match-columns':
          try {
            const matches = JSON.parse(question.correctAnswer as string);
            return matches && Object.keys(matches).length > 0;
          } catch {
            return false;
          }
        
        case 'open-text':
          return true; // Open text questions don't need specific validation
        
        default:
          return false;
      }
    });
  }

  // Get quiz statistics
  async getQuizStats(quizId: string): Promise<{
    totalQuestions: number;
    totalPoints: number;
    estimatedDuration: number;
    questionTypes: { [key: string]: number };
  }> {
    try {
      const quiz = await this.getQuiz(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const totalQuestions = quiz.questions.length;
      const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      const estimatedDuration = quiz.questions.reduce((sum, q) => sum + (q.timeLimit || 30), 0);
      
      const questionTypes: { [key: string]: number } = {};
      quiz.questions.forEach(q => {
        questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
      });

      return {
        totalQuestions,
        totalPoints,
        estimatedDuration,
        questionTypes,
      };
    } catch (error) {
      logger.error('Error getting quiz stats:', error);
      throw new Error('Failed to get quiz statistics');
    }
  }
}

export const quizService = new QuizService();