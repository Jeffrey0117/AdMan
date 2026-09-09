import Database from 'better-sqlite3'
import path from 'path'
import { mkdirSync } from 'fs'

/**
 * 事件儲存（SQLite）
 * 廣告事件（ad_impression / ad_click）與站點分析事件
 * （page_view / section_view / cta_click / dwell）都進同一張表，
 * 用 scope_type + scope_id（adId 或 siteKey）區分。
 *
 * 高頻 append 用 SQLite 而不是 JSON 檔：JSON 整檔重寫扛不住事件量。
 */

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'events.db')

export const EVENT_TYPES = [
  'ad_impression',
  'ad_click',
  'page_view',
  'section_view',
  'cta_click',
  'dwell',
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export interface EventRow {
  scopeType: 'ad' | 'site'
  scopeId: string
  sessionId: string
  eventType: EventType
  metadata: Record<string, string | number>
}

let db: Database.Database | null = null

export function getEventsDb(): Database.Database {
  if (db) return db
  mkdirSync(DATA_DIR, { recursive: true })
  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scope_type TEXT NOT NULL CHECK (scope_type IN ('ad', 'site')),
      scope_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      metadata TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_events_scope_time
      ON events (scope_type, scope_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_events_scope_event
      ON events (scope_type, scope_id, event_type);
  `)
  return db
}

export function insertEvents(rows: EventRow[]): void {
  const database = getEventsDb()
  const stmt = database.prepare(
    `INSERT INTO events (scope_type, scope_id, session_id, event_type, metadata)
     VALUES (@scopeType, @scopeId, @sessionId, @eventType, @metadata)`
  )
  const insertAll = database.transaction((items: EventRow[]) => {
    for (const item of items) {
      stmt.run({ ...item, metadata: JSON.stringify(item.metadata) })
    }
  })
  insertAll(rows)
}

// ── Aggregates ───────────────────────────────────────────

function sinceModifier(days: number): string {
  const safe = Math.min(365, Math.max(1, Math.round(days)))
  return `-${safe} days`
}

export interface AdStats {
  impressions: number
  clicks: number
  sessions: number
  ctr: number
  daily: Array<{ date: string; impressions: number; clicks: number }>
}

export function getAdStats(adId: string, days: number = 30): AdStats {
  const database = getEventsDb()
  const since = sinceModifier(days)

  const counts = database
    .prepare(
      `SELECT
         SUM(CASE WHEN event_type = 'ad_impression' THEN 1 ELSE 0 END) AS impressions,
         SUM(CASE WHEN event_type = 'ad_click' THEN 1 ELSE 0 END) AS clicks,
         COUNT(DISTINCT session_id) AS sessions
       FROM events
       WHERE scope_type = 'ad' AND scope_id = ? AND created_at > datetime('now', ?)`
    )
    .get(adId, since) as { impressions: number | null; clicks: number | null; sessions: number }

  const daily = database
    .prepare(
      `SELECT date(created_at) AS date,
              SUM(CASE WHEN event_type = 'ad_impression' THEN 1 ELSE 0 END) AS impressions,
              SUM(CASE WHEN event_type = 'ad_click' THEN 1 ELSE 0 END) AS clicks
       FROM events
       WHERE scope_type = 'ad' AND scope_id = ? AND created_at > datetime('now', ?)
       GROUP BY date(created_at)
       ORDER BY date`
    )
    .all(adId, since) as Array<{ date: string; impressions: number; clicks: number }>

  const impressions = counts.impressions ?? 0
  const clicks = counts.clicks ?? 0
  return {
    impressions,
    clicks,
    sessions: counts.sessions ?? 0,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
    daily,
  }
}

export interface SiteStats {
  views: number
  sessions: number
  avgDwellSeconds: number
  avgMaxScroll: number
  sections: Record<string, number>
  ctas: Record<string, { clicks: number; sessions: number }>
  referrers: Array<{ referrer: string; views: number }>
  daily: Array<{ date: string; views: number; sessions: number }>
  devices: Record<string, number>
}

export function getSiteStats(siteKey: string, days: number = 30): SiteStats {
  const database = getEventsDb()
  const since = sinceModifier(days)
  const base = `scope_type = 'site' AND scope_id = ? AND created_at > datetime('now', ?)`

  const pv = database
    .prepare(
      `SELECT COUNT(*) AS views, COUNT(DISTINCT session_id) AS sessions
       FROM events WHERE ${base} AND event_type = 'page_view'`
    )
    .get(siteKey, since) as { views: number; sessions: number }

  // 每個 session 的停留加總 / 最深滑動，再取平均
  const dwell = database
    .prepare(
      `SELECT COALESCE(ROUND(AVG(secs)), 0) AS avgSeconds,
              COALESCE(ROUND(AVG(scroll)), 0) AS avgScroll
       FROM (
         SELECT session_id,
                SUM(CAST(json_extract(metadata, '$.seconds') AS REAL)) AS secs,
                MAX(CAST(json_extract(metadata, '$.maxScroll') AS REAL)) AS scroll
         FROM events WHERE ${base} AND event_type = 'dwell'
         GROUP BY session_id
       )`
    )
    .get(siteKey, since) as { avgSeconds: number; avgScroll: number }

  const sections = database
    .prepare(
      `SELECT json_extract(metadata, '$.section') AS section,
              COUNT(DISTINCT session_id) AS sessions
       FROM events WHERE ${base} AND event_type = 'section_view'
       GROUP BY 1`
    )
    .all(siteKey, since) as Array<{ section: string; sessions: number }>

  const ctas = database
    .prepare(
      `SELECT json_extract(metadata, '$.cta') AS cta,
              COUNT(*) AS clicks,
              COUNT(DISTINCT session_id) AS sessions
       FROM events WHERE ${base} AND event_type = 'cta_click'
       GROUP BY 1`
    )
    .all(siteKey, since) as Array<{ cta: string; clicks: number; sessions: number }>

  const referrers = database
    .prepare(
      `SELECT COALESCE(NULLIF(json_extract(metadata, '$.referrer'), ''), '(direct)') AS referrer,
              COUNT(*) AS views
       FROM events WHERE ${base} AND event_type = 'page_view'
       GROUP BY 1 ORDER BY 2 DESC LIMIT 10`
    )
    .all(siteKey, since) as Array<{ referrer: string; views: number }>

  const devices = database
    .prepare(
      `SELECT COALESCE(json_extract(metadata, '$.device'), 'unknown') AS device,
              COUNT(DISTINCT session_id) AS sessions
       FROM events WHERE ${base} AND event_type = 'page_view'
       GROUP BY 1`
    )
    .all(siteKey, since) as Array<{ device: string; sessions: number }>

  const daily = database
    .prepare(
      `SELECT date(created_at) AS date,
              COUNT(*) AS views,
              COUNT(DISTINCT session_id) AS sessions
       FROM events WHERE ${base} AND event_type = 'page_view'
       GROUP BY date(created_at) ORDER BY date`
    )
    .all(siteKey, since) as Array<{ date: string; views: number; sessions: number }>

  return {
    views: pv.views ?? 0,
    sessions: pv.sessions ?? 0,
    avgDwellSeconds: dwell.avgSeconds ?? 0,
    avgMaxScroll: dwell.avgScroll ?? 0,
    sections: Object.fromEntries(sections.filter((s) => s.section).map((s) => [s.section, s.sessions])),
    ctas: Object.fromEntries(
      ctas.filter((c) => c.cta).map((c) => [c.cta, { clicks: c.clicks, sessions: c.sessions }])
    ),
    referrers,
    daily,
    devices: Object.fromEntries(devices.map((d) => [d.device, d.sessions])),
  }
}
