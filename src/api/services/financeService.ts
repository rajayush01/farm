import { USE_MOCK } from '@/lib/config'
import { httpClient } from '@/api/httpClient'
import { db, delay } from '@/api/mockDb'
import type { Expense, Sale, InventoryItem } from '@/types'

export const expenseService = {
  async list(farmId: string): Promise<Expense[]> {
    if (USE_MOCK) {
      await delay()
      return db.expenses.filter((e) => e.farmId === farmId)
    }
    return httpClient.get<Expense[]>(`/farms/${farmId}/expenses`)
  },

  async record(payload: Omit<Expense, 'id'>): Promise<Expense> {
    if (USE_MOCK) {
      await delay()
      const expense: Expense = { ...payload, id: `e-${db.expenses.length + 1}` }
      db.expenses.push(expense)
      return expense
    }
    return httpClient.post<Expense>('/expenses', payload)
  },
}

export const saleService = {
  async list(batchId?: string): Promise<Sale[]> {
    if (USE_MOCK) {
      await delay()
      return batchId ? db.sales.filter((s) => s.batchId === batchId) : db.sales
    }
    return httpClient.get<Sale[]>(batchId ? `/batches/${batchId}/sales` : '/sales')
  },
}

export const inventoryService = {
  async list(): Promise<InventoryItem[]> {
    if (USE_MOCK) {
      await delay()
      return db.inventory
    }
    return httpClient.get<InventoryItem[]>('/inventory')
  },
}
