import { NextRequest, NextResponse } from 'next/server'
import { getById, update, remove, ADS_FILE } from '@/lib/storage'
import { UpdateAdSchema, type Ad } from '@/lib/models'
import { withAuth } from '@/lib/auth'

type RouteParams = { params: Promise<{ adId: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { adId } = await params
    const ad = await getById<Ad>(ADS_FILE, adId)
    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }
    return NextResponse.json(ad)
  } catch (error) {
    console.error('Failed to fetch ad:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ad' },
      { status: 500 }
    )
  }
}

export const PUT = withAuth<RouteParams>(async (request, { params }) => {
  try {
    const { adId } = await params
    const body = await request.json()
    const parsed = UpdateAdSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const existing = await getById<Ad>(ADS_FILE, adId)
    if (!existing) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    const updates: Partial<Ad> = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
      style: parsed.data.style
        ? { ...existing.style, ...parsed.data.style }
        : undefined,
    }

    const updated = await update<Ad>(ADS_FILE, adId, updates)
    if (!updated) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update ad:', error)
    return NextResponse.json(
      { error: 'Failed to update ad' },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth<RouteParams>(async (_request, { params }) => {
  try {
    const { adId } = await params
    const deleted = await remove<Ad>(ADS_FILE, adId)
    if (!deleted) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete ad:', error)
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    )
  }
})
