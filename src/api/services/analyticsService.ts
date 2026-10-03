import { USE_MOCK } from '@/lib/config'
import { httpClient } from '@/api/httpClient'
import { db, delay } from '@/api/mockDb'
import type { AppAlert, Batch, BatchMetrics } from '@/types'

export const alertService = {
  async list(farmId?: string): Promise<AppAlert[]> {
    if (USE_MOCK) {
      await delay()
      return farmId ? db.alerts.filter((a) => a.farmId === farmId) : db.alerts
    }
    return httpClient.get<AppAlert[]>(farmId ? `/farms/${farmId}/alerts` : '/alerts')
  },
}

// IMPORTANT: per the spec's "API-first" principle (section 51), these calculations
// belong on the backend so web and mobile never disagree. This mock implementation
// exists only so the frontend has real numbers to render; when USE_MOCK is false,
// it simply defers to the backend's /batches/:id/metrics endpoint.
export const analyticsService = {
  async batchMetrics(batchId: string): Promise<BatchMetrics> {
    if (USE_MOCK) {
      await delay()
      const batch = db.batches.find((b) => b.id === batchId)
      if (!batch) throw new Error('Batch not found')
      return computeBatchMetrics(batch)
    }
    return httpClient.get<BatchMetrics>(`/batches/${batchId}/metrics`)
  },
}

function computeBatchMetrics(batch: Batch): BatchMetrics {
  const mortalityRecords = db.mortalityRecords.filter((r) => r.batchId === batch.id)
  const feedEntries = db.dailyFeedEntries.filter((e) => e.batchId === batch.id)
  const expenses = db.expenses.filter((e) => e.batchId === batch.id)
  const medicine = db.medicineUsage.filter((m) => m.batchId === batch.id)

  const mortalityCount = mortalityRecords.reduce((s, r) => s + r.mortality, 0)
  const mortalityPercent = batch.initialQuantity ? (mortalityCount / batch.initialQuantity) * 100 : 0

  const feedConsumedKg = feedEntries.reduce((s, e) => s + e.totalKg, 0)
  const feedCost = feedEntries.reduce((s, e) => s + e.totalCost, 0)
  const medicineCost = medicine.reduce((s, m) => s + m.cost, 0)
  const otherCost = expenses.reduce((s, e) => s + e.amount, 0)
  const purchaseCost = batch.purchaseCost ?? 0

  const totalCost = purchaseCost + feedCost + medicineCost + otherCost
  const costPerBird = batch.currentQuantity ? totalCost / batch.currentQuantity : 0
  const weightGainKg = ((batch.currentAvgWeightG - batch.initialAvgWeightG) / 1000) * batch.currentQuantity
  const costPerKg = weightGainKg > 0 ? totalCost / weightGainKg : 0

  const fcr = weightGainKg > 0 ? feedConsumedKg / weightGainKg : null

  const ageInDays = Math.max(
    0,
    Math.round((new Date().getTime() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24)),
  )

  return {
    batchId: batch.id,
    ageInDays,
    mortalityCount,
    mortalityPercent,
    feedConsumedKg,
    fcr,
    costPerBird,
    costPerKg,
    totalCost,
    avgWeightG: batch.currentAvgWeightG,
    weightGainG: batch.currentAvgWeightG - batch.initialAvgWeightG,
  }
}
