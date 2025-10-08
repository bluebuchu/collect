import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Google OAuth 사용자 정보 타입 정의
export interface GoogleUser {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  bio?: string;
}

export interface GoogleAuthStatus {
  user: GoogleUser | null;
  isGoogleOAuthEnabled: boolean;
  currentHost?: string;
  message?: string;
}

// 서버 측 OAuth를 사용하므로 클라이언트 ID는 필요없음

declare global {
  interface Window {
    google: any;
  }
}

export function useGoogleAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // 서버에서 Google OAuth 상태 정보 가져오기
  const { data: authData, isLoading, error, refetch } = useQuery<GoogleAuthStatus>({
    queryKey: ['google-auth'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/google/status', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        return { user: null, isGoogleOAuthEnabled: false };
      } catch (err) {
        console.error('Failed to fetch Google auth status:', err);
        return { user: null, isGoogleOAuthEnabled: false };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false
  });

  const user = authData?.user || null;
  const isGoogleOAuthEnabled = authData?.isGoogleOAuthEnabled || false;

  // 서버 OAuth 사용이므로 클라이언트 라이브러리 초기화 불필요
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // 서버에서 Google OAuth 처리하므로 클라이언트에서 JWT 처리 불필요

  // Google 로그인 시작 - 서버 OAuth 엔드포인트로 리디렉션
  const signIn = () => {
    window.location.href = '/api/auth/google';
  };

  // Google 로그아웃
  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/google/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // 쿼리 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['google-auth'] });
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        console.log('Google logout successful');
      }
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    isGoogleOAuthEnabled,
    signIn,
    signOut,
    refetch,
    message: authData?.message
  };
}