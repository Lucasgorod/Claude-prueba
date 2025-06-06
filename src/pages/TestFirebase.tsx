import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { Button, Card, Input } from '../components/ui';
import { supabase } from '../services/supabase';

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

export const TestSupabase: React.FC = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [databaseStatus, setDatabaseStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [authStatus, setAuthStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('test123456');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    // Test Supabase initialization
    try {
      if (supabase) {
        setSupabaseStatus('success');
        addLog('✅ Supabase initialized successfully');
      } else {
        setSupabaseStatus('error');
        addLog('❌ Supabase initialization failed');
      }
    } catch (error) {
      setSupabaseStatus('error');
      addLog(`❌ Supabase error: ${error}`);
    }

    // Test Database connection
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        // If table doesn't exist, that's expected
        if (error.message.includes('relation "profiles" does not exist')) {
          setDatabaseStatus('success');
          addLog('✅ Database connection successful (profiles table needs to be created)');
        } else {
          setDatabaseStatus('error');
          addLog(`❌ Database error: ${error.message}`);
        }
      } else {
        setDatabaseStatus('success');
        addLog('✅ Database connection successful');
      }
    } catch (error: any) {
      setDatabaseStatus('error');
      addLog(`❌ Database error: ${error.message}`);
    }
  };

  const testAuth = async () => {
    try {
      setAuthStatus('pending');
      addLog('🔄 Testing authentication...');

      // First try to sign in (in case user already exists)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        addLog('ℹ️ User not found, creating new user...');
        
        // Try to create a test user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) throw signUpError;
        addLog(`✅ User created: ${signUpData.user?.email}`);
        
        // Try to sign in again
        const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });
        
        if (newSignInError) throw newSignInError;
        addLog(`✅ User signed in: ${newSignIn.user?.email}`);
      } else if (signInError) {
        throw signInError;
      } else {
        addLog(`✅ User signed in: ${signInData.user?.email}`);
      }

      setAuthStatus('success');
    } catch (error: any) {
      setAuthStatus('error');
      addLog(`❌ Auth error: ${error.message}`);
    }
  };

  return (
    <TestContainer>
      <h1 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.lg }}>
        Supabase Connection Test
      </h1>
      
      <TestSection padding="lg">
        <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
          Connection Status
        </h3>
        
        <StatusIndicator $status={supabaseStatus}>
          Supabase Client: {supabaseStatus === 'success' ? '✅ Connected' : 
                            supabaseStatus === 'error' ? '❌ Failed' : '⏳ Testing...'}
        </StatusIndicator>
        
        <StatusIndicator $status={databaseStatus}>
          PostgreSQL Database: {databaseStatus === 'success' ? '✅ Connected' : 
                                databaseStatus === 'error' ? '❌ Failed' : '⏳ Testing...'}
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
          onClick={() => {
            console.log('Button clicked!');
            testAuth();
          }}
          disabled={authStatus === 'pending'}
          fullWidth
        >
          {authStatus === 'pending' ? 'Testing...' : 'Test Auth'}
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