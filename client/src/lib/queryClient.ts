import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeaders } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    const contentType = res.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else {
        const text = await res.text();
        if (text) errorMessage = text;
      }
    } catch (e) {
      console.error('Error parsing response:', e);
    }
    
    // 401 에러시 자동 로그아웃 처리
    if (res.status === 401) {
      console.warn('[401 Error] Authentication failed - clearing tokens');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('supabase_token');
      // 첫 페이지(랜딩 페이지)로 리디렉션
      window.location.href = '/';
    }
    
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  urlOrMethod: string,
  dataOrOptions?: unknown | { method?: string },
  actualData?: unknown
): Promise<any> {
  // Handle both old signature (url, method, data) and new signature (url, options)
  let url: string;
  let method: string;
  let data: unknown;
  
  if (typeof dataOrOptions === "object" && dataOrOptions !== null && "method" in dataOrOptions) {
    // New signature: apiRequest(url, { method: "GET" })
    url = urlOrMethod;
    method = dataOrOptions.method || "GET";
    data = actualData;
  } else if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(urlOrMethod.toUpperCase())) {
    // Old signature: apiRequest("GET", url, data)
    method = urlOrMethod;
    url = dataOrOptions as string;
    data = actualData;
  } else {
    // Simple GET request: apiRequest(url) or apiRequest(url, data)
    url = urlOrMethod;
    method = "GET";
    data = dataOrOptions;
  }
    
  const authHeaders = getAuthHeaders();
  console.log('[apiRequest] Auth headers:', authHeaders);
  console.log('[apiRequest] URL:', url, 'Method:', method);
  
  // JWT 토큰이 없으면 경고 로그
  if (!authHeaders.Authorization) {
    console.warn('[apiRequest] No JWT token found - relying on session authentication');
  }
  
  const headers: HeadersInit = {
    ...authHeaders,
  };
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(url, {
    method: method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors",
  });

  await throwIfResNotOk(res);
  
  // Check if response has content
  const contentType = res.headers.get('content-type');
  const contentLength = res.headers.get('content-length');
  
  // If no content or empty response
  if (contentLength === '0' || res.status === 204) {
    return { success: true };
  }
  
  // Parse JSON response
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  
  // For non-JSON responses, return as text
  const text = await res.text();
  return { success: true, message: text || 'Operation completed successfully' };
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      mode: "cors",
      headers: {
        ...getAuthHeaders(),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Check content type for proper parsing
    const contentType = res.headers.get('content-type');
    const contentLength = res.headers.get('content-length');
    
    // If no content or empty response
    if (contentLength === '0' || res.status === 204) {
      return null;
    }
    
    // Parse JSON response
    if (contentType?.includes('application/json')) {
      return await res.json();
    }
    
    // For non-JSON responses, try to return as text
    const text = await res.text();
    return text || null;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
