// lib/client.js
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// This client automatically shares cookies with your Next.js Middleware!
export const supabase = createBrowserClient(supabaseUrl!, supabaseAnonKey!)