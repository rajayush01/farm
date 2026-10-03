import React from 'react'
import { Sprout, AlertTriangle } from 'lucide-react'

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-barn-300 text-sm gap-2">
      <div className="h-3.5 w-3.5 rounded-full border-2 border-barn-200 border-t-barn-500 animate-spin" />
      {label}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-2">
      <Sprout className="h-6 w-6 text-barn-200" />
      <p className="text-sm font-medium text-barn-500">{title}</p>
      {hint && <p className="text-xs text-barn-300 max-w-xs">{hint}</p>}
    </div>
  )
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-alert-light text-alert text-sm px-4 py-3">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  )
}
