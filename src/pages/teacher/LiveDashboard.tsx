import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { staggerContainer, staggerItem } from '../../styles/animations';
import { Button, Card, Switch, Modal } from '../../components/ui';
import { QRGenerator } from '../../components/quiz/QRGenerator';
import { useSession } from '../../hooks/useSession';
import { useQuiz } from '../../hooks/useQuiz';
import { useAuth } from '../../hooks/useAuth';
import { Question, QuestionResponse, Participant } from '../../types';

const DashboardContainer = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const SessionCode = styled.div`
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  background: ${theme.colors.surface};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
`;

const SessionStatus = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return `color: ${theme.colors.success};`;
      case 'paused':
        return `color: ${theme.colors.warning};`;
      default:
        return `color: ${theme.colors.textSecondary};`;
    }
  }}
`;

const StatusDot = styled.div<{ $status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return `background: ${theme.colors.success};`;
      case 'paused':
        return `background: ${theme.colors.warning};`;
      default:
        return `background: ${theme.colors.textSecondary};`;
    }
  }}
`;

const ControlButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled(Card)`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const QuestionSection = styled(motion.div)``;

const CurrentQuestionCard = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.md};
`;

const QuestionNumber = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const QuestionTimer = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  font-family: ${theme.typography.fontFamily.mono};
`;

const QuestionText = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.lg};
  line-height: ${theme.typography.lineHeight.tight};
`;

const ResponsesCard = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const ResponseOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.separator};
  
  &:last-child {
    border-bottom: none;
  }
`;

const OptionText = styled.span`
  color: ${theme.colors.textPrimary};
`;

const ResponseBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.full};
  margin: 0 ${theme.spacing.md};
  overflow: hidden;
`;

const ResponseFill = styled(motion.div)<{ $percentage: number; $isCorrect?: boolean }>`
  height: 100%;
  background: ${({ $isCorrect }) => $isCorrect ? theme.colors.success : theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  width: ${({ $percentage }) => $percentage}%;
`;

const ResponseCount = styled.span`
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};
  min-width: 30px;
  text-align: right;
`;

const ParticipantsSection = styled(motion.div)``;

const ParticipantsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ParticipantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ParticipantName = styled.span`
  color: ${theme.colors.textPrimary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ParticipantStatus = styled.div<{ $status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${({ $status }) => {
    switch ($status) {
      case 'answered':
        return `background: ${theme.colors.success};`;
      case 'viewing':
        return `background: ${theme.colors.primary};`;
      case 'disconnected':
        return `background: ${theme.colors.error};`;
      default:
        return `background: ${theme.colors.textTertiary};`;
    }
  }}
`;

const ParticipantScore = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
`;

export const LiveDashboard: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const { getQuiz } = useQuiz();
  const { 
    session, 
    participants, 
    startSession, 
    pauseSession, 
    resumeSession, 
    endSession, 
    nextQuestion, 
    previousQuestion,
    subscribeToQuestionResponses 
  } = useSession(sessionId);

  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load quiz data
  useEffect(() => {
    const loadQuizData = async () => {
      if (session?.quizId) {
        try {
          const quizData = await getQuiz(session.quizId);
          setQuiz(quizData);
          if (quizData?.questions) {
            setCurrentQuestion(quizData.questions[session.currentQuestionIndex] || null);
            setTimeLeft(quizData.questions[session.currentQuestionIndex]?.timeLimit || 30);
          }
        } catch (error) {
          console.error('Error loading quiz:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadQuizData();
  }, [session, getQuiz]);

  // Update current question when session changes
  useEffect(() => {
    if (quiz?.questions && session) {
      const question = quiz.questions[session.currentQuestionIndex];
      setCurrentQuestion(question || null);
      if (question) {
        setTimeLeft(question.timeLimit || 30);
      }
    }
  }, [session?.currentQuestionIndex, quiz]);

  // Subscribe to responses for current question
  useEffect(() => {
    if (!sessionId || !currentQuestion) return;

    const unsubscribe = subscribeToQuestionResponses(currentQuestion.id, (newResponses) => {
      setResponses(newResponses);
    });

    return unsubscribe;
  }, [sessionId, currentQuestion?.id, subscribeToQuestionResponses]);

  // Timer effect
  useEffect(() => {
    if (session?.status === 'active' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && autoAdvance) {
      handleNextQuestion();
    }
  }, [timeLeft, session?.status, autoAdvance]);

  const handleSessionControl = async () => {
    if (!sessionId) return;
    
    try {
      if (session?.status === 'active') {
        await pauseSession(sessionId);
      } else if (session?.status === 'paused') {
        await resumeSession(sessionId);
      } else if (session?.status === 'waiting') {
        await startSession(sessionId);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to control session');
    }
  };

  const handleNextQuestion = async () => {
    if (!sessionId || !quiz) return;
    
    try {
      if (session && session.currentQuestionIndex < quiz.questions.length - 1) {
        await nextQuestion(sessionId);
      } else {
        // Quiz completed
        await handleEndSession();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to advance question');
    }
  };

  const handlePreviousQuestion = async () => {
    if (!sessionId) return;
    
    try {
      await previousQuestion(sessionId);
    } catch (error: any) {
      alert(error.message || 'Failed to go to previous question');
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    
    const confirmEnd = window.confirm('Are you sure you want to end this session? This cannot be undone.');
    if (!confirmEnd) return;
    
    try {
      await endSession(sessionId);
      navigate('/admin/sessions');
    } catch (error: any) {
      alert(error.message || 'Failed to end session');
    }
  };

  // Calculate response statistics
  const getResponseStats = () => {
    if (!currentQuestion || responses.length === 0) {
      return [];
    }

    const stats: { [key: string]: { count: number; isCorrect: boolean } } = {};

    if (currentQuestion.type === 'multiple-choice') {
      currentQuestion.options?.forEach(option => {
        stats[option] = { count: 0, isCorrect: option === currentQuestion.correctAnswer };
      });
    } else if (currentQuestion.type === 'true-false') {
      stats['True'] = { count: 0, isCorrect: currentQuestion.correctAnswer === 'true' };
      stats['False'] = { count: 0, isCorrect: currentQuestion.correctAnswer === 'false' };
    }

    responses.forEach(response => {
      const answer = Array.isArray(response.answer) ? response.answer[0] : response.answer;
      if (currentQuestion.type === 'true-false') {
        const displayAnswer = answer === 'true' ? 'True' : 'False';
        if (stats[displayAnswer]) {
          stats[displayAnswer].count++;
        }
      } else if (stats[answer]) {
        stats[answer].count++;
      }
    });

    return Object.entries(stats).map(([option, data]) => ({
      option,
      count: data.count,
      isCorrect: data.isCorrect,
    }));
  };

  const responseStats = getResponseStats();
  const totalResponses = responses.length;

  // Show loading state
  if (loading || !session) {
    return (
      <DashboardContainer
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
          Loading session...
        </div>
      </DashboardContainer>
    );
  }

  // Debug logging
  console.log('Access check:', {
    isTeacher,
    sessionCreatedBy: session.createdBy,
    userId: user?.id,
    hasAccess: isTeacher && session.createdBy === user?.id
  });

  // Show access denied if not teacher or not session owner
  if (!isTeacher || session.createdBy !== user?.id) {
    return (
      <DashboardContainer
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
          <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
            Access Denied
          </h3>
          <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
            You don't have permission to access this session.
          </p>
          <Button variant="primary" onClick={() => navigate('/admin')}>
            Go to Dashboard
          </Button>
        </Card>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <DashboardHeader>
        <SessionInfo>
          <SessionCode>{session.code}</SessionCode>
          <SessionStatus $status={session.status}>
            <StatusDot $status={session.status} />
            {session.status === 'active' ? 'Live' : 
             session.status === 'paused' ? 'Paused' : 
             session.status === 'waiting' ? 'Waiting' : 'Completed'}
          </SessionStatus>
        </SessionInfo>
        
        <ControlButtons>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQRModal(true)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M13 13h.01M13 16h.01M16 13h.01M16 16h.01M21 16h.01M16 19h.01M21 19h.01M19 13h.01M19 21h.01" stroke="currentColor" strokeWidth="2"/>
              </svg>
            }
          >
            QR Code
          </Button>

          {session.status !== 'completed' && (
            <>
              <Button
                variant={session.status === 'active' ? 'secondary' : 'primary'}
                onClick={handleSessionControl}
                icon={
                  session.status === 'active' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
                      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5v14l11-7z" fill="currentColor" />
                    </svg>
                  )
                }
              >
                {session.status === 'active' ? 'Pause' : 
                 session.status === 'paused' ? 'Resume' : 'Start'}
              </Button>
              
              {session.currentQuestionIndex > 0 && (
                <Button variant="outline" onClick={handlePreviousQuestion}>
                  Previous
                </Button>
              )}
              
              <Button variant="outline" onClick={handleNextQuestion}>
                {session.currentQuestionIndex < (quiz?.questions?.length || 0) - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
              
              <Button variant="danger" onClick={handleEndSession}>
                End Session
              </Button>
            </>
          )}
        </ControlButtons>
      </DashboardHeader>

      <StatsGrid variants={staggerItem}>
        <StatCard padding="lg">
          <StatValue>{participants.length}</StatValue>
          <StatLabel>Participants</StatLabel>
        </StatCard>
        <StatCard padding="lg">
          <StatValue>{totalResponses}</StatValue>
          <StatLabel>Responses</StatLabel>
        </StatCard>
        <StatCard padding="lg">
          <StatValue>{session.currentQuestionIndex + 1}</StatValue>
          <StatLabel>Question</StatLabel>
        </StatCard>
        <StatCard padding="lg">
          <StatValue>
            {participants.length > 0 ? Math.round((totalResponses / participants.length) * 100) : 0}%
          </StatValue>
          <StatLabel>Response Rate</StatLabel>
        </StatCard>
      </StatsGrid>

      <MainContent>
        <QuestionSection variants={staggerItem}>
          <CurrentQuestionCard variant="glass" padding="lg">
            <QuestionHeader>
              <QuestionNumber>
                Question {session.currentQuestionIndex + 1} of {quiz?.questions?.length || 0}
              </QuestionNumber>
              <QuestionTimer>{timeLeft}s</QuestionTimer>
            </QuestionHeader>
            <QuestionText>
              {currentQuestion?.question || 'No question available'}
            </QuestionText>
            <Switch
              checked={autoAdvance}
              onChange={setAutoAdvance}
              label="Auto-advance when time expires"
            />
          </CurrentQuestionCard>

          <ResponsesCard variant="default" padding="lg">
            <Card.Title>Live Responses ({totalResponses})</Card.Title>
            <div style={{ marginTop: theme.spacing.md }}>
              {responseStats.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: theme.spacing.lg,
                  color: theme.colors.textSecondary 
                }}>
                  {currentQuestion?.type === 'open-text' ? 
                    'Open text responses will be reviewed manually' :
                    'Waiting for responses...'
                  }
                </div>
              ) : (
                responseStats.map((response, index) => (
                  <ResponseOption key={index}>
                    <OptionText>{response.option}</OptionText>
                    <ResponseBar>
                      <ResponseFill
                        $percentage={(response.count / Math.max(totalResponses, 1)) * 100}
                        $isCorrect={response.isCorrect}
                        initial={{ width: 0 }}
                        animate={{ width: `${(response.count / Math.max(totalResponses, 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </ResponseBar>
                    <ResponseCount>{response.count}</ResponseCount>
                  </ResponseOption>
                ))
              )}
            </div>
          </ResponsesCard>
        </QuestionSection>

        <ParticipantsSection variants={staggerItem}>
          <Card variant="default" padding="lg">
            <Card.Title>Participants ({participants.length})</Card.Title>
            <ParticipantsList style={{ marginTop: theme.spacing.md }}>
              {participants.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: theme.spacing.lg,
                  color: theme.colors.textSecondary 
                }}>
                  No participants yet. Share the session code or QR code for students to join.
                </div>
              ) : (
                participants.map((participant) => {
                  const hasAnswered = responses.some(r => r.participantId === participant.id);
                  const participantStatus = hasAnswered ? 'answered' : 
                                          participant.status === 'connected' ? 'viewing' : 'disconnected';
                  
                  return (
                    <ParticipantItem key={participant.id}>
                      <ParticipantInfo>
                        <ParticipantStatus $status={participantStatus} />
                        <ParticipantName>{participant.name}</ParticipantName>
                      </ParticipantInfo>
                      <ParticipantScore>{participant.score}pts</ParticipantScore>
                    </ParticipantItem>
                  );
                })
              )}
            </ParticipantsList>
          </Card>
        </ParticipantsSection>
      </MainContent>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={`Session: ${session.code}`}
        size="md"
      >
        <Modal.Body>
          <QRGenerator
            sessionCode={session.code}
            onClose={() => setShowQRModal(false)}
          />
        </Modal.Body>
      </Modal>
    </DashboardContainer>
  );
};