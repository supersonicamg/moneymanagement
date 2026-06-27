'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppData } from '@/lib/DataContext'

const TABS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[18px] h-[18px]">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/logs',
    label: 'Log',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[18px] h-[18px]">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    href: '/plan',
    label: 'Plan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[18px] h-[18px]">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    href: '/insights',
    label: 'Insights',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[18px] h-[18px]">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[18px] h-[18px]">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
      </svg>
    ),
  },
]

interface NavProps {
  onAddClick: () => void
}

export default function Nav({ onAddClick }: NavProps) {
  const pathname = usePathname()
  const { signOut } = useAppData()

  return (
    <>
      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-stone border-t border-linen grid grid-cols-5 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {TABS.map(tab => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-3.5 pb-3 transition-colors duration-200 text-[9px] font-normal tracking-[.1em] uppercase ${
                active ? 'text-char' : 'text-ash'
              }`}
            >
              <span className={active ? 'text-brand-red' : 'text-ash'}>{tab.icon}</span>
              {tab.label}
            </Link>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 lg:w-64 bg-stone border-r border-linen z-40 py-10 px-6">
        <div className="mb-10">
          <p className="text-[9px] tracking-[.18em] uppercase text-ash mb-2">Paisa</p>
          <h1 className="font-serif text-2xl font-light text-ink">Money</h1>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {TABS.map(tab => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-left text-[11px] tracking-[.1em] uppercase transition-colors duration-150 w-full ${
                  active ? 'text-char bg-linen' : 'text-ash hover:text-char hover:bg-linen/50'
                }`}
              >
                <span className={active ? 'text-brand-red' : ''}>{tab.icon}</span>
                {tab.label}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={onAddClick}
          className="w-full bg-char text-stone text-[11px] tracking-[.14em] uppercase py-3.5 cursor-pointer hover:opacity-85 active:opacity-70 transition-opacity"
        >
          + Add Entry
        </button>

        <button
          onClick={signOut}
          className="mt-2 w-full text-ash text-[9px] tracking-[.14em] uppercase py-2 cursor-pointer hover:text-char transition-colors"
        >
          Sign out
        </button>
      </aside>
    </>
  )
}
