import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Loader2, LogOut } from 'lucide-react';

interface SupabaseGoogleButtonProps {
  className?: string;
  showUserInfo?: boolean;
}

export function SupabaseGoogleButton({ className = '', showUserInfo = false }: SupabaseGoogleButtonProps) {
  const { user, isLoading, isAuthenticated, signInWithGoogle, signOut } = useSupabaseAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-500">인증 확인 중...</span>
      </div>
    );
  }

  // 로그인된 상태
  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showUserInfo && (
          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name || user.email}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{user.email}</div>
            </div>
          </div>
        )}
        <Button
          onClick={async () => {
            setIsSigningOut(true);
            await signOut();
            setIsSigningOut(false);
          }}
          variant="outline"
          size="sm"
          disabled={isSigningOut}
          className="flex items-center gap-2"
        >
          {isSigningOut ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          로그아웃
        </Button>
      </div>
    );
  }

  const isModalContext = className?.includes('w-full');

  // Google 로그인 버튼
  return (
    <div className={className}>
      <Button
        onClick={async () => {
          try {
            setIsSigningIn(true);
            await signInWithGoogle();
            // Supabase가 자동으로 리디렉션 처리
          } catch (error) {
            console.error('Google sign in error:', error);
            setIsSigningIn(false);
          }
        }}
        variant="outline"
        disabled={isSigningIn}
        className={`flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 ${
          isModalContext ? 'w-full py-3' : ''
        }`}
        style={isModalContext ? { fontFamily: "'Pretendard', sans-serif" } : {}}
      >
        {isSigningIn && <Loader2 className="w-4 h-4 animate-spin" />}
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>{isSigningIn ? '로그인 중...' : 'Google로 로그인'}</span>
      </Button>
      
      {/* Supabase Auth 장점 안내 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        ✨ 모든 도메인에서 작동 • 안전한 인증
      </div>
    </div>
  );
}