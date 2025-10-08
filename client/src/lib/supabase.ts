import { createClient } from '@supabase/supabase-js'

// Supabase 환경 변수
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upemqhahrliikgtqqeor.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZW1xaGFocmxpaWtndHFxZW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MjMwODUsImV4cCI6MjA3MjE5OTA4NX0.d64QdZZnEcgAg0ncVh2SpiFUBERcRU6_NQrUeLT817s'

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
})

// 디버깅용
if (typeof window !== 'undefined') {
  console.log('Supabase initialized:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  })
}