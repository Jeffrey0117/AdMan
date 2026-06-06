'use client'

import { apiFetch } from '@/lib/api-client'
import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import type { Site } from '@/lib/models'
import type { SiteStats } from '@/lib/events-db'

/** 站點數據儀表板：總覽 / 區塊漏斗 / CTA 點擊 / 流量來源 / 每日趨勢 */
export default function SiteStatsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params)
  const [site, setSite] = useState<Site | null>(null)
  const [stats, setStats] = useState<SiteStats | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [siteRes, statsRes] = await Promise.all([
        apiFetch(`/api/sites/${siteId}`),
        apiFetch(`/api/stats?siteKey=${siteId}&days=${days}`),
      ])
      if (siteRes.ok) setSite(await siteRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } finally {
      setLoading(false)
    }
  }, [siteId, days])

  useEffect(() => {
    load()
  }, [load])

  const formatDwell = (seconds: number) =>
    seconds < 60 ? `${seconds} 秒` : `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`

  const sessions = stats?.sessions || 0
  const funnel = Object.entries(stats?.sections || {}).sort((a, b) => b[1] - a[1])
  const ctas = Object.entries(stats?.ctas || {}).sort((a, b) => b[1].clicks - a[1].clicks)

  return (
    <div className="py-10 max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <Link href="/sites" className="text-sm text-zinc-400 hover:text-zinc-600">
            ← 站點列表
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1">
            {site?.name || siteId}
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">{siteId}</p>
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
          {/* 總覽卡 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '瀏覽次數', value: stats.views.toLocaleString() },
              { label: '不重複訪客', value: stats.sessions.toLocaleString() },
              { label: '平均停留', value: formatDwell(stats.avgDwellSeconds) },
              { label: '平均滑動深度', value: `${stats.avgMaxScroll}%` },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-5">
                <p className="text-xs text-zinc-400 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-zinc-900">{card.value}</p>
              </div>
            ))}
          </div>

          {/* 區塊漏斗 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-zinc-900 mb-1">區塊觸及漏斗</h2>
            <p className="text-xs text-zinc-400 mb-4">
              有標 data-track-section 的區塊，多少訪客真的滑到
            </p>
            {funnel.length === 0 ? (
              <p className="text-sm text-zinc-400 py-2">
                還沒有區塊數據——在網站的區塊加上 data-track-section=&quot;名稱&quot; 就會出現
              </p>
            ) : (
              <div className="space-y-2">
                {funnel.map(([section, count]) => {
                  const pct = sessions > 0 ? Math.round((count / sessions) * 100) : 0
                  return (
                    <div key={section} className="flex items-center gap-3">
                      <span className="w-28 md:w-36 text-sm text-right text-zinc-500 truncate shrink-0">
                        {section}
                      </span>
                      <div className="flex-1 h-6 bg-zinc-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded flex items-center justify-end px-2"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        >
                          <span className="text-[11px] text-white font-semibold">{pct}%</span>
                        </div>
                      </div>
                      <span className="w-14 text-sm text-zinc-400 shrink-0">{count} 人</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* CTA 點擊 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold text-zinc-900 mb-1">CTA 點擊</h2>
            <p className="text-xs text-zinc-400 mb-4">有標 data-track-cta 的按鈕/連結</p>
            {ctas.length === 0 ? (
              <p className="text-sm text-zinc-400 py-2">還沒有 CTA 點擊</p>
            ) : (
              <div className="space-y-2">
                {ctas.map(([cta, v]) => (
                  <div
                    key={cta}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-2.5"
                  >
                    <span className="text-sm font-medium text-zinc-700">{cta}</span>
                    <span className="text-sm text-zinc-500">
                      <strong className="text-zinc-900">{v.clicks}</strong> 次 ·{' '}
                      <strong className="text-zinc-900">{v.sessions}</strong> 人
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 流量來源 + 每日 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="font-semibold text-zinc-900 mb-4">流量來源</h2>
              {stats.referrers.length === 0 ? (
                <p className="text-sm text-zinc-400 py-2">還沒有數據</p>
              ) : (
                <div className="space-y-2">
                  {stats.referrers.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 truncate max-w-[70%]">{r.referrer}</span>
                      <span className="text-zinc-400 shrink-0">{r.views} 次</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="font-semibold text-zinc-900 mb-4">每日瀏覽</h2>
              {stats.daily.length === 0 ? (
                <p className="text-sm text-zinc-400 py-2">還沒有數據</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {[...stats.daily].reverse().map((d) => (
                    <div key={d.date} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">{d.date}</span>
                      <span className="text-zinc-700">
                        {d.views} 次 / {d.sessions} 人
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
