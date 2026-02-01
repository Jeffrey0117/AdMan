'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLang } from '@/components/layout/lang-provider'

interface Ad {
  id: string
  name: string
  headline: string
  status: string
}

interface Project {
  id: string
}

export default function DashboardPage() {
  const { t } = useLang()
  const [projects, setProjects] = useState<Project[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [projRes, adsRes] = await Promise.all([
      fetch('/api/projects'),
      fetch('/api/ads'),
    ])
    setProjects(await projRes.json())
    setAds(await adsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return <div className="p-8 text-zinc-500">{t('common.loading')}</div>
  }

  const enabledAds = ads.filter((a) => a.status === 'enabled')
  const draftAds = ads.filter((a) => a.status === 'draft')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900">
        {t('dashboard.title')}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {t('dashboard.subtitle')}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/projects"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-medium text-zinc-500">
            {t('dashboard.projects')}
          </p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">
            {projects.length}
          </p>
        </Link>
        <Link
          href="/ads"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-medium text-zinc-500">
            {t('dashboard.totalAds')}
          </p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">{ads.length}</p>
        </Link>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            {t('dashboard.activeAds')}
          </p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">
            {enabledAds.length}
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          href="/ads/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          {t('dashboard.newAd')}
        </Link>
        <Link
          href="/projects"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {t('dashboard.manageProjects')}
        </Link>
      </div>

      {draftAds.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-zinc-900">
            {t('dashboard.draftAds')}
          </h2>
          <div className="mt-3 space-y-2">
            {draftAds.map((ad) => (
              <Link
                key={ad.id}
                href={`/ads/${ad.id}/edit`}
                className="block rounded-md border border-amber-200 bg-amber-50 p-3 text-sm hover:bg-amber-100 transition-colors"
              >
                <span className="font-medium text-amber-900">{ad.name}</span>
                <span className="ml-2 text-amber-700">{ad.headline}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
