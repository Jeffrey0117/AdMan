'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AdPreview } from '@/components/ads/ad-preview'
import { useLang } from '@/components/layout/lang-provider'

interface AdData {
  id: string
  name: string
  type: string
  status: string
  position: string
  headline: string
  bodyText: string
  ctaText: string
  ctaUrl: string
  imageUrl?: string
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

export default function PreviewPage() {
  const params = useParams<{ adId: string }>()
  const { t } = useLang()
  const [ad, setAd] = useState<AdData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAd = useCallback(async () => {
    const res = await fetch(`/api/ads/${params.adId}`)
    if (res.ok) {
      setAd(await res.json())
    }
    setLoading(false)
  }, [params.adId])

  useEffect(() => {
    fetchAd()
  }, [fetchAd])

  if (loading) {
    return <div className="p-8 text-zinc-500">{t('common.loading')}</div>
  }

  if (!ad) {
    return <div className="p-8 text-red-600">{t('common.notFound')}</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/ads/${ad.id}/edit`}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            &larr; {t('preview.back')}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            {t('preview.title')} {ad.name}
          </h1>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-zinc-500 mb-3 uppercase tracking-wider">
          {t('preview.adPreview')}
        </h2>
        <div className="rounded-lg border border-zinc-200 bg-white p-8">
          <div className="mx-auto" style={{ maxWidth: ad.style.maxWidth }}>
            <AdPreview ad={ad} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-500 mb-3 uppercase tracking-wider">
          {t('preview.embedCode')}
        </h2>
        <pre className="rounded-md bg-zinc-100 p-4 text-sm text-zinc-700 overflow-x-auto">
{`<!-- Place this where you want the ad to appear -->
<div data-adman-id="${ad.id}"></div>

<!-- Add this before </body> -->
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/adman.js"
  data-base-url="${typeof window !== 'undefined' ? window.location.origin : ''}"></script>`}
        </pre>
      </div>
    </div>
  )
}
