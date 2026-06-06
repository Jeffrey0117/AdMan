'use client'

/**
 * Admin UI 的 API client
 * Token 存 localStorage，所有請求自動帶 Authorization header
 * 收到 401 就清掉 token 並通知 AuthGate 重新要求登入
 */

const TOKEN_KEY = 'adman_token'
export const AUTH_CHANGED_EVENT = 'adman-auth-changed'

export function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(input, { ...init, headers })
  if (res.status === 401) {
    clearToken()
  }
  return res
}

/** 驗證 token 是否有效（打受保護的 probe 端點） */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/check', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}
