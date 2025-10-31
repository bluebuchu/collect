const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Check for Supabase token first, then fall back to regular auth token
  const supabaseToken = localStorage.getItem('supabase_token');
  const authToken = localStorage.getItem(TOKEN_KEY);
  console.log('[getToken] supabase_token:', supabaseToken ? 'exists' : 'null');
  console.log('[getToken] auth_token:', authToken ? 'exists' : 'null');
  return supabaseToken || authToken;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  
  return {
    'Authorization': `Bearer ${token}`,
  };
}