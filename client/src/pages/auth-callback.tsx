import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // OAuth callback 처리 (Google OAuth 등)
    // 현재는 Supabase Auth를 사용하지 않으므로 바로 리디렉션
    const handleAuthCallback = async () => {
      try {
        // URL 파라미터 확인
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const success = params.get('success');
        
        if (error) {
          console.error('Auth error:', error);
          setLocation('/?error=' + encodeURIComponent(error));
          return;
        }

        if (success === 'google_login') {
          // Google OAuth 성공 - 이미 서버에서 세션 생성됨
          console.log('Google OAuth login successful');
          setLocation('/');
        } else {
          // 기본 동작: 홈으로 리디렉션
          setLocation('/');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setLocation('/?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

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