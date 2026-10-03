import { USE_MOCK } from '@/lib/config'
import { httpClient } from '@/api/httpClient'
import { db, delay } from '@/api/mockDb'
import type { Farm } from '@/types'

export const farmService = {
  async list(): Promise<Farm[]> {
    if (USE_MOCK) {
      await delay()
      return db.farms
    }
    return httpClient.get<Farm[]>('/farms')
  },

  async get(id: string): Promise<Farm | undefined> {
    if (USE_MOCK) {
      await delay()
      return db.farms.find((f) => f.id === id)
    }
    return httpClient.get<Farm>(`/farms/${id}`)
  },

  async create(payload: Omit<Farm, 'id' | 'createdAt'>): Promise<Farm> {
    if (USE_MOCK) {
      await delay()
      const farm: Farm = { ...payload, id: `farm-${db.farms.length + 1}`, createdAt: new Date().toISOString().slice(0, 10) }
      db.farms.push(farm)
      return farm
    }
    return httpClient.post<Farm>('/farms', payload)
  },
}
