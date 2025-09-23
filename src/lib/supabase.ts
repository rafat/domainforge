// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a singleton client instance
let supabaseClient: SupabaseClient | null = null;

// Create a function that returns the client only on the browser
function createSupabaseClient() {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    // Return a mock client for server-side rendering
    return {
      channel: (name: string) => ({
        on: () => ({ 
          subscribe: (callback?: (status: string, err?: any) => void) => {
            if (callback) callback('SUBSCRIBED');
            return {};
          }
        }),
        subscribe: (callback?: (status: string, err?: any) => void) => {
          if (callback) callback('SUBSCRIBED');
          return {};
        },
        unsubscribe: () => {},
        removeAllChannels: () => Promise.resolve()
      }),
      removeChannel: () => Promise.resolve(),
      removeAllChannels: () => Promise.resolve(),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null })
      }
    } as any;
  }
  
  // Create a new client instance if one doesn't exist
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  
  return supabaseClient;
}

export const supabase = createSupabaseClient();