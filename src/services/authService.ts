import { 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'teacher' | 'student' | 'admin';
  createdAt: Date;
  lastLoginAt: Date;
}

class AuthService {
  // Sign in teacher with email/password
  async signInTeacher(email: string, password: string): Promise<User> {
    try {
      console.log('AuthService: Starting sign in process for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthService: Sign in successful, updating last login...');
      await this.updateLastLogin(result.user.uid);
      console.log('AuthService: Last login updated, returning user');
      return result.user;
    } catch (error: any) {
      console.error('Error signing in teacher:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Register new teacher
  async registerTeacher(email: string, password: string, displayName: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(result.user, { displayName });
      
      // Create user document in Firestore
      await this.createUserProfile(result.user.uid, {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        role: 'teacher',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });

      return result.user;
    } catch (error: any) {
      console.error('Error registering teacher:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign in student anonymously
  async signInStudent(studentName: string): Promise<User> {
    try {
      const result = await signInAnonymously(auth);
      
      // Update user profile with display name
      await updateProfile(result.user, { displayName: studentName });
      
      // Store student name in Firestore
      await this.createUserProfile(result.user.uid, {
        uid: result.user.uid,
        email: null,
        displayName: studentName,
        role: 'student',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });

      return result.user;
    } catch (error: any) {
      console.error('Error signing in student:', error);
      throw new Error('Failed to join session. Please try again.');
    }
  }

  // Sign out current user
  async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Create user profile in Firestore
  private async createUserProfile(uid: string, profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...profile,
        createdAt: profile.createdAt,
        lastLoginAt: profile.lastLoginAt,
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  // Update last login time
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: new Date(),
      });
    } catch (error: any) {
      console.error('Error updating last login:', error);
      // Don't throw error for quota exceeded - allow login to continue
      if (error.code === 'resource-exhausted') {
        console.warn('Firebase quota exceeded - continuing without updating last login');
        return;
      }
    }
  }

  // Convert Firebase auth error codes to user-friendly messages
  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
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