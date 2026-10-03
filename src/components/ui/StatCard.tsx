import React from 'react'
import clsx from 'clsx'

interface StatCardProps {
  label: string
  value: string
  delta?: { value: string; positive: boolean }
  icon?: React.ReactNode
  tone?: 'default' | 'alert'
}

export function StatCard({ label, value, delta, icon, tone = 'default' }: StatCardProps) {
  return (
    <div
      className={clsx(
        'bg-white border rounded-lg px-5 py-4 flex flex-col gap-1.5',
        tone === 'alert' ? 'border-alert/30' : 'border-barn-100',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-barn-400">{label}</span>
        {icon && <span className="text-barn-300">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-medium text-barn-800">{value}</span>
        {delta && (
          <span className={clsx('text-xs font-medium', delta.positive ? 'text-barn-500' : 'text-alert')}>
            {delta.value}
          </span>
        )}
      </div>
    </div>
  )
}
