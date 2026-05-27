const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4300/api').replace(/\/$/, '')

export function createApiClient(role) {
  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Workven-Role': role,
        ...(options.headers || {}),
      },
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || `Request failed with ${response.status}`)
    }

    return response.json()
  }

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  }
}
