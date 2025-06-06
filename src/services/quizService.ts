import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Quiz, Question } from '../types';

export interface FirebaseQuiz extends Omit<Quiz, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class QuizService {
  private readonly collection = 'quizzes';

  // Convert Firebase timestamp to Date
  private convertFirebaseQuiz(firebaseQuiz: any): Quiz {
    return {
      ...firebaseQuiz,
      createdAt: firebaseQuiz.createdAt?.toDate() || new Date(),
      updatedAt: firebaseQuiz.updatedAt?.toDate() || new Date(),
    };
  }

  // Create a new quiz
  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const quizData = {
        ...quiz,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.collection), quizData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Failed to create quiz');
    }
  }

  // Update an existing quiz
  async updateQuiz(quizId: string, updates: Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const quizRef = doc(db, this.collection, quizId);
      await updateDoc(quizRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw new Error('Failed to update quiz');
    }
  }

  // Delete a quiz
  async deleteQuiz(quizId: string): Promise<void> {
    try {
      const quizRef = doc(db, this.collection, quizId);
      await deleteDoc(quizRef);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw new Error('Failed to delete quiz');
    }
  }

  // Get a specific quiz by ID
  async getQuiz(quizId: string): Promise<Quiz | null> {
    try {
      const quizRef = doc(db, this.collection, quizId);
      const quizSnap = await getDoc(quizRef);
      
      if (quizSnap.exists()) {
        return this.convertFirebaseQuiz({ id: quizSnap.id, ...quizSnap.data() });
      }
      
      return null;
    } catch (error) {
      console.error('Error getting quiz:', error);
      throw new Error('Failed to get quiz');
    }
  }

  // Get all quizzes for a specific user
  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    try {
      const q = query(
        collection(db, this.collection),
        where('createdBy', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        this.convertFirebaseQuiz({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting user quizzes:', error);
      throw new Error('Failed to get quizzes');
    }
  }

  // Get all quizzes (for admin/public access)
  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const q = query(
        collection(db, this.collection),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => 
        this.convertFirebaseQuiz({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting all quizzes:', error);
      throw new Error('Failed to get quizzes');
    }
  }

  // Subscribe to real-time updates for user's quizzes
  subscribeToUserQuizzes(userId: string, callback: (quizzes: Quiz[]) => void): () => void {
    const q = query(
      collection(db, this.collection),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const quizzes = querySnapshot.docs.map(doc => 
        this.convertFirebaseQuiz({ id: doc.id, ...doc.data() })
      );
      callback(quizzes);
    }, (error) => {
      console.error('Error in quiz subscription:', error);
    });
  }

  // Subscribe to real-time updates for all quizzes
  subscribeToAllQuizzes(callback: (quizzes: Quiz[]) => void): () => void {
    const q = query(
      collection(db, this.collection),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const quizzes = querySnapshot.docs.map(doc => 
        this.convertFirebaseQuiz({ id: doc.id, ...doc.data() })
      );
      callback(quizzes);
    }, (error) => {
      console.error('Error in quiz subscription:', error);
    });
  }

  // Duplicate a quiz (for creating templates or copies)
  async duplicateQuiz(quizId: string, newTitle: string, userId: string): Promise<string> {
    try {
      const originalQuiz = await this.getQuiz(quizId);
      if (!originalQuiz) {
        throw new Error('Quiz not found');
      }

      const duplicatedQuiz = {
        ...originalQuiz,
        title: newTitle,
        createdBy: userId,
        // Generate new IDs for all questions
        questions: originalQuiz.questions.map(question => ({
          ...question,
          id: this.generateQuestionId(),
        })),
      };

      // Remove the original ID and timestamps
      delete (duplicatedQuiz as any).id;
      delete (duplicatedQuiz as any).createdAt;
      delete (duplicatedQuiz as any).updatedAt;

      return await this.createQuiz(duplicatedQuiz);
    } catch (error) {
      console.error('Error duplicating quiz:', error);
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
      console.error('Error getting quiz stats:', error);
      throw new Error('Failed to get quiz statistics');
    }
  }
}

export const quizService = new QuizService();