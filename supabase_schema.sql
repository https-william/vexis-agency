-- Vexis Agency - Persistent Memory Architecture
-- Execute this script in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can only read their own messages"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
    ON public.chat_messages FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
    ON public.chat_messages FOR DELETE
    USING (auth.uid() = user_id);

-- Create an index to speed up message retrieval per user and agent
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_agent 
    ON public.chat_messages(user_id, agent_id);
