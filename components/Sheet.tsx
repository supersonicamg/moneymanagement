'use client'

import { useEffect } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/45 transition-opacity" />
      <div
        className="animate-sheet absolute bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-stone max-h-[92svh] overflow-y-auto md:rounded-sm md:shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3.5 pb-1 sticky top-0 bg-stone z-10">
          <div className="w-9 h-1 bg-silk rounded-full" />
        </div>

        <div className="px-6 pt-4 md:p-8 pb-[calc(1.75rem+env(safe-area-inset-bottom,0px))] md:pb-8">
          <div className="flex items-center justify-between mb-7 md:mb-8">
            <h2 className="font-serif text-[22px] font-light text-ink">{title}</h2>
            <button
              onClick={onClose}
              className="text-ash hover:text-char transition-colors text-2xl leading-none p-2 -mr-1 cursor-pointer"
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
