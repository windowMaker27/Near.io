import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Client Supabase côté navigateur.
 * À utiliser dans tous les composants 'use client' et les pages client.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
