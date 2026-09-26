const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('farmmitra_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('farmmitra_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('farmmitra_token');
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorRes = data as ApiErrorResponse;
    const msg =
      errorRes.details && errorRes.details.length > 0
        ? errorRes.details.map((d) => `${d.field}: ${d.message}`).join(', ')
        : errorRes.error || errorRes.message || 'API Request failed';
    throw new Error(msg);
  }

  return data as T;
}
