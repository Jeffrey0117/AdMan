'use client'

import type { LoginFormConfig } from '@/lib/models'
import type { TranslationKey } from '@/lib/i18n'

interface LoginFormFieldsProps {
  config: LoginFormConfig
  onChange: (config: LoginFormConfig) => void
  t: (key: TranslationKey) => string
  inputClass: string
  labelClass: string
}

export function LoginFormFields({ config, onChange, t, inputClass, labelClass }: LoginFormFieldsProps) {
  function updateConfig(updates: Partial<LoginFormConfig>) {
    onChange({ ...config, ...updates })
  }

  function toggleSocialLogin(provider: 'google' | 'github' | 'facebook') {
    const current = config.socialLogins ?? []
    const updated = current.includes(provider)
      ? current.filter((p) => p !== provider)
      : [...current, provider]
    updateConfig({ socialLogins: updated })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t('loginForm.title')}</label>
        <input
          className={inputClass}
          value={config.title}
          onChange={(e) => updateConfig({ title: e.target.value })}
          placeholder={t('loginForm.titlePlaceholder')}
        />
      </div>

      <div>
        <label className={labelClass}>{t('loginForm.subtitle')}</label>
        <input
          className={inputClass}
          value={config.subtitle}
          onChange={(e) => updateConfig({ subtitle: e.target.value })}
          placeholder={t('loginForm.subtitlePlaceholder')}
        />
      </div>

      <div>
        <label className={labelClass}>{t('loginForm.submitText')}</label>
        <input
          className={inputClass}
          value={config.submitText}
          onChange={(e) => updateConfig({ submitText: e.target.value })}
          placeholder="Sign In"
        />
      </div>

      <div>
        <label className={labelClass}>{t('loginForm.submitUrl')}</label>
        <input
          className={inputClass}
          value={config.submitUrl}
          onChange={(e) => updateConfig({ submitUrl: e.target.value })}
          placeholder={t('loginForm.submitUrlPlaceholder')}
        />
      </div>

      <div>
        <label className={labelClass}>{t('loginForm.successRedirect')}</label>
        <input
          className={inputClass}
          value={config.successRedirect}
          onChange={(e) => updateConfig({ successRedirect: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="border-t border-zinc-200 pt-4">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            type="checkbox"
            checked={config.showSocialLogins}
            onChange={(e) => updateConfig({ showSocialLogins: e.target.checked })}
            className="rounded border-zinc-300"
          />
          {t('loginForm.showSocialLogins')}
        </label>

        {config.showSocialLogins && (
          <div className="mt-2 flex gap-3">
            {(['google', 'github', 'facebook'] as const).map((provider) => (
              <label key={provider} className="flex items-center gap-1.5 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={config.socialLogins?.includes(provider) ?? false}
                  onChange={() => toggleSocialLogin(provider)}
                  className="rounded border-zinc-300"
                />
                {t(`loginForm.social${provider.charAt(0).toUpperCase() + provider.slice(1)}` as TranslationKey)}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              checked={config.showRegisterLink}
              onChange={(e) => updateConfig({ showRegisterLink: e.target.checked })}
              className="rounded border-zinc-300"
            />
            {t('loginForm.showRegisterLink')}
          </label>
          {config.showRegisterLink && (
            <input
              className={`${inputClass} mt-2`}
              value={config.registerUrl}
              onChange={(e) => updateConfig({ registerUrl: e.target.value })}
              placeholder={t('loginForm.registerUrl')}
            />
          )}
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              checked={config.showForgotPassword}
              onChange={(e) => updateConfig({ showForgotPassword: e.target.checked })}
              className="rounded border-zinc-300"
            />
            {t('loginForm.showForgotPassword')}
          </label>
          {config.showForgotPassword && (
            <input
              className={`${inputClass} mt-2`}
              value={config.forgotPasswordUrl}
              onChange={(e) => updateConfig({ forgotPasswordUrl: e.target.value })}
              placeholder={t('loginForm.forgotPasswordUrl')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
