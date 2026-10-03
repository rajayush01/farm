import { MOCK_LATENCY_MS } from '@/lib/config'
import type {
  Farm, Shed, Batch, FeedMasterItem, FeedPurchase, DailyFeedEntry,
  MortalityRecord, WeightRecord, MedicineUsageEntry, VaccinationRecord,
  Expense, Sale, InventoryItem, AppAlert,
} from '@/types'

export const delay = (ms = MOCK_LATENCY_MS) => new Promise((r) => setTimeout(r, ms))

// ---- Seed data, following the worked example in the spec (Mradul Poultry Farm, Batch B001) ----

export const db = {
  farms: [
    {
      id: 'farm-1',
      name: 'Mradul Poultry Farm',
      type: 'poultry',
      location: 'Indore, Madhya Pradesh',
      ownerName: 'Mradul Sharma',
      contactPhone: '+91 98765 43210',
      shedCount: 3,
      totalCapacity: 30000,
      currency: '₹',
      defaultFeedUnit: 'kg',
      defaultWeightUnit: 'g',
      createdAt: '2026-08-15',
    },
    {
      id: 'farm-2',
      name: 'Khargone Layer Farm',
      type: 'layer',
      location: 'Khargone, Madhya Pradesh',
      ownerName: 'Mradul Sharma',
      shedCount: 2,
      totalCapacity: 12000,
      currency: '₹',
      defaultFeedUnit: 'kg',
      defaultWeightUnit: 'g',
      createdAt: '2026-06-01',
    },
  ] as Farm[],

  sheds: [
    { id: 'shed-1', farmId: 'farm-1', name: 'Shed 1', capacity: 10000, currentPopulation: 9825, activeBatchId: 'batch-1' },
    { id: 'shed-2', farmId: 'farm-1', name: 'Shed 2', capacity: 10000, currentPopulation: 9640, activeBatchId: 'batch-2' },
    { id: 'shed-3', farmId: 'farm-1', name: 'Shed 3', capacity: 10000, currentPopulation: 0 },
    { id: 'shed-4', farmId: 'farm-2', name: 'Shed A', capacity: 6000, currentPopulation: 5820, activeBatchId: 'batch-3' },
  ] as Shed[],

  batches: [
    {
      id: 'batch-1', code: 'B001', farmId: 'farm-1', shedId: 'shed-1',
      animalType: 'Broiler', breed: 'Ross 308', startDate: '2026-09-01',
      expectedSellingDate: '2026-10-13', initialQuantity: 10000, currentQuantity: 9825,
      initialAvgWeightG: 40, currentAvgWeightG: 850, supplier: 'MP Hatcheries',
      purchaseCost: 450000, status: 'active',
    },
    {
      id: 'batch-2', code: 'B002', farmId: 'farm-1', shedId: 'shed-2',
      animalType: 'Broiler', breed: 'Cobb 500', startDate: '2026-08-20',
      expectedSellingDate: '2026-10-01', initialQuantity: 10000, currentQuantity: 9640,
      initialAvgWeightG: 40, currentAvgWeightG: 1450, supplier: 'MP Hatcheries',
      purchaseCost: 448000, status: 'active',
    },
    {
      id: 'batch-3', code: 'B003', farmId: 'farm-2', shedId: 'shed-4',
      animalType: 'Layer', breed: 'BV-300', startDate: '2026-04-10',
      initialQuantity: 6000, currentQuantity: 5820,
      initialAvgWeightG: 1600, currentAvgWeightG: 1850, supplier: 'Khargone Hatchery',
      purchaseCost: 300000, status: 'active',
    },
  ] as Batch[],

  feedMaster: [
    { id: 'feed-1', name: 'Starter Feed', type: 'Poultry', unit: 'kg', currentPricePerUnit: 35, active: true },
    { id: 'feed-2', name: 'Grower Feed', type: 'Poultry', unit: 'kg', currentPricePerUnit: 32, active: true },
    { id: 'feed-3', name: 'Finisher Feed', type: 'Poultry', unit: 'kg', currentPricePerUnit: 30, active: true },
    { id: 'feed-4', name: 'Layer Mash', type: 'Poultry', unit: 'kg', currentPricePerUnit: 28, active: true },
  ] as FeedMasterItem[],

  feedPurchases: [
    { id: 'fp-1', date: '2026-09-03', farmId: 'farm-1', feedId: 'feed-1', supplier: 'AgroFeeds Ltd', quantity: 2000, pricePerUnit: 35, totalAmount: 70000, invoiceNumber: 'INV-2201', paymentStatus: 'paid' },
    { id: 'fp-2', date: '2026-09-10', farmId: 'farm-1', feedId: 'feed-2', supplier: 'AgroFeeds Ltd', quantity: 3000, pricePerUnit: 32, totalAmount: 96000, invoiceNumber: 'INV-2244', paymentStatus: 'paid' },
    { id: 'fp-3', date: '2026-09-16', farmId: 'farm-1', feedId: 'feed-3', supplier: 'AgroFeeds Ltd', quantity: 2500, pricePerUnit: 30, totalAmount: 75000, invoiceNumber: 'INV-2299', paymentStatus: 'pending' },
  ] as FeedPurchase[],

  dailyFeedEntries: buildFeedHistory(),

  mortalityRecords: buildMortalityHistory(),

  weightRecords: [
    { id: 'w-1', date: '2026-09-08', batchId: 'batch-1', sampleSize: 100, totalSampleWeightG: 18000, avgWeightG: 180 },
    { id: 'w-2', date: '2026-09-15', batchId: 'batch-1', sampleSize: 100, totalSampleWeightG: 42000, avgWeightG: 420 },
    { id: 'w-3', date: '2026-09-16', batchId: 'batch-1', sampleSize: 100, totalSampleWeightG: 85000, avgWeightG: 850 },
  ] as WeightRecord[],

  medicineUsage: [
    { id: 'm-1', date: '2026-09-05', batchId: 'batch-1', medicineName: 'Vitamin Supplement', quantity: 5, unit: 'litres', cost: 4000, reason: 'Vitamin supplementation', givenBy: 'Ramesh' },
    { id: 'm-2', date: '2026-09-12', batchId: 'batch-1', medicineName: 'Antibiotic Course', quantity: 2, unit: 'kg', cost: 6200, reason: 'Respiratory infection', givenBy: 'Dr. Verma' },
  ] as MedicineUsageEntry[],

  vaccinations: [
    { id: 'v-1', batchId: 'batch-1', vaccine: 'Newcastle Disease (ND)', date: '2026-09-07', dose: '1 drop/bird', cost: 3200, nextScheduledDate: '2026-09-21' },
    { id: 'v-2', batchId: 'batch-2', vaccine: 'Infectious Bursal Disease (IBD)', date: '2026-09-14', dose: '1 drop/bird', cost: 3100, nextScheduledDate: '2026-09-20' },
  ] as VaccinationRecord[],

  expenses: [
    { id: 'e-1', date: '2026-09-16', farmId: 'farm-1', batchId: 'batch-1', category: 'electricity', amount: 15000 },
    { id: 'e-2', date: '2026-09-16', farmId: 'farm-1', batchId: 'batch-1', category: 'labour', amount: 45000 },
    { id: 'e-3', date: '2026-09-16', farmId: 'farm-1', batchId: 'batch-1', category: 'transport', amount: 8000 },
    { id: 'e-4', date: '2026-09-14', farmId: 'farm-1', batchId: 'batch-2', category: 'maintenance', amount: 6500 },
  ] as Expense[],

  sales: [
    { id: 's-1', date: '2026-08-25', batchId: 'batch-2', quantity: 500, avgWeightKg: 1.1, totalWeightKg: 550, pricePerKg: 105, revenue: 57750, buyer: 'Local Trader' },
  ] as Sale[],

  inventory: [
    { id: 'inv-1', name: 'Starter Feed', category: 'feed', unit: 'kg', quantity: 800, minimumStock: 500 },
    { id: 'inv-2', name: 'Grower Feed', category: 'feed', unit: 'kg', quantity: 1400, minimumStock: 500 },
    { id: 'inv-3', name: 'Finisher Feed', category: 'feed', unit: 'kg', quantity: 180, minimumStock: 400 },
    { id: 'inv-4', name: 'Vitamin Supplement', category: 'medicine', unit: 'litres', quantity: 3, minimumStock: 5, expiryDate: '2026-12-01' },
    { id: 'inv-5', name: 'ND Vaccine', category: 'vaccine', unit: 'vials', quantity: 12, minimumStock: 10, expiryDate: '2026-10-30' },
  ] as InventoryItem[],

  alerts: [
    { id: 'a-1', severity: 'warning', category: 'inventory', message: 'Finisher Feed stock is below minimum level (180kg / 400kg).', createdAt: '2026-09-16T07:00:00', farmId: 'farm-1' },
    { id: 'a-2', severity: 'critical', category: 'inventory', message: 'Vitamin Supplement stock is below minimum level (3L / 5L).', createdAt: '2026-09-16T07:00:00', farmId: 'farm-1' },
    { id: 'a-3', severity: 'info', category: 'vaccination', message: 'IBD vaccination for Batch B002 is due in 4 days.', createdAt: '2026-09-16T07:00:00', farmId: 'farm-1', batchId: 'batch-2' },
    { id: 'a-4', severity: 'warning', category: 'growth', message: 'Batch B001 average weight is 7.5% below the expected day-15 target.', createdAt: '2026-09-16T07:00:00', farmId: 'farm-1', batchId: 'batch-1' },
  ] as AppAlert[],
}

function buildFeedHistory(): DailyFeedEntry[] {
  const out: DailyFeedEntry[] = []
  const start = new Date('2026-09-02')
  for (let i = 0; i < 15; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const starter = Math.max(0, 260 - i * 12)
    const grower = i > 5 ? 300 + i * 8 : 0
    const finisher = i > 10 ? 200 + i * 10 : 0
    const totalKg = starter + grower + finisher
    const totalCost = starter * 35 + grower * 32 + finisher * 30
    out.push({
      id: `df-${i}`,
      date: d.toISOString().slice(0, 10),
      batchId: 'batch-1',
      entries: [
        ...(starter ? [{ feedId: 'feed-1', quantity: starter }] : []),
        ...(grower ? [{ feedId: 'feed-2', quantity: grower }] : []),
        ...(finisher ? [{ feedId: 'feed-3', quantity: finisher }] : []),
      ],
      totalKg,
      totalCost,
    })
  }
  return out
}

function buildMortalityHistory(): MortalityRecord[] {
  const out: MortalityRecord[] = []
  let opening = 10000
  const start = new Date('2026-09-01')
  for (let i = 0; i < 16; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const mortality = i === 0 ? 0 : Math.round(3 + Math.random() * 15)
    const closing = opening - mortality
    out.push({
      id: `mr-${i}`,
      date: d.toISOString().slice(0, 10),
      batchId: 'batch-1',
      openingCount: opening,
      mortality,
      closingCount: closing,
      reasons: mortality > 10 ? [{ reason: 'disease', count: Math.round(mortality * 0.6) }, { reason: 'unknown', count: Math.round(mortality * 0.4) }] : undefined,
    })
    opening = closing
  }
  return out
}
