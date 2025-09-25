const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function jsonHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function handleRes(res: Response) {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res
}

export default {
  get: (path: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sc_token') : null
    return fetch(`${API_BASE}${path}`, { headers: jsonHeaders(token || undefined) }).then(handleRes)
  },
  post: (path: string, { body }: { body?: any } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sc_token') : null
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: jsonHeaders(token || undefined),
      body: body ? JSON.stringify(body) : undefined
    }).then(handleRes)
  },
  put: (path: string, { body }: { body?: any } = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sc_token') : null
    return fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: jsonHeaders(token || undefined),
      body: body ? JSON.stringify(body) : undefined
    }).then(handleRes)
  },
  del: (path: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sc_token') : null
    return fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: jsonHeaders(token || undefined)
    }).then(handleRes)
  }
}
