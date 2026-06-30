import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createMany, getById, ADS_FILE, PROJECTS_FILE } from '@/lib/storage'
import { SafeUrlSchema, type Ad, type Project } from '@/lib/models'
import {
  AD_TYPES,
  AD_STATUSES,
  WIDGET_CATEGORIES,
  TYPE_DEFAULT_POSITIONS,
} from '@/lib/constants'
import { generateAdId } from '@/lib/id'
import { withAuth } from '@/lib/auth'

/**
 * 批量建立廣告 — 一次丟一堆「網址 + 封面圖(+文字)」快速量產同版位的廣告。
 * 寶寶 frame: 課程站 / 蝦皮分潤 各一個 project, 貼一整批一鍵生成。
 *
 * POST /api/ads/bulk
 * body: {
 *   projectId, type (版位), status?, category?, namePrefix?,
 *   items: [{ ctaUrl(必填), imageUrl?, headline?, bodyText?, ctaText?, name? }]
 * }
 * resp: { created: number, ads: Ad[] }
 */
const BulkItemSchema = z.object({
  ctaUrl: SafeUrlSchema, // 廣告點了連去哪 (課程頁 / 蝦皮分潤連結)
  imageUrl: SafeUrlSchema.optional(),
  headline: z.string().optional(),
  bodyText: z.string().optional(),
  ctaText: z.string().optional(),
  name: z.string().optional(),
})

const BulkCreateSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  type: z.enum(AD_TYPES).default('sidebar-card'),
  status: z.enum(AD_STATUSES).default('draft'),
  category: z.enum(WIDGET_CATEGORIES).default('ad'),
  namePrefix: z.string().optional(),
  items: z.array(BulkItemSchema).min(1, '至少要一筆').max(500, '一次最多 500 筆'),
})

const DEFAULT_STYLE = {
  backgroundColor: '#ffffff',
  textColor: '#000000',
  ctaBackgroundColor: '#2563eb',
  ctaTextColor: '#ffffff',
  borderRadius: '8px',
  zIndex: 9999,
  maxWidth: '100%',
  padding: '16px',
  customCSS: '',
}

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const parsed = BulkCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { projectId, type, status, category, namePrefix, items } = parsed.data

    // 確認 project 存在
    const project = await getById<Project>(PROJECTS_FILE, projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const position = TYPE_DEFAULT_POSITIONS[type]
    const prefix = namePrefix?.trim() || '廣告'

    const ads: Ad[] = items.map((it, i) => ({
      id: generateAdId(),
      projectId,
      name: it.name?.trim() || `${prefix} ${i + 1}`,
      category,
      type,
      status,
      position,
      headline: it.headline ?? '',
      bodyText: it.bodyText ?? '',
      ctaText: it.ctaText ?? '',
      ctaUrl: it.ctaUrl ?? '',
      imageUrl: it.imageUrl,
      backgroundImageUrl: undefined,
      widgetConfig: undefined,
      style: DEFAULT_STYLE,
      createdAt: now,
      updatedAt: now,
    }))

    await createMany(ADS_FILE, ads)
    return NextResponse.json({ created: ads.length, ads }, { status: 201 })
  } catch (error) {
    console.error('Failed to bulk-create ads:', error)
    return NextResponse.json(
      { error: 'Failed to bulk-create ads' },
      { status: 500 }
    )
  }
})
