import { NextRequest, NextResponse } from 'next/server'
import { getAll, create, SITES_FILE } from '@/lib/storage'
import { CreateSiteSchema, type Site } from '@/lib/models'
import { generateSiteId } from '@/lib/id'
import { withAuth } from '@/lib/auth'

/** 站點（analytics tracking）管理 — admin only */

export const GET = withAuth(async () => {
  try {
    const sites = await getAll<Site>(SITES_FILE)
    return NextResponse.json(sites)
  } catch (error) {
    console.error('Failed to fetch sites:', error)
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const parsed = CreateSiteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const site: Site = {
      id: generateSiteId(),
      name: parsed.data.name,
      allowedOrigins: parsed.data.allowedOrigins ?? [],
      createdAt: now,
      updatedAt: now,
    }

    await create(SITES_FILE, site)
    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error('Failed to create site:', error)
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
})
