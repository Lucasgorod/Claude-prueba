import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { Button, Card, Input, Modal, Switch } from '../../components/ui';
import { QuestionEditor } from '../../components/quiz/QuestionEditor';
import { Question, QuestionType, Quiz } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useQuiz } from '../../hooks/useQuiz';

const QuizBuilderContainer = styled(motion.div)`
  max-width: 1000px;
  margin: 0 auto;
`;

const QuizHeader = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const QuizTitle = styled(Input)`
  margin-bottom: ${theme.spacing.md};
`;

const QuizDescription = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.textPrimary};
  font-family: ${theme.typography.fontFamily.system};
  font-size: ${theme.typography.fontSize.base};
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
  
  &::placeholder {
    color: ${theme.colors.textTertiary};
  }
`;

const QuestionsSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const QuestionCard = styled(Card)`
  border-left: 4px solid ${theme.colors.primary};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.sm};
`;

const QuestionTypeLabel = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.primary};
  background: rgba(0, 122, 255, 0.1);
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const QuestionActions = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const QuestionText = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.sm} 0;
  line-height: ${theme.typography.lineHeight.normal};
`;

const QuestionOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const OptionItem = styled.div<{ $isCorrect?: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  background: ${({ $isCorrect }) => 
    $isCorrect ? 'rgba(48, 209, 88, 0.1)' : theme.colors.surfaceSecondary};
  border: 1px solid ${({ $isCorrect }) => 
    $isCorrect ? theme.colors.success : theme.colors.border};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing['3xl']};
  color: ${theme.colors.textSecondary};
`;

const QuestionTypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const QuestionTypeCard = styled(Card)`
  cursor: pointer;
  text-align: center;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const QuestionTypeIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.primary};
  color: ${theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing.sm};
`;

export const QuizBuilder: React.FC = () => {
  const { quizId } = useParams<{ quizId?: string }>();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const { createQuiz, updateQuiz, getQuiz, loading, error } = useQuiz();
  
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);

  // Load existing quiz if editing
  useEffect(() => {
    if (quizId && isTeacher) {
      loadQuiz();
    }
  }, [quizId, isTeacher]);

  const loadQuiz = async () => {
    if (!quizId) return;
    
    try {
      const quiz = await getQuiz(quizId);
      if (quiz) {
        setCurrentQuiz(quiz);
        setQuizTitle(quiz.title);
        setQuizDescription(quiz.description);
        setQuestions(quiz.questions);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  };

  const questionTypes = [
    {
      type: 'true-false' as QuestionType,
      name: 'True / False',
      description: 'Simple true or false questions',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      type: 'multiple-choice' as QuestionType,
      name: 'Multiple Choice',
      description: 'Questions with multiple options',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12h6M9 16h6M9 8h6M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      type: 'match-columns' as QuestionType,
      name: 'Match Columns',
      description: 'Match items from two lists',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      type: 'open-text' as QuestionType,
      name: 'Open Text',
      description: 'Free-form text responses',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      type: 'fill-in-blank' as QuestionType,
      name: 'Fill in Blank',
      description: 'Questions with missing words',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 7h16M4 12h16M4 17h7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const renderQuestionOptions = (question: Question) => {
    switch (question.type) {
      case 'true-false':
        return (
          <QuestionOptions>
            <OptionItem $isCorrect={question.correctAnswer === 'true'}>
              True
            </OptionItem>
            <OptionItem $isCorrect={question.correctAnswer === 'false'}>
              False
            </OptionItem>
          </QuestionOptions>
        );
      case 'multiple-choice':
        return (
          <QuestionOptions>
            {question.options?.map((option, index) => (
              <OptionItem
                key={index}
                $isCorrect={question.correctAnswer === option}
              >
                {option}
              </OptionItem>
            ))}
          </QuestionOptions>
        );
      case 'open-text':
        return (
          <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            Open text response
          </div>
        );
      case 'fill-in-blank':
        return (
          <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            Fill in the blank: {question.correctAnswer}
          </div>
        );
      default:
        return null;
    }
  };

  const generateQuestionId = () => {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddQuestion = (type: QuestionType) => {
    setSelectedQuestionType(type);
    setEditingQuestion(null);
    setShowQuestionModal(false);
    setShowQuestionEditor(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setSelectedQuestionType(question.type);
    setShowQuestionEditor(true);
  };

  const handleSaveQuestion = (questionData: Omit<Question, 'id'>) => {
    if (editingQuestion) {
      // Edit existing question
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id 
          ? { ...questionData, id: editingQuestion.id }
          : q
      ));
    } else {
      // Add new question
      const newQuestion: Question = {
        ...questionData,
        id: generateQuestionId(),
      };
      setQuestions([...questions, newQuestion]);
    }
    setShowQuestionEditor(false);
    setEditingQuestion(null);
    setSelectedQuestionType(null);
  };

  const handleCancelEdit = () => {
    setShowQuestionEditor(false);
    setEditingQuestion(null);
    setSelectedQuestionType(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSaveQuiz = async () => {
    if (!user || !isTeacher) {
      alert('You must be logged in as a teacher to save quizzes.');
      return;
    }

    if (!quizTitle.trim()) {
      alert('Please enter a quiz title.');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }

    setIsSaving(true);
    try {
      const quizData = {
        title: quizTitle.trim(),
        description: quizDescription.trim(),
        questions,
        createdBy: user.uid,
      };

      if (currentQuiz) {
        // Update existing quiz
        await updateQuiz(currentQuiz.id, quizData);
        alert('Quiz updated successfully!');
      } else {
        // Create new quiz
        const newQuizId = await createQuiz(quizData);
        alert('Quiz created successfully!');
        navigate(`/admin/quizzes/${newQuizId}`);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    if (questions.length > 0 || quizTitle.trim() || quizDescription.trim()) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmLeave) return;
    }
    navigate('/admin');
  };

  // Show loading state
  if (loading) {
    return (
      <QuizBuilderContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
          <div style={{ marginBottom: theme.spacing.md }}>Loading quiz...</div>
        </div>
      </QuizBuilderContainer>
    );
  }

  // Show error if user is not authenticated
  if (!isTeacher) {
    return (
      <QuizBuilderContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
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
            You must be logged in as a teacher to access the quiz builder.
          </p>
          <Button variant="primary" onClick={() => navigate('/admin')}>
            Go to Dashboard
          </Button>
        </Card>
      </QuizBuilderContainer>
    );
  }

  return (
    <QuizBuilderContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <QuizHeader>
        <QuizTitle
          label="Quiz Title"
          placeholder="Enter quiz title..."
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          fullWidth
          size="lg"
        />
        <QuizDescription
          placeholder="Enter quiz description..."
          value={quizDescription}
          onChange={(e) => setQuizDescription(e.target.value)}
        />
      </QuizHeader>

      <QuestionsSection>
        <SectionHeader>
          <SectionTitle>Questions ({questions.length})</SectionTitle>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button
              variant="secondary"
              onClick={handleBackToDashboard}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 12H5M12 19l-7-7 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveQuiz}
              loading={isSaving}
              disabled={!quizTitle.trim() || questions.length === 0}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 21v-8H7v8M7 3v5h8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              {currentQuiz ? 'Update Quiz' : 'Save Quiz'}
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowQuestionModal(true)}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              Add Question
            </Button>
          </div>
        </SectionHeader>

        {questions.length === 0 ? (
          <EmptyState>
            <h3>No questions added yet</h3>
            <p>Click "Add Question" to start building your quiz</p>
          </EmptyState>
        ) : (
          <QuestionsList>
            {questions.map((question, index) => (
              <QuestionCard key={question.id} padding="lg">
                <QuestionHeader>
                  <QuestionTypeLabel>
                    {questionTypes.find(t => t.type === question.type)?.name}
                  </QuestionTypeLabel>
                  <QuestionActions>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuestion(question)}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      }
                    >
                      Delete
                    </Button>
                  </QuestionActions>
                </QuestionHeader>
                <QuestionText>
                  {index + 1}. {question.question}
                </QuestionText>
                {renderQuestionOptions(question)}
              </QuestionCard>
            ))}
          </QuestionsList>
        )}
      </QuestionsSection>

      {/* Question Type Selection Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title="Add Question"
        size="lg"
      >
        <Modal.Body>
          <QuestionTypeSelector>
            {questionTypes.map((type) => (
              <QuestionTypeCard
                key={type.type}
                interactive
                onClick={() => handleAddQuestion(type.type)}
                padding="lg"
              >
                <QuestionTypeIcon>{type.icon}</QuestionTypeIcon>
                <h4 style={{ margin: '0 0 8px 0', color: theme.colors.textPrimary }}>
                  {type.name}
                </h4>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                  {type.description}
                </p>
              </QuestionTypeCard>
            ))}
          </QuestionTypeSelector>
        </Modal.Body>
      </Modal>

      {/* Question Editor Modal */}
      <Modal
        isOpen={showQuestionEditor}
        onClose={handleCancelEdit}
        title={editingQuestion ? 'Edit Question' : 'Create Question'}
        size="xl"
      >
        <Modal.Body>
          {selectedQuestionType && (
            <QuestionEditor
              questionType={selectedQuestionType}
              initialQuestion={editingQuestion || undefined}
              onSave={handleSaveQuestion}
              onCancel={handleCancelEdit}
            />
          )}
        </Modal.Body>
      </Modal>
    </QuizBuilderContainer>
  );
};