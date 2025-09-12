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
          if (response.status === 401 && token) {
            removeToken();
          }
          throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        return data.user;
      } catch (error) {
        throw new Error('Not authenticated');
      }
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
      // Remove JWT token
      removeToken();
      
      // Also call logout endpoint to destroy session (if any)
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        
        if (!response.ok) {
          console.warn("Session logout failed, but token removed");
        }
      } catch (error) {
        console.warn("Session logout failed, but token removed");
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.clear();
      sessionStorage.removeItem('hasShownDailySentence'); // Clear on logout
      // 로그아웃 후 첫 페이지로 이동
      window.location.href = "/";
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