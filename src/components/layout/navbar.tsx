'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from './lang-provider'
import type { TranslationKey } from '@/lib/i18n'

const navItems: { href: string; labelKey: TranslationKey }[] = [
  { href: '/', labelKey: 'nav.dashboard' },
  { href: '/projects', labelKey: 'nav.projects' },
  { href: '/ads', labelKey: 'nav.ads' },
  { href: '/templates', labelKey: 'nav.templates' },
  { href: '/sites', labelKey: 'nav.sites' },
]

export function Navbar() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLang()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="mx-auto flex h-14 items-center px-12 lg:px-32">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 mr-8">
          AdMan
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-4 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {t(item.labelKey)}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900" />
              )}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-colors"
        >
          {locale === 'en' ? '中文' : 'English'}
        </button>
      </div>
    </header>
  )
}
