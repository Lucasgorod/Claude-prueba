import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { QuizSession, Participant, QuestionResponse } from '../types';

export interface FirebaseSession extends Omit<QuizSession, 'startTime' | 'endTime'> {
  startTime?: Timestamp;
  endTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseParticipant extends Omit<Participant, 'joinedAt'> {
  joinedAt: Timestamp;
}

export interface FirebaseResponse extends Omit<QuestionResponse, 'submittedAt'> {
  submittedAt: Timestamp;
}

class SessionService {
  private readonly sessionsCollection = 'sessions';
  private readonly participantsCollection = 'participants';
  private readonly responsesCollection = 'responses';

  // Generate a 6-digit session code
  private generateSessionCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Check if session code is unique
  private async isCodeUnique(code: string): Promise<boolean> {
    const q = query(
      collection(db, this.sessionsCollection),
      where('code', '==', code),
      where('status', 'in', ['waiting', 'active', 'paused'])
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  }

  // Generate unique session code
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    
    do {
      code = this.generateSessionCode();
      isUnique = await this.isCodeUnique(code);
    } while (!isUnique);
    
    return code;
  }

  // Convert Firebase timestamps to Date objects
  private convertFirebaseSession(data: any): QuizSession {
    return {
      ...data,
      startTime: data.startTime?.toDate(),
      endTime: data.endTime?.toDate(),
      participants: data.participants || [],
    };
  }

  private convertFirebaseParticipant(data: any): Participant {
    return {
      ...data,
      joinedAt: data.joinedAt?.toDate() || new Date(),
    };
  }

  private convertFirebaseResponse(data: any): QuestionResponse {
    return {
      ...data,
      submittedAt: data.submittedAt?.toDate() || new Date(),
    };
  }

  // Create a new quiz session
  async createSession(quizId: string, createdBy: string): Promise<string> {
    try {
      const code = await this.generateUniqueCode();
      
      const sessionData = {
        quizId,
        code,
        status: 'waiting' as const,
        currentQuestionIndex: 0,
        createdBy,
        participants: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.sessionsCollection), sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  // Update session status and properties
  async updateSession(sessionId: string, updates: Partial<QuizSession>): Promise<void> {
    try {
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Convert Date objects to Timestamps for Firebase
      if (updates.startTime) {
        updateData.startTime = updates.startTime;
      }
      if (updates.endTime) {
        updateData.endTime = updates.endTime;
      }

      await updateDoc(sessionRef, updateData);
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<QuizSession | null> {
    try {
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        return this.convertFirebaseSession({ id: sessionSnap.id, ...sessionSnap.data() });
      }
      
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error('Failed to get session');
    }
  }

  // Get session by code
  async getSessionByCode(code: string): Promise<QuizSession | null> {
    try {
      const q = query(
        collection(db, this.sessionsCollection),
        where('code', '==', code.toUpperCase())
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return this.convertFirebaseSession({ id: doc.id, ...doc.data() });
      }
      
      return null;
    } catch (error) {
      console.error('Error getting session by code:', error);
      throw new Error('Failed to find session');
    }
  }

  // Get all sessions for a teacher
  async getTeacherSessions(teacherId: string): Promise<QuizSession[]> {
    try {
      const q = query(
        collection(db, this.sessionsCollection),
        where('createdBy', '==', teacherId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        this.convertFirebaseSession({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting teacher sessions:', error);
      throw new Error('Failed to get sessions');
    }
  }

  // Add participant to session
  async addParticipant(sessionId: string, participant: Omit<Participant, 'id' | 'joinedAt'>): Promise<string> {
    try {
      const participantData = {
        ...participant,
        sessionId,
        joinedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.participantsCollection), participantData);
      
      // Update session with participant count (optional optimization)
      await this.updateSessionParticipantCount(sessionId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw new Error('Failed to join session');
    }
  }

  // Update participant status
  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<void> {
    try {
      const participantRef = doc(db, this.participantsCollection, participantId);
      await updateDoc(participantRef, updates);
    } catch (error) {
      console.error('Error updating participant:', error);
      throw new Error('Failed to update participant');
    }
  }

  // Get participants for a session
  async getSessionParticipants(sessionId: string): Promise<Participant[]> {
    try {
      const q = query(
        collection(db, this.participantsCollection),
        where('sessionId', '==', sessionId),
        orderBy('joinedAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        this.convertFirebaseParticipant({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting participants:', error);
      throw new Error('Failed to get participants');
    }
  }

  // Submit question response
  async submitResponse(response: Omit<QuestionResponse, 'id' | 'submittedAt'>): Promise<string> {
    try {
      const responseData = {
        ...response,
        submittedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.responsesCollection), responseData);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw new Error('Failed to submit response');
    }
  }

  // Get responses for a session and question
  async getQuestionResponses(sessionId: string, questionId: string): Promise<QuestionResponse[]> {
    try {
      const q = query(
        collection(db, this.responsesCollection),
        where('sessionId', '==', sessionId),
        where('questionId', '==', questionId),
        orderBy('submittedAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        this.convertFirebaseResponse({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting responses:', error);
      throw new Error('Failed to get responses');
    }
  }

  // Get all responses for a session
  async getSessionResponses(sessionId: string): Promise<QuestionResponse[]> {
    try {
      const q = query(
        collection(db, this.responsesCollection),
        where('sessionId', '==', sessionId),
        orderBy('submittedAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => 
        this.convertFirebaseResponse({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting session responses:', error);
      throw new Error('Failed to get responses');
    }
  }

  // Subscribe to session updates
  subscribeToSession(sessionId: string, callback: (session: QuizSession | null) => void): () => void {
    const sessionRef = doc(db, this.sessionsCollection, sessionId);
    
    return onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const session = this.convertFirebaseSession({ id: doc.id, ...doc.data() });
        callback(session);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in session subscription:', error);
      callback(null);
    });
  }

  // Subscribe to participants updates
  subscribeToParticipants(sessionId: string, callback: (participants: Participant[]) => void): () => void {
    const q = query(
      collection(db, this.participantsCollection),
      where('sessionId', '==', sessionId),
      orderBy('joinedAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const participants = snapshot.docs.map(doc => 
        this.convertFirebaseParticipant({ id: doc.id, ...doc.data() })
      );
      callback(participants);
    }, (error) => {
      console.error('Error in participants subscription:', error);
      callback([]);
    });
  }

  // Subscribe to question responses
  subscribeToQuestionResponses(
    sessionId: string, 
    questionId: string, 
    callback: (responses: QuestionResponse[]) => void
  ): () => void {
    const q = query(
      collection(db, this.responsesCollection),
      where('sessionId', '==', sessionId),
      where('questionId', '==', questionId),
      orderBy('submittedAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const responses = snapshot.docs.map(doc => 
        this.convertFirebaseResponse({ id: doc.id, ...doc.data() })
      );
      callback(responses);
    }, (error) => {
      console.error('Error in responses subscription:', error);
      callback([]);
    });
  }

  // End session and cleanup
  async endSession(sessionId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Update session status
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      batch.update(sessionRef, {
        status: 'completed',
        endTime: new Date(),
        updatedAt: serverTimestamp(),
      });

      // Update all participants to disconnected
      const participantsQuery = query(
        collection(db, this.participantsCollection),
        where('sessionId', '==', sessionId)
      );
      
      const participantsSnapshot = await getDocs(participantsQuery);
      participantsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'disconnected' });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error ending session:', error);
      throw new Error('Failed to end session');
    }
  }

  // Delete session and all related data
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete session
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      batch.delete(sessionRef);

      // Delete participants
      const participantsQuery = query(
        collection(db, this.participantsCollection),
        where('sessionId', '==', sessionId)
      );
      const participantsSnapshot = await getDocs(participantsQuery);
      participantsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete responses
      const responsesQuery = query(
        collection(db, this.responsesCollection),
        where('sessionId', '==', sessionId)
      );
      const responsesSnapshot = await getDocs(responsesQuery);
      responsesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  }

  // Helper method to update participant count
  private async updateSessionParticipantCount(sessionId: string): Promise<void> {
    try {
      const participants = await this.getSessionParticipants(sessionId);
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      await updateDoc(sessionRef, {
        participantCount: participants.length,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating participant count:', error);
    }
  }

  // Get session statistics
  async getSessionStats(sessionId: string): Promise<{
    totalParticipants: number;
    activeParticipants: number;
    totalResponses: number;
    averageResponseTime: number;
  }> {
    try {
      const [participants, responses] = await Promise.all([
        this.getSessionParticipants(sessionId),
        this.getSessionResponses(sessionId)
      ]);

      const activeParticipants = participants.filter(p => p.status === 'connected').length;
      const totalResponses = responses.length;
      
      // Calculate average response time
      const responseTimes = responses.map(r => r.timeSpent || 0);
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;

      return {
        totalParticipants: participants.length,
        activeParticipants,
        totalResponses,
        averageResponseTime: Math.round(averageResponseTime),
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      throw new Error('Failed to get session statistics');
    }
  }
}

export const sessionService = new SessionService();