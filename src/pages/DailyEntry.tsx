import React, { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Field, Input, Select } from '@/components/ui/Form'
import { Button } from '@/components/ui/Button'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useFarmContext } from '@/lib/farmContext'
import { batchService, shedService, feedService, mortalityService, weightService } from '@/api'
import type { ExpenseCategory } from '@/types'
import { Plus, Trash2, Save } from 'lucide-react'

const expenseCategories: ExpenseCategory[] = [
  'feed', 'medicine', 'vaccination', 'labour', 'electricity', 'water', 'transport', 'maintenance', 'rent', 'equipment', 'veterinary', 'misc',
]

export default function DailyEntry() {
  const { currentFarm } = useFarmContext()
  const [shedId, setShedId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saved, setSaved] = useState(false)

  const { data: sheds } = useAsync(() => (currentFarm ? shedService.listByFarm(currentFarm.id) : Promise.resolve([])), [currentFarm?.id])
  const { data: batches } = useAsync(() => (currentFarm ? batchService.list(currentFarm.id) : Promise.resolve([])), [currentFarm?.id])
  const { data: feedMaster } = useAsync(() => feedService.master(), [])

  const shedBatches = (batches ?? []).filter((b) => (shedId ? b.shedId === shedId : true) && b.status === 'active')

  // Population
  const [opening, setOpening] = useState<number | ''>('')
  const [mortality, setMortality] = useState<number | ''>('')

  // Feed rows
  const [feedRows, setFeedRows] = useState<{ feedId: string; quantity: number | '' }[]>([{ feedId: '', quantity: '' }])

  // Weight
  const [sampleSize, setSampleSize] = useState<number | ''>('')
  const [sampleWeight, setSampleWeight] = useState<number | ''>('')

  // Expense
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('feed')
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('')

  const closing = opening !== '' && mortality !== '' ? Number(opening) - Number(mortality) : undefined

  function updateFeedRow(index: number, patch: Partial<{ feedId: string; quantity: number | '' }>) {
    setFeedRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  async function handleSave() {
    if (!batchId) return

    if (opening !== '' && mortality !== '') {
      await mortalityService.record({
        date,
        batchId,
        openingCount: Number(opening),
        mortality: Number(mortality),
        closingCount: Number(opening) - Number(mortality),
      })
    }

    const validFeedRows = feedRows.filter((r) => r.feedId && r.quantity !== '')
    if (validFeedRows.length > 0) {
      await feedService.recordConsumption({
        date,
        batchId,
        entries: validFeedRows.map((r) => ({ feedId: r.feedId, quantity: Number(r.quantity) })),
      })
    }

    if (sampleSize !== '' && sampleWeight !== '') {
      await weightService.record({
        date,
        batchId,
        sampleSize: Number(sampleSize),
        totalSampleWeightG: Number(sampleWeight),
      })
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Layout title="Daily entry">
      <div className="max-w-3xl flex flex-col gap-6">
        <Card>
          <CardHeader title="1. Select context" subtitle="Farm → Shed → Batch → Date" />
          <CardBody className="grid grid-cols-3 gap-4">
            <Field label="Shed">
              <Select value={shedId} onChange={(e) => setShedId(e.target.value)}>
                <option value="">All sheds</option>
                {(sheds ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Batch">
              <Select value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                <option value="">Select batch</option>
                {shedBatches.map((b) => (
                  <option key={b.id} value={b.id}>{b.code} · {b.animalType}</option>
                ))}
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </CardBody>
        </Card>

        {!batchId ? (
          <EmptyState title="Select a batch to continue" hint="Population, feed, weight, medicine and expenses are all recorded against a specific batch." />
        ) : (
          <>
            <Card>
              <CardHeader title="2. Population" subtitle="Opening birds, mortality, closing birds" />
              <CardBody className="grid grid-cols-3 gap-4 items-end">
                <Field label="Opening birds">
                  <Input type="number" value={opening} onChange={(e) => setOpening(e.target.value === '' ? '' : Number(e.target.value))} />
                </Field>
                <Field label="Mortality">
                  <Input type="number" value={mortality} onChange={(e) => setMortality(e.target.value === '' ? '' : Number(e.target.value))} />
                </Field>
                <Field label="Closing birds (auto)">
                  <Input value={closing ?? ''} disabled className="bg-barn-50 text-barn-400" />
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="3. Feed"
                subtitle="Add each feed type consumed today"
                action={
                  <Button variant="secondary" onClick={() => setFeedRows((r) => [...r, { feedId: '', quantity: '' }])}>
                    <Plus className="h-3.5 w-3.5" /> Add feed type
                  </Button>
                }
              />
              <CardBody className="flex flex-col gap-3">
                {feedRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_140px_32px] gap-3 items-end">
                    <Field label="Feed">
                      <Select value={row.feedId} onChange={(e) => updateFeedRow(i, { feedId: e.target.value })}>
                        <option value="">Select feed</option>
                        {(feedMaster ?? []).map((f) => (
                          <option key={f.id} value={f.id}>{f.name} (₹{f.currentPricePerUnit}/{f.unit})</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Quantity (kg)">
                      <Input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => updateFeedRow(i, { quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                      />
                    </Field>
                    <button
                      className="h-9 w-8 flex items-center justify-center text-barn-300 hover:text-alert"
                      onClick={() => setFeedRows((rows) => rows.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="4. Weight sample" subtitle="Sample-based — no need to weigh every bird" />
              <CardBody className="grid grid-cols-3 gap-4">
                <Field label="Sample size (birds)">
                  <Input type="number" value={sampleSize} onChange={(e) => setSampleSize(e.target.value === '' ? '' : Number(e.target.value))} />
                </Field>
                <Field label="Total sample weight (g)">
                  <Input type="number" value={sampleWeight} onChange={(e) => setSampleWeight(e.target.value === '' ? '' : Number(e.target.value))} />
                </Field>
                <Field label="Average weight (auto)">
                  <Input
                    disabled
                    className="bg-barn-50 text-barn-400"
                    value={sampleSize && sampleWeight ? `${Math.round(Number(sampleWeight) / Number(sampleSize))} g` : ''}
                  />
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="5. Other expenses" subtitle="Optional — labour, electricity, transport, etc." />
              <CardBody className="grid grid-cols-3 gap-4">
                <Field label="Category">
                  <Select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}>
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Amount">
                  <Input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))} />
                </Field>
              </CardBody>
            </Card>

            <div className="flex items-center gap-3 pb-8">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4" /> Save daily entry
              </Button>
              {saved && <span className="text-sm text-barn-500">Saved. Population, feed stock, and cost analytics have been updated.</span>}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
