'use client'

import type { FeedbackFormConfig, FeedbackField } from '@/lib/models'
import type { TranslationKey } from '@/lib/i18n'

interface FeedbackFormFieldsProps {
  config: FeedbackFormConfig
  onChange: (config: FeedbackFormConfig) => void
  t: (key: TranslationKey) => string
  inputClass: string
  labelClass: string
}

export function FeedbackFormFields({ config, onChange, t, inputClass, labelClass }: FeedbackFormFieldsProps) {
  function updateConfig(updates: Partial<FeedbackFormConfig>) {
    onChange({ ...config, ...updates })
  }

  function updateField(index: number, updates: Partial<FeedbackField>) {
    const updatedFields = config.fields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    )
    updateConfig({ fields: updatedFields })
  }

  function addField() {
    const newField: FeedbackField = {
      name: `field_${config.fields.length + 1}`,
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
    }
    updateConfig({ fields: [...config.fields, newField] })
  }

  function removeField(index: number) {
    updateConfig({ fields: config.fields.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t('feedbackForm.title')}</label>
        <input
          className={inputClass}
          value={config.title}
          onChange={(e) => updateConfig({ title: e.target.value })}
          placeholder={t('feedbackForm.titlePlaceholder')}
        />
      </div>

      <div>
        <label className={labelClass}>{t('feedbackForm.subtitle')}</label>
        <input
          className={inputClass}
          value={config.subtitle}
          onChange={(e) => updateConfig({ subtitle: e.target.value })}
          placeholder={t('feedbackForm.subtitlePlaceholder')}
        />
      </div>

      <div>
        <label className={labelClass}>{t('feedbackForm.submitText')}</label>
        <input
          className={inputClass}
          value={config.submitText}
          onChange={(e) => updateConfig({ submitText: e.target.value })}
          placeholder="Send Feedback"
        />
      </div>

      <div>
        <label className={labelClass}>{t('feedbackForm.submitUrl')}</label>
        <input
          className={inputClass}
          value={config.submitUrl}
          onChange={(e) => updateConfig({ submitUrl: e.target.value })}
          placeholder={t('feedbackForm.submitUrlPlaceholder')}
        />
      </div>

      <div>
        <label className={labelClass}>{t('feedbackForm.successMessage')}</label>
        <input
          className={inputClass}
          value={config.successMessage}
          onChange={(e) => updateConfig({ successMessage: e.target.value })}
          placeholder="Thank you for your feedback!"
        />
      </div>

      <div className="border-t border-zinc-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-zinc-700">{t('feedbackForm.fields')}</h4>
          <button
            type="button"
            onClick={addField}
            className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            {t('feedbackForm.addField')}
          </button>
        </div>

        <div className="space-y-3">
          {config.fields.map((field, index) => (
            <div
              key={index}
              className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-500">{t('feedbackForm.fieldLabel')}</label>
                  <input
                    className={inputClass}
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500">{t('feedbackForm.fieldType')}</label>
                  <select
                    className={inputClass}
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as FeedbackField['type'] })}
                  >
                    <option value="text">{t('feedbackForm.fieldTypeText')}</option>
                    <option value="email">{t('feedbackForm.fieldTypeEmail')}</option>
                    <option value="textarea">{t('feedbackForm.fieldTypeTextarea')}</option>
                    <option value="rating">{t('feedbackForm.fieldTypeRating')}</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-500">{t('feedbackForm.fieldPlaceholder')}</label>
                  <input
                    className={inputClass}
                    value={field.placeholder}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  />
                </div>
                <div className="flex items-end justify-between">
                  <label className="flex items-center gap-1.5 text-sm text-zinc-600">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                      className="rounded border-zinc-300"
                    />
                    {t('feedbackForm.fieldRequired')}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    {t('feedbackForm.removeField')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
