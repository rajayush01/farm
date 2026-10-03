import React from 'react'
import clsx from 'clsx'

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-barn-500">{label}</span>
      {children}
      {hint && <span className="text-xs text-barn-400">{hint}</span>}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'rounded-md border border-barn-200 bg-white px-3 py-2 text-sm text-barn-800 placeholder:text-barn-300 focus:border-barn-500',
        props.className,
      )}
    />
  )
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        'rounded-md border border-barn-200 bg-white px-3 py-2 text-sm text-barn-800 focus:border-barn-500',
        props.className,
      )}
    >
      {children}
    </select>
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        'rounded-md border border-barn-200 bg-white px-3 py-2 text-sm text-barn-800 placeholder:text-barn-300 focus:border-barn-500',
        props.className,
      )}
    />
  )
}
