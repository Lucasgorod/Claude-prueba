-- Fix all RLS policies to avoid infinite recursion
-- Execute this in Supabase SQL Editor

-- 1. Drop all existing problematic policies
DROP POLICY IF EXISTS "Anyone can view participants in their sessions" ON participants;
DROP POLICY IF EXISTS "Participants can view responses in their sessions" ON responses;
DROP POLICY IF EXISTS "Users can manage their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Anyone can view quizzes for sessions they participate in" ON quizzes;

-- 2. Create simple, non-recursive policies for quizzes
CREATE POLICY "Enable insert for authenticated users" ON quizzes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable select for users based on created_by" ON quizzes
FOR SELECT USING (auth.uid() = created_by OR auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on created_by" ON quizzes
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Enable delete for users based on created_by" ON quizzes
FOR DELETE USING (auth.uid() = created_by);

-- 3. Create simple policies for participants
CREATE POLICY "Enable all for authenticated users" ON participants
FOR ALL USING (auth.role() = 'authenticated');

-- 4. Create simple policies for responses  
CREATE POLICY "Enable all for authenticated users" ON responses
FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create simple policies for sessions
DROP POLICY IF EXISTS "Teachers can manage their own sessions" ON sessions;
DROP POLICY IF EXISTS "Anyone can view sessions" ON sessions;

CREATE POLICY "Enable all for authenticated users" ON sessions
FOR ALL USING (auth.role() = 'authenticated');