'use client'

interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-ink text-stone text-[11px] tracking-[.08em] px-5 py-2.5 z-[200] pointer-events-none whitespace-nowrap transition-all duration-200 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {message}
    </div>
  )
}
