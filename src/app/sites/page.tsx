'use client'

import { apiFetch } from '@/lib/api-client'
import { useState, useEffect, useCallback, type FormEvent } from 'react'
import Link from 'next/link'
import type { Site } from '@/lib/models'

/** 站點分析管理：建站點拿 site key，一行 script 裝到任何網站 */
export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [origins, setOrigins] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/sites')
      if (res.ok) setSites(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const allowedOrigins = origins
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
      const res = await apiFetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), allowedOrigins }),
      })
      if (res.ok) {
        setName('')
        setOrigins('')
        await load()
      }
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('刪除站點？事件數據會留著但不再收新事件。')) return
    await apiFetch(`/api/sites/${id}`, { method: 'DELETE' })
    await load()
  }

  const snippetFor = (siteKey: string) =>
    `<script defer src="${baseUrl}/embed/track.js" data-site="${siteKey}"></script>`

  const copySnippet = (siteKey: string) => {
    navigator.clipboard.writeText(snippetFor(siteKey))
    setCopied(siteKey)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div className="py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">站點數據</h1>
        <p className="text-sm text-zinc-500 mt-1">
          建一個站點拿 site key，把一行 script 貼進網站就開始收數據（瀏覽、停留、漏斗、CTA）
        </p>
      </div>

      {/* 新增站點 */}
      <form
        onSubmit={handleCreate}
        className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 space-y-3"
      >
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="站點名稱（例：我的部落格）"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="rounded-lg bg-zinc-900 text-white px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            {creating ? '建立中…' : '建立站點'}
          </button>
        </div>
        <input
          value={origins}
          onChange={(e) => setOrigins(e.target.value)}
          placeholder="允許的 Origin（選填，逗號分隔，例：https://example.com — 不填則不限制）"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </form>

      {/* 站點列表 */}
      {loading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : sites.length === 0 ? (
        <p className="text-sm text-zinc-400">還沒有站點，建一個開始收數據</p>
      ) : (
        <div className="space-y-4">
          {sites.map((site) => (
            <div key={site.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <Link
                    href={`/sites/${site.id}`}
                    className="font-semibold text-zinc-900 hover:underline"
                  >
                    {site.name}
                  </Link>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono">{site.id}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/sites/${site.id}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:border-zinc-300"
                  >
                    看數據
                  </Link>
                  <button
                    onClick={() => handleDelete(site.id)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-red-500 hover:border-red-300"
                  >
                    刪除
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 block rounded-lg bg-zinc-50 border border-zinc-100 px-3 py-2 text-xs text-zinc-600 overflow-x-auto whitespace-nowrap">
                  {snippetFor(site.id)}
                </code>
                <button
                  onClick={() => copySnippet(site.id)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600 hover:text-zinc-900 shrink-0"
                >
                  {copied === site.id ? '已複製 ✓' : '複製'}
                </button>
              </div>
              {site.allowedOrigins.length > 0 && (
                <p className="text-xs text-zinc-400 mt-2">
                  限定 Origin：{site.allowedOrigins.join('、')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
