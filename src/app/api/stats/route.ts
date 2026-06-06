import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getAdStats, getSiteStats } from '@/lib/events-db'

/**
 * 分析數據查詢（admin only）
 * GET /api/stats?adId=ad_xxx&days=30   → 廣告曝光/點擊/CTR
 * GET /api/stats?siteKey=site_xxx&days=30 → 站點瀏覽/漏斗/CTA/來源
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const adId = searchParams.get('adId')
    const siteKey = searchParams.get('siteKey')
    const days = Math.min(365, Math.max(1, Number(searchParams.get('days')) || 30))

    if (adId) {
      return NextResponse.json(getAdStats(adId, days))
    }
    if (siteKey) {
      return NextResponse.json(getSiteStats(siteKey, days))
    }
    return NextResponse.json(
      { error: 'adId or siteKey query param required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Stats failed:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
})
