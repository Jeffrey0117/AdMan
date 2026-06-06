import { NextRequest, NextResponse } from 'next/server'
import { getById, update, remove, SITES_FILE } from '@/lib/storage'
import { UpdateSiteSchema, type Site } from '@/lib/models'
import { withAuth } from '@/lib/auth'

type RouteParams = { params: Promise<{ siteId: string }> }

export const GET = withAuth<RouteParams>(async (_request, { params }) => {
  try {
    const { siteId } = await params
    const site = await getById<Site>(SITES_FILE, siteId)
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }
    return NextResponse.json(site)
  } catch (error) {
    console.error('Failed to fetch site:', error)
    return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 })
  }
})

export const PUT = withAuth<RouteParams>(async (request, { params }) => {
  try {
    const { siteId } = await params
    const body = await request.json()
    const parsed = UpdateSiteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const updated = await update<Site>(SITES_FILE, siteId, {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    } as Partial<Site>)

    if (!updated) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update site:', error)
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 })
  }
})

export const DELETE = withAuth<RouteParams>(async (_request, { params }) => {
  try {
    const { siteId } = await params
    const deleted = await remove<Site>(SITES_FILE, siteId)
    if (!deleted) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete site:', error)
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 })
  }
})
