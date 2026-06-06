'use client'

import { apiFetch } from '@/lib/api-client'
import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import type { Ad } from '@/lib/models'
import type { AdStats } from '@/lib/events-db'

/** 廣告成效：曝光 / 點擊 / CTR / 每日趨勢 */
export default function AdStatsPage({ params }: { params: Promise<{ adId: string }> }) {
  const { adId } = use(params)
  const [ad, setAd] = useState<Ad | null>(null)
  const [stats, setStats] = useState<AdStats | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [adRes, statsRes] = await Promise.all([
        apiFetch(`/api/ads/${adId}`),
        apiFetch(`/api/stats?adId=${adId}&days=${days}`),
      ])
      if (adRes.ok) setAd(await adRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } finally {
      setLoading(false)
    }
  }, [adId, days])

  useEffect(() => {
    load()
  }, [load])

  const maxDaily = Math.max(1, ...(stats?.daily || []).map((d) => d.impressions))

  return (
    <div className="py-10 max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <Link href="/ads" className="text-sm text-zinc-400 hover:text-zinc-600">
            ← 廣告列表
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">{ad?.name || adId}</h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">{adId}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-sm border ${
                days === d
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              {d} 天
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : !stats ? (
        <p className="text-sm text-zinc-400">無法載入數據</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '曝光', value: stats.impressions.toLocaleString() },
              { label: '點擊', value: stats.clicks.toLocaleString() },
              { label: 'CTR', value: `${stats.ctr}%` },
              { label: '觸及訪客', value: stats.sessions.toLocaleString() },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-5">
                <p className="text-xs text-zinc-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-zinc-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-zinc-900 mb-4">每日曝光 / 點擊</h2>
            {stats.daily.length === 0 ? (
              <p className="text-sm text-zinc-400 py-2">
                還沒有數據——廣告被嵌入的頁面有人看就會開始累積
              </p>
            ) : (
              <div className="space-y-2">
                {stats.daily.map((d) => (
                  <div key={d.date} className="flex items-center gap-3 text-sm">
                    <span className="w-20 text-zinc-500 shrink-0">{d.date}</span>
                    <div className="flex-1 h-5 bg-zinc-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 rounded"
                        style={{ width: `${Math.max((d.impressions / maxDaily) * 100, 2)}%` }}
                      />
                    </div>
                    <span className="w-28 text-zinc-500 shrink-0 text-right">
                      {d.impressions} 曝光 / {d.clicks} 點擊
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
