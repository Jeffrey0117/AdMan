'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLang } from '@/components/layout/lang-provider'
import type { TranslationKey } from '@/lib/i18n'
import type { AdType, AdStatus } from '@/lib/constants'

interface Project {
  id: string
  name: string
}

interface Ad {
  id: string
  projectId: string
  name: string
  type: AdType
  status: AdStatus
  headline: string
  createdAt: string
}

export default function AdsPage() {
  const { t } = useLang()
  const [ads, setAds] = useState<Ad[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProject, setFilterProject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const fetchData = useCallback(async () => {
    const [adsRes, projRes] = await Promise.all([
      fetch('/api/ads'),
      fetch('/api/projects'),
    ])
    setAds(await adsRes.json())
    setProjects(await projRes.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleDelete(adId: string) {
    if (!confirm(t('ads.confirmDelete'))) return
    await fetch(`/api/ads/${adId}`, { method: 'DELETE' })
    fetchData()
  }

  function projectName(projectId: string) {
    return projects.find((p) => p.id === projectId)?.name ?? 'Unknown'
  }

  const filtered = ads.filter((ad) => {
    if (filterProject && ad.projectId !== filterProject) return false
    if (filterStatus && ad.status !== filterStatus) return false
    return true
  })

  if (loading) {
    return <div className="p-8 text-zinc-500">{t('common.loading')}</div>
  }

  const statusColors: Record<string, string> = {
    enabled: 'bg-emerald-100 text-emerald-800',
    disabled: 'bg-zinc-100 text-zinc-600',
    draft: 'bg-amber-100 text-amber-800',
  }

  const selectClass =
    'rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {t('ads.title')}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {filtered.length} {t('common.of')} {ads.length} {t('ads.count')}
          </p>
        </div>
        <Link
          href="/ads/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t('ads.new')}
        </Link>
      </div>

      <div className="mt-4 flex gap-3">
        <select
          className={selectClass}
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
        >
          <option value="">{t('ads.allProjects')}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">{t('ads.allStatuses')}</option>
          <option value="enabled">{t('status.enabled')}</option>
          <option value="disabled">{t('status.disabled')}</option>
          <option value="draft">{t('status.draft')}</option>
        </select>
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map((ad) => (
          <div
            key={ad.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[ad.status] ?? 'bg-zinc-100 text-zinc-600'}`}
              >
                {t(`status.${ad.status}` as TranslationKey)}
              </span>
              <div>
                <Link
                  href={`/ads/${ad.id}/edit`}
                  className="text-sm font-medium text-zinc-900 hover:underline"
                >
                  {ad.name}
                </Link>
                <p className="text-xs text-zinc-400">
                  {projectName(ad.projectId)} &middot;{' '}
                  {t(`type.${ad.type}` as TranslationKey)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/preview/${ad.id}`}
                className="text-xs text-zinc-500 hover:underline"
              >
                {t('ads.preview')}
              </Link>
              <Link
                href={`/ads/${ad.id}/edit`}
                className="text-xs text-zinc-600 hover:underline"
              >
                {t('ads.edit')}
              </Link>
              <button
                onClick={() => handleDelete(ad.id)}
                className="text-xs text-red-500 hover:underline"
              >
                {t('ads.delete')}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-400">
            {ads.length === 0 ? t('ads.empty') : t('ads.noMatch')}
          </div>
        )}
      </div>
    </div>
  )
}
