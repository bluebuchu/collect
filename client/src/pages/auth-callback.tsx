import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL 해시에서 에러 확인
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        if (error) {
          console.error('Auth error:', error, errorDescription);
          setLocation('/?error=' + encodeURIComponent(errorDescription || error));
          return;
        }

        // 현재 세션 확인
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setLocation('/?error=' + encodeURIComponent(sessionError.message));
          return;
        }

        if (session) {
          console.log('Successfully signed in via OAuth');
          
          // 기존 사용자 데이터와 동기화 (필요한 경우)
          await syncUserData(session.user);
          
          // 홈으로 리디렉션
          setLocation('/');
        } else {
          // 세션이 없으면 랜딩 페이지로
          setLocation('/');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setLocation('/?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  // 사용자 데이터 동기화 (Supabase Auth와 기존 DB)
  const syncUserData = async (authUser: any) => {
    try {
      // Supabase Auth 사용자 정보
      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        avatar: authUser.user_metadata?.avatar_url,
        provider: authUser.app_metadata?.provider || 'email'
      };

      // 서버의 기존 사용자 테이블과 동기화
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser.access_token}`
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to sync user data');
      }
    } catch (error) {
      console.error('User sync error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            인증 처리 중...
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    </div>
  );
}