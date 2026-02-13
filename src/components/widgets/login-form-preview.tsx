import type { LoginFormConfig } from '@/lib/models'

interface LoginFormPreviewProps {
  config: LoginFormConfig
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

export function LoginFormPreview({ config, style }: LoginFormPreviewProps) {
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
      <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 600, textAlign: 'center' }}>
        {config.title || 'Login'}
      </h3>
      {config.subtitle && (
        <p style={{ margin: '0 0 16px', fontSize: '14px', opacity: 0.7, textAlign: 'center' }}>
          {config.subtitle}
        </p>
      )}

      {config.showSocialLogins && config.socialLogins.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {config.socialLogins.map((provider) => (
            <button
              key={provider}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px',
                border: `1px solid ${style.textColor}20`,
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: style.textColor,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily,
              }}
            >
              {provider === 'google' && 'Continue with Google'}
              {provider === 'github' && 'Continue with GitHub'}
              {provider === 'facebook' && 'Continue with Facebook'}
            </button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: `${style.textColor}20` }} />
            <span style={{ fontSize: '12px', opacity: 0.5 }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: `${style.textColor}20` }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {config.fields.map((field) => (
          <div key={field.name}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
            </label>
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
        {config.submitText || 'Sign In'}
      </button>

      {(config.showForgotPassword || config.showRegisterLink) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px' }}>
          {config.showForgotPassword && (
            <span style={{ opacity: 0.7, cursor: 'pointer' }}>Forgot password?</span>
          )}
          {config.showRegisterLink && (
            <span style={{ opacity: 0.7, cursor: 'pointer', marginLeft: 'auto' }}>Create account</span>
          )}
        </div>
      )}
    </div>
  )
}
