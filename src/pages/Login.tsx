import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import { fadeIn, slideUp } from '../styles/animations';
import { Button, Card, Input } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

const LoginContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  max-width: 500px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background};
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  background: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textInverse};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing['2xl']};
  text-align: center;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const TabButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.lg};
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${theme.spacing.sm};
  border: none;
  background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active }) => $active ? theme.colors.textInverse : theme.colors.textSecondary};
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.surfaceSecondary};
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing.sm};
  background: rgba(255, 59, 48, 0.1);
  border-radius: ${theme.borderRadius.md};
`;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInTeacher, registerTeacher } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        console.log('Attempting teacher sign in...');
        await signInTeacher(email, password);
        console.log('Teacher sign in successful');
      } else {
        console.log('Attempting teacher registration...');
        await registerTeacher(email, password, displayName);
        console.log('Teacher registration successful');
      }
      console.log('Navigating to admin...');
      navigate('/admin');
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <Logo>Q</Logo>
        <Title>Apple Quiz</Title>
        <Subtitle>Interactive quiz platform for educators</Subtitle>
      </motion.div>

      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
        style={{ width: '100%' }}
      >
        <LoginCard variant="glass" padding="lg">
          <TabButtons>
            <TabButton 
              type="button"
              $active={isLogin}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </TabButton>
            <TabButton 
              type="button"
              $active={!isLogin}
              onClick={() => setIsLogin(false)}
            >
              Register
            </TabButton>
          </TabButtons>

          <LoginForm onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                fullWidth
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!email || !password || (!isLogin && !displayName)}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </LoginForm>
        </LoginCard>
      </motion.div>

      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
        style={{ marginTop: theme.spacing.xl, textAlign: 'center' }}
      >
        <p style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
          Students don't need to register. <br />
          Use the session code provided by your teacher.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/student')}
          style={{ marginTop: theme.spacing.md }}
        >
          Join as Student
        </Button>
      </motion.div>
    </LoginContainer>
  );
};