'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdPreview } from './ad-preview'
import { useLang } from '@/components/layout/lang-provider'
import type { TranslationKey } from '@/lib/i18n'
import {
  AD_TYPES,
  AD_STATUSES,
  TYPE_DEFAULT_POSITIONS,
  TYPE_POSITION_OPTIONS,
} from '@/lib/constants'
import type { AdType, AdStatus, AdPosition } from '@/lib/constants'
import { getTemplateById } from '@/lib/templates'

interface Project {
  id: string
  name: string
}

interface AdFormData {
  projectId: string
  name: string
  type: AdType
  status: AdStatus
  position: AdPosition
  headline: string
  bodyText: string
  ctaText: string
  ctaUrl: string
  imageUrl: string
  backgroundImageUrl: string
  style: {
    backgroundColor: string
    textColor: string
    ctaBackgroundColor: string
    ctaTextColor: string
    borderRadius: string
    padding: string
    maxWidth: string
  }
}

interface AdFormProps {
  mode: 'create' | 'edit'
  adId?: string
  defaultProjectId?: string
  defaultTemplateId?: string
}

const defaultStyle = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  ctaBackgroundColor: '#2563eb',
  ctaTextColor: '#ffffff',
  borderRadius: '8px',
  padding: '16px',
  maxWidth: '100%',
}

const EMBED_ATTRS: { attr: string; key: TranslationKey; example: string }[] = [
  { attr: 'data-bg-color', key: 'adForm.embedAttr.bgColor', example: '#1e293b' },
  { attr: 'data-text-color', key: 'adForm.embedAttr.textColor', example: '#ffffff' },
  { attr: 'data-font-size', key: 'adForm.embedAttr.fontSize', example: '16px' },
  { attr: 'data-cta-bg-color', key: 'adForm.embedAttr.ctaBgColor', example: '#3b82f6' },
  { attr: 'data-cta-text-color', key: 'adForm.embedAttr.ctaTextColor', example: '#fff' },
  { attr: 'data-border-radius', key: 'adForm.embedAttr.borderRadius', example: '12px' },
  { attr: 'data-padding', key: 'adForm.embedAttr.padding', example: '20px' },
  { attr: 'data-max-width', key: 'adForm.embedAttr.maxWidth', example: '600px' },
  { attr: 'data-text-align', key: 'adForm.embedAttr.textAlign', example: 'center' },
]

function EmbedCodeBlock({ adId, t }: { adId: string; t: (key: TranslationKey) => string }) {
  const [copied, setCopied] = useState(false)
  const [attrsOpen, setAttrsOpen] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'YOUR_DOMAIN'
  const code = `<div data-adman-id="${adId}"></div>\n<script src="${origin}/embed/adman.js"></script>`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-700">
          {t('adForm.embedCode')}
        </h3>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
        >
          {copied ? t('adForm.copied') : t('adForm.copy')}
        </button>
      </div>
      <pre className="rounded bg-zinc-100 p-3 text-xs text-zinc-700 overflow-x-auto select-all">
        {code}
      </pre>

      <div className="mt-3 border-t border-zinc-100 pt-3">
        <button
          type="button"
          onClick={() => setAttrsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          <span className={`inline-block transition-transform ${attrsOpen ? 'rotate-90' : ''}`}>&#9654;</span>
          {t('adForm.embedAttrsTitle')}
        </button>
        {attrsOpen && (
          <div className="mt-2">
            <p className="text-xs text-zinc-500 mb-2">{t('adForm.embedAttrsDesc')}</p>
            <div className="space-y-1">
              {EMBED_ATTRS.map(({ attr, key, example }) => (
                <div key={attr} className="flex items-baseline gap-2 text-xs">
                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-zinc-600 whitespace-nowrap">{attr}</code>
                  <span className="text-zinc-400">&mdash;</span>
                  <span className="text-zinc-500">{t(key)}</span>
                  <span className="text-zinc-300 ml-auto font-mono">{example}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AdForm({ mode, adId, defaultProjectId, defaultTemplateId }: AdFormProps) {
  const router = useRouter()
  const { locale, t } = useLang()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [templateApplied, setTemplateApplied] = useState(false)
  const [form, setForm] = useState<AdFormData>(() => {
    const base: AdFormData = {
      projectId: defaultProjectId ?? '',
      name: '',
      type: 'bottom-banner',
      status: 'draft',
      position: 'fixed-bottom',
      headline: '',
      bodyText: '',
      ctaText: '',
      ctaUrl: '',
      imageUrl: '',
      backgroundImageUrl: '',
      style: { ...defaultStyle },
    }

    if (defaultTemplateId) {
      const tpl = getTemplateById(defaultTemplateId)
      if (tpl) {
        return {
          ...base,
          name: tpl.name[locale],
          type: tpl.suggestedType,
          position: tpl.suggestedPosition,
          headline: tpl.headline[locale],
          bodyText: tpl.bodyText[locale],
          ctaText: tpl.ctaText[locale],
          style: { ...tpl.style },
        }
      }
    }

    return base
  })

  useEffect(() => {
    loadData()
    if (defaultTemplateId && getTemplateById(defaultTemplateId)) {
      setTemplateApplied(true)
    }
  }, [])

  useEffect(() => {
    const defaultPos = TYPE_DEFAULT_POSITIONS[form.type]
    const options = TYPE_POSITION_OPTIONS[form.type]
    if (!options.includes(form.position)) {
      updateForm({ position: defaultPos })
    }
  }, [form.type])

  async function loadData() {
    try {
      const projRes = await fetch('/api/projects')
      const projData = await projRes.json()
      setProjects(projData)

      if (mode === 'edit' && adId) {
        const adRes = await fetch(`/api/ads/${adId}`)
        if (!adRes.ok) {
          setError(t('common.notFound'))
          setLoading(false)
          return
        }
        const adData = await adRes.json()
        setForm({
          projectId: adData.projectId,
          name: adData.name,
          type: adData.type,
          status: adData.status,
          position: adData.position,
          headline: adData.headline,
          bodyText: adData.bodyText,
          ctaText: adData.ctaText,
          ctaUrl: adData.ctaUrl,
          imageUrl: adData.imageUrl ?? '',
          backgroundImageUrl: adData.backgroundImageUrl ?? '',
          style: {
            backgroundColor: adData.style.backgroundColor,
            textColor: adData.style.textColor,
            ctaBackgroundColor: adData.style.ctaBackgroundColor,
            ctaTextColor: adData.style.ctaTextColor,
            borderRadius: adData.style.borderRadius,
            padding: adData.style.padding,
            maxWidth: adData.style.maxWidth,
          },
        })
      }
    } catch {
      setError('Failed to load data')
    }
    setLoading(false)
  }

  function updateForm(updates: Partial<AdFormData>) {
    setForm((prev) => ({ ...prev, ...updates }))
  }

  function updateStyle(updates: Partial<AdFormData['style']>) {
    setForm((prev) => ({ ...prev, style: { ...prev.style, ...updates } }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        return
      }
      const data = await res.json()
      updateForm({ imageUrl: data.url })
    } catch {
      setError('Upload failed')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const url = mode === 'create' ? '/api/ads' : `/api/ads/${adId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const body = {
      ...form,
      imageUrl: form.imageUrl || undefined,
      backgroundImageUrl: form.backgroundImageUrl || undefined,
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        setSubmitting(false)
        return
      }

      const saved = await res.json()
      router.push(`/ads/${saved.id}/edit`)
      router.refresh()
    } catch {
      setError('Failed to save')
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="p-8 text-zinc-500">{t('common.loading')}</div>
  }

  if (error && mode === 'edit' && !form.name) {
    return <div className="p-8 text-red-600">{error}</div>
  }

  const labelClass = 'block text-sm font-medium text-zinc-700 mb-1'
  const inputClass =
    'w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent'
  const selectClass = inputClass

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900">
        {mode === 'create' ? t('adForm.create') : `${t('adForm.editPrefix')} ${form.name}`}
      </h1>

      {templateApplied && (
        <div className="mt-3 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
          {t('templates.applied')}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{t('adForm.project')}</label>
            <select
              className={selectClass}
              value={form.projectId}
              onChange={(e) => updateForm({ projectId: e.target.value })}
              required
            >
              <option value="">{t('adForm.selectProject')}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('adForm.name')}</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => updateForm({ name: e.target.value })}
              placeholder={t('adForm.namePlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>{t('adForm.type')}</label>
              <select
                className={selectClass}
                value={form.type}
                onChange={(e) => updateForm({ type: e.target.value as AdType })}
              >
                {AD_TYPES.map((typ) => (
                  <option key={typ} value={typ}>
                    {t(`type.${typ}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('adForm.position')}</label>
              <select
                className={selectClass}
                value={form.position}
                onChange={(e) => updateForm({ position: e.target.value as AdPosition })}
                disabled={TYPE_POSITION_OPTIONS[form.type].length <= 1}
              >
                {TYPE_POSITION_OPTIONS[form.type].map((pos) => (
                  <option key={pos} value={pos}>
                    {t(`position.${pos}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t('adForm.status')}</label>
              <select
                className={selectClass}
                value={form.status}
                onChange={(e) => updateForm({ status: e.target.value as AdStatus })}
              >
                {AD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`status.${s}` as TranslationKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('adForm.headline')}</label>
            <input
              className={inputClass}
              value={form.headline}
              onChange={(e) => updateForm({ headline: e.target.value })}
              placeholder={t('adForm.headlinePlaceholder')}
              required
            />
          </div>

          <div>
            <label className={labelClass}>{t('adForm.bodyText')}</label>
            <textarea
              className={inputClass}
              rows={3}
              value={form.bodyText}
              onChange={(e) => updateForm({ bodyText: e.target.value })}
              placeholder={t('adForm.bodyTextPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('adForm.ctaText')}</label>
              <input
                className={inputClass}
                value={form.ctaText}
                onChange={(e) => updateForm({ ctaText: e.target.value })}
                placeholder="Click Here"
                required
              />
            </div>
            <div>
              <label className={labelClass}>{t('adForm.ctaUrl')}</label>
              <input
                className={inputClass}
                type="url"
                value={form.ctaUrl}
                onChange={(e) => updateForm({ ctaUrl: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('adForm.image')}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm text-zinc-600"
            />
            {form.imageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-zinc-500">{form.imageUrl}</span>
                <button
                  type="button"
                  onClick={() => updateForm({ imageUrl: '' })}
                  className="text-xs text-red-600 hover:underline"
                >
                  {t('adForm.removeImage')}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>{t('adForm.backgroundImage')}</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const formData = new FormData()
                formData.append('file', file)
                try {
                  const res = await fetch('/api/upload', { method: 'POST', body: formData })
                  if (!res.ok) {
                    const data = await res.json()
                    setError(data.error)
                    return
                  }
                  const data = await res.json()
                  updateForm({ backgroundImageUrl: data.url })
                } catch {
                  setError('Upload failed')
                }
              }}
              className="text-sm text-zinc-600"
            />
            {form.backgroundImageUrl && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-zinc-500">{form.backgroundImageUrl}</span>
                <button
                  type="button"
                  onClick={() => updateForm({ backgroundImageUrl: '' })}
                  className="text-xs text-red-600 hover:underline"
                >
                  {t('adForm.removeBackgroundImage')}
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">
              {t('adForm.style')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('adForm.bgColor')}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.style.backgroundColor}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="h-9 w-12 rounded border border-zinc-300 cursor-pointer"
                  />
                  <input
                    className={inputClass}
                    value={form.style.backgroundColor}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('adForm.textColor')}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.style.textColor}
                    onChange={(e) => updateStyle({ textColor: e.target.value })}
                    className="h-9 w-12 rounded border border-zinc-300 cursor-pointer"
                  />
                  <input
                    className={inputClass}
                    value={form.style.textColor}
                    onChange={(e) => updateStyle({ textColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('adForm.ctaBgColor')}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.style.ctaBackgroundColor}
                    onChange={(e) => updateStyle({ ctaBackgroundColor: e.target.value })}
                    className="h-9 w-12 rounded border border-zinc-300 cursor-pointer"
                  />
                  <input
                    className={inputClass}
                    value={form.style.ctaBackgroundColor}
                    onChange={(e) => updateStyle({ ctaBackgroundColor: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('adForm.ctaTextColor')}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.style.ctaTextColor}
                    onChange={(e) => updateStyle({ ctaTextColor: e.target.value })}
                    className="h-9 w-12 rounded border border-zinc-300 cursor-pointer"
                  />
                  <input
                    className={inputClass}
                    value={form.style.ctaTextColor}
                    onChange={(e) => updateStyle({ ctaTextColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>{t('adForm.borderRadius')}</label>
                <input
                  className={inputClass}
                  value={form.style.borderRadius}
                  onChange={(e) => updateStyle({ borderRadius: e.target.value })}
                  placeholder="8px"
                />
              </div>
              <div>
                <label className={labelClass}>{t('adForm.padding')}</label>
                <input
                  className={inputClass}
                  value={form.style.padding}
                  onChange={(e) => updateStyle({ padding: e.target.value })}
                  placeholder="16px"
                />
              </div>
              <div>
                <label className={labelClass}>{t('adForm.maxWidth')}</label>
                <input
                  className={inputClass}
                  value={form.style.maxWidth}
                  onChange={(e) => updateStyle({ maxWidth: e.target.value })}
                  placeholder="100%"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {submitting
                ? t('adForm.saving')
                : mode === 'create'
                  ? t('adForm.createBtn')
                  : t('adForm.saveBtn')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              {t('adForm.cancel')}
            </button>
          </div>
        </form>

        <div>
          <h2 className="text-sm font-semibold text-zinc-700 mb-3">
            {t('adForm.livePreview')}
          </h2>
          <div className="rounded-lg border border-zinc-200 bg-white p-6">
            <AdPreview
              ad={{
                headline: form.headline,
                bodyText: form.bodyText,
                ctaText: form.ctaText,
                ctaUrl: form.ctaUrl,
                imageUrl: form.imageUrl || undefined,
                backgroundImageUrl: form.backgroundImageUrl || undefined,
                type: form.type,
                style: form.style,
              }}
            />
          </div>

          {mode === 'edit' && adId && (
            <EmbedCodeBlock adId={adId} t={t} />
          )}
        </div>
      </div>
    </div>
  )
}
