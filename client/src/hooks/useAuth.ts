import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { getToken, setToken, removeToken, getAuthHeaders } from "@/lib/auth";
import { fetchAPI } from "@/lib/api-helper";

export function useAuth() {
  // 임시로 모든 API 호출을 건너뛰고 가짜 데이터 반환
  const MOCK_AUTH = false; // false로 변경하여 실제 인증 사용
  
  if (MOCK_AUTH) {
    console.log("[useAuth] MOCK MODE - Returning fake user");
    const mockUser = {
      id: 1,
      email: "test@test.com",
      nickname: "테스트사용자",
      bio: "테스트 계정",
      profileImage: null
    } as User;
    
    return {
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      error: null
    };
  }
  
  // 원래 코드 
  const { data: user = null, isLoading = false, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      console.log("[useAuth] Fetching user...");
      try {
        // Vite 프록시 사용 (원래대로)
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        console.log("[useAuth] Response status:", response.status);
        
        if (!response.ok) {
          // 401은 정상적인 "로그인 안됨" 상태
          if (response.status === 401) {
            console.log("[useAuth] Not authenticated (401)");
            return null;
          }
          throw new Error('Server error');
        }
        
        const data = await response.json();
        console.log("[useAuth] User data:", data.user);
        return data.user;
      } catch (err) {
        console.error("[useAuth] Error:", err);
        return null;
      }
    },
    retry: false,
    staleTime: 60 * 60 * 1000, // 60분간 캐시 유지
    gcTime: 2 * 60 * 60 * 1000, // 2시간 캐시 보관
    refetchOnWindowFocus: false, // 창 포커스시 재요청 안함
    refetchOnMount: false, // 마운트시 재요청 안함  
    refetchOnReconnect: false, // 재연결시 재요청 안함
    enabled: true,
  });

  const isAuthenticated = !!user;
  
  console.log("[useAuth] Return values:", { user, isLoading, isAuthenticated });
  
  return {
    user: user || null,
    isLoading,
    isAuthenticated,
    error: null, // 401은 에러가 아님
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
        console.log("[Login] JWT token stored successfully");
      } else {
        console.warn("[Login] No JWT token received from server");
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
        console.log("[Register] JWT token stored successfully");
      } else {
        console.warn("[Register] No JWT token received from server");
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
      console.log("[Logout] Starting unified logout process...");
      
      // 1. 모든 인증 관련 토큰 제거
      const authKeys = [
        'auth_token', 'jwt', 'token', 'accessToken', 'refreshToken',
        'supabase.auth.token', 'google_auth_token', 'session_token'
      ];
      
      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove ${key}:`, e);
        }
      });
      
      // 세션 스토리지도 완전히 정리
      sessionStorage.clear();
      
      console.log("[Logout] All tokens removed");
      
      // 2. 쿼리 캐시 완전 정리
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.cancelQueries();
      queryClient.setQueryData(["/api/auth/me"], null);
      console.log("[Logout] Query cache cleared");
      
      // 3. 모든 쿠키 강제 삭제
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          // 다양한 도메인과 경로 조합으로 쿠키 삭제 시도
          const domains = ['', window.location.hostname, `.${window.location.hostname}`];
          const paths = ['/', '/api', '/auth'];
          
          domains.forEach(domain => {
            paths.forEach(path => {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};${domain ? `domain=${domain};` : ''}`;
              document.cookie = `${name}=;Max-Age=0;path=${path};${domain ? `domain=${domain};` : ''}`;
            });
          });
        }
      });
      console.log("[Logout] All cookies cleared");
      
      // 4. 서버 세션 파괴 (동기적으로 처리)
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        console.log("[Logout] Server logout completed");
      } catch (error) {
        console.warn("[Logout] Server logout error:", error);
      }
      
      // 5. 브라우저 캐시 정리
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
      console.log("[Logout] Redirecting to home...");
      // 즉시 홈으로 리다이렉트 (replace 사용하여 히스토리에서 제거)
      window.location.replace('/');
    },
    onError: (error) => {
      console.error("[Logout] Error occurred:", error);
      // 에러가 발생해도 강제로 리다이렉트
      window.location.replace('/');
    }
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