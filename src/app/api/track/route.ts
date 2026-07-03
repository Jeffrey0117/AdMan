import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getById, ADS_FILE, SITES_FILE } from '@/lib/storage'
import { insertEvents, type EventRow } from '@/lib/events-db'
import type { Ad, Site } from '@/lib/models'

/**
 * 事件收集端點（公開，給 embed / track.js 的 sendBeacon 打）
 * - 廣告事件（ad_impression / ad_click）：scope = adId
 * - 站點事件（page_view / section_view / cta_click / dwell）：scope = siteKey
 * - tenant 歸屬一律從 DB 反查，不信任 client
 */

// sendBeacon 依規範必帶 credentials，回 '*' 會被瀏覽器整批擋掉 — 必須動態回應 Origin
function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }
}

const adIdPattern = /^ad_[\w-]{4,24}$/
const siteKeyPattern = /^site_[\w-]{4,24}$/

const TrackEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ad_impression'), adId: z.string().regex(adIdPattern) }),
  z.object({ type: z.literal('ad_click'), adId: z.string().regex(adIdPattern) }),
  z.object({
    type: z.literal('page_view'),
    path: z.string().max(200).optional(),
    referrer: z.string().max(300).optional(),
    utm_source: z.string().max(100).optional(),
    utm_medium: z.string().max(100).optional(),
    utm_campaign: z.string().max(100).optional(),
    device: z.enum(['mobile', 'desktop']).optional(),
  }),
  z.object({ type: z.literal('section_view'), section: z.string().min(1).max(64) }),
  z.object({ type: z.literal('cta_click'), cta: z.string().min(1).max(64) }),
  z.object({
    type: z.literal('dwell'),
    seconds: z.number().min(0).max(3600),
    maxScroll: z.number().min(0).max(100),
  }),
])

const BodySchema = z.object({
  sessionId: z.string().min(8).max(64),
  siteKey: z.string().regex(siteKeyPattern).optional(),
  events: z.array(TrackEventSchema).min(1).max(20),
})

function originAllowed(site: Site, origin: string | null): boolean {
  if (!site.allowedOrigins || site.allowedOrigins.length === 0) return true
  if (!origin) return false
  const normalized = origin.replace(/\/+$/, '').toLowerCase()
  return site.allowedOrigins.some((o) => o.replace(/\/+$/, '').toLowerCase() === normalized)
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) })
}

export async function POST(request: NextRequest) {
  const cors = corsHeaders(request.headers.get('origin'))
  try {
    // sendBeacon 不一定帶 application/json content-type，用 text 再 parse
    const raw = await request.text()
    const parsed = BodySchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400, headers: cors })
    }
    const { sessionId, siteKey, events } = parsed.data

    const rows: EventRow[] = []
    const verifiedAdIds = new Set<string>()
    let siteVerified = false

    for (const event of events) {
      if (event.type === 'ad_impression' || event.type === 'ad_click') {
        // adId 驗證存在（每個 adId 只查一次）
        if (!verifiedAdIds.has(event.adId)) {
          const ad = await getById<Ad>(ADS_FILE, event.adId)
          if (!ad) continue
          verifiedAdIds.add(event.adId)
        }
        rows.push({
          scopeType: 'ad',
          scopeId: event.adId,
          sessionId,
          eventType: event.type,
          metadata: {},
        })
        continue
      }

      // 站點事件需要有效 siteKey
      if (!siteKey) continue
      if (!siteVerified) {
        const site = await getById<Site>(SITES_FILE, siteKey)
        if (!site || !originAllowed(site, request.headers.get('origin'))) {
          return NextResponse.json({ ok: false }, { status: 403, headers: cors })
        }
        siteVerified = true
      }

      const { type, ...metadata } = event
      rows.push({
        scopeType: 'site',
        scopeId: siteKey,
        sessionId,
        eventType: type,
        metadata,
      })
    }

    if (rows.length > 0) {
      insertEvents(rows)
    }

    return NextResponse.json({ ok: true }, { headers: cors })
  } catch (error) {
    console.error('Track failed:', error)
    return NextResponse.json({ ok: false }, { status: 400, headers: cors })
  }
}
