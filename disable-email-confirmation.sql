-- Disable email confirmation for development
-- Execute this in your Supabase SQL Editor

-- Option 1: Confirm specific user manually
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'lucasgorod@gmail.com';

-- Option 2: Confirm all existing users (if needed)
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Option 3: Also update any email confirmation tokens
DELETE FROM auth.identities 
WHERE provider = 'email' 
AND user_id IN (
  SELECT id FROM auth.users WHERE email = 'lucasgorod@gmail.com'
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'lucasgorod@gmail.com' 
AND id NOT IN (SELECT user_id FROM auth.identities WHERE provider = 'email');