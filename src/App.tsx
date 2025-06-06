import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';

// Layout components
import { Layout } from './components/layout';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { QuizBuilder } from './pages/admin/QuizBuilder';
import { SessionManager } from './pages/admin/SessionManager';

// Student pages
import { JoinSession } from './pages/student/JoinSession';
import { QuizTaking } from './pages/student/QuizTaking';

// Teacher pages
import { LiveDashboard } from './pages/teacher/LiveDashboard';

// Test page
import { TestFirebase } from './pages/TestFirebase';

// Auth page
import { Login } from './pages/Login';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={<Layout variant="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="quizzes" element={<QuizBuilder />} />
            <Route path="quizzes/:quizId" element={<QuizBuilder />} />
            <Route path="sessions" element={<SessionManager />} />
          </Route>

          {/* Student routes */}
          <Route path="/student" element={<Layout variant="student" />}>
            <Route index element={<JoinSession />} />
            <Route path="quiz/:sessionId" element={<QuizTaking />} />
          </Route>

          {/* Teacher routes */}
          <Route path="/teacher" element={<Layout variant="teacher" />}>
            <Route path="session/:sessionId" element={<LiveDashboard />} />
          </Route>

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Test route */}
          <Route path="/test" element={<TestFirebase />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;