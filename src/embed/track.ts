/**
 * AdMan Track — 通用站點分析 SDK（瘦版 GA）
 *
 * 安裝（一行）：
 *   <script defer src="https://YOUR-ADMAN-HOST/embed/track.js" data-site="site_xxxx"></script>
 *
 * 自動追蹤：page_view（path/referrer/UTM/裝置）、dwell（停留秒數）、最深滑動 %
 * 選配（加 HTML 屬性就有）：
 *   <section data-track-section="hero">…</section>   → 區塊觸及漏斗
 *   <a data-track-cta="buy" href="…">購買</a>         → CTA 點擊
 *
 * 匿名 session id 存 sessionStorage；不用 cookie、不收 PII。
 * 事件批次走 sendBeacon，關頁也送得到，永不阻塞宿主頁面。
 */
;(function () {
  const scriptTag = document.currentScript as HTMLScriptElement | null
  const SITE_KEY = scriptTag?.getAttribute('data-site') ?? ''
  if (!SITE_KEY) return

  function resolveBaseUrl(): string {
    const explicit = scriptTag?.getAttribute('data-base-url')
    if (explicit) return explicit.replace(/\/+$/, '')
    const src = scriptTag?.getAttribute('src') ?? ''
    try {
      return new URL(src, window.location.href).origin
    } catch {
      return ''
    }
  }

  const BASE_URL = resolveBaseUrl()
  const ENDPOINT = `${BASE_URL}/api/track`
  const FLUSH_INTERVAL_MS = 5000

  type TrackEvent = Record<string, string | number> & { type: string }

  function getSessionId(): string {
    try {
      const KEY = 'adman_sid'
      const existing = sessionStorage.getItem(KEY)
      if (existing) return existing
      const sid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      sessionStorage.setItem(KEY, sid)
      return sid
    } catch {
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`
    }
  }

  const sessionId = getSessionId()
  let queue: TrackEvent[] = []
  let maxScroll = 0
  let dwellStart = Date.now()
  let dwellSent = false
  const seenSections = new Set<string>()

  function flush(): void {
    if (queue.length === 0) return
    const batch = queue.slice(0, 20)
    queue = queue.slice(20)
    try {
      const body = JSON.stringify({ sessionId, siteKey: SITE_KEY, events: batch })
      if (!navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) {
        fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {})
      }
    } catch {
      // tracking must never break the host page
    }
  }

  function track(event: TrackEvent, immediate = false): void {
    queue = [...queue, event]
    if (immediate) flush()
  }

  // ── page_view ────────────────────────────────────────────
  const params = new URLSearchParams(window.location.search)
  const pageView: TrackEvent = {
    type: 'page_view',
    path: window.location.pathname.slice(0, 200),
    referrer: document.referrer.slice(0, 300),
    device: window.innerWidth < 768 ? 'mobile' : 'desktop',
  }
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const value = params.get(key)
    if (value) pageView[key] = value.slice(0, 100)
  }
  track(pageView)

  // ── section_view：data-track-section 第一次進視窗 ────────
  const sectionObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue
              const section = (entry.target as HTMLElement).dataset.trackSection
              if (section && !seenSections.has(section)) {
                seenSections.add(section)
                track({ type: 'section_view', section: section.slice(0, 64) })
              }
              sectionObserver?.unobserve(entry.target)
            }
          },
          { threshold: 0.25 }
        )
      : null

  function observeSections(root: ParentNode): void {
    if (!sectionObserver) return
    root.querySelectorAll<HTMLElement>('[data-track-section]').forEach((el) => {
      sectionObserver.observe(el)
    })
  }

  observeSections(document)

  // SPA / 晚載入的區塊也要抓到
  if ('MutationObserver' in window) {
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.dataset.trackSection) sectionObserver?.observe(node)
            observeSections(node)
          }
        })
      }
    }).observe(document.body, { childList: true, subtree: true })
  }

  // ── cta_click：事件委派，點了馬上送 ──────────────────────
  document.addEventListener(
    'click',
    (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-track-cta]')
      if (target?.dataset.trackCta) {
        track({ type: 'cta_click', cta: target.dataset.trackCta.slice(0, 64) }, true)
      }
    },
    { capture: true, passive: true }
  )

  // ── 最深滑動 % ───────────────────────────────────────────
  function onScroll(): void {
    const total = document.documentElement.scrollHeight - window.innerHeight
    if (total <= 0) return
    const pct = Math.min(100, Math.round((window.scrollY / total) * 100))
    if (pct > maxScroll) maxScroll = pct
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  // ── dwell：離開（切分頁/關頁）送停留秒數 + 最深滑動 ──────
  function sendDwell(): void {
    if (dwellSent) return
    dwellSent = true
    const seconds = Math.min(3600, Math.round((Date.now() - dwellStart) / 1000))
    track({ type: 'dwell', seconds, maxScroll }, true)
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendDwell()
    } else {
      // 回到頁面重新起算一段，後端按 session 加總
      dwellStart = Date.now()
      dwellSent = false
    }
  })
  window.addEventListener('pagehide', sendDwell)

  setInterval(flush, FLUSH_INTERVAL_MS)
})()
