'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/components/layout/lang-provider'
import type { TranslationKey } from '@/lib/i18n'
import type { AdType, AdStatus } from '@/lib/constants'

interface Project {
  id: string
  name: string
  description: string
  domain?: string
  createdAt: string
  updatedAt: string
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

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>()
  const { t } = useLang()
  const [project, setProject] = useState<Project | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState('')

  const fetchData = useCallback(async () => {
    const [projRes, adsRes] = await Promise.all([
      fetch(`/api/projects/${params.projectId}`),
      fetch(`/api/ads?projectId=${params.projectId}`),
    ])
    if (!projRes.ok) {
      setLoading(false)
      return
    }
    const projData = await projRes.json()
    setProject(projData)
    setName(projData.name)
    setDescription(projData.description)
    setDomain(projData.domain ?? '')
    setAds(await adsRes.json())
    setLoading(false)
  }, [params.projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/projects/${params.projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, domain: domain || undefined }),
    })
    setEditing(false)
    fetchData()
  }

  async function handleDeleteAd(adId: string) {
    if (!confirm(t('ads.confirmDelete'))) return
    await fetch(`/api/ads/${adId}`, { method: 'DELETE' })
    fetchData()
  }

  if (loading) {
    return <div className="p-8 text-zinc-500">{t('common.loading')}</div>
  }

  if (!project) {
    return <div className="p-8 text-red-600">{t('common.notFound')}</div>
  }

  const statusColors: Record<string, string> = {
    enabled: 'bg-emerald-100 text-emerald-800',
    disabled: 'bg-zinc-100 text-zinc-600',
    draft: 'bg-amber-100 text-amber-800',
  }

  const labelClass = 'block text-sm font-medium text-zinc-700 mb-1'
  const inputClass =
    'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400'

  return (
    <div className="p-8">
      <Link
        href="/projects"
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        &larr; {t('projects.back')}
      </Link>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-6">
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className={labelClass}>{t('projects.name')}</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>{t('projects.description')}</label>
              <input
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('projects.domain')}</label>
              <input
                className={inputClass}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                {t('projects.save')}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                {t('projects.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="mt-1 text-sm text-zinc-500">
                    {project.description}
                  </p>
                )}
                {project.domain && (
                  <p className="mt-1 text-xs text-zinc-400">
                    {project.domain}
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
              >
                {t('projects.edit')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          {t('nav.ads')} ({ads.length})
        </h2>
        <Link
          href={`/ads/new?projectId=${params.projectId}`}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t('ads.new')}
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        {ads.map((ad) => (
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
                onClick={() => handleDeleteAd(ad.id)}
                className="text-xs text-red-500 hover:underline"
              >
                {t('ads.delete')}
              </button>
            </div>
          </div>
        ))}

        {ads.length === 0 && (
          <div className="text-center py-8 text-zinc-400 text-sm">
            {t('projects.noAds')}
          </div>
        )}
      </div>
    </div>
  )
}
