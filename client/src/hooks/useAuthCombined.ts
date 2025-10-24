import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// 통합 인증 훅 - Supabase Auth와 세션 인증 통합
export function useAuthCombined() {
  const sessionAuth = useAuth();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase 세션 확인
    checkSupabaseSession();

    // Supabase auth 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      
      // Supabase 토큰을 localStorage에 저장 (API 호출용)
      if (session?.access_token) {
        localStorage.setItem('supabase_token', session.access_token);
      } else {
        localStorage.removeItem('supabase_token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkSupabaseSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSupabaseUser(session?.user ?? null);
      
      if (session?.access_token) {
        localStorage.setItem('supabase_token', session.access_token);
      }
    } catch (error) {
      console.error('Supabase session check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  // Supabase로 로그인
  async function loginWithSupabase(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // 토큰 저장
      if (data.session?.access_token) {
        localStorage.setItem('supabase_token', data.session.access_token);
      }

      // 세션 인증도 시도
      await sessionAuth.login({ email, password });

      return data;
    } catch (error) {
      console.error('Supabase login failed:', error);
      throw error;
    }
  }

  // Supabase로 회원가입
  async function signUpWithSupabase(email: string, password: string, nickname: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nickname }
        }
      });

      if (error) throw error;

      // 세션 인증도 시도
      await sessionAuth.register({ email, password, nickname });

      return data;
    } catch (error) {
      console.error('Supabase signup failed:', error);
      throw error;
    }
  }

  // 로그아웃
  async function logout() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase_token');
      await sessionAuth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // API 호출용 헤더 생성
  function getAuthHeaders() {
    const token = localStorage.getItem('supabase_token');
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // 통합된 사용자 정보
  const user = supabaseUser || sessionAuth.user;
  const isAuthenticated = !!(supabaseUser || sessionAuth.isAuthenticated);

  return {
    user,
    isAuthenticated,
    loading: loading || sessionAuth.loading,
    login: loginWithSupabase,
    signUp: signUpWithSupabase,
    logout,
    getAuthHeaders,
    // 기존 세션 인증 메서드도 유지
    sessionAuth
  };
}