'use client'

import { useState } from 'react'
import Sheet from '@/components/Sheet'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; target: number; saved: number; deadline?: string }) => void
}

const fieldCls = 'w-full bg-transparent border-0 border-b border-silk outline-none font-sans text-[15px] font-light text-char py-2 placeholder:text-silk focus:border-char transition-colors'
const labelCls = 'block text-[9px] tracking-[.16em] uppercase text-ash mb-2'

export default function GoalSheet({ open, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [deadline, setDeadline] = useState('')

  const reset = () => { setName(''); setTarget(''); setSaved(''); setDeadline('') }

  const handleSave = () => {
    const t = parseFloat(target)
    if (!name.trim() || !t || t <= 0) return
    onSave({
      name: name.trim(),
      target: t,
      saved: parseFloat(saved) || 0,
      deadline: deadline || undefined,
    })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onClose={() => { reset(); onClose() }} title="New goal">
      <div className="mb-6">
        <label className={labelCls}>Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Emergency fund"
          className={fieldCls}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Target</label>
          <input
            type="number"
            inputMode="decimal"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="0"
            className={`${fieldCls} font-serif text-[24px] font-light`}
          />
        </div>
        <div>
          <label className={labelCls}>Saved so far</label>
          <input
            type="number"
            inputMode="decimal"
            value={saved}
            onChange={e => setSaved(e.target.value)}
            placeholder="0"
            className={`${fieldCls} font-serif text-[24px] font-light`}
          />
        </div>
      </div>
      <div className="mb-7">
        <label className={labelCls}>Deadline (optional)</label>
        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={fieldCls} />
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-char text-stone text-[11px] tracking-[.14em] uppercase py-3.5 cursor-pointer hover:opacity-85 active:opacity-70 transition-opacity"
      >
        Save
      </button>
    </Sheet>
  )
}
