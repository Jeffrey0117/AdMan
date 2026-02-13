'use client'

import { useSearchParams } from 'next/navigation'
import { AdForm } from '@/components/ads/ad-form'
import { Suspense } from 'react'

function NewAdContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId') ?? undefined
  const templateId = searchParams.get('template') ?? undefined

  return <AdForm mode="create" defaultProjectId={projectId} defaultTemplateId={templateId} />
}

export default function NewAdPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500">Loading...</div>}>
      <NewAdContent />
    </Suspense>
  )
}
