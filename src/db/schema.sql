-- Create a table for users/contacts
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a junction table for users in conversations (many-to-many)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, conversation_id)
);

-- Create a table for messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access during development
-- Note: In production, you'll want to replace these with proper authentication policies
CREATE POLICY "Allow public access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow public access to conversations" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Allow public access to conversation_participants" ON public.conversation_participants FOR ALL USING (true);
CREATE POLICY "Allow public access to messages" ON public.messages FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO public.users (id, name, avatar, status)
VALUES
  ('9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', 'Periskope', 'https://ui-avatars.com/api/?background=4CAF50&color=fff&name=P', 'Online'),
  ('8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', 'Rochirag Airtel', 'https://ui-avatars.com/api/?name=Rochirag+Airtel', 'Last seen 5 min ago'),
  ('7d6e5f4c-3b2a-1e0d-9c8b-7a6d5e4f3c2b', 'Rochirag Jio', 'https://ui-avatars.com/api/?name=Rochirag+Jio', 'Online'),
  ('6c5d4e3b-2a1f-0e9d-8c7b-6a5d4e3f2c1b', 'Bharat Kumar Ramesh', 'https://ui-avatars.com/api/?name=Bharat+Kumar', 'Last seen yesterday'),
  ('5b4c3d2e-1a0f-9e8d-7c6b-5a4c3d2e1f0b', 'Support2', 'https://ui-avatars.com/api/?name=Support2', 'Online');
  
-- Insert sample conversations
INSERT INTO public.conversations (id, name, avatar)
VALUES
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', 'Test Skope Final 5', 'https://ui-avatars.com/api/?name=Test+Skope'),
  ('2b3c4d5e-6f7a-4b9c-0d1e-2f3a4b5c6d7e', 'Periskope Team Chat', 'https://ui-avatars.com/api/?background=4CAF50&color=fff&name=P'),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'Test El Centro', 'https://ui-avatars.com/api/?name=Test+El');

-- Add participants to conversations
INSERT INTO public.conversation_participants (user_id, conversation_id)
VALUES
  -- Test Skope Final 5 conversation participants
  ('9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', '1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d'), -- Periskope
  ('5b4c3d2e-1a0f-9e8d-7c6b-5a4c3d2e1f0b', '1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d'), -- Support2

  -- Periskope Team Chat participants
  ('9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', '2b3c4d5e-6f7a-4b9c-0d1e-2f3a4b5c6d7e'), -- Periskope

  -- Test El Centro participants
  ('9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'), -- Periskope
  ('8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'), -- Rochirag Airtel
  ('7d6e5f4c-3b2a-1e0d-9c8b-7a6d5e4f3c2b', '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'), -- Rochirag Jio
  ('6c5d4e3b-2a1f-0e9d-8c7b-6a5d4e3f2c1b', '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b'); -- Bharat Kumar Ramesh

-- Insert sample messages
INSERT INTO public.messages (conversation_id, sender_id, content, timestamp, is_read)
VALUES
  -- Messages for Test Skope Final 5 conversation
  ('1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d', '5b4c3d2e-1a0f-9e8d-7c6b-5a4c3d2e1f0b', 'This doesn''t go on Tuesday', '2023-02-28 13:30:00', true),

  -- Messages for Periskope Team Chat
  ('2b3c4d5e-6f7a-4b9c-0d1e-2f3a4b5c6d7e', '9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', 'Test message', '2023-02-28 09:00:00', true),

  -- Messages for Test El Centro
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', 'CVFER', '2023-03-01 11:33:00', true),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', 'CDERT', '2023-03-01 11:54:00', true),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', 'hello', '2023-03-01 12:27:00', true),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', 'Hello, South Euna!', '2023-03-01 09:01:00', true),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', 'Hello, Livonia!', '2023-03-01 06:51:00', true),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', 'test el centro', '2023-03-01 05:28:00', true);

-- Enable RLS and set up Real-time functionality
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;

-- Add realtime functionality to these tables
BEGIN;
  -- Drop the publication if it exists
  DROP PUBLICATION IF EXISTS supabase_realtime;

  -- Create a new publication for all tables
  CREATE PUBLICATION supabase_realtime FOR TABLE
    users,
    conversations,
    conversation_participants,
    messages;
COMMIT;
