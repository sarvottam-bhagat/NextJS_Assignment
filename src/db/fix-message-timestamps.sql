-- Fix message timestamps to be more recent and in proper chronological order
-- This will help test the message ordering functionality

-- Update messages for Test El Centro conversation to have recent timestamps in proper order
UPDATE public.messages 
SET timestamp = '2024-12-19 05:28:00+00'
WHERE conversation_id = '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b' 
  AND content = 'test el centro';

UPDATE public.messages 
SET timestamp = '2024-12-19 06:51:00+00'
WHERE conversation_id = '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b' 
  AND content = 'Hello, Livonia!';

UPDATE public.messages 
SET timestamp = '2024-12-19 09:01:00+00'
WHERE conversation_id = '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b' 
  AND content = 'Hello, South Euna!';

UPDATE public.messages 
SET timestamp = '2024-12-19 11:33:00+00'
WHERE conversation_id = '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b' 
  AND content = 'CVFER';

UPDATE public.messages 
SET timestamp = '2024-12-19 11:54:00+00'
WHERE conversation_id = '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b' 
  AND content = 'CDERT';

UPDATE public.messages 
SET timestamp = '2024-12-19 12:27:00+00'
WHERE conversation_id = '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b' 
  AND content = 'hello';

-- Update other conversations to have recent timestamps
UPDATE public.messages 
SET timestamp = '2024-12-19 13:30:00+00'
WHERE conversation_id = '1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d' 
  AND content = 'This doesn''t go on Tuesday';

UPDATE public.messages 
SET timestamp = '2024-12-19 09:00:00+00'
WHERE conversation_id = '2b3c4d5e-6f7a-4b9c-0d1e-2f3a4b5c6d7e' 
  AND content = 'Test message';

-- Add a few more test messages with proper timestamps to verify ordering
INSERT INTO public.messages (conversation_id, sender_id, content, timestamp, is_read)
VALUES
  -- Add some messages for today to test the "Today" grouping
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', 'Good morning!', NOW() - INTERVAL '2 hours', false),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '8e7d6c5b-4a3f-2e1d-0c9b-8a7d6e5f4c3b', 'How are you doing?', NOW() - INTERVAL '1 hour', false),
  ('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '9f8b5c2e-1a3d-4f6e-8c7b-9d0e2f1a3b5c', 'I am doing well, thanks!', NOW() - INTERVAL '30 minutes', false);
