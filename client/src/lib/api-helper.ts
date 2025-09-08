// API helper functions for better error handling

export async function fetchAPI(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get('Content-Type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (isJson) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Failed to parse JSON error
        }
      } else {
        // Try to get text error
        try {
          const textError = await response.text();
          if (textError) {
            errorMessage = textError;
          }
        } catch {
          // Failed to get text error
        }
      }
      
      throw new Error(errorMessage);
    }

    // Parse JSON response
    if (isJson) {
      return await response.json();
    }
    
    // Return text for non-JSON responses
    return await response.text();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}