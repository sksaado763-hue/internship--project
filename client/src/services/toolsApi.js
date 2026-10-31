const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Fetches the tool list from the server API.
 * Returns null if the server is unreachable or returns an error.
 * @param {URLSearchParams|Record<string,string>} [params]
 */
export async function fetchTools(params) {
  try {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const response = await fetch(`${API_BASE}/tools${query}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data?.tools ?? null;
  } catch {
    return null;
  }
}

/**
 * Patches a tool's visibility via the API.
 * @param {string} slug
 * @param {boolean} hidden
 */
export async function patchToolVisibility(slug, hidden) {
  const response = await fetch(`${API_BASE}/tools/${slug}/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ hidden }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json?.message ?? 'Request failed');
  return json;
}
