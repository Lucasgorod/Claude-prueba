-- Create quizzes table if it doesn't exist
-- Execute this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Create simple policy for testing
DROP POLICY IF EXISTS "Users can manage their own quizzes" ON quizzes;
CREATE POLICY "Users can manage their own quizzes" ON quizzes 
FOR ALL USING (auth.uid() = created_by);

-- Create policy for viewing quizzes
DROP POLICY IF EXISTS "Users can view quizzes" ON quizzes;
CREATE POLICY "Users can view quizzes" ON quizzes 
FOR SELECT USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;
CREATE TRIGGER update_quizzes_updated_at 
BEFORE UPDATE ON quizzes 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();