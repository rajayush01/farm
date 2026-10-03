import React, { createContext, useContext, useEffect, useState } from 'react'
import { farmService } from '@/api'
import type { Farm } from '@/types'

interface FarmContextValue {
  farms: Farm[]
  currentFarm: Farm | undefined
  setCurrentFarmId: (id: string) => void
  loading: boolean
}

const FarmContext = createContext<FarmContextValue | undefined>(undefined)

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [farms, setFarms] = useState<Farm[]>([])
  const [currentFarmId, setCurrentFarmId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    farmService.list().then((list) => {
      setFarms(list)
      if (list.length > 0) setCurrentFarmId(list[0].id)
      setLoading(false)
    })
  }, [])

  const currentFarm = farms.find((f) => f.id === currentFarmId)

  return (
    <FarmContext.Provider value={{ farms, currentFarm, setCurrentFarmId, loading }}>
      {children}
    </FarmContext.Provider>
  )
}

export function useFarmContext(): FarmContextValue {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarmContext must be used within FarmProvider')
  return ctx
}
