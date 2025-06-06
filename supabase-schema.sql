-- Supabase Database Schema for Quiz Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'student', 'admin')) DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'active', 'paused', 'completed')) DEFAULT 'waiting',
  current_question_index INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  participant_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants table
CREATE TABLE participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('connected', 'disconnected')) DEFAULT 'connected',
  current_question_index INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses table
CREATE TABLE responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer JSONB NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  points INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Teachers can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

-- Quizzes policies
CREATE POLICY "Teachers can manage their own quizzes" ON quizzes FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Anyone can view quizzes for sessions they participate in" ON quizzes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions s
    JOIN participants p ON p.session_id = s.id
    WHERE s.quiz_id = quizzes.id
  )
);

-- Sessions policies
CREATE POLICY "Teachers can manage their own sessions" ON sessions FOR ALL USING (created_by = auth.uid());
CREATE POLICY "Anyone can view sessions" ON sessions FOR SELECT USING (true);

-- Participants policies
CREATE POLICY "Anyone can join sessions" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view participants in their sessions" ON participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM participants p2 
    WHERE p2.session_id = participants.session_id
  )
);
CREATE POLICY "Participants can update their own status" ON participants FOR UPDATE USING (true);

-- Responses policies
CREATE POLICY "Anyone can submit responses" ON responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Teachers can view responses in their sessions" ON responses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = responses.session_id AND s.created_by = auth.uid()
  )
);
CREATE POLICY "Participants can view responses in their sessions" ON responses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM participants p
    WHERE p.id = responses.participant_id OR p.session_id = responses.session_id
  )
);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Indexes for better performance
CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_sessions_created_by ON sessions(created_by);
CREATE INDEX idx_sessions_code ON sessions(code);
CREATE INDEX idx_participants_session_id ON participants(session_id);
CREATE INDEX idx_responses_session_id ON responses(session_id);
CREATE INDEX idx_responses_participant_id ON responses(participant_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE responses;