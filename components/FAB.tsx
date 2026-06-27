'use client'

interface FABProps {
  onClick: () => void
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      title="Add transaction"
      className="md:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-5 w-12 h-12 bg-char text-stone rounded-full text-2xl leading-none flex items-center justify-center shadow-[0_4px_20px_rgba(12,12,10,0.18)] hover:scale-105 hover:shadow-[0_6px_28px_rgba(12,12,10,0.24)] active:scale-95 transition-all duration-200 z-49 cursor-pointer"
    >
      +
    </button>
  )
}
