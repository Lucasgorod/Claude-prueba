import { supabase } from './supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: 'teacher' | 'student' | 'admin';
  created_at: string;
  last_login_at: string;
}

class AuthService {
  // Sign in teacher with email/password
  async signInTeacher(email: string, password: string): Promise<User> {
    try {
      console.log('AuthService: Starting sign in process for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign in');

      console.log('AuthService: Sign in successful, updating last login...');
      await this.updateLastLogin(data.user.id);
      console.log('AuthService: Last login updated, returning user');
      
      return data.user;
    } catch (error: any) {
      console.error('Error signing in teacher:', error);
      throw new Error(this.getAuthErrorMessage(error.message));
    }
  }

  // Register new teacher
  async registerTeacher(email: string, password: string, displayName: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: 'teacher'
          },
          emailRedirectTo: undefined // Disable email confirmation redirect
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign up');

      // Create user profile in database
      await this.createUserProfile(data.user.id, {
        id: data.user.id,
        email: data.user.email || null,
        display_name: displayName,
        role: 'teacher',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      });

      return data.user;
    } catch (error: any) {
      console.error('Error registering teacher:', error);
      throw new Error(this.getAuthErrorMessage(error.message));
    }
  }

  // Sign in student with temporary email (alternative to anonymous)
  async signInStudent(studentName: string): Promise<User> {
    try {
      // Create a temporary email for the student
      const tempEmail = `${studentName.toLowerCase().replace(/\s+/g, '')}_${Date.now()}@temp.student`;
      const tempPassword = 'student123';

      console.log('Creating temporary student account:', tempEmail);

      const { data, error } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            display_name: studentName,
            role: 'student'
          },
          emailRedirectTo: undefined // Disable email confirmation
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign up');

      // Store student profile in database
      await this.createUserProfile(data.user.id, {
        id: data.user.id,
        email: tempEmail,
        display_name: studentName,
        role: 'student',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      });

      return data.user;
    } catch (error: any) {
      console.error('Error signing in student:', error);
      throw new Error('Failed to join session. Please try again.');
    }
  }

  // Sign out current user
  async signOutUser(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }

  // Get user profile from database
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Row not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Create user profile in database
  private async createUserProfile(uid: string, profile: UserProfile): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([profile]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  // Update last login time
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', uid);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating last login:', error);
    }
  }

  // Convert Supabase auth error messages to user-friendly messages
  private getAuthErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password.';
    }
    if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists.';
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'Password should be at least 6 characters long.';
    }
    if (errorMessage.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('too many requests')) {
      return 'Too many failed attempts. Please try again later.';
    }
    if (errorMessage.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    return errorMessage || 'An error occurred. Please try again.';
  }

  // Check if user is teacher
  async isTeacher(uid: string): Promise<boolean> {
    const profile = await this.getUserProfile(uid);
    return profile?.role === 'teacher' || profile?.role === 'admin';
  }

  // Check if user is student
  async isStudent(uid: string): Promise<boolean> {
    const profile = await this.getUserProfile(uid);
    return profile?.role === 'student';
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  isValidPassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: 'Password is valid' };
  }
}

export const authService = new AuthService();