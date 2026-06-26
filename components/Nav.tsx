'use client'

import type { Screen } from '@/lib/types'

const TABS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[18px] h-[18px]">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'log',
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
    id: 'plan',
    label: 'Plan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[18px] h-[18px]">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-[18px] h-[18px]">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
]

interface NavProps {
  active: Screen
  onChange: (s: Screen) => void
  onAddClick: () => void
}

export default function Nav({ active, onChange, onAddClick }: NavProps) {
  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone border-t border-linen grid grid-cols-4 z-40 pb-[env(safe-area-inset-bottom,0)]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-1 py-3.5 pb-3 cursor-pointer transition-colors duration-200 text-[9px] font-normal tracking-[.1em] uppercase ${
              active === tab.id ? 'text-char' : 'text-ash'
            }`}
          >
            <span className={active === tab.id ? 'text-brand-red' : 'text-ash'}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 lg:w-64 bg-stone border-r border-linen z-40 py-10 px-6">
        <div className="mb-10">
          <p className="text-[9px] tracking-[.18em] uppercase text-ash mb-2">Paisa</p>
          <h1 className="font-serif text-2xl font-light text-ink">Money</h1>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-3 px-3 py-2.5 text-left text-[11px] tracking-[.1em] uppercase cursor-pointer transition-colors duration-150 w-full ${
                active === tab.id
                  ? 'text-char bg-linen'
                  : 'text-ash hover:text-char hover:bg-linen/50'
              }`}
            >
              <span className={active === tab.id ? 'text-brand-red' : ''}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <button
          onClick={onAddClick}
          className="w-full bg-char text-stone text-[11px] tracking-[.14em] uppercase py-3.5 cursor-pointer hover:opacity-85 active:opacity-70 transition-opacity"
        >
          + Add Entry
        </button>
      </aside>
    </>
  )
}
