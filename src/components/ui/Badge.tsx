import React from 'react'
import clsx from 'clsx'

type Tone = 'green' | 'amber' | 'red' | 'neutral'

const toneClasses: Record<Tone, string> = {
  green: 'bg-barn-500/10 text-barn-600',
  amber: 'bg-grain/20 text-grain-dark',
  red: 'bg-alert-light text-alert',
  neutral: 'bg-barn-100 text-barn-500',
}

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={clsx('inline-flex items-center rounded px-2 py-0.5 text-xs font-medium', toneClasses[tone])}>
      {children}
    </span>
  )
}
