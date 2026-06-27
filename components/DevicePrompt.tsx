'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Step = 'ask' | 'mobile' | null

export default function DevicePrompt() {
  const [step, setStep] = useState<Step>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (localStorage.getItem('device-prompted')) return
    if (window.matchMedia('(display-mode: standalone)').matches) {
      localStorage.setItem('device-prompted', '1')
      return
    }
    const t = setTimeout(() => setStep('ask'), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem('device-prompted', '1')
    setStep(null)
  }

  const chooseDesktop = () => {
    localStorage.setItem('device-type', 'desktop')
    dismiss()
  }

  const chooseMobile = () => {
    localStorage.setItem('device-type', 'mobile')
    setStep('mobile')
  }

  const installPWA = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    }
    dismiss()
  }

  if (!step) return null

  return (
    <div
      className="fixed inset-0 z-100 flex items-end md:items-center justify-center"
      onClick={dismiss}
    >
      <div className="absolute inset-0 bg-ink/55" />
      <div
        className="relative w-full md:max-w-sm bg-stone md:mx-4 md:rounded-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3.5 pb-0">
          <div className="w-9 h-1 bg-silk rounded-full" />
        </div>

        <div className="px-7 pt-6 md:px-8 md:pt-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:pb-8">
          {step === 'ask' && (
            <>
              <p className="text-[9px] tracking-[.18em] uppercase text-ash mb-3">Paisa</p>
              <h2 className="font-serif text-[28px] font-light text-ink mb-2.5 leading-tight">
                What device are you on?
              </h2>
              <p className="text-[13px] text-ash leading-relaxed mb-8">
                We'll make sure the experience feels right for your screen.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={chooseMobile}
                  className="flex-1 py-4 border border-silk text-[11px] tracking-[.12em] uppercase text-ash hover:border-char hover:text-char transition-colors cursor-pointer"
                >
                  Mobile
                </button>
                <button
                  onClick={chooseDesktop}
                  className="flex-1 py-4 bg-char text-stone text-[11px] tracking-[.12em] uppercase cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Desktop
                </button>
              </div>
            </>
          )}

          {step === 'mobile' && (
            <>
              <p className="text-[9px] tracking-[.18em] uppercase text-ash mb-3">Mobile</p>
              <h2 className="font-serif text-[28px] font-light text-ink mb-2.5 leading-tight">
                Install Paisa
              </h2>
              <p className="text-[13px] text-ash leading-relaxed mb-6">
                Add to your home screen for a full-screen experience — no browser bar, instant access, works offline.
              </p>

              {!deferredPrompt && (
                <div className="border border-linen p-4 mb-6">
                  <p className="text-[11px] text-ash leading-[1.75]">
                    <span className="text-char font-normal">On iOS Safari</span> — tap the{' '}
                    <span className="font-normal text-char">Share ↑</span> button at the bottom,
                    then <span className="font-normal text-char">Add to Home Screen</span>.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                {deferredPrompt && (
                  <button
                    onClick={installPWA}
                    className="w-full py-4 bg-char text-stone text-[11px] tracking-[.12em] uppercase cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Add to Home Screen
                  </button>
                )}
                <button
                  onClick={dismiss}
                  className="w-full py-4 border border-silk text-[11px] tracking-[.12em] uppercase text-ash cursor-pointer hover:border-char hover:text-char transition-colors"
                >
                  Continue in Browser
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
