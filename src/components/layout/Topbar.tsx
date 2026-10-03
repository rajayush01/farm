import React from 'react'
import { Bell } from 'lucide-react'
import { useFarmContext } from '@/lib/farmContext'
import { useAsync } from '@/hooks/useAsync'
import { alertService } from '@/api'

export function Topbar({ title }: { title: string }) {
  const { farms, currentFarm, setCurrentFarmId } = useFarmContext()
  const { data: alerts } = useAsync(() => alertService.list(currentFarm?.id), [currentFarm?.id])

  return (
    <header className="h-16 shrink-0 border-b border-barn-100 bg-parchment/90 backdrop-blur flex items-center justify-between px-6">
      <h1 className="font-display text-xl text-barn-800">{title}</h1>
      <div className="flex items-center gap-4">
        {farms.length > 1 && (
          <select
            value={currentFarm?.id ?? ''}
            onChange={(e) => setCurrentFarmId(e.target.value)}
            className="text-sm border border-barn-200 rounded-md px-2.5 py-1.5 bg-white text-barn-700"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
        <button className="relative text-barn-500 hover:text-barn-700">
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          {alerts && alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-alert text-white text-[10px] flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </button>
        <div className="h-8 w-8 rounded-full bg-grain/40 flex items-center justify-center text-xs font-medium text-barn-700">
          {currentFarm?.ownerName?.slice(0, 1) ?? '—'}
        </div>
      </div>
    </header>
  )
}
