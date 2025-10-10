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
      localStorage.clear();
      
      // 3. 쿼리 캐시 즉시 클리어 (mutationFn 내부에서 처리)
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.cancelQueries();
      queryClient.setQueryData(["/api/auth/me"], null);
      console.log("[Logout] Query cache cleared");
      
      // 4. 서버 세션 파괴 (실패해도 진행)
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          console.log("[Logout] Server session destroyed");
        }
      } catch (error) {
        console.warn("[Logout] Server logout error, but proceeding:", error);
      }
      
      // 5. 크롬 브라우저 쿠키 강제 삭제
      if (isChrome) {
        const cookieNames = ['sessionId', 'connect.sid', 'jwt', 'auth-token'];
        const domains = ['', '.vercel.app', `.${window.location.hostname}`, window.location.hostname];
        
        cookieNames.forEach(name => {
          domains.forEach(domain => {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domain ? `domain=${domain};` : ''}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domain ? `domain=${domain};` : ''} secure; samesite=none`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domain ? `domain=${domain};` : ''} secure; samesite=lax`;
            document.cookie = `${name}=; Max-Age=0; path=/; ${domain ? `domain=${domain};` : ''}`;
          });
        });
        console.log("[Logout] Chrome: Cookies force deleted");
      }
      
      // 6. 브라우저 캐시 삭제
      if ('caches' in window) {
        try {
          const names = await caches.keys();
          await Promise.all(names.map(name => caches.delete(name)));
          console.log("[Logout] Browser caches cleared");
        } catch (e) {
          console.warn("[Logout] Cache clear error:", e);
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      console.log("[Logout] Performing complete page replacement...");
      
      // 완전한 페이지 교체로 모든 JavaScript 상태 초기화
      // replace를 사용하여 히스토리 스택에서도 제거
      window.location.replace(window.location.origin);
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