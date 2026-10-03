import { USE_MOCK } from '@/lib/config'
import { httpClient } from '@/api/httpClient'
import { db, delay } from '@/api/mockDb'
import type { FeedMasterItem, FeedPurchase, DailyFeedEntry } from '@/types'

export const feedService = {
  async master(): Promise<FeedMasterItem[]> {
    if (USE_MOCK) {
      await delay()
      return db.feedMaster
    }
    return httpClient.get<FeedMasterItem[]>('/feed/master')
  },

  async purchases(farmId: string): Promise<FeedPurchase[]> {
    if (USE_MOCK) {
      await delay()
      return db.feedPurchases.filter((p) => p.farmId === farmId)
    }
    return httpClient.get<FeedPurchase[]>(`/farms/${farmId}/feed-purchases`)
  },

  async recordPurchase(payload: Omit<FeedPurchase, 'id'>): Promise<FeedPurchase> {
    if (USE_MOCK) {
      await delay()
      const purchase: FeedPurchase = { ...payload, id: `fp-${db.feedPurchases.length + 1}` }
      db.feedPurchases.push(purchase)
      return purchase
    }
    return httpClient.post<FeedPurchase>('/feed-purchases', payload)
  },

  async consumptionHistory(batchId: string): Promise<DailyFeedEntry[]> {
    if (USE_MOCK) {
      await delay()
      return db.dailyFeedEntries.filter((e) => e.batchId === batchId)
    }
    return httpClient.get<DailyFeedEntry[]>(`/batches/${batchId}/feed-consumption`)
  },

  async recordConsumption(payload: Omit<DailyFeedEntry, 'id' | 'totalKg' | 'totalCost'>): Promise<DailyFeedEntry> {
    if (USE_MOCK) {
      await delay()
      const totalKg = payload.entries.reduce((sum, e) => sum + e.quantity, 0)
      const totalCost = payload.entries.reduce((sum, e) => {
        const feed = db.feedMaster.find((f) => f.id === e.feedId)
        return sum + e.quantity * (feed?.currentPricePerUnit ?? 0)
      }, 0)
      const entry: DailyFeedEntry = { ...payload, id: `df-${db.dailyFeedEntries.length + 1}`, totalKg, totalCost }
      db.dailyFeedEntries.push(entry)
      return entry
    }
    return httpClient.post<DailyFeedEntry>('/feed-consumption', payload)
  },
}
