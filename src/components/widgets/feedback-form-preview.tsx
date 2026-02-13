import type { FeedbackFormConfig } from '@/lib/models'

interface FeedbackFormPreviewProps {
  config: FeedbackFormConfig
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

const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

function StarRating({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: '20px',
            cursor: 'pointer',
            opacity: star <= 3 ? 1 : 0.3,
            color: star <= 3 ? '#f59e0b' : color,
          }}
        >
          &#9733;
        </span>
      ))}
    </div>
  )
}

export function FeedbackFormPreview({ config, style }: FeedbackFormPreviewProps) {
  return (
    <div
      style={{
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        borderRadius: style.borderRadius,
        padding: style.padding,
        maxWidth: style.maxWidth,
        fontFamily,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 600 }}>
        {config.title || 'Feedback'}
      </h3>
      {config.subtitle && (
        <p style={{ margin: '0 0 16px', fontSize: '14px', opacity: 0.7 }}>
          {config.subtitle}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {config.fields.map((field) => (
          <div key={field.name}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
            </label>
            {field.type === 'rating' ? (
              <StarRating color={style.textColor} />
            ) : field.type === 'textarea' ? (
              <textarea
                placeholder={field.placeholder}
                disabled
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${style.textColor}20`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  color: style.textColor,
                  boxSizing: 'border-box',
                  fontFamily,
                  resize: 'vertical',
                }}
              />
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${style.textColor}20`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  color: style.textColor,
                  boxSizing: 'border-box',
                  fontFamily,
                }}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        style={{
          display: 'block',
          width: '100%',
          padding: '10px',
          marginTop: '16px',
          backgroundColor: style.ctaBackgroundColor,
          color: style.ctaTextColor,
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily,
        }}
      >
        {config.submitText || 'Submit'}
      </button>
    </div>
  )
}
