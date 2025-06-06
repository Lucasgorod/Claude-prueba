import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { authService, UserProfile } from '../services/authService';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        try {
          const profile = await authService.getUserProfile(user.id);
          setAuthState({
            user,
            profile,
            loading: false,
            error: null,
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          setAuthState({
            user,
            profile: null,
            loading: false,
            error: 'Failed to load user profile',
          });
        }
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const signInTeacher = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signInTeacher(email, password);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const registerTeacher = async (email: string, password: string, displayName: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.registerTeacher(email, password, displayName);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const signInStudent = async (studentName: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signInStudent(studentName);
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signOutUser();
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    signInTeacher,
    registerTeacher,
    signInStudent,
    signOut,
    clearError,
    isTeacher: authState.profile?.role === 'teacher' || authState.profile?.role === 'admin',
    isStudent: authState.profile?.role === 'student',
    isAuthenticated: !!authState.user,
  };
};