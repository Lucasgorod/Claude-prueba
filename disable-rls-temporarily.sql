-- Temporary fix: Disable RLS on profiles table for testing
-- WARNING: This removes security - only for development/testing

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Or alternatively, create a simple policy that allows all operations
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow all access" ON profiles;
-- CREATE POLICY "Allow all access" ON profiles FOR ALL USING (true);