import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { GoogleOAuthSetupModal } from '@/components/google-oauth-setup-modal';
import { LogOut, Settings } from 'lucide-react';

interface GoogleAuthButtonProps {
  className?: string;
  showUserInfo?: boolean;
}

export function GoogleAuthButton({ className = '', showUserInfo = false }: GoogleAuthButtonProps) {
  const { user, isInitialized, isAuthenticated, signIn, signOut, renderSignInButton } = useGoogleAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Google 자동 버튼 렌더링 비활성화 (커스텀 버튼만 사용)

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showUserInfo && (
          <div className="flex items-center gap-2">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
              <div className="text-gray-600 dark:text-gray-400">{user.email}</div>
            </div>
          </div>
        )}
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Google 로그아웃
        </Button>
      </div>
    );
  }

  const handleGoogleSignIn = () => {
    // 서버의 Google OAuth 엔드포인트로 리디렉션
    window.location.href = '/api/auth/google';
  };

  const isModalContext = className?.includes('w-full');

  return (
    <>
      <div className={className}>
        
        {/* 우리가 만든 Google 버튼 */}
        <div className={isModalContext ? "w-full" : "flex gap-2"}>
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className={`flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 ${isModalContext ? 'w-full py-3' : ''}`}
            style={isModalContext ? { fontFamily: "'Pretendard', sans-serif" } : {}}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </Button>
          {window.location.origin.includes('.replit') && !isModalContext && (
            <Button
              onClick={() => setShowSetupModal(true)}
              variant="ghost"
              size="sm"
              title="Google OAuth 설정 도움말"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <GoogleOAuthSetupModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        currentDomain={window.location.origin}
      />
    </>
  );
}