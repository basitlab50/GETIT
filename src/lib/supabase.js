import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials
// When you create your Supabase project, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://pqekoqryvpfomexmptik.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZWtvcXJ5dnBmb21leG1wdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MzA0ODIsImV4cCI6MjEwNzIwNjQ4Mn0.r32Ax0I_rW9EkmkyDSIbUc7lSUU0P51StmpDhsXf7G8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
