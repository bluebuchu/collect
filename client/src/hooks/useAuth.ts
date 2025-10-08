import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { getToken, setToken, removeToken, getAuthHeaders } from "@/lib/auth";
import { fetchAPI } from "@/lib/api-helper";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const token = getToken();
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers,
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // 401 에러 시 JWT 토큰만 삭제
            removeToken();
          }
          throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        return data.user;
      } catch (error) {
        // 에러 발생 시에도 JWT 토큰만 삭제
        removeToken();
        throw new Error('Not authenticated');
      }
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,  // 401 에러 시 무한 요청 방지
    refetchOnMount: false,  // 마운트 시 재요청 방지
    refetchInterval: false,
  });

  const isAuthenticated = !!user && !error;
  console.log("useAuth:", { user: user?.nickname, isLoading, error: error?.message, isAuthenticated });

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      console.log("Attempting login for:", credentials.email);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(credentials),
      });

      console.log("Login response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("Login error response:", error);
        throw new Error(error.message || "로그인에 실패했습니다.");
      }

      const result = await response.json();
      console.log("Login success:", result);
      
      // Store JWT token if provided
      if (result.token) {
        setToken(result.token);
      }
      
      return result;
    },
    onSuccess: (data) => {
      console.log("Login mutation success:", data);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: { 
      email: string; 
      password: string; 
      nickname: string; 
      bio?: string 
    }) => {
      console.log("Attempting register for:", userData.email);
      
      // Send nickname field to match server schema
      const registerData = {
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname,
      };
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(registerData),
      });

      console.log("Register response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("Register error response:", error);
        throw new Error(error.error || "회원가입에 실패했습니다.");
      }

      const result = await response.json();
      console.log("Register success:", result);
      
      // Store JWT token if provided
      if (result.token) {
        setToken(result.token);
      }
      
      return result;
    },
    onSuccess: (data) => {
      console.log("Register mutation success:", data);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      console.log("[Logout] Starting logout process...");
      
      // 브라우저 및 환경 감지
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isProduction = window.location.hostname.includes('vercel.app');
      console.log("[Logout] Environment:", { isChrome, isProduction, host: window.location.hostname });
      
      // 1. JWT 토큰 제거
      removeToken();
      console.log("[Logout] JWT token removed");
      
      // 2. 모든 스토리지 클리어
      sessionStorage.clear();
      localStorage.clear(); // 프로덕션에서는 완전 클리어
      
      console.log("[Logout] Storage cleared completely");
      
      // 3. 서버 세션 파괴
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            // Chrome과 프로덕션 정보 전달
            ...(isChrome && { 'X-Chrome-Logout': 'true' }),
            ...(isProduction && { 'X-Production-Logout': 'true' })
          }
        });
        
        const result = await response.json();
        console.log("[Logout] Server response:", result);
        
        if (!response.ok) {
          console.warn("[Logout] Session logout failed, but proceeding with client cleanup");
        }
      } catch (error) {
        console.warn("[Logout] Session logout error, but proceeding:", error);
      }
      
      // Chrome + 프로덕션 특별 처리
      if (isChrome && isProduction) {
        // 쿠키 강제 삭제 시도 (여러 도메인 조합)
        const cookieNames = ['sessionId', 'connect.sid'];
        const domains = ['', '.vercel.app', `.${window.location.hostname}`];
        
        cookieNames.forEach(name => {
          domains.forEach(domain => {
            // 과거 날짜로 설정하여 쿠키 삭제
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domain ? `domain=${domain};` : ''}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domain ? `domain=${domain};` : ''} secure; samesite=lax`;
          });
        });
        
        console.log("[Logout] Chrome production: Forced cookie deletion attempted");
      }
      
      return { success: true };
    },
    onSuccess: () => {
      console.log("[Logout] Clearing query cache...");
      
      // 쿼리 캐시 완전 초기화
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.cancelQueries();
      
      // 브라우저 캐시도 초기화 시도
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      console.log("[Logout] Performing hard reload...");
      
      // Vercel 프로덕션에서 확실한 로그아웃을 위한 하드 리로드
      // 모든 JavaScript 상태와 메모리를 완전히 초기화
      const isProduction = window.location.hostname.includes('vercel.app');
      
      if (isProduction) {
        // 프로덕션: 즉시 하드 리로드
        window.location.href = window.location.origin + '/?logout=true&t=' + Date.now();
      } else {
        // 로컬 개발: 기존 방식
        setTimeout(() => {
          window.location.href = "/";
          setTimeout(() => {
            window.location.reload(true);
          }, 50);
        }, 100);
      }
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { 
      nickname?: string; 
      bio?: string; 
      profileImage?: string 
    }) => {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "프로필 업데이트에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}