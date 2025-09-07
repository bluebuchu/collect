import { useState, useEffect } from 'react';

// Google OAuth 사용자 정보 타입 정의
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

// 보안을 위해 하드코딩된 클라이언트 ID 사용 (공개 정보이므로 안전함)
// 클라이언트 보안 비밀번호는 절대로 클라이언트 사이드에 노출하지 않음
const GOOGLE_CLIENT_ID = '664057699342-61far8pr8f65ptf6u8q6qq627kjt6nkn.apps.googleusercontent.com';

declare global {
  interface Window {
    google: any;
  }
}

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // localStorage에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('googleUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('googleUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Google Sign-In 라이브러리 초기화
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        try {
          // Replit 환경에서 동적 도메인 처리
          const currentOrigin = window.location.origin;
          console.log('Current origin:', currentOrigin);
          
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            // Replit 환경을 위한 추가 설정
            use_fedcm_for_prompt: false,
            ux_mode: 'popup',
          });
          setIsInitialized(true);
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Google Sign-In:', error);
          setIsInitialized(false);
        }
      }
    };

    // Google 라이브러리가 로드될 때까지 기다림
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(checkGoogle);
        }
      }, 100);

      // 10초 후 타임아웃
      setTimeout(() => {
        clearInterval(checkGoogle);
        console.error('Google Sign-In library failed to load');
      }, 10000);
    }
  }, []);

  // Google 인증 응답 처리
  const handleCredentialResponse = (response: any) => {
    try {
      // JWT 토큰 디코딩 (클라이언트 사이드에서 안전하게 처리)
      const payload = parseJwt(response.credential);
      
      const googleUser: GoogleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
      };

      setUser(googleUser);
      // 보안을 고려하여 민감하지 않은 정보만 localStorage에 저장
      localStorage.setItem('googleUser', JSON.stringify(googleUser));
      
      console.log('Google login successful:', googleUser.name);
    } catch (error) {
      console.error('Failed to process Google credential:', error);
    }
  };

  // JWT 토큰 파싱 (클라이언트 사이드 전용)
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT token:', error);
      throw error;
    }
  };

  // Google 로그인 시작
  const signIn = () => {
    if (isInitialized && window.google) {
      try {
        // Replit 환경에서는 popup 방식 사용
        const currentOrigin = window.location.origin;
        
        // Replit 환경에서는 별도 처리 (모달에서 처리됨)
        if (currentOrigin.includes('.replit.dev') || currentOrigin.includes('.replit.app')) {
          console.warn('Replit domain detected. Google OAuth requires domain authorization.');
          return;
        }
        
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Failed to start Google sign-in:', error);
        alert('Google 로그인 중 오류가 발생했습니다. 브라우저 콘솔을 확인하세요.');
      }
    } else {
      alert('Google Sign-In이 아직 초기화되지 않았습니다. 잠시 후 다시 시도하세요.');
    }
  };

  // Google 로그아웃
  const signOut = () => {
    try {
      setUser(null);
      localStorage.removeItem('googleUser');
      
      // Google Sign-In 세션도 정리
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      console.log('Google logout successful');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // 로그인 버튼 렌더링 (비활성화됨 - 커스텀 버튼만 사용)
  const renderSignInButton = (element: HTMLElement) => {
    // 자동 렌더링 비활성화
    return;
  };

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    signIn,
    signOut,
    renderSignInButton,
  };
}