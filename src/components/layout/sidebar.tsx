'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from './lang-provider'
import type { TranslationKey } from '@/lib/i18n'

const navItems: { href: string; labelKey: TranslationKey }[] = [
  { href: '/', labelKey: 'nav.dashboard' },
  { href: '/projects', labelKey: 'nav.projects' },
  { href: '/ads', labelKey: 'nav.ads' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLang()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-zinc-900 text-white flex flex-col">
      <div className="px-5 py-4 border-b border-zinc-800">
        <Link href="/" className="text-xl font-bold tracking-tight">
          AdMan
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-zinc-700/60 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
          className="w-full rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-left"
        >
          {locale === 'en' ? '中文' : 'English'}
        </button>
      </div>
    </aside>
  )
}
