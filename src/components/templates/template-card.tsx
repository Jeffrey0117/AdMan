'use client'

import { useLang } from '@/components/layout/lang-provider'
import type { AdTemplate } from '@/lib/templates'
import type { TranslationKey } from '@/lib/i18n'

interface TemplateCardProps {
  template: AdTemplate
  onUse: (templateId: string) => void
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const { locale, t } = useLang()

  const name = template.name[locale]
  const description = template.description[locale]
  const dateRange = template.dateRange[locale]
  const headline = template.headline[locale]

  return (
    <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="px-4 py-5"
        style={{
          backgroundColor: template.style.backgroundColor,
          color: template.style.textColor,
        }}
      >
        <p className="text-sm font-bold leading-tight truncate">{headline}</p>
        <div className="mt-3">
          <span
            className="inline-block rounded px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: template.style.ctaBackgroundColor,
              color: template.style.ctaTextColor,
            }}
          >
            {template.ctaText[locale]}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        <h3 className="text-sm font-semibold text-zinc-900">{name}</h3>
        <p className="text-xs text-zinc-500 line-clamp-2">{description}</p>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>{t('templates.dateRange')}: {dateRange}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>{t('templates.suggestedType')}: {t(`type.${template.suggestedType}` as TranslationKey)}</span>
          <span>{t('templates.suggestedPosition')}: {t(`position.${template.suggestedPosition}` as TranslationKey)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-400">{t('templates.colors')}:</span>
          {[
            template.style.backgroundColor,
            template.style.textColor,
            template.style.ctaBackgroundColor,
            template.style.ctaTextColor,
          ].map((color, i) => (
            <span
              key={i}
              className="h-4 w-4 rounded-full border border-zinc-200"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <button
          onClick={() => onUse(template.id)}
          className="mt-1 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          {t('templates.useTemplate')}
        </button>
      </div>
    </div>
  )
}
