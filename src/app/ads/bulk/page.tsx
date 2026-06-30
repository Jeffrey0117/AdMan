'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/api-client'
import { AD_TYPES, type AdType } from '@/lib/constants'

type ProjectLite = { id: string; name: string }

// 版位中文名 (對用戶講人話, 不露 bottom-banner 這種詞)
const TYPE_LABELS_ZH: Record<AdType, string> = {
  'sidebar-card': '卡牌 (側欄卡片)',
  'bottom-banner': '置底橫幅',
  'in-article-banner': '文章內嵌',
  'modal-popup': '彈窗',
  'top-notification': '頂部通知',
}

type ParsedItem = { ctaUrl: string; imageUrl?: string; headline?: string }

// 每行: 網址 | 圖片網址 | 文字   (分隔符 | 或 tab 或 逗號都接受; 只有網址也行)
function parseLines(raw: string): ParsedItem[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((line) => {
      const parts = line.split(/\s*[|\t,]\s*/)
      const ctaUrl = (parts[0] || '').trim()
      const imageUrl = (parts[1] || '').trim()
      const headline = (parts[2] || '').trim()
      return {
        ctaUrl,
        imageUrl: imageUrl || undefined,
        headline: headline || undefined,
      }
    })
    .filter((it) => /^https?:\/\//i.test(it.ctaUrl)) // 只留合法 http(s) 網址
}

function BulkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<ProjectLite[]>([])
  const [projectId, setProjectId] = useState(searchParams.get('projectId') ?? '')
  const [type, setType] = useState<AdType>('sidebar-card')
  const [enabled, setEnabled] = useState(false) // 預設草稿, 勾了直接上線
  const [namePrefix, setNamePrefix] = useState('')
  const [raw, setRaw] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [doneMsg, setDoneMsg] = useState('')

  useEffect(() => {
    apiFetch('/api/projects')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ProjectLite[]) => {
        setProjects(data)
        if (!projectId && data.length > 0) setProjectId(data[0].id)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = useMemo(() => parseLines(raw), [raw])
  const totalLines = raw.split('\n').filter((l) => l.trim().length > 0).length
  const skipped = totalLines - items.length

  async function handleSubmit() {
    setError('')
    setDoneMsg('')
    if (!projectId) return setError('請先選一個活動 (project)')
    if (items.length === 0) return setError('沒有解析到任何有效網址 (每行至少要有一個 http(s) 網址)')

    setSubmitting(true)
    try {
      const res = await apiFetch('/api/ads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          type,
          status: enabled ? 'enabled' : 'draft',
          namePrefix: namePrefix.trim() || undefined,
          items,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || `建立失敗 (${res.status})`)
        setSubmitting(false)
        return
      }
      const d = await res.json()
      setDoneMsg(`✅ 成功建立 ${d.created} 支廣告`)
      setRaw('')
      setTimeout(() => router.push(`/ads?projectId=${projectId}`), 900)
    } catch {
      setError('建立失敗 (網路或伺服器錯誤)')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">批量新增廣告</h1>
          <p className="mt-1 text-sm text-zinc-500">
            貼一整批「網址 + 封面圖」一鍵生成同版位廣告
          </p>
        </div>
        <Link href="/ads" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← 回廣告列表
        </Link>
      </div>

      <div className="space-y-5 rounded-lg border border-zinc-200 bg-white p-6">
        {/* 活動 + 版位 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">活動 (Project)</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              {projects.length === 0 && <option value="">(尚無活動, 先去建一個)</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-zinc-400">
              課程站廣告 / 蝦皮分潤 各用一個活動分開管
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700">版位</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AdType)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              {AD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS_ZH[t]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 名稱前綴 + 上線開關 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">名稱前綴 (選填)</span>
            <input
              value={namePrefix}
              onChange={(e) => setNamePrefix(e.target.value)}
              placeholder="例: 蝦皮分潤"
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-zinc-700">建立後直接上線 (不勾=先存草稿)</span>
          </label>
        </div>

        {/* 貼上區 */}
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">
            一行一支廣告 — 格式:<code className="rounded bg-zinc-100 px-1">網址 | 圖片網址 | 文字</code>
          </span>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            placeholder={
              'https://你的課程頁/abc | https://圖床/cover1.jpg | 限時優惠\nhttps://shopee.tw/分潤連結 | https://圖床/item2.jpg\nhttps://只有網址也可以.com'
            }
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs"
          />
          <span className="mt-1 block text-xs text-zinc-400">
            圖片網址、文字可省略;分隔符用 <code>|</code>、逗號或 Tab 都行。只有網址的行也會建。
          </span>
        </label>

        {/* 預覽 */}
        <div className="rounded-md bg-zinc-50 px-3 py-2 text-sm">
          解析到 <b className="text-zinc-900">{items.length}</b> 支有效廣告
          {skipped > 0 && (
            <span className="text-amber-600">,{skipped} 行因沒有合法網址被略過</span>
          )}
        </div>

        {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
        {doneMsg && (
          <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{doneMsg}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || items.length === 0 || !projectId}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
        >
          {submitting ? '建立中…' : `一鍵建立 ${items.length} 支廣告`}
        </button>
      </div>
    </div>
  )
}

export default function BulkAdsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500">Loading...</div>}>
      <BulkContent />
    </Suspense>
  )
}
