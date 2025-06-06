import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { staggerContainer, staggerItem } from '../../styles/animations';
import { Button, Card, Modal } from '../../components/ui';
import { QRGenerator } from '../../components/quiz/QRGenerator';
import { QuizSession } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useQuiz } from '../../hooks/useQuiz';
import { useSession } from '../../hooks/useSession';

const SessionManagerContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
`;

const SessionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const SessionsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing['2xl']};
`;

const SessionCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const SessionStatus = styled.span<{ $status: string }>`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return `
          color: ${theme.colors.success};
          background: rgba(48, 209, 88, 0.1);
        `;
      case 'waiting':
        return `
          color: ${theme.colors.warning};
          background: rgba(255, 159, 10, 0.1);
        `;
      case 'paused':
        return `
          color: ${theme.colors.textSecondary};
          background: ${theme.colors.surfaceSecondary};
        `;
      case 'completed':
        return `
          color: ${theme.colors.textTertiary};
          background: ${theme.colors.surface};
        `;
      default:
        return '';
    }
  }}
`;

const SessionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const SessionCode = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  font-family: ${theme.typography.fontFamily.mono};
  margin-bottom: ${theme.spacing.sm};
`;

const SessionStats = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-top: 1px solid ${theme.colors.separator};
  margin-top: ${theme.spacing.sm};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.textSecondary};
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const QRCodePlaceholder = styled.div`
  width: 200px;
  height: 200px;
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const SessionManager: React.FC = () => {
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const { quizzes } = useQuiz();
  const { createSession, getTeacherSessions } = useSession();
  
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(null);
  const [showQuizSelector, setShowQuizSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load teacher's sessions
  useEffect(() => {
    if (isTeacher) {
      loadSessions();
    }
  }, [isTeacher]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const teacherSessions = await getTeacherSessions();
      setSessions(teacherSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live';
      case 'waiting':
        return 'Waiting';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleShowQR = (session: QuizSession) => {
    setSelectedSession(session);
    setShowQRModal(true);
  };

  const handleStartSession = async (quizId: string) => {
    try {
      setLoading(true);
      const sessionId = await createSession(quizId);
      await loadSessions(); // Refresh the list
      
      // Find the newly created session and show QR
      const newSession = sessions.find(s => s.id === sessionId);
      if (newSession) {
        setSelectedSession(newSession);
        setShowQRModal(true);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create session');
    } finally {
      setLoading(false);
      setShowQuizSelector(false);
    }
  };

  const handleViewDashboard = (sessionId: string) => {
    navigate(`/teacher/session/${sessionId}`);
  };

  return (
    <SessionManagerContainer
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <SessionsHeader>
        <PageTitle>Live Sessions</PageTitle>
        <Button
          variant="primary"
          onClick={() => setShowQuizSelector(true)}
          disabled={quizzes.length === 0}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 5v14l11-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        >
          Start Session
        </Button>
      </SessionsHeader>

      {loading ? (
        <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.textSecondary }}>
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState>
          <h3>No active sessions</h3>
          <p>Start a new quiz session to see it here</p>
          {quizzes.length === 0 && (
            <p style={{ marginTop: theme.spacing.sm }}>
              You need to create a quiz first before starting a session.
            </p>
          )}
        </EmptyState>
      ) : (
        <SessionsGrid variants={staggerItem}>
          {sessions.map((session) => {
            const quiz = quizzes.find(q => q.id === session.quizId);
            return (
              <SessionCard
                key={session.id}
                interactive
                onClick={() => handleShowQR(session)}
                padding="lg"
              >
                <SessionHeader>
                  <SessionStatus $status={session.status}>
                    {getStatusText(session.status)}
                  </SessionStatus>
                </SessionHeader>
                
                <SessionTitle>
                  {quiz?.title || 'Quiz Session'}
                </SessionTitle>
                
                <SessionCode>
                  {session.code}
                </SessionCode>
                
                <SessionStats>
                  <StatItem>
                    <StatValue>{session.participants?.length || 0}</StatValue>
                    <StatLabel>Participants</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{session.currentQuestionIndex}</StatValue>
                    <StatLabel>Question</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>
                      {session.startTime ? 
                        Math.floor((Date.now() - session.startTime.getTime()) / 60000) : 0
                      }m
                    </StatValue>
                    <StatLabel>Duration</StatLabel>
                  </StatItem>
                </SessionStats>
                
                <div style={{ 
                  display: 'flex', 
                  gap: theme.spacing.xs, 
                  marginTop: theme.spacing.sm,
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDashboard(session.id);
                    }}
                  >
                    Dashboard
                  </Button>
                </div>
              </SessionCard>
            );
          })}
        </SessionsGrid>
      )}

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={`Session: ${selectedSession?.code}`}
        size="md"
      >
        <Modal.Body>
          {selectedSession && (
            <QRGenerator
              sessionCode={selectedSession.code}
              onClose={() => setShowQRModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Quiz Selector Modal */}
      <Modal
        isOpen={showQuizSelector}
        onClose={() => setShowQuizSelector(false)}
        title="Select Quiz for Session"
        size="lg"
      >
        <Modal.Body>
          {quizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
              <h4 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
                No Quizzes Available
              </h4>
              <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
                You need to create a quiz before starting a session.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setShowQuizSelector(false);
                  navigate('/admin/quizzes');
                }}
              >
                Create Quiz
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: theme.spacing.md }}>
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  interactive
                  onClick={() => handleStartSession(quiz.id)}
                  padding="lg"
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        color: theme.colors.textPrimary, 
                        marginBottom: theme.spacing.xs,
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold 
                      }}>
                        {quiz.title}
                      </h4>
                      <p style={{ 
                        color: theme.colors.textSecondary, 
                        fontSize: theme.typography.fontSize.sm,
                        marginBottom: theme.spacing.sm 
                      }}>
                        {quiz.description || `${quiz.questions.length} questions`}
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        gap: theme.spacing.md,
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.textTertiary 
                      }}>
                        <span>{quiz.questions.length} questions</span>
                        <span>{quiz.questions.reduce((sum, q) => sum + q.points, 0)} points</span>
                        <span>~{Math.ceil(quiz.questions.reduce((sum, q) => sum + (q.timeLimit || 30), 0) / 60)} min</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={loading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartSession(quiz.id);
                      }}
                    >
                      Start
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </SessionManagerContainer>
  );
};