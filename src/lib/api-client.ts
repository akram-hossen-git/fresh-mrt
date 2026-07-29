// import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://active.test/api/v2';
const SYSTEM_KEY = process.env.NEXT_PUBLIC_SYSTEM_KEY || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch helper — routes through the Next.js proxy to avoid CORS issues.
 * Token stored in localStorage, sent as Bearer header.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  console.log(`[apiFetch] ${endpoint} | token: ${token ? token.slice(0, 15) + '...' : 'NONE'}`);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'System-Key': SYSTEM_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.log(`[apiFetch] FAILED ${endpoint} | status: ${res.status} | response:`, errorData);
    throw new ApiError(
      res.status,
      errorData.message || `API error: ${res.status}`
    );
  }

  return res.json();
}

/**
 * Server-side fetch for Server Components — calls Laravel directly.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: { revalidate?: number; tags?: string[] } = {}
): Promise<T> {
  const { revalidate = 60, tags } = options;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'System-Key': SYSTEM_KEY,
    },
    next: {
      revalidate,
      ...(tags ? { tags } : {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status}`);
  }

  return res.json();
}
