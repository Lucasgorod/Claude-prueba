import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';
import { Button, Card, Input } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { slideUp } from '../../styles/animations';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginContainer = styled(motion.div)`
  max-width: 400px;
  margin: 0 auto;
`;

const LoginCard = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing.sm};
  background: rgba(255, 59, 48, 0.1);
  border-radius: ${theme.borderRadius.md};
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  text-align: center;
  padding: ${theme.spacing.sm};
  
  &:hover {
    text-decoration: underline;
  }
`;

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { signInTeacher, registerTeacher, loading, error, clearError } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      // Registration validation
      if (!formData.displayName.trim()) {
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        return;
      }
      
      if (formData.password.length < 6) {
        return;
      }
    }

    try {
      if (isRegister) {
        await registerTeacher(formData.email, formData.password, formData.displayName);
      } else {
        await signInTeacher(formData.email, formData.password);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    });
    clearError();
  };

  const isValid = () => {
    if (isRegister) {
      return formData.email && 
             formData.password && 
             formData.confirmPassword && 
             formData.displayName.trim() &&
             formData.password === formData.confirmPassword &&
             formData.password.length >= 6;
    }
    return formData.email && formData.password;
  };

  return (
    <LoginContainer
      variants={slideUp}
      initial="initial"
      animate="animate"
    >
      <LoginCard variant="glass" padding="lg">
        <Title>{isRegister ? 'Create Teacher Account' : 'Teacher Sign In'}</Title>
        
        <Form onSubmit={handleSubmit}>
          {isRegister && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              fullWidth
              required
            />
          )}
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            fullWidth
            required
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            fullWidth
            required
            helperText={isRegister ? "Password must be at least 6 characters" : undefined}
          />
          
          {isRegister && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              fullWidth
              required
              error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 
                     "Passwords don't match" : undefined}
            />
          )}
          
          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!isValid()}
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </Form>
        
        <ToggleButton onClick={toggleMode}>
          {isRegister 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Create one"
          }
        </ToggleButton>
      </LoginCard>
    </LoginContainer>
  );
};