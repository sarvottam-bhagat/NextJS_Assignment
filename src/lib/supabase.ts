import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback to the current values for local development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sysdmrfkkvbmwifzspkd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5c2RtcmZra3ZibXdpZnpzcGtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc0MzcxNywiZXhwIjoyMDYzMzE5NzE3fQ.Ax-xO4rQ0PTvVqczTdqbesXMd_j4F7lz9kG3f31P0Go';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
