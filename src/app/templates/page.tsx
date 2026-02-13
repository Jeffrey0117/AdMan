'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/components/layout/lang-provider'
import { TemplateCard } from '@/components/templates/template-card'
import {
  AD_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type TemplateCategoryFilter,
} from '@/lib/templates'
import type { TranslationKey } from '@/lib/i18n'

interface Project {
  id: string
  name: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const { t } = useLang()
  const [category, setCategory] = useState<TemplateCategoryFilter>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data)
        if (data.length > 0) {
          setSelectedProjectId(data[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const filtered =
    category === 'all'
      ? AD_TEMPLATES
      : AD_TEMPLATES.filter((tpl) => tpl.category === category)

  function handleUseTemplate(templateId: string) {
    if (!selectedProjectId) return
    router.push(`/ads/new?template=${templateId}&projectId=${selectedProjectId}`)
  }

  const tabClass = (active: boolean) =>
    `px-3 py-2 text-sm font-medium transition-colors rounded-md ${
      active
        ? 'bg-zinc-900 text-white'
        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
    }`

  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t('templates.title')}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t('templates.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600">{t('adForm.project')}:</label>
          <select
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.length === 0 && (
              <option value="">{t('templates.selectProject')}</option>
            )}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-1">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={tabClass(category === cat)}
          >
            {t(`templates.${cat}` as TranslationKey)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500">{t('templates.empty')}</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              onUse={handleUseTemplate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
