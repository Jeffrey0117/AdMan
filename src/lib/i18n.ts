export type Locale = 'en' | 'zh'

const translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', zh: '儀表板' },
  'nav.projects': { en: 'Projects', zh: '專案' },
  'nav.ads': { en: 'Ads', zh: '廣告' },

  // Dashboard
  'dashboard.title': { en: 'Dashboard', zh: '儀表板' },
  'dashboard.subtitle': { en: 'Overview of your advertisements', zh: '廣告總覽' },
  'dashboard.projects': { en: 'Projects', zh: '專案' },
  'dashboard.totalAds': { en: 'Total Ads', zh: '廣告總數' },
  'dashboard.activeAds': { en: 'Active Ads', zh: '啟用中' },
  'dashboard.newAd': { en: '+ New Ad', zh: '+ 新增廣告' },
  'dashboard.manageProjects': { en: 'Manage Projects', zh: '管理專案' },
  'dashboard.draftAds': { en: 'Draft Ads', zh: '草稿廣告' },

  // Projects
  'projects.title': { en: 'Projects', zh: '專案' },
  'projects.count': { en: 'project(s)', zh: '個專案' },
  'projects.new': { en: '+ New Project', zh: '+ 新增專案' },
  'projects.name': { en: 'Name', zh: '名稱' },
  'projects.description': { en: 'Description', zh: '描述' },
  'projects.domain': { en: 'Domain', zh: '網域' },
  'projects.create': { en: 'Create', zh: '建立' },
  'projects.creating': { en: 'Creating...', zh: '建立中...' },
  'projects.cancel': { en: 'Cancel', zh: '取消' },
  'projects.delete': { en: 'Delete', zh: '刪除' },
  'projects.addAd': { en: '+ Add Ad', zh: '+ 新增廣告' },
  'projects.empty': { en: 'No projects yet. Create one to get started.', zh: '尚無專案，建立一個開始吧。' },
  'projects.ads': { en: 'ad(s)', zh: '則廣告' },
  'projects.back': { en: 'Back to Projects', zh: '返回專案列表' },
  'projects.edit': { en: 'Edit', zh: '編輯' },
  'projects.save': { en: 'Save', zh: '儲存' },
  'projects.noAds': { en: 'No ads yet for this project.', zh: '此專案尚無廣告。' },
  'projects.confirmDelete': { en: 'Delete this project?', zh: '確定要刪除此專案？' },

  // Ads
  'ads.title': { en: 'Ads', zh: '廣告' },
  'ads.count': { en: 'ad(s)', zh: '則廣告' },
  'ads.new': { en: '+ New Ad', zh: '+ 新增廣告' },
  'ads.allProjects': { en: 'All Projects', zh: '全部專案' },
  'ads.allStatuses': { en: 'All Statuses', zh: '全部狀態' },
  'ads.preview': { en: 'Preview', zh: '預覽' },
  'ads.edit': { en: 'Edit', zh: '編輯' },
  'ads.delete': { en: 'Delete', zh: '刪除' },
  'ads.empty': { en: 'No ads yet. Create one to get started.', zh: '尚無廣告，建立一個開始吧。' },
  'ads.noMatch': { en: 'No ads match your filters.', zh: '沒有符合篩選條件的廣告。' },
  'ads.confirmDelete': { en: 'Delete this ad?', zh: '確定要刪除此廣告？' },

  // Ad Form
  'adForm.create': { en: 'Create Ad', zh: '建立廣告' },
  'adForm.editPrefix': { en: 'Edit:', zh: '編輯：' },
  'adForm.project': { en: 'Project', zh: '專案' },
  'adForm.selectProject': { en: 'Select project...', zh: '選擇專案...' },
  'adForm.name': { en: 'Name', zh: '名稱' },
  'adForm.namePlaceholder': { en: 'Ad name', zh: '廣告名稱' },
  'adForm.type': { en: 'Type', zh: '類型' },
  'adForm.position': { en: 'Position', zh: '位置' },
  'adForm.status': { en: 'Status', zh: '狀態' },
  'adForm.headline': { en: 'Headline', zh: '標題' },
  'adForm.headlinePlaceholder': { en: 'Ad headline', zh: '廣告標題' },
  'adForm.bodyText': { en: 'Body Text', zh: '內文' },
  'adForm.bodyTextPlaceholder': { en: 'Ad body text', zh: '廣告內文' },
  'adForm.ctaText': { en: 'CTA Text', zh: 'CTA 文字' },
  'adForm.ctaUrl': { en: 'CTA URL', zh: 'CTA 連結' },
  'adForm.image': { en: 'Image', zh: '圖片' },
  'adForm.removeImage': { en: 'Remove', zh: '移除' },
  'adForm.backgroundImage': { en: 'Background Image', zh: '背景圖片' },
  'adForm.removeBackgroundImage': { en: 'Remove', zh: '移除' },
  'adForm.style': { en: 'Style', zh: '樣式' },
  'adForm.bgColor': { en: 'Background', zh: '背景色' },
  'adForm.textColor': { en: 'Text Color', zh: '文字色' },
  'adForm.ctaBgColor': { en: 'CTA Background', zh: 'CTA 背景' },
  'adForm.ctaTextColor': { en: 'CTA Text', zh: 'CTA 文字色' },
  'adForm.borderRadius': { en: 'Border Radius', zh: '圓角' },
  'adForm.padding': { en: 'Padding', zh: '內距' },
  'adForm.maxWidth': { en: 'Max Width', zh: '最大寬度' },
  'adForm.saving': { en: 'Saving...', zh: '儲存中...' },
  'adForm.createBtn': { en: 'Create Ad', zh: '建立廣告' },
  'adForm.saveBtn': { en: 'Save Changes', zh: '儲存變更' },
  'adForm.cancel': { en: 'Cancel', zh: '取消' },
  'adForm.livePreview': { en: 'Live Preview', zh: '即時預覽' },
  'adForm.embedCode': { en: 'Embed Code', zh: '嵌入程式碼' },

  // Preview
  'preview.back': { en: 'Back to Edit', zh: '返回編輯' },
  'preview.title': { en: 'Preview:', zh: '預覽：' },
  'preview.adPreview': { en: 'Ad Preview', zh: '廣告預覽' },
  'preview.embedCode': { en: 'Embed Code', zh: '嵌入程式碼' },

  // Common
  'common.loading': { en: 'Loading...', zh: '載入中...' },
  'common.notFound': { en: 'Not found', zh: '找不到' },
  'common.of': { en: 'of', zh: '/' },

  // Status labels
  'status.enabled': { en: 'Enabled', zh: '啟用' },
  'status.disabled': { en: 'Disabled', zh: '停用' },
  'status.draft': { en: 'Draft', zh: '草稿' },

  // Type labels
  'type.bottom-banner': { en: 'Bottom Banner', zh: '底部橫幅' },
  'type.top-notification': { en: 'Top Notification', zh: '頂部通知欄' },
  'type.in-article-banner': { en: 'In-Article Banner', zh: '文中橫幅' },
  'type.modal-popup': { en: 'Modal Popup', zh: '彈窗廣告' },
  'type.sidebar-card': { en: 'Sidebar Card', zh: '側邊卡片' },

  // Position labels
  'position.fixed-bottom': { en: 'Fixed Bottom', zh: '固定底部' },
  'position.fixed-top': { en: 'Fixed Top', zh: '固定頂部' },
  'position.inline': { en: 'Inline', zh: '內嵌' },
  'position.fixed': { en: 'Fixed (Modal)', zh: '固定（彈窗）' },
  'position.sidebar-left': { en: 'Sidebar Left', zh: '左側欄' },
  'position.sidebar-right': { en: 'Sidebar Right', zh: '右側欄' },

  // Templates
  'nav.templates': { en: 'Templates', zh: '模板' },
  'templates.title': { en: 'Templates', zh: '模板' },
  'templates.subtitle': { en: 'Pre-built ad templates for e-commerce campaigns', zh: '電商活動預設廣告模板' },
  'templates.all': { en: 'All', zh: '全部' },
  'templates.shopping': { en: 'Shopping Festivals', zh: '購物節' },
  'templates.seasonal': { en: 'Seasonal Events', zh: '季節活動' },
  'templates.member': { en: 'Member Events', zh: '會員活動' },
  'templates.useTemplate': { en: 'Use Template', zh: '使用模板' },
  'templates.dateRange': { en: 'Date', zh: '日期' },
  'templates.suggestedType': { en: 'Type', zh: '類型' },
  'templates.suggestedPosition': { en: 'Position', zh: '位置' },
  'templates.colors': { en: 'Colors', zh: '配色' },
  'templates.preview': { en: 'Preview', zh: '預覽' },
  'templates.empty': { en: 'No templates in this category.', zh: '此分類暫無模板。' },
  'templates.applied': { en: 'Template applied! Customize your ad below.', zh: '模板已套用！請在下方自訂您的廣告。' },
  'templates.selectProject': { en: 'Select a project first to use a template', zh: '請先選擇專案再使用模板' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key
}
