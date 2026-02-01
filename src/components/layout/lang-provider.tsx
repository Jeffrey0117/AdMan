'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { t as translate, type Locale, type TranslationKey } from '@/lib/i18n'

interface LangContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LangContext = createContext<LangContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('adman-locale') as Locale | null
    if (saved === 'en' || saved === 'zh') {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('adman-locale', newLocale)
  }, [])

  const tFn = useCallback(
    (key: TranslationKey) => translate(key, locale),
    [locale]
  )

  return (
    <LangContext.Provider value={{ locale, setLocale, t: tFn }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
