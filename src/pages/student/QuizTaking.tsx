import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { fadeIn, slideLeft, slideRight } from '../../styles/animations';
import { Button, Card, Input } from '../../components/ui';
import { Question, QuestionType } from '../../types';
import { useSession } from '../../hooks/useSession';
import { useQuiz } from '../../hooks/useQuiz';
import { useAuth } from '../../hooks/useAuth';

const QuizContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};
  min-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const QuizHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.separator};
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const SessionCode = styled.div`
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  background: ${theme.colors.surface};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
`;

const Timer = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary};
  font-family: ${theme.typography.fontFamily.mono};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.full};
  margin-bottom: ${theme.spacing.xl};
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ $progress: number }>`
  height: 100%;
  background: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.full};
  width: ${({ $progress }) => $progress}%;
`;

const QuestionCard = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: ${theme.spacing.lg};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.lg};
`;

const QuestionNumber = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const QuestionPoints = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const QuestionText = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  line-height: ${theme.typography.lineHeight.tight};
  margin-bottom: ${theme.spacing.xl};
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  flex: 1;
`;

const OptionButton = styled(motion.button)<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border: 2px solid ${({ $selected }) => $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  background: ${({ $selected }) => $selected ? 'rgba(0, 122, 255, 0.1)' : theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.typography.fontSize.base};
  text-align: left;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: rgba(0, 122, 255, 0.05);
  }
`;

const OptionLetter = styled.div<{ $selected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: ${({ $selected }) => $selected ? theme.colors.primary : theme.colors.surfaceSecondary};
  color: ${({ $selected }) => $selected ? theme.colors.textInverse : theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.semibold};
  flex-shrink: 0;
`;

const OptionText = styled.span`
  flex: 1;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: space-between;
  align-items: center;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const WaitingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60vh;
  gap: ${theme.spacing.lg};
`;

const WaitingIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border: 4px solid ${theme.colors.surface};
  border-top: 4px solid ${theme.colors.primary};
  border-radius: 50%;
`;

const TextInput = styled(Input)`
  input {
    min-height: 100px;
    resize: vertical;
    font-family: inherit;
  }
`;

const MatchingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const MatchingColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const MatchingItem = styled(motion.div)<{ $selected: boolean; $isLeft: boolean }>`
  padding: ${theme.spacing.md};
  border: 2px solid ${({ $selected }) => $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${({ $selected }) => $selected ? 'rgba(0, 122, 255, 0.1)' : theme.colors.surface};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  text-align: center;
  
  &:hover {
    border-color: ${theme.colors.primary};
    background: rgba(0, 122, 255, 0.05);
  }
`;

const FillBlankContainer = styled.div`
  line-height: ${theme.typography.lineHeight.relaxed};
  font-size: ${theme.typography.fontSize.lg};
`;

const BlankInput = styled.input`
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  color: ${theme.colors.textPrimary};
  font-size: inherit;
  min-width: 100px;
  margin: 0 ${theme.spacing.xs};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

export const QuizTaking: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useAuth();
  const { getQuiz } = useQuiz();
  const { 
    session, 
    participants, 
    submitResponse, 
    updateParticipantStatus 
  } = useSession(sessionId);
  
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [textAnswer, setTextAnswer] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState<{ [key: string]: string }>({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isWaiting, setIsWaiting] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  
  const progress = quiz ? ((session?.currentQuestionIndex || 0) / quiz.questions.length) * 100 : 0;

  // Load quiz data only when session.quizId changes
  useEffect(() => {
    const loadQuizData = async () => {
      if (session?.quizId && !quiz) {
        try {
          const quizData = await getQuiz(session.quizId);
          setQuiz(quizData);
        } catch (error) {
          console.error('Error loading quiz:', error);
        } finally {
          setLoading(false);
        }
      } else if (session && !session.quizId) {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [session?.quizId, getQuiz, quiz]);

  // Initialize participant only when needed
  useEffect(() => {
    const initializeParticipant = async () => {
      if (user && sessionId && !participantId && participants.length > 0) {
        // First try to find existing participant
        const participant = participants.find(p => p.name === user.displayName);
        
        if (participant) {
          setParticipantId(participant.id);
        } else {
          // Try to add as new participant if user has a display name
          if (user.displayName && session) {
            try {
              const { sessionService } = await import('../../services/sessionService');
              const newParticipantId = await sessionService.addParticipant(sessionId, {
                name: user.displayName,
                sessionId: sessionId,
                status: 'connected',
                currentQuestionIndex: 0,
                score: 0,
              });
              setParticipantId(newParticipantId);
            } catch (error) {
              console.error('Failed to add participant:', error);
            }
          }
        }
      }
    };

    initializeParticipant();
  }, [user?.displayName, participants.length, participantId, sessionId, session?.id]);

  // All callback functions defined first
  const resetAnswers = useCallback(() => {
    setSelectedAnswer('');
    setTextAnswer('');
    setMatchingAnswers({});
    setFillBlankAnswers([]);
  }, []);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(answer);
  }, [hasAnswered]);

  const handleTextChange = useCallback((value: string) => {
    if (hasAnswered) return;
    setTextAnswer(value);
  }, [hasAnswered]);

  const handleMatchingSelect = useCallback((leftItem: string, rightItem: string) => {
    if (hasAnswered) return;
    setMatchingAnswers(prev => ({
      ...prev,
      [leftItem]: rightItem
    }));
  }, [hasAnswered]);

  const handleFillBlankChange = useCallback((index: number, value: string) => {
    if (hasAnswered) return;
    const newAnswers = [...fillBlankAnswers];
    newAnswers[index] = value;
    setFillBlankAnswers(newAnswers);
  }, [hasAnswered, fillBlankAnswers]);

  // Helper functions
  const getCurrentAnswer = (): string | string[] => {
    if (!currentQuestion) return '';
    
    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'true-false':
        return selectedAnswer as string;
      case 'open-text':
        return textAnswer;
      case 'match-columns':
        return Object.entries(matchingAnswers).map(([left, right]) => `${left}=${right}`);
      case 'fill-in-blank':
        return fillBlankAnswers;
      default:
        return '';
    }
  };

  const isAnswerValid = (): boolean => {
    if (!currentQuestion) return false;
    
    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'true-false':
        return Boolean(selectedAnswer);
      case 'open-text':
        return textAnswer.trim().length > 0;
      case 'match-columns':
        return currentQuestion.leftColumn && 
               currentQuestion.leftColumn.length === Object.keys(matchingAnswers).length;
      case 'fill-in-blank':
        const blanksCount = (currentQuestion.question.match(/___/g) || []).length;
        return fillBlankAnswers.length === blanksCount && 
               fillBlankAnswers.every(answer => answer.trim().length > 0);
      default:
        return false;
    }
  };

  const calculateScore = (): { isCorrect: boolean; points: number } => {
    if (!currentQuestion) return { isCorrect: false, points: 0 };
    
    const answer = getCurrentAnswer();
    let isCorrect = false;
    
    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'true-false':
        isCorrect = answer === currentQuestion.correctAnswer;
        break;
      case 'match-columns':
        if (Array.isArray(answer) && currentQuestion.correctMatches) {
          const userMatches = answer.reduce((acc, match) => {
            const [left, right] = match.split('=');
            acc[left] = right;
            return acc;
          }, {} as { [key: string]: string });
          
          isCorrect = Object.entries(currentQuestion.correctMatches)
            .every(([left, right]) => userMatches[left] === right);
        }
        break;
      case 'fill-in-blank':
        if (Array.isArray(answer) && currentQuestion.correctAnswers) {
          isCorrect = answer.every((userAnswer, index) => 
            userAnswer.toLowerCase().trim() === currentQuestion.correctAnswers![index].toLowerCase().trim()
          );
        }
        break;
      case 'open-text':
        // For open text, we'll mark as correct and let teacher review manually
        isCorrect = true;
        break;
    }
    
    return {
      isCorrect,
      points: isCorrect ? currentQuestion.points : 0
    };
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (hasAnswered || !currentQuestion || !participantId || !sessionId || !startTime) {
      return;
    }
    
    // Immediately set hasAnswered to prevent multiple submissions
    setHasAnswered(true);
    
    const answer = getCurrentAnswer();
    const isValid = isAnswerValid();
    if (!isValid) {
      setHasAnswered(false); // Reset if answer is invalid
      return;
    }
    
    const timeSpent = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const { isCorrect, points } = calculateScore();
    
    try {
      console.log('Submitting response...', { answer, timeSpent, isCorrect, points });
      await submitResponse(
        sessionId,
        participantId,
        currentQuestion.id,
        answer,
        timeSpent,
        isCorrect,
        points
      );
      console.log('Response submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      setHasAnswered(false); // Reset on error so user can try again
    }
  }, [hasAnswered, currentQuestion, participantId, sessionId, startTime, submitResponse]);

  // Now all useEffect hooks
  // Update current question when question index changes
  useEffect(() => {
    if (quiz?.questions && session && typeof session.currentQuestionIndex === 'number') {
      const question = quiz.questions[session.currentQuestionIndex];
      setCurrentQuestion(question || null);
      if (question && !hasAnswered) {
        setTimeLeft(question.timeLimit || 30);
        setStartTime(new Date());
        setHasAnswered(false);
        resetAnswers();
      }
    }
  }, [session?.currentQuestionIndex, quiz?.questions, hasAnswered, resetAnswers]);

  // Update waiting state when session status changes
  useEffect(() => {
    if (session) {
      setIsWaiting(session.status !== 'active');
    }
  }, [session?.status]);

  // Timer effect
  useEffect(() => {
    if (session?.status === 'active' && timeLeft > 0 && !isWaiting && !hasAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasAnswered && currentQuestion) {
      handleSubmitAnswer();
    }
  }, [timeLeft, session?.status, isWaiting, hasAnswered]);

  // Update participant status on mount/unmount
  useEffect(() => {
    if (participantId && updateParticipantStatus) {
      updateParticipantStatus(participantId, 'connected');
      
      return () => {
        updateParticipantStatus(participantId, 'disconnected');
      };
    }
  }, [participantId, updateParticipantStatus]);

  const renderQuestionContent = () => {
    if (!currentQuestion) return null;
    
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return currentQuestion.options?.map((option, index) => (
          <OptionButton
            key={index}
            $selected={selectedAnswer === option}
            onClick={() => handleAnswerSelect(option)}
            whileTap={{ scale: 0.98 }}
            style={{ opacity: hasAnswered ? 0.7 : 1 }}
          >
            <OptionLetter $selected={selectedAnswer === option}>
              {String.fromCharCode(65 + index)}
            </OptionLetter>
            <OptionText>{option}</OptionText>
          </OptionButton>
        ));
      
      case 'true-false':
        return ['True', 'False'].map((option, index) => (
          <OptionButton
            key={option}
            $selected={selectedAnswer === option.toLowerCase()}
            onClick={() => handleAnswerSelect(option.toLowerCase())}
            whileTap={{ scale: 0.98 }}
            style={{ opacity: hasAnswered ? 0.7 : 1 }}
          >
            <OptionLetter $selected={selectedAnswer === option.toLowerCase()}>
              {option === 'True' ? 'T' : 'F'}
            </OptionLetter>
            <OptionText>{option}</OptionText>
          </OptionButton>
        ));
      
      case 'open-text':
        return (
          <TextInput
            value={textAnswer}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer here..."
            disabled={hasAnswered}
            fullWidth
            rows={4}
          />
        );
      
      case 'match-columns':
        if (!currentQuestion.leftColumn || !currentQuestion.rightColumn) return null;
        
        return (
          <MatchingContainer>
            <MatchingColumn>
              <h4 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
                Match these items:
              </h4>
              {currentQuestion.leftColumn.map((item, index) => (
                <MatchingItem
                  key={`left-${index}`}
                  $selected={Boolean(matchingAnswers[item])}
                  $isLeft={true}
                  onClick={() => !hasAnswered && setSelectedAnswer(item)}
                  whileTap={{ scale: 0.98 }}
                  style={{ opacity: hasAnswered ? 0.7 : 1 }}
                >
                  {item}
                  {matchingAnswers[item] && (
                    <div style={{ 
                      marginTop: theme.spacing.xs, 
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.primary 
                    }}>
                      → {matchingAnswers[item]}
                    </div>
                  )}
                </MatchingItem>
              ))}
            </MatchingColumn>
            
            <MatchingColumn>
              <h4 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
                With these options:
              </h4>
              {currentQuestion.rightColumn.map((item, index) => (
                <MatchingItem
                  key={`right-${index}`}
                  $selected={selectedAnswer === item || Object.values(matchingAnswers).includes(item)}
                  $isLeft={false}
                  onClick={() => {
                    if (!hasAnswered && selectedAnswer && typeof selectedAnswer === 'string') {
                      handleMatchingSelect(selectedAnswer, item);
                      setSelectedAnswer('');
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{ 
                    opacity: hasAnswered ? 0.7 : 
                            (Object.values(matchingAnswers).includes(item) ? 0.5 : 1)
                  }}
                >
                  {item}
                </MatchingItem>
              ))}
            </MatchingColumn>
          </MatchingContainer>
        );
      
      case 'fill-in-blank':
        const questionParts = currentQuestion.question.split('___');
        const blanksCount = questionParts.length - 1;
        
        if (fillBlankAnswers.length !== blanksCount) {
          setFillBlankAnswers(new Array(blanksCount).fill(''));
        }
        
        return (
          <FillBlankContainer>
            {questionParts.map((part, index) => (
              <span key={index}>
                {part}
                {index < blanksCount && (
                  <BlankInput
                    value={fillBlankAnswers[index] || ''}
                    onChange={(e) => handleFillBlankChange(index, e.target.value)}
                    disabled={hasAnswered}
                    placeholder={`Blank ${index + 1}`}
                  />
                )}
              </span>
            ))}
          </FillBlankContainer>
        );
      
      default:
        return null;
    }
  };

  // Show loading state
  if (loading || userLoading) {
    return (
      <QuizContainer variants={fadeIn} initial="initial" animate="animate">
        <WaitingScreen>
          <WaitingIcon
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div>
            <h2 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
              Loading...
            </h2>
            <p style={{ color: theme.colors.textSecondary }}>
              {userLoading ? 'Authenticating user...' : 'Connecting to session'}
            </p>
          </div>
        </WaitingScreen>
      </QuizContainer>
    );
  }

  // Show error if no session
  if (!session) {
    return (
      <QuizContainer variants={fadeIn} initial="initial" animate="animate">
        <WaitingScreen>
          <div>
            <h2 style={{ color: theme.colors.error, marginBottom: theme.spacing.sm }}>
              Session Not Found
            </h2>
            <p style={{ color: theme.colors.textSecondary }}>
              Unable to connect to the quiz session
            </p>
          </div>
        </WaitingScreen>
      </QuizContainer>
    );
  }

  // Show error if no quiz
  if (!quiz) {
    return (
      <QuizContainer variants={fadeIn} initial="initial" animate="animate">
        <WaitingScreen>
          <div>
            <h2 style={{ color: theme.colors.error, marginBottom: theme.spacing.sm }}>
              Quiz Not Found
            </h2>
            <p style={{ color: theme.colors.textSecondary }}>
              The quiz for this session could not be loaded
            </p>
          </div>
        </WaitingScreen>
      </QuizContainer>
    );
  }
  
  // Show waiting state
  if (isWaiting || session.status !== 'active') {
    const isCompleted = session.status === 'completed';
    const isPaused = session.status === 'paused';
    
    return (
      <QuizContainer variants={fadeIn} initial="initial" animate="animate">
        <WaitingScreen>
          <WaitingIcon
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div>
            <h2 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
              {isCompleted ? 'Quiz Completed!' : 
               isPaused ? 'Quiz Paused' : 
               'Waiting for Teacher'}
            </h2>
            <p style={{ color: theme.colors.textSecondary }}>
              {isCompleted ? 'Thank you for participating!' : 
               isPaused ? 'The teacher has paused the quiz' : 
               'Waiting for the teacher to start the quiz...'}
            </p>
          </div>
        </WaitingScreen>
      </QuizContainer>
    );
  }
  
  // Show completed question state
  if (hasAnswered && currentQuestion) {
    return (
      <QuizContainer variants={fadeIn} initial="initial" animate="animate">
        <QuizHeader>
          <SessionInfo>
            <SessionCode>Session: {session.code}</SessionCode>
          </SessionInfo>
          <Timer style={{ color: theme.colors.success }}>Answered!</Timer>
        </QuizHeader>

        <ProgressBar>
          <ProgressFill
            $progress={progress}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </ProgressBar>

        <WaitingScreen>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: theme.colors.success, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.lg
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
              Answer Submitted!
            </h2>
            <p style={{ color: theme.colors.textSecondary }}>
              Waiting for the next question...
            </p>
          </div>
        </WaitingScreen>
      </QuizContainer>
    );
  }

  // Don't render if we don't have a current question
  if (!currentQuestion) {
    return (
      <QuizContainer variants={fadeIn} initial="initial" animate="animate">
        <WaitingScreen>
          <div>
            <h2 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
              Loading Question...
            </h2>
            <p style={{ color: theme.colors.textSecondary }}>
              Preparing quiz content
            </p>
          </div>
        </WaitingScreen>
      </QuizContainer>
    );
  }

  return (
    <QuizContainer variants={fadeIn} initial="initial" animate="animate">
      <QuizHeader>
        <SessionInfo>
          <SessionCode>Session: {session.code}</SessionCode>
        </SessionInfo>
        <Timer>{timeLeft}s</Timer>
      </QuizHeader>

      <ProgressBar>
        <ProgressFill
          $progress={progress}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </ProgressBar>

      <AnimatePresence mode="wait">
        <motion.div
          key={session.currentQuestionIndex}
          variants={slideLeft}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <QuestionCard variant="glass" padding="lg">
            <QuestionHeader>
              <QuestionNumber>
                Question {session.currentQuestionIndex + 1} of {quiz.questions.length}
              </QuestionNumber>
              <QuestionPoints>{currentQuestion.points} points</QuestionPoints>
            </QuestionHeader>

            <QuestionText>
              {currentQuestion.type === 'fill-in-blank' ? '' : currentQuestion.question}
            </QuestionText>

            <OptionsContainer>
              {renderQuestionContent()}
            </OptionsContainer>
          </QuestionCard>

          <ActionButtons>
            <div style={{ 
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSecondary 
            }}>
              {currentQuestion.type === 'match-columns' && selectedAnswer && 
                'Select an option from the right column to match'
              }
            </div>

            <Button
              variant="primary"
              onClick={handleSubmitAnswer}
              disabled={!isAnswerValid() || hasAnswered}
              size="lg"
            >
              Submit Answer
            </Button>
          </ActionButtons>
        </motion.div>
      </AnimatePresence>
    </QuizContainer>
  );
};