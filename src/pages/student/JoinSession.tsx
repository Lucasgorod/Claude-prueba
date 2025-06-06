import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { fadeIn, slideUp } from '../../styles/animations';
import { Button, Card, Input, Modal } from '../../components/ui';
import { QRScanner } from '../../components/quiz/QRScanner';
import { useSession } from '../../hooks/useSession';
import { useAuth } from '../../hooks/useAuth';

const JoinContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  max-width: 500px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

const WelcomeSection = styled(motion.div)`
  text-align: center;
  margin-bottom: ${theme.spacing['2xl']};
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
  margin: 0 auto ${theme.spacing.lg};
`;

const WelcomeTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
`;

const WelcomeSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.textSecondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const JoinCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const JoinForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const CodeInput = styled(Input)`
  input {
    text-align: center;
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeight.semibold};
    font-family: ${theme.typography.fontFamily.mono};
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`;

const NameInput = styled(Input)`
  input {
    text-align: center;
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin: ${theme.spacing.lg} 0;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${theme.colors.separator};
  }
`;

const QRSection = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const QRIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;

const QRText = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing.sm};
  background: rgba(255, 59, 48, 0.1);
  border-radius: ${theme.borderRadius.md};
  margin-top: ${theme.spacing.sm};
`;

export const JoinSession: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinSession } = useSession();
  const { signInStudent } = useAuth();
  
  const [sessionCode, setSessionCode] = useState(searchParams.get('code') || '');
  const [studentName, setStudentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim()) {
      setError('Please enter a session code');
      return;
    }
    
    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Sign in student anonymously
      await signInStudent(studentName.trim());
      
      // Join the session
      const { sessionId } = await joinSession(sessionCode.trim().toUpperCase(), studentName.trim());
      
      // Navigate to quiz taking page
      navigate(`/student/quiz/${sessionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join session. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = (code: string) => {
    setSessionCode(code);
    setShowQRScanner(false);
    
    // If student name is already entered, auto-submit
    if (studentName.trim()) {
      handleSubmit(new Event('submit') as any);
    }
  };

  const handleQRError = (error: string) => {
    setError(error);
    setShowQRScanner(false);
  };

  return (
    <JoinContainer
      variants={fadeIn}
      initial="initial"
      animate="animate"
    >
      <WelcomeSection
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <Logo>Q</Logo>
        <WelcomeTitle>Join Quiz</WelcomeTitle>
        <WelcomeSubtitle>
          Enter the session code provided by your teacher to join the quiz
        </WelcomeSubtitle>
      </WelcomeSection>

      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
        style={{ width: '100%' }}
      >
        <JoinCard variant="glass" padding="lg">
          <JoinForm onSubmit={handleSubmit}>
            <CodeInput
              label="Session Code"
              placeholder="ABC123"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              maxLength={6}
              autoComplete="off"
              fullWidth
            />

            <NameInput
              label="Your Name"
              placeholder="Enter your name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              fullWidth
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={!sessionCode.trim() || !studentName.trim()}
            >
              Join Quiz
            </Button>

            {error && <ErrorMessage>{error}</ErrorMessage>}
          </JoinForm>

          <OrDivider>or</OrDivider>

          <QRSection>
            <QRIcon>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="8"
                  height="8"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="13"
                  y="3"
                  width="8"
                  height="8"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="3"
                  y="13"
                  width="8"
                  height="8"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M13 13h.01M13 16h.01M16 13h.01M16 16h.01M21 16h.01M16 19h.01M21 19h.01M19 13h.01M19 21h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </QRIcon>
            <QRText>Scan QR code to join instantly</QRText>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQRScanner(true)}
              style={{ marginTop: theme.spacing.sm }}
            >
              Open Camera
            </Button>
          </QRSection>
        </JoinCard>
      </motion.div>

      {/* QR Scanner Modal */}
      <Modal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        title="Scan QR Code"
        size="md"
      >
        <Modal.Body>
          <QRScanner
            onScan={handleQRScan}
            onError={handleQRError}
            onClose={() => setShowQRScanner(false)}
          />
        </Modal.Body>
      </Modal>
    </JoinContainer>
  );
};