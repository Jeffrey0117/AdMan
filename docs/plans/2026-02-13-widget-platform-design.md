# AdMan Widget Platform Extension

## Summary

Extend AdMan from ad-only management to a universal embeddable widget platform. Two new widget categories added alongside existing 5 ad types:

1. **Login / Register Form** - Embeddable auth widget
2. **Feedback / Contact Form** - Embeddable feedback widget

Same embed pattern: `<div data-adman-id="xxx"></div>` + script tag.

## Architecture

### Widget Category System

Current `type` field (bottom-banner, top-notification, etc.) becomes part of a higher-level **category** system:

```
category: 'ad' | 'login-form' | 'feedback-form'
```

- **ad** category keeps all 5 existing types unchanged
- **login-form** and **feedback-form** are new categories with their own field schemas

### Data Model

Extend the Ad model with a `category` field. Existing ads default to `category: 'ad'`. New widget types have category-specific fields stored in a `widgetConfig` JSON object.

```typescript
// Shared base fields
{ id, projectId, name, category, status, position, style, createdAt, updatedAt }

// category='ad' - existing fields
{ headline, bodyText, ctaText, ctaUrl, imageUrl, backgroundImageUrl, type }

// category='login-form'
{ widgetConfig: { title, submitUrl, fields, socialLogins, successRedirect } }

// category='feedback-form'
{ widgetConfig: { title, fields, submitUrl, successMessage } }
```

### Files to Create/Modify

**New files:**
- `src/lib/widget-types.ts` - Category definitions, field configs
- `src/components/widgets/login-form-preview.tsx` - Login form preview
- `src/components/widgets/feedback-form-preview.tsx` - Feedback form preview
- `src/components/widgets/login-form-fields.tsx` - Form editor fields
- `src/components/widgets/feedback-form-fields.tsx` - Form editor fields
- `src/embed/renderers/login-form.ts` - Embed renderer
- `src/embed/renderers/feedback-form.ts` - Embed renderer
- `src/app/api/widget-submit/route.ts` - Form submission endpoint

**Modified files:**
- `src/lib/constants.ts` - Add WIDGET_CATEGORIES
- `src/lib/models.ts` - Extend schema with category + widgetConfig
- `src/lib/i18n.ts` - Add widget translation keys
- `src/components/ads/ad-form.tsx` - Category selector, conditional fields
- `src/components/ads/ad-preview.tsx` - Route to widget previews
- `src/embed/adman-embed.ts` - Route to widget renderers
- `src/app/api/serve/[adId]/route.ts` - Serve widgets too
- `src/app/page.tsx` - Dashboard shows widget counts
- `src/components/layout/navbar.tsx` - Add "Widgets" nav item (or rename)

### Embed Behavior

**Login Form** renders:
- Title
- Email + password inputs (styled)
- Submit button
- Optional social login buttons (Google, GitHub, etc.)
- Form POSTs to configured `submitUrl`

**Feedback Form** renders:
- Title
- Configurable fields (name, email, message, rating)
- Submit button
- Form POSTs to configured `submitUrl`
- Shows success message after submit

### Form Submission

Widget forms POST to the host site's configured `submitUrl`. AdMan acts as the UI layer only - it doesn't handle auth or store feedback data. This keeps it simple and flexible.

Optional: `/api/widget-submit` proxy endpoint for sites that want AdMan to relay submissions.
