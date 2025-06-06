-- Debug quiz creation issues
-- Execute in Supabase SQL Editor

-- 1. Check if quizzes table exists and structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
ORDER BY ordinal_position;

-- 2. Check RLS policies on quizzes table
SELECT * FROM pg_policies WHERE tablename = 'quizzes';

-- 3. Check if current user can insert (test with sample data)
-- Replace 'YOUR_USER_ID' with actual user ID from auth.users
SELECT auth.uid(); -- This shows current user ID

-- 4. Test simple insert
-- INSERT INTO quizzes (title, description, questions, created_by) 
-- VALUES ('Test Quiz', 'Test Description', '[]'::jsonb, auth.uid());