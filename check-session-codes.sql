-- Check existing sessions and their codes
-- Execute this in Supabase SQL Editor

-- First check if sessions table exists
SELECT COUNT(*) as session_count FROM sessions;

-- Then list all sessions
SELECT id, code, status, quiz_id, created_by, created_at 
FROM sessions 
ORDER BY created_at DESC;