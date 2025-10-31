import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

// 사용자 활동을 감지하고 토큰을 자동 갱신하는 훅
export function useActivityTracker() {
  const { user } = useAuth();
  const lastActivityRef = useRef(Date.now());
  const tokenRefreshTimeoutRef = useRef<NodeJS.Timeout>();

  // 토큰 갱신 함수
  const refreshToken = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
          console.log('[Activity] Token refreshed due to user activity');
        }
      } else if (response.status === 401) {
        // 토큰 갱신 실패 시 로그아웃 처리
        console.warn('[Activity] Token refresh failed - redirecting to login');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('supabase_token');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('[Activity] Token refresh failed:', error);
    }
  };

  // 사용자 활동 감지 함수
  const handleActivity = () => {
    if (!user) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // 5분 이상 경과한 경우에만 토큰 갱신
    if (timeSinceLastActivity > 5 * 60 * 1000) {
      lastActivityRef.current = now;
      refreshToken();
    }

    // 기존 타임아웃 클리어
    if (tokenRefreshTimeoutRef.current) {
      clearTimeout(tokenRefreshTimeoutRef.current);
    }

    // 55분 후 토큰 갱신 예약 (1시간 만료 전에 미리 갱신)
    tokenRefreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, 55 * 60 * 1000);
  };

  useEffect(() => {
    if (!user) return;

    // 감지할 이벤트 목록
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // 이벤트 리스너 등록
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // 초기 활동 시간 설정
    handleActivity();

    // 클린업
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (tokenRefreshTimeoutRef.current) {
        clearTimeout(tokenRefreshTimeoutRef.current);
      }
    };
  }, [user]);

  return null;
}