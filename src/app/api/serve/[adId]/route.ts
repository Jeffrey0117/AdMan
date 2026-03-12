import { NextRequest, NextResponse } from 'next/server'
import { getById, ADS_FILE } from '@/lib/storage'
import type { Ad } from '@/lib/models'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=10',
}

type RouteParams = { params: Promise<{ adId: string }> }

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { adId } = await params
    const ad = await getById<Ad>(ADS_FILE, adId)

    if (!ad || ad.status !== 'enabled') {
      return NextResponse.json(
        { error: 'Ad not found or disabled' },
        { status: 404, headers: corsHeaders }
      )
    }

    return NextResponse.json(ad, { headers: corsHeaders })
  } catch (error) {
    console.error('Failed to serve ad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
