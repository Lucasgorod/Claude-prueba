-- Fix RLS policies to avoid infinite recursion

-- Drop existing profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Teachers can view all profiles" ON profiles;

-- Create corrected profiles policies
CREATE POLICY "Users can view their own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Teachers can view all profiles (simplified to avoid recursion)
CREATE POLICY "Teachers can view all profiles" ON profiles 
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('teacher', 'admin')
  )
);

-- Fix other policies that might cause issues

-- Drop and recreate quizzes policies with better logic
DROP POLICY IF EXISTS "Anyone can view quizzes for sessions they participate in" ON quizzes;

CREATE POLICY "Anyone can view quizzes for sessions they participate in" ON quizzes 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.quiz_id = quizzes.id 
    AND (
      s.created_by = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM participants p 
        WHERE p.session_id = s.id
      )
    )
  )
);

-- Simplify participants policies
DROP POLICY IF EXISTS "Anyone can view participants in their sessions" ON participants;

CREATE POLICY "Anyone can view participants in their sessions" ON participants 
FOR SELECT USING (
  session_id IN (
    SELECT id FROM sessions WHERE created_by = auth.uid()
  ) OR 
  id IN (
    SELECT id FROM participants WHERE session_id = participants.session_id
  )
);

-- Simplify responses policies  
DROP POLICY IF EXISTS "Participants can view responses in their sessions" ON responses;

CREATE POLICY "Participants can view responses in their sessions" ON responses 
FOR SELECT USING (
  session_id IN (
    SELECT session_id FROM participants WHERE id = participant_id
  ) OR
  session_id IN (
    SELECT id FROM sessions WHERE created_by = auth.uid()
  )
);