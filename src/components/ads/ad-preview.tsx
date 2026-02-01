interface AdPreviewData {
  headline: string
  bodyText: string
  ctaText: string
  ctaUrl: string
  imageUrl?: string
  backgroundImageUrl?: string
  type: string
  style: {
    backgroundColor: string
    textColor: string
    ctaBackgroundColor: string
    ctaTextColor: string
    borderRadius: string
    padding: string
    maxWidth: string
  }
}

function bgImageStyle(url?: string): React.CSSProperties {
  if (!url) return {}
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }
}

const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

function CtaButton({ ad, style: overrides }: { ad: AdPreviewData; style?: React.CSSProperties }) {
  return (
    <a
      href={ad.ctaUrl || '#'}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.preventDefault()}
      style={{
        display: 'inline-block',
        backgroundColor: ad.style.ctaBackgroundColor,
        color: ad.style.ctaTextColor,
        padding: '8px 20px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        ...overrides,
      }}
    >
      {ad.ctaText || 'Click Here'}
    </a>
  )
}

function DismissButton({ style: overrides }: { style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      onClick={(e) => e.preventDefault()}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        lineHeight: 1,
        opacity: 0.7,
        padding: '4px 8px',
        ...overrides,
      }}
    >
      ✕
    </button>
  )
}

function BottomBannerPreview({ ad }: { ad: AdPreviewData }) {
  return (
    <div
      style={{
        backgroundColor: ad.style.backgroundColor,
        color: ad.style.textColor,
        borderRadius: ad.style.borderRadius,
        padding: ad.style.padding,
        fontFamily,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        ...bgImageStyle(ad.backgroundImageUrl),
      }}
    >
      {ad.imageUrl && (
        <img
          src={ad.imageUrl}
          alt=""
          style={{
            width: '80px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '4px',
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600 }}>
          {ad.headline || 'Headline'}
        </h3>
        {ad.bodyText && (
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.85, lineHeight: 1.4 }}>
            {ad.bodyText}
          </p>
        )}
      </div>
      <CtaButton ad={ad} />
    </div>
  )
}

function TopNotificationPreview({ ad }: { ad: AdPreviewData }) {
  return (
    <div
      style={{
        backgroundColor: ad.style.backgroundColor,
        color: ad.style.textColor,
        padding: '10px 16px',
        fontFamily,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        ...bgImageStyle(ad.backgroundImageUrl),
      }}
    >
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>
        {ad.headline || 'Headline'}
      </span>
      <CtaButton ad={ad} style={{ padding: '6px 16px', fontSize: '13px' }} />
      <DismissButton style={{ color: ad.style.textColor }} />
    </div>
  )
}

function InArticleBannerPreview({ ad }: { ad: AdPreviewData }) {
  return (
    <div
      style={{
        backgroundColor: ad.style.backgroundColor,
        color: ad.style.textColor,
        borderRadius: ad.style.borderRadius,
        padding: ad.style.padding,
        maxWidth: ad.style.maxWidth,
        fontFamily,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        ...bgImageStyle(ad.backgroundImageUrl),
      }}
    >
      {ad.imageUrl && (
        <img
          src={ad.imageUrl}
          alt=""
          style={{
            width: '100%',
            borderRadius: '4px',
            marginBottom: '12px',
            objectFit: 'cover',
            maxHeight: '200px',
          }}
        />
      )}
      <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 600 }}>
        {ad.headline || 'Headline'}
      </h3>
      {ad.bodyText && (
        <p style={{ margin: '0 0 12px', fontSize: '14px', opacity: 0.85, lineHeight: 1.5 }}>
          {ad.bodyText}
        </p>
      )}
      <CtaButton ad={ad} />
    </div>
  )
}

function ModalPopupPreview({ ad }: { ad: AdPreviewData }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: ad.style.borderRadius,
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        fontFamily,
      }}
    >
      <div
        style={{
          backgroundColor: ad.style.backgroundColor,
          color: ad.style.textColor,
          borderRadius: ad.style.borderRadius,
          padding: ad.style.padding,
          maxWidth: '400px',
          width: '100%',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          ...bgImageStyle(ad.backgroundImageUrl),
        }}
      >
        <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
          <DismissButton style={{ color: ad.style.textColor }} />
        </div>
        {ad.imageUrl && (
          <img
            src={ad.imageUrl}
            alt=""
            style={{
              width: '100%',
              borderRadius: '4px',
              marginBottom: '12px',
              objectFit: 'cover',
              maxHeight: '180px',
            }}
          />
        )}
        <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600 }}>
          {ad.headline || 'Headline'}
        </h3>
        {ad.bodyText && (
          <p style={{ margin: '0 0 16px', fontSize: '14px', opacity: 0.85, lineHeight: 1.5 }}>
            {ad.bodyText}
          </p>
        )}
        <CtaButton ad={ad} style={{ width: '100%', textAlign: 'center' }} />
      </div>
    </div>
  )
}

function SidebarCardPreview({ ad }: { ad: AdPreviewData }) {
  return (
    <div
      style={{
        backgroundColor: ad.style.backgroundColor,
        color: ad.style.textColor,
        borderRadius: ad.style.borderRadius,
        padding: ad.style.padding,
        maxWidth: '280px',
        fontFamily,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        ...bgImageStyle(ad.backgroundImageUrl),
      }}
    >
      {ad.imageUrl && (
        <img
          src={ad.imageUrl}
          alt=""
          style={{
            width: '100%',
            borderRadius: '4px',
            marginBottom: '12px',
            objectFit: 'cover',
            maxHeight: '160px',
          }}
        />
      )}
      <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600 }}>
        {ad.headline || 'Headline'}
      </h3>
      {ad.bodyText && (
        <p style={{ margin: '0 0 12px', fontSize: '13px', opacity: 0.85, lineHeight: 1.4 }}>
          {ad.bodyText}
        </p>
      )}
      <CtaButton ad={ad} style={{ width: '100%', textAlign: 'center', fontSize: '13px' }} />
    </div>
  )
}

export function AdPreview({ ad }: { ad: AdPreviewData }) {
  switch (ad.type) {
    case 'bottom-banner':
      return <BottomBannerPreview ad={ad} />
    case 'top-notification':
      return <TopNotificationPreview ad={ad} />
    case 'in-article-banner':
      return <InArticleBannerPreview ad={ad} />
    case 'modal-popup':
      return <ModalPopupPreview ad={ad} />
    case 'sidebar-card':
      return <SidebarCardPreview ad={ad} />
    default:
      return <InArticleBannerPreview ad={ad} />
  }
}
