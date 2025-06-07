import { supabase } from './supabase';
import {
  QuizSession,
  Participant,
  QuestionResponse,
  DatabaseSession,
  DatabaseParticipant,
  DatabaseResponse,
} from '../types';

class SessionService {
  private readonly sessionsTable = 'sessions';
  private readonly participantsTable = 'participants';
  private readonly responsesTable = 'responses';

  // Generate a 6-digit session code
  private generateSessionCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Check if session code is unique
  private async isCodeUnique(code: string): Promise<boolean> {
    const { data, error } = await supabase
      .from(this.sessionsTable)
      .select('id')
      .eq('code', code)
      .in('status', ['waiting', 'active', 'paused']);

    if (error) throw error;
    return data.length === 0;
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

  // Convert database objects to application format
  private convertDatabaseSession(data: DatabaseSession): QuizSession {
    return {
      id: data.id,
      quizId: data.quiz_id,
      code: data.code,
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      participants: [],
      createdBy: data.created_by,
    };
  }

  private convertDatabaseParticipant(data: DatabaseParticipant): Participant {
    return {
      id: data.id,
      name: data.name,
      sessionId: data.session_id,
      joinedAt: new Date(data.joined_at),
      status: data.status,
      currentQuestionIndex: data.current_question_index,
      score: data.score,
    };
  }

  private convertDatabaseResponse(data: DatabaseResponse): QuestionResponse {
    return {
      id: data.id,
      participantId: data.participant_id,
      questionId: data.question_id,
      answer: data.answer,
      isCorrect: data.is_correct,
      points: data.points,
      timeSpent: data.time_spent,
      submittedAt: new Date(data.submitted_at),
    };
  }

  // Create a new quiz session
  async createSession(quizId: string, createdBy: string): Promise<string> {
    try {
      const code = await this.generateUniqueCode();
      const now = new Date().toISOString();
      
      const sessionData = {
        quiz_id: quizId,
        code,
        status: 'waiting' as const,
        current_question_index: 0,
        created_by: createdBy,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from(this.sessionsTable)
        .insert([sessionData])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  // Update session status and properties
  async updateSession(sessionId: string, updates: Partial<QuizSession>): Promise<void> {
    try {
      const updateData: Partial<DatabaseSession> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.status) updateData.status = updates.status;
      if (updates.currentQuestionIndex !== undefined) updateData.current_question_index = updates.currentQuestionIndex;
      if (updates.startTime) updateData.start_time = updates.startTime.toISOString();
      if (updates.endTime) updateData.end_time = updates.endTime.toISOString();

      const { error } = await supabase
        .from(this.sessionsTable)
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<QuizSession | null> {
    try {
      const { data, error } = await supabase
        .from(this.sessionsTable)
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        throw error;
      }

      return this.convertDatabaseSession(data);
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error('Failed to get session');
    }
  }

  // Get session by code
  async getSessionByCode(code: string): Promise<QuizSession | null> {
    try {
      console.log('Searching for session with code:', code.toUpperCase());
      
      const { data, error } = await supabase
        .from(this.sessionsTable)
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      console.log('Session search result:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Session not found');
          return null; // Row not found
        }
        throw error;
      }

      const session = this.convertDatabaseSession(data);
      console.log('Converted session:', session);
      return session;
    } catch (error) {
      console.error('Error getting session by code:', error);
      throw new Error('Failed to find session');
    }
  }

  // Get all sessions for a teacher
  async getTeacherSessions(teacherId: string): Promise<QuizSession[]> {
    try {
      console.log('🔍 getTeacherSessions called with teacherId:', teacherId);
      
      const { data, error } = await supabase
        .from(this.sessionsTable)
        .select('*')
        .eq('created_by', teacherId)
        .order('updated_at', { ascending: false });

      console.log('🔍 Supabase query result:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      const sessions = data.map(session => this.convertDatabaseSession(session));
      console.log('🔍 Converted sessions:', sessions);
      return sessions;
    } catch (error) {
      console.error('❌ Error getting teacher sessions:', error);
      throw new Error('Failed to get sessions');
    }
  }

  // Add participant to session
  async addParticipant(sessionId: string, participant: Omit<Participant, 'id' | 'joinedAt'>): Promise<string> {
    try {
      console.log('Adding participant:', { sessionId, participant });
      
      const participantData = {
        name: participant.name,
        session_id: sessionId,
        status: participant.status,
        current_question_index: participant.currentQuestionIndex,
        score: participant.score,
        joined_at: new Date().toISOString(),
      };

      console.log('Participant data to insert:', participantData);

      const { data, error } = await supabase
        .from(this.participantsTable)
        .insert([participantData])
        .select('id')
        .single();

      console.log('Add participant result:', { data, error });

      if (error) throw error;
      
      // Update session with participant count (optional optimization)
      await this.updateSessionParticipantCount(sessionId);
      
      return data.id;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw new Error('Failed to join session');
    }
  }

  // Update participant status
  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<void> {
    try {
      const updateData: Partial<DatabaseParticipant> = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.currentQuestionIndex !== undefined) updateData.current_question_index = updates.currentQuestionIndex;
      if (updates.score !== undefined) updateData.score = updates.score;

      const { error } = await supabase
        .from(this.participantsTable)
        .update(updateData)
        .eq('id', participantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating participant:', error);
      throw new Error('Failed to update participant');
    }
  }

  // Get participants for a session
  async getSessionParticipants(sessionId: string): Promise<Participant[]> {
    try {
      const { data, error } = await supabase
        .from(this.participantsTable)
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return data.map(participant => this.convertDatabaseParticipant(participant));
    } catch (error) {
      console.error('Error getting participants:', error);
      throw new Error('Failed to get participants');
    }
  }

  // Submit question response
  async submitResponse(response: Omit<QuestionResponse, 'id' | 'submittedAt'>): Promise<string> {
    try {
      const responseData = {
        participant_id: response.participantId,
        question_id: response.questionId,
        answer: response.answer,
        is_correct: response.isCorrect,
        points: response.points,
        time_spent: response.timeSpent,
        session_id: '', // Will need to get this from participant
        submitted_at: new Date().toISOString(),
      };

      // Get session_id from participant
      const { data: participantData, error: participantError } = await supabase
        .from(this.participantsTable)
        .select('session_id')
        .eq('id', response.participantId)
        .single();

      if (participantError) throw participantError;
      responseData.session_id = participantData.session_id;

      const { data, error } = await supabase
        .from(this.responsesTable)
        .insert([responseData])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw new Error('Failed to submit response');
    }
  }

  // Get responses for a session and question
  async getQuestionResponses(sessionId: string, questionId: string): Promise<QuestionResponse[]> {
    try {
      const { data, error } = await supabase
        .from(this.responsesTable)
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', questionId)
        .order('submitted_at', { ascending: true });

      if (error) throw error;

      return data.map(response => this.convertDatabaseResponse(response));
    } catch (error) {
      console.error('Error getting responses:', error);
      throw new Error('Failed to get responses');
    }
  }

  // Get all responses for a session
  async getSessionResponses(sessionId: string): Promise<QuestionResponse[]> {
    try {
      const { data, error } = await supabase
        .from(this.responsesTable)
        .select('*')
        .eq('session_id', sessionId)
        .order('submitted_at', { ascending: true });

      if (error) throw error;

      return data.map(response => this.convertDatabaseResponse(response));
    } catch (error) {
      console.error('Error getting session responses:', error);
      throw new Error('Failed to get responses');
    }
  }

  // Subscribe to session updates
  subscribeToSession(sessionId: string, callback: (session: QuizSession | null) => void): () => void {
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.sessionsTable,
          filter: `id=eq.${sessionId}`
        },
        () => {
          this.getSession(sessionId).then(callback).catch(() => callback(null));
        }
      )
      .subscribe();

    // Initial fetch
    this.getSession(sessionId).then(callback).catch(() => callback(null));

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Subscribe to participants updates
  subscribeToParticipants(sessionId: string, callback: (participants: Participant[]) => void): () => void {
    const channel = supabase
      .channel(`participants-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.participantsTable,
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          this.getSessionParticipants(sessionId).then(callback).catch(() => callback([]));
        }
      )
      .subscribe();

    // Initial fetch
    this.getSessionParticipants(sessionId).then(callback).catch(() => callback([]));

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Subscribe to question responses
  subscribeToQuestionResponses(
    sessionId: string, 
    questionId: string, 
    callback: (responses: QuestionResponse[]) => void
  ): () => void {
    const channel = supabase
      .channel(`responses-${sessionId}-${questionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.responsesTable,
          filter: `session_id=eq.${sessionId},question_id=eq.${questionId}`
        },
        () => {
          this.getQuestionResponses(sessionId, questionId).then(callback).catch(() => callback([]));
        }
      )
      .subscribe();

    // Initial fetch
    this.getQuestionResponses(sessionId, questionId).then(callback).catch(() => callback([]));

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // End session and cleanup
  async endSession(sessionId: string): Promise<void> {
    try {
      // Update session status
      await supabase
        .from(this.sessionsTable)
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);

      // Update all participants to disconnected
      await supabase
        .from(this.participantsTable)
        .update({ status: 'disconnected' })
        .eq('session_id', sessionId);

    } catch (error) {
      console.error('Error ending session:', error);
      throw new Error('Failed to end session');
    }
  }

  // Delete session and all related data
  async deleteSession(sessionId: string): Promise<void> {
    try {
      // Delete responses first (foreign key dependency)
      await supabase
        .from(this.responsesTable)
        .delete()
        .eq('session_id', sessionId);

      // Delete participants
      await supabase
        .from(this.participantsTable)
        .delete()
        .eq('session_id', sessionId);

      // Delete session
      await supabase
        .from(this.sessionsTable)
        .delete()
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  }

  // Helper method to update participant count
  private async updateSessionParticipantCount(sessionId: string): Promise<void> {
    try {
      const participants = await this.getSessionParticipants(sessionId);
      await supabase
        .from(this.sessionsTable)
        .update({
          participant_count: participants.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
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