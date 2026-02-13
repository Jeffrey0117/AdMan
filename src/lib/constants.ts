// ── Widget Categories ────────────────────────────────────

export const WIDGET_CATEGORIES = ['ad', 'login-form', 'feedback-form'] as const
export type WidgetCategory = (typeof WIDGET_CATEGORIES)[number]

// ── Ad Types ─────────────────────────────────────────────

export const AD_TYPES = [
  'bottom-banner',
  'top-notification',
  'in-article-banner',
  'modal-popup',
  'sidebar-card',
] as const
export type AdType = (typeof AD_TYPES)[number]

export const AD_STATUSES = ['enabled', 'disabled', 'draft'] as const
export type AdStatus = (typeof AD_STATUSES)[number]

export const AD_POSITIONS = [
  'fixed-bottom',
  'fixed-top',
  'inline',
  'fixed',
  'sidebar-left',
  'sidebar-right',
] as const
export type AdPosition = (typeof AD_POSITIONS)[number]

export const TYPE_DEFAULT_POSITIONS: Record<AdType, AdPosition> = {
  'bottom-banner': 'fixed-bottom',
  'top-notification': 'fixed-top',
  'in-article-banner': 'inline',
  'modal-popup': 'fixed',
  'sidebar-card': 'sidebar-right',
}

export const TYPE_POSITION_OPTIONS: Record<AdType, readonly AdPosition[]> = {
  'bottom-banner': ['fixed-bottom'],
  'top-notification': ['fixed-top'],
  'in-article-banner': ['inline'],
  'modal-popup': ['fixed'],
  'sidebar-card': ['sidebar-left', 'sidebar-right'],
}

export const AD_TYPE_LABELS: Record<AdType, string> = {
  'bottom-banner': 'Bottom Banner',
  'top-notification': 'Top Notification',
  'in-article-banner': 'In-Article Banner',
  'modal-popup': 'Modal Popup',
  'sidebar-card': 'Sidebar Card',
}

export const AD_STATUS_LABELS: Record<AdStatus, string> = {
  enabled: 'Enabled',
  disabled: 'Disabled',
  draft: 'Draft',
}

export const AD_POSITION_LABELS: Record<AdPosition, string> = {
  'fixed-bottom': 'Fixed Bottom',
  'fixed-top': 'Fixed Top',
  'inline': 'Inline',
  'fixed': 'Fixed (Modal)',
  'sidebar-left': 'Sidebar Left',
  'sidebar-right': 'Sidebar Right',
}

// ── Widget Category Defaults ─────────────────────────────

export const CATEGORY_DEFAULT_POSITION: Record<WidgetCategory, AdPosition> = {
  'ad': 'fixed-bottom',
  'login-form': 'inline',
  'feedback-form': 'inline',
}

export const CATEGORY_POSITION_OPTIONS: Record<WidgetCategory, readonly AdPosition[]> = {
  'ad': AD_POSITIONS,
  'login-form': ['inline', 'fixed'],
  'feedback-form': ['inline', 'fixed', 'sidebar-right', 'sidebar-left'],
}
