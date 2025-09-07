import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeaders } from "./auth";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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
    
  const headers: HeadersInit = {
    ...getAuthHeaders(),
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
  return res.json();
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
    return await res.json();
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
