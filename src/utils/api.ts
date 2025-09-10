// Utility for building API URLs that supports a production base URL
// If VITE_API_BASE_URL is set (e.g. https://immo-find-api.onrender.com),
// we build absolute URLs against it. Otherwise we fall back to the dev proxy '/api'.

const RAW_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined

// Ensure we only keep protocol+host (and optional base path) without trailing slash
const NORMALIZED_BASE = RAW_BASE ? RAW_BASE.replace(/\/$/, '') : undefined

export function buildApiUrl(endpoint: string, queryString?: string) {
  const cleanEndpoint = endpoint.replace(/^\//, '') // remove leading slash
  if (NORMALIZED_BASE) {
    return `${NORMALIZED_BASE}/${cleanEndpoint}${queryString ? (queryString.startsWith('?') ? queryString : `?${queryString}`) : ''}`
  }
  // Dev fallback uses Vite proxy: '/api' prefix will be stripped by proxy to backend
  return `/api/${cleanEndpoint}${queryString ? (queryString.startsWith('?') ? queryString : `?${queryString}`) : ''}`
}

export async function apiFetch(input: string, init?: RequestInit) {
  // Convenience wrapper identical to window.fetch but via buildApiUrl for relative endpoints
  // Accept either already-built absolute/relative URL or an endpoint (without '/api'). If it
  // looks like http(s) we pass through.
  if (/^https?:\/\//i.test(input)) {
    return fetch(input, init)
  }
  return fetch(buildApiUrl(input), init)
}
