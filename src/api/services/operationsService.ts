import { USE_MOCK } from '@/lib/config'
import { httpClient } from '@/api/httpClient'
import { db, delay } from '@/api/mockDb'
import type { MortalityRecord, WeightRecord, MedicineUsageEntry, VaccinationRecord } from '@/types'

export const mortalityService = {
  async history(batchId: string): Promise<MortalityRecord[]> {
    if (USE_MOCK) {
      await delay()
      return db.mortalityRecords.filter((r) => r.batchId === batchId)
    }
    return httpClient.get<MortalityRecord[]>(`/batches/${batchId}/mortality`)
  },

  async record(payload: Omit<MortalityRecord, 'id'>): Promise<MortalityRecord> {
    if (USE_MOCK) {
      await delay()
      const record: MortalityRecord = { ...payload, id: `mr-${db.mortalityRecords.length + 1}` }
      db.mortalityRecords.push(record)
      return record
    }
    return httpClient.post<MortalityRecord>('/mortality', payload)
  },
}

export const weightService = {
  async history(batchId: string): Promise<WeightRecord[]> {
    if (USE_MOCK) {
      await delay()
      return db.weightRecords.filter((r) => r.batchId === batchId)
    }
    return httpClient.get<WeightRecord[]>(`/batches/${batchId}/weight`)
  },

  async record(payload: Omit<WeightRecord, 'id' | 'avgWeightG'>): Promise<WeightRecord> {
    if (USE_MOCK) {
      await delay()
      const avgWeightG = Math.round(payload.totalSampleWeightG / payload.sampleSize)
      const record: WeightRecord = { ...payload, id: `w-${db.weightRecords.length + 1}`, avgWeightG }
      db.weightRecords.push(record)
      return record
    }
    return httpClient.post<WeightRecord>('/weight-records', payload)
  },
}

export const medicineService = {
  async usageHistory(batchId: string): Promise<MedicineUsageEntry[]> {
    if (USE_MOCK) {
      await delay()
      return db.medicineUsage.filter((r) => r.batchId === batchId)
    }
    return httpClient.get<MedicineUsageEntry[]>(`/batches/${batchId}/medicine-usage`)
  },

  async vaccinations(batchId: string): Promise<VaccinationRecord[]> {
    if (USE_MOCK) {
      await delay()
      return db.vaccinations.filter((r) => r.batchId === batchId)
    }
    return httpClient.get<VaccinationRecord[]>(`/batches/${batchId}/vaccinations`)
  },
}
