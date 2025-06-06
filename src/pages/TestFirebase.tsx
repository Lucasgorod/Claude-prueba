import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Button, Card, Input } from '../components/ui';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const TestContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

const TestSection = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const StatusIndicator = styled.div<{ $status: 'success' | 'error' | 'pending' }>`
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  margin: ${theme.spacing.sm} 0;
  
  ${({ $status }) => {
    switch ($status) {
      case 'success':
        return `background: rgba(48, 209, 88, 0.1); color: ${theme.colors.success};`;
      case 'error':
        return `background: rgba(255, 59, 48, 0.1); color: ${theme.colors.error};`;
      default:
        return `background: ${theme.colors.surface}; color: ${theme.colors.textSecondary};`;
    }
  }}
`;

export const TestFirebase: React.FC = () => {
  const [firebaseStatus, setFirebaseStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [firestoreStatus, setFirestoreStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [authStatus, setAuthStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    // Test Firebase initialization
    try {
      if (auth && db) {
        setFirebaseStatus('success');
        addLog('✅ Firebase initialized successfully');
      } else {
        setFirebaseStatus('error');
        addLog('❌ Firebase initialization failed');
      }
    } catch (error) {
      setFirebaseStatus('error');
      addLog(`❌ Firebase error: ${error}`);
    }

    // Test Firestore connection
    try {
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { timestamp: new Date(), test: true });
      const docSnap = await getDoc(testDoc);
      
      if (docSnap.exists()) {
        setFirestoreStatus('success');
        addLog('✅ Firestore connection successful');
      } else {
        setFirestoreStatus('error');
        addLog('❌ Firestore write/read failed');
      }
    } catch (error: any) {
      setFirestoreStatus('error');
      addLog(`❌ Firestore error: ${error.message}`);
    }
  };

  const testAuth = async () => {
    try {
      setAuthStatus('pending');
      addLog('🔄 Testing authentication...');

      // Try to create a test user
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      addLog(`✅ User created: ${userCredential.user.email}`);
      
      // Sign out
      await auth.signOut();
      addLog('✅ User signed out');
      
      // Try to sign in
      const signInResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      addLog(`✅ User signed in: ${signInResult.user.email}`);
      
      setAuthStatus('success');
    } catch (error: any) {
      setAuthStatus('error');
      addLog(`❌ Auth error: ${error.message}`);
      
      // If user already exists, try to sign in
      if (error.code === 'auth/email-already-in-use') {
        try {
          const signInResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
          addLog(`✅ Existing user signed in: ${signInResult.user.email}`);
          setAuthStatus('success');
        } catch (signInError: any) {
          addLog(`❌ Sign in failed: ${signInError.message}`);
        }
      }
    }
  };

  return (
    <TestContainer>
      <h1 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.lg }}>
        Firebase Connection Test
      </h1>
      
      <TestSection padding="lg">
        <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
          Connection Status
        </h3>
        
        <StatusIndicator $status={firebaseStatus}>
          Firebase App: {firebaseStatus === 'success' ? '✅ Connected' : 
                        firebaseStatus === 'error' ? '❌ Failed' : '⏳ Testing...'}
        </StatusIndicator>
        
        <StatusIndicator $status={firestoreStatus}>
          Firestore Database: {firestoreStatus === 'success' ? '✅ Connected' : 
                               firestoreStatus === 'error' ? '❌ Failed' : '⏳ Testing...'}
        </StatusIndicator>
        
        <StatusIndicator $status={authStatus}>
          Authentication: {authStatus === 'success' ? '✅ Working' : 
                          authStatus === 'error' ? '❌ Failed' : '⏳ Not tested'}
        </StatusIndicator>
      </TestSection>
      
      <TestSection padding="lg">
        <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
          Test Authentication
        </h3>
        
        <div style={{ marginBottom: theme.spacing.md }}>
          <Input
            label="Test Email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            fullWidth
          />
        </div>
        
        <div style={{ marginBottom: theme.spacing.md }}>
          <Input
            label="Test Password"
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            fullWidth
          />
        </div>
        
        <Button
          variant="primary"
          onClick={testAuth}
          disabled={authStatus === 'pending'}
          fullWidth
        >
          Test Auth
        </Button>
      </TestSection>
      
      <TestSection padding="lg">
        <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
          Connection Logs
        </h3>
        
        <div style={{ 
          background: theme.colors.surface,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textSecondary,
          fontFamily: 'monospace',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setLogs([])}
          style={{ marginTop: theme.spacing.sm }}
        >
          Clear Logs
        </Button>
      </TestSection>
    </TestContainer>
  );
};