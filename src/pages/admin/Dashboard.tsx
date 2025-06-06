import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { staggerContainer, staggerItem } from '../../styles/animations';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useQuiz } from '../../hooks/useQuiz';

const DashboardContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled(motion.div)`
  margin-bottom: ${theme.spacing['2xl']};
`;

const WelcomeTitle = styled.h1`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
`;

const WelcomeSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xl};
`;

const QuickActionsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing['2xl']};
`;

const ActionCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
  }
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.primary};
  color: ${theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing.md};
`;

const ActionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

const ActionDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin-bottom: ${theme.spacing.md};
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing['2xl']};
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

const RecentSection = styled(motion.div)`
  margin-bottom: ${theme.spacing['2xl']};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.lg};
`;

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const RecentItem = styled(Card)`
  cursor: pointer;
  
  &:hover {
    border-color: ${theme.colors.primary};
  }
`;

const RecentItemHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.xs};
`;

const RecentItemTitle = styled.h4`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  margin: 0;
  flex: 1;
`;

const RecentItemDate = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.textTertiary};
`;

const RecentItemDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const { quizzes, loading, deleteQuiz, duplicateQuiz } = useQuiz();

  const quickActions = [
    {
      title: 'Create Quiz',
      description: 'Build a new quiz with multiple question types and interactive elements.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      action: () => navigate('/admin/quizzes'),
    },
    {
      title: 'Start Session',
      description: 'Launch a live quiz session for students to join and participate.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 5v14l11-7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      action: () => navigate('/admin/sessions'),
    },
    {
      title: 'View Analytics',
      description: 'Analyze student performance and quiz effectiveness with detailed reports.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3v18h18M9 17l4-4 4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      action: () => navigate('/admin/analytics'),
    },
  ];

  const stats = [
    { value: quizzes.length.toString(), label: 'Total Quizzes' },
    { value: '147', label: 'Students Reached' },
    { value: '23', label: 'Active Sessions' },
    { value: '89%', label: 'Avg. Completion' },
  ];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        await deleteQuiz(quizId);
      } catch (error: any) {
        alert(error.message || 'Failed to delete quiz');
      }
    }
  };

  const handleDuplicateQuiz = async (quizId: string, originalTitle: string) => {
    const newTitle = prompt('Enter a name for the duplicated quiz:', `${originalTitle} (Copy)`);
    
    if (newTitle && newTitle.trim()) {
      try {
        await duplicateQuiz(quizId, newTitle.trim());
      } catch (error: any) {
        alert(error.message || 'Failed to duplicate quiz');
      }
    }
  };

  // Show login prompt if not authenticated
  if (!isTeacher) {
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
        <Card variant="glass" padding="lg" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.md }}>
            Welcome to Quiz App
          </h3>
          <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
            Please sign in as a teacher to access the dashboard and create quizzes.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Sign In as Teacher
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
      <WelcomeSection variants={staggerItem}>
        <WelcomeTitle>Welcome back! 👋</WelcomeTitle>
        <WelcomeSubtitle>
          Ready to create engaging quizzes and track student progress?
        </WelcomeSubtitle>
      </WelcomeSection>

      <QuickActionsGrid variants={staggerItem}>
        {quickActions.map((action, index) => (
          <ActionCard
            key={index}
            interactive
            onClick={action.action}
            padding="lg"
          >
            <ActionIcon>{action.icon}</ActionIcon>
            <ActionTitle>{action.title}</ActionTitle>
            <ActionDescription>{action.description}</ActionDescription>
            <Button variant="outline" size="sm">
              Get Started
            </Button>
          </ActionCard>
        ))}
      </QuickActionsGrid>

      <StatsGrid variants={staggerItem}>
        {stats.map((stat, index) => (
          <StatCard key={index} padding="lg">
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <RecentSection variants={staggerItem}>
        <SectionTitle>Recent Quizzes ({quizzes.length})</SectionTitle>
        {loading ? (
          <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.textSecondary }}>
            Loading quizzes...
          </div>
        ) : quizzes.length === 0 ? (
          <Card variant="glass" padding="lg" style={{ textAlign: 'center' }}>
            <h4 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
              No quizzes yet
            </h4>
            <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
              Create your first quiz to get started!
            </p>
            <Button variant="primary" onClick={() => navigate('/admin/quizzes')}>
              Create Quiz
            </Button>
          </Card>
        ) : (
          <RecentList>
            {quizzes.slice(0, 5).map((quiz) => (
              <RecentItem key={quiz.id} padding="md">
                <RecentItemHeader>
                  <RecentItemTitle>{quiz.title}</RecentItemTitle>
                  <RecentItemDate>{formatDate(quiz.updatedAt)}</RecentItemDate>
                </RecentItemHeader>
                <RecentItemDescription>
                  {quiz.description || `${quiz.questions.length} questions`}
                </RecentItemDescription>
                <div style={{ 
                  display: 'flex', 
                  gap: theme.spacing.xs, 
                  marginTop: theme.spacing.sm,
                  justifyContent: 'flex-end'
                }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/quizzes/${quiz.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateQuiz(quiz.id, quiz.title)}
                  >
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    style={{ color: theme.colors.error }}
                  >
                    Delete
                  </Button>
                </div>
              </RecentItem>
            ))}
          </RecentList>
        )}
      </RecentSection>
    </DashboardContainer>
  );
};