import { createClient } from '@supabase/supabase-js';

// Robust in-memory storage adapter that never crashes Expo Go or native simulators
const memoryStorage = new Map();
const safeStorage = {
  getItem: async (key) => {
    return memoryStorage.has(key) ? memoryStorage.get(key) : null;
  },
  setItem: async (key, value) => {
    memoryStorage.set(key, String(value));
  },
  removeItem: async (key) => {
    memoryStorage.delete(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pqekoqryvpfomexmptik.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZWtvcXJ5dnBmb21leG1wdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MzA0ODIsImV4cCI6MjEwNzIwNjQ4Mn0.r32Ax0I_rW9EkmkyDSIbUc7lSUU0P51StmpDhsXf7G8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
