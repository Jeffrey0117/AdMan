'use client'

import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { usePathname } from 'next/navigation'
import { getToken, setToken, verifyToken, AUTH_CHANGED_EVENT } from '@/lib/api-client'

/**
 * 後台登入閘：沒有有效 token 就擋下整個 UI 要求輸入
 * /preview 路徑放行（單純讀取，後面 API 仍受保護）
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [status, setStatus] = useState<'checking' | 'authed' | 'unauthed'>('checking')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const check = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setStatus('unauthed')
      return
    }
    const ok = await verifyToken(token)
    setStatus(ok ? 'authed' : 'unauthed')
  }, [])

  useEffect(() => {
    check()
    window.addEventListener(AUTH_CHANGED_EVENT, check)
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, check)
  }, [check])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setSubmitting(true)
    setError('')
    const ok = await verifyToken(input.trim())
    if (ok) {
      setToken(input.trim())
      setStatus('authed')
    } else {
      setError('Token 無效，請確認 ADMAN_ADMIN_TOKEN')
    }
    setSubmitting(false)
  }

  // Preview 頁不擋（分享預覽連結用）
  if (pathname?.startsWith('/preview')) {
    return <>{children}</>
  }

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 text-sm">
        Loading…
      </div>
    )
  }

  if (status === 'unauthed') {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4"
        >
          <div>
            <h1 className="text-lg font-semibold">AdMan 管理後台</h1>
            <p className="text-sm text-zinc-500 mt-1">輸入 Admin Token 以繼續</p>
          </div>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ADMAN_ADMIN_TOKEN"
            autoFocus
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? '驗證中…' : '登入'}
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}
