-- Allow all teachers to manage any session
-- Execute this script in the Supabase SQL Editor

DROP POLICY IF EXISTS "Teachers can manage their own sessions" ON sessions;

CREATE POLICY "Teachers can manage any session" ON sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'teacher'
  )
);
