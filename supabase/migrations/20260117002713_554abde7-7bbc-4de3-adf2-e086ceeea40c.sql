-- Create sessions table for persistent memory
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for conversation history
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  intent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create code_snippets table for code sandbox history
CREATE TABLE public.code_snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'typescript',
  code TEXT NOT NULL,
  filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  haptics_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions (public access by user_id for now, can add auth later)
CREATE POLICY "Users can view their sessions" ON public.sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can create sessions" ON public.sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their sessions" ON public.sessions
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their sessions" ON public.sessions
  FOR DELETE USING (true);

-- Create policies for messages
CREATE POLICY "Users can view messages in their sessions" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Users can create messages" ON public.messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete messages" ON public.messages
  FOR DELETE USING (true);

-- Create policies for code_snippets
CREATE POLICY "Users can view code snippets" ON public.code_snippets
  FOR SELECT USING (true);

CREATE POLICY "Users can create code snippets" ON public.code_snippets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update code snippets" ON public.code_snippets
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete code snippets" ON public.code_snippets
  FOR DELETE USING (true);

-- Create policies for user_preferences
CREATE POLICY "Users can view preferences" ON public.user_preferences
  FOR SELECT USING (true);

CREATE POLICY "Users can create preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update preferences" ON public.user_preferences
  FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_code_snippets_session_id ON public.code_snippets(session_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON public.code_snippets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();