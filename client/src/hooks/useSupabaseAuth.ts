import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import type { User, Session } from '@supabase/supabase-js'

export interface SupabaseAuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['sentences'] })
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error

      // Supabase가 자동으로 Google OAuth 페이지로 리디렉션함
      console.log('Redirecting to Google OAuth...')
      
    } catch (error: any) {
      console.error('Google sign in error:', error)
      toast({
        title: "로그인 실패",
        description: error.message || "Google 로그인 중 오류가 발생했습니다.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  // 일반 이메일 로그인
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast({
        title: "로그인 성공",
        description: "환영합니다!"
      })

      return data
    } catch (error: any) {
      console.error('Email sign in error:', error)
      toast({
        title: "로그인 실패",
        description: error.message || "이메일 로그인 중 오류가 발생했습니다.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 회원가입
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) throw error

      toast({
        title: "회원가입 성공",
        description: "이메일을 확인해주세요."
      })

      return data
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // 로컬 상태 초기화
      setUser(null)
      setSession(null)
      
      // 쿼리 캐시 초기화
      queryClient.clear()

      toast({
        title: "로그아웃",
        description: "성공적으로 로그아웃되었습니다."
      })

      // 랜딩 페이지로 리디렉션 (로그인 페이지)
      // 타이머를 사용하여 확실하게 리디렉션
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast({
        title: "로그아웃 실패",
        description: error.message || "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  // 비밀번호 재설정 이메일 전송
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      toast({
        title: "이메일 전송",
        description: "비밀번호 재설정 이메일을 확인해주세요."
      })
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast({
        title: "전송 실패",
        description: error.message || "비밀번호 재설정 이메일 전송에 실패했습니다.",
        variant: "destructive"
      })
      throw error
    }
  }

  // 비밀번호 업데이트
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast({
        title: "비밀번호 변경",
        description: "비밀번호가 성공적으로 변경되었습니다."
      })
    } catch (error: any) {
      console.error('Password update error:', error)
      toast({
        title: "변경 실패",
        description: error.message || "비밀번호 변경에 실패했습니다.",
        variant: "destructive"
      })
      throw error
    }
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }
}