// Core domain types, modeled directly on the product spec's entities (section 48).
// Keep these in sync with the backend's API contracts when you wire up real endpoints.

export type FarmType = 'poultry' | 'layer' | 'goat'

export type UnitSystem = 'metric' | 'imperial'

export interface Farm {
  id: string
  name: string
  type: FarmType
  location: string
  address?: string
  ownerName: string
  contactPhone?: string
  contactEmail?: string
  shedCount: number
  totalCapacity: number
  currency: string
  defaultFeedUnit: string
  defaultWeightUnit: string
  createdAt: string
}

export interface Shed {
  id: string
  farmId: string
  name: string
  capacity: number
  currentPopulation: number
  activeBatchId?: string
}

export type BatchStatus = 'active' | 'completed' | 'sold' | 'cancelled'

export interface Batch {
  id: string
  code: string // e.g. B001
  farmId: string
  shedId: string
  animalType: string
  breed?: string
  startDate: string
  expectedSellingDate?: string
  initialQuantity: number
  currentQuantity: number
  initialAvgWeightG: number
  currentAvgWeightG: number
  supplier?: string
  purchaseCost?: number
  status: BatchStatus
}

export interface FeedMasterItem {
  id: string
  name: string
  type: string
  supplier?: string
  unit: string
  currentPricePerUnit: number
  active: boolean
}

export interface FeedPurchase {
  id: string
  date: string
  farmId: string
  feedId: string
  supplier: string
  quantity: number
  pricePerUnit: number
  totalAmount: number
  invoiceNumber?: string
  paymentStatus: 'paid' | 'pending' | 'partial'
  notes?: string
}

export interface FeedConsumptionEntry {
  feedId: string
  quantity: number
}

export interface DailyFeedEntry {
  id: string
  date: string
  batchId: string
  entries: FeedConsumptionEntry[]
  totalKg: number
  totalCost: number
}

export interface MortalityReason {
  reason: 'disease' | 'heat_stress' | 'weak_bird' | 'injury' | 'unknown' | 'predation' | 'other'
  count: number
}

export interface MortalityRecord {
  id: string
  date: string
  batchId: string
  openingCount: number
  mortality: number
  closingCount: number
  reasons?: MortalityReason[]
}

export interface WeightRecord {
  id: string
  date: string
  batchId: string
  sampleSize: number
  totalSampleWeightG: number
  avgWeightG: number
}

export interface MedicineUsageEntry {
  id: string
  date: string
  batchId: string
  shedId?: string
  medicineName: string
  quantity: number
  unit: string
  cost: number
  reason?: string
  dosage?: string
  givenBy?: string
  notes?: string
}

export interface VaccinationRecord {
  id: string
  batchId: string
  vaccine: string
  date: string
  dose?: string
  quantity?: number
  cost?: number
  nextScheduledDate?: string
  notes?: string
}

export type ExpenseCategory =
  | 'feed'
  | 'medicine'
  | 'vaccination'
  | 'labour'
  | 'electricity'
  | 'water'
  | 'transport'
  | 'maintenance'
  | 'rent'
  | 'equipment'
  | 'veterinary'
  | 'misc'

export interface Expense {
  id: string
  date: string
  farmId: string
  batchId?: string
  category: ExpenseCategory
  amount: number
  notes?: string
}

export interface Sale {
  id: string
  date: string
  batchId: string
  quantity: number
  avgWeightKg: number
  totalWeightKg: number
  pricePerKg: number
  revenue: number
  buyer?: string
  transportCost?: number
}

export interface InventoryItem {
  id: string
  name: string
  category: 'feed' | 'medicine' | 'vaccine' | 'supplement' | 'equipment' | 'other'
  unit: string
  quantity: number
  minimumStock: number
  expiryDate?: string
}

export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface AppAlert {
  id: string
  severity: AlertSeverity
  category: 'inventory' | 'medicine' | 'vaccination' | 'mortality' | 'growth' | 'feed'
  message: string
  createdAt: string
  farmId?: string
  batchId?: string
}

export interface DailyEntryPayload {
  date: string
  farmId: string
  shedId: string
  batchId: string
  population?: { opening: number; mortality: number; closing: number }
  feed?: FeedConsumptionEntry[]
  weight?: { sampleSize: number; totalSampleWeightG: number }
  medicines?: { medicineName: string; quantity: number; unit: string; cost: number }[]
  expenses?: { category: ExpenseCategory; amount: number; notes?: string }[]
}

// Derived / computed metrics the backend (or a local calculator) produces.
export interface BatchMetrics {
  batchId: string
  ageInDays: number
  mortalityCount: number
  mortalityPercent: number
  feedConsumedKg: number
  fcr: number | null
  costPerBird: number
  costPerKg: number
  totalCost: number
  avgWeightG: number
  weightGainG: number
}
