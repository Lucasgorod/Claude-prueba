-- Disable RLS for development (ONLY for testing)
-- Execute this in Supabase SQL Editor

ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;  
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE responses DISABLE ROW LEVEL SECURITY;

-- Keep profiles enabled for basic security
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;