import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials
// When you create your Supabase project, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
