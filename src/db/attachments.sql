-- Add attachment fields to the messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- Create a storage bucket for attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the chat-attachments bucket
-- First, check if the policies already exist and drop them if they do
DO $$
BEGIN
    -- Drop existing policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or other error, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or other error, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or other error, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or other error, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist or other error, continue
    END;
END
$$;

-- Now create the policies
-- Allow public read access to attachments
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-attachments');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update and delete their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'chat-attachments' 
  AND (auth.uid() IS NULL OR auth.uid()::text = owner::text)
);

CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-attachments' 
  AND (auth.uid() IS NULL OR auth.uid()::text = owner::text)
);

-- For development, allow public uploads (remove in production)
CREATE POLICY "Public Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-attachments');

-- Update the realtime publication to include the new columns
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
