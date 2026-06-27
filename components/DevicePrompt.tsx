'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const SUPPRESS_KEY = 'pwa-dismissed-at'
const SUPPRESS_HOURS = 72

export default function DevicePrompt() {
  const [step, setStep] = useState<'android' | 'ios' | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const dismissed = localStorage.getItem(SUPPRESS_KEY)
    if (dismissed && Date.now() - parseInt(dismissed) < SUPPRESS_HOURS * 3600000) return

    const globalPrompt = (window as any).__pwaPrompt as BeforeInstallPromptEvent | null
    if (globalPrompt) {
      setDeferredPrompt(globalPrompt)
      setTimeout(() => setStep('android'), 900)
      return
    }

    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    const isNonSafari = /CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)
    if (isIOS && !isNonSafari) {
      setTimeout(() => setStep('ios'), 900)
    }
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      const prompt = e as BeforeInstallPromptEvent
      ;(window as any).__pwaPrompt = prompt
      setDeferredPrompt(prompt)
      setStep(prev => prev ?? 'android')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(SUPPRESS_KEY, String(Date.now()))
    setStep(null)
  }

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (outcome === 'accepted') {
        localStorage.setItem(SUPPRESS_KEY, String(Date.now() + 365 * 86400000))
      }
    }
    setStep(null)
  }

  if (!step) return null

  return (
    <div className="fixed inset-0 z-100 flex items-end" onClick={dismiss}>
      <div className="absolute inset-0 bg-ink/55" />
      <div
        className="animate-sheet relative w-full bg-stone shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3.5 pb-0">
          <div className="w-9 h-1 bg-silk rounded-full" />
        </div>

        <div className="px-7 pt-6 pb-[calc(2.25rem+env(safe-area-inset-bottom,0px))]">
          <p className="text-[9px] tracking-[.18em] uppercase text-ash mb-3">Paisa</p>
          <h2 className="font-serif text-[28px] font-light text-ink mb-2.5 leading-tight">
            Install Paisa
          </h2>

          {step === 'android' && (
            <>
              <p className="text-[13px] text-ash leading-relaxed mb-7">
                Add to your home screen for a full-screen, offline-ready experience — no browser bar, instant access.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={install}
                  className="w-full py-4 bg-char text-stone text-[11px] tracking-[.12em] uppercase cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Add to Home Screen
                </button>
                <button
                  onClick={dismiss}
                  className="w-full py-3.5 border border-silk text-[11px] tracking-[.12em] uppercase text-ash cursor-pointer hover:border-char hover:text-char transition-colors"
                >
                  Not now
                </button>
              </div>
            </>
          )}

          {step === 'ios' && (
            <>
              <p className="text-[13px] text-ash leading-relaxed mb-5">
                Add to your home screen for a full-screen experience.
              </p>
              <div className="border border-linen p-4 mb-6">
                <p className="text-[12px] text-ash leading-[1.85]">
                  Tap the <span className="text-char font-normal">Share ↑</span> button at the bottom of Safari, then choose{' '}
                  <span className="text-char font-normal">Add to Home Screen</span>.
                </p>
              </div>
              <button
                onClick={dismiss}
                className="w-full py-3.5 border border-silk text-[11px] tracking-[.12em] uppercase text-ash cursor-pointer hover:border-char hover:text-char transition-colors"
              >
                Got it
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
