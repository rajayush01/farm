import { USE_MOCK } from '@/lib/config'
import { httpClient } from '@/api/httpClient'
import { db, delay } from '@/api/mockDb'
import type { Shed, Batch } from '@/types'

export const shedService = {
  async listByFarm(farmId: string): Promise<Shed[]> {
    if (USE_MOCK) {
      await delay()
      return db.sheds.filter((s) => s.farmId === farmId)
    }
    return httpClient.get<Shed[]>(`/farms/${farmId}/sheds`)
  },
}

export const batchService = {
  async list(farmId?: string): Promise<Batch[]> {
    if (USE_MOCK) {
      await delay()
      return farmId ? db.batches.filter((b) => b.farmId === farmId) : db.batches
    }
    return httpClient.get<Batch[]>(farmId ? `/farms/${farmId}/batches` : '/batches')
  },

  async get(id: string): Promise<Batch | undefined> {
    if (USE_MOCK) {
      await delay()
      return db.batches.find((b) => b.id === id)
    }
    return httpClient.get<Batch>(`/batches/${id}`)
  },

  async create(payload: Omit<Batch, 'id'>): Promise<Batch> {
    if (USE_MOCK) {
      await delay()
      const batch: Batch = { ...payload, id: `batch-${db.batches.length + 1}` }
      db.batches.push(batch)
      return batch
    }
    return httpClient.post<Batch>('/batches', payload)
  },
}
