-- Add label column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS label TEXT;

-- Update the realtime publication to include the new column
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
