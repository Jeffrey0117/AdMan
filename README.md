# AdMan

自架的「廣告投放 + 站點分析」二合一平台。一行 script 嵌進任何網站：

- **廣告**：管理後台做好廣告（橫幅 / 通知條 / 彈窗 / 側欄卡 / 表單 widget），嵌入碼貼上就顯示，**曝光與點擊自動回報**
- **分析**：瘦版 GA — 瀏覽、停留秒數、滑動深度、區塊觸及漏斗、CTA 點擊、流量來源。無 cookie、無 PII、2.5kb

## 別的站怎麼裝

### 裝站點分析（一行）

後台「數據」頁建一個站點拿 `site key`，然後在網站 `<head>` 或 `<body>` 結尾貼：

```html
<script defer src="https://YOUR-ADMAN-HOST/embed/track.js" data-site="site_xxxxxxxxxx"></script>
```

貼完自動就有：**瀏覽次數、不重複訪客、平均停留、滑動深度、referrer / UTM 來源、每日趨勢**。

想要「滑到哪一區就走了」的漏斗和 CTA 點擊排行，在 HTML 加屬性（名稱隨你取）：

```html
<section data-track-section="hero">…</section>
<section data-track-section="pricing">…</section>

<a data-track-cta="buy-now" href="/checkout">立即購買</a>
```

SPA / 晚渲染的區塊也抓得到（MutationObserver）。後台 → 數據 → 該站點，就能看漏斗。

### 裝廣告

```html
<div data-adman-id="ad_xxxxxxxx"></div>
<script defer src="https://YOUR-ADMAN-HOST/embed/adman.js"></script>
```

廣告顯示時自動記曝光（可視面積過半才算）、點擊自動記點擊。後台廣告列表 →「數據」看曝光 / 點擊 / CTR。

可用 `data-bg-color`、`data-text-color`、`data-max-width` 等屬性蓋樣式。

## Stack

- Next.js 16 + React 19 + TypeScript + Tailwind 4
- 設定資料：JSON 檔（`data/projects.json` / `ads.json` / `sites.json`）
- 事件資料：SQLite（`data/events.db`，better-sqlite3 + WAL）
- 嵌入腳本：esbuild bundle（`public/embed/adman.js` + `track.js`）
- Port: 4003

## Run

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # build (embeds + next)
pnpm start        # production
```

需要環境變數（`.env`）：

```bash
ADMAN_ADMIN_TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
```

沒設 token 時所有管理操作一律拒絕（secure by default）。後台 UI 開啟時會要求輸入這個 token。

## API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/projects`, `/api/ads`, `/api/ads/:id` | — | 讀取 |
| POST/PUT/DELETE | `/api/projects*`, `/api/ads*` | Bearer | 管理 |
| POST | `/api/upload` | Bearer | 圖片上傳（magic-bytes 驗證） |
| GET | `/api/serve/:adId` | — | 廣告投放（CORS） |
| POST | `/api/track` | — | 事件收集（CORS，zod 消毒 + origin 白名單） |
| GET | `/api/stats?adId=\|siteKey=&days=` | Bearer | 分析數據 |
| GET/POST/PUT/DELETE | `/api/sites*` | Bearer | 站點管理 |

安全細節見 [SECURITY.md](./SECURITY.md)。

## 事件模型

| 事件 | scope | 來源 |
|------|-------|------|
| `ad_impression` / `ad_click` | adId | adman.js 自動 |
| `page_view` / `dwell` | siteKey | track.js 自動 |
| `section_view` | siteKey | `data-track-section` |
| `cta_click` | siteKey | `data-track-cta` |

匿名 session id（sessionStorage），事件批次 `sendBeacon`，關頁也送得到。
