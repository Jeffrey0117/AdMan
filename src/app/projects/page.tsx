'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLang } from '@/components/layout/lang-provider'

interface Project {
  id: string
  name: string
  description: string
  domain?: string
  createdAt: string
}

interface Ad {
  id: string
  projectId: string
}

export default function ProjectsPage() {
  const { t } = useLang()
  const [projects, setProjects] = useState<Project[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [domain, setDomain] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        domain: domain || undefined,
      }),
    })
    if (res.ok) {
      setName('')
      setDescription('')
      setDomain('')
      setShowForm(false)
      fetchData()
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (!confirm(t('projects.confirmDelete'))) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error)
      return
    }
    fetchData()
  }

  function adCount(projectId: string) {
    return ads.filter((a) => a.projectId === projectId).length
  }

  if (loading) {
    return <div className="p-8 text-zinc-500">{t('common.loading')}</div>
  }

  const labelClass = 'block text-sm font-medium text-zinc-700 mb-1'
  const inputClass =
    'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {t('projects.title')}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {projects.length} {t('projects.count')}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {t('projects.new')}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 space-y-3"
        >
          <div>
            <label className={labelClass}>{t('projects.name')} *</label>
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
              placeholder="https://example.com"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting ? t('projects.creating') : t('projects.create')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              {t('projects.cancel')}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <Link href={`/projects/${project.id}`}>
              <h3 className="text-base font-semibold text-zinc-900 hover:underline">
                {project.name}
              </h3>
            </Link>
            {project.description && (
              <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                {project.description}
              </p>
            )}
            {project.domain && (
              <p className="mt-1 text-xs text-zinc-400">{project.domain}</p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                {adCount(project.id)} {t('projects.ads')}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/ads/new?projectId=${project.id}`}
                  className="text-xs text-zinc-600 hover:underline"
                >
                  {t('projects.addAd')}
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  {t('projects.delete')}
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-400">
            {t('projects.empty')}
          </div>
        )}
      </div>
    </div>
  )
}
