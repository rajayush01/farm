import React, { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Field, Select } from '@/components/ui/Form'
import { Badge } from '@/components/ui/Badge'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useFarmContext } from '@/lib/farmContext'
import { batchService, medicineService } from '@/api'
import { formatCurrency, formatDate } from '@/lib/format'

export default function Medicine() {
  const { currentFarm } = useFarmContext()
  const [batchId, setBatchId] = useState('')

  const { data: batches } = useAsync(() => (currentFarm ? batchService.list(currentFarm.id) : Promise.resolve([])), [currentFarm?.id])
  const activeBatches = (batches ?? []).filter((b) => b.status === 'active')
  const selectedBatchId = batchId || activeBatches[0]?.id || ''

  const { data: usage, loading: usageLoading } = useAsync(
    () => (selectedBatchId ? medicineService.usageHistory(selectedBatchId) : Promise.resolve([])),
    [selectedBatchId],
  )
  const { data: vaccinations, loading: vaccineLoading } = useAsync(
    () => (selectedBatchId ? medicineService.vaccinations(selectedBatchId) : Promise.resolve([])),
    [selectedBatchId],
  )

  const today = new Date()
  const daysUntil = (dateStr?: string) =>
    dateStr ? Math.round((new Date(dateStr).getTime() - today.getTime()) / 86400000) : undefined

  return (
    <Layout title="Medicine & vaccination">
      <div className="mb-5 max-w-xs">
        <Field label="Batch">
          <Select value={selectedBatchId} onChange={(e) => setBatchId(e.target.value)}>
            {activeBatches.map((b) => (
              <option key={b.id} value={b.id}>{b.code} · {b.animalType}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Vaccination schedule" subtitle="Automatic reminders for upcoming doses" />
          <CardBody className="!px-0 !py-0">
            {vaccineLoading ? (
              <LoadingBlock />
            ) : !vaccinations || vaccinations.length === 0 ? (
              <EmptyState title="No vaccinations recorded" />
            ) : (
              <ul className="divide-y divide-barn-100 px-5">
                {vaccinations.map((v) => {
                  const remaining = daysUntil(v.nextScheduledDate)
                  return (
                    <li key={v.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-barn-700">{v.vaccine}</span>
                        {remaining !== undefined && remaining >= 0 && remaining <= 5 && (
                          <Badge tone="amber">Due in {remaining}d</Badge>
                        )}
                      </div>
                      <p className="text-xs text-barn-400 mt-0.5">
                        Given {formatDate(v.date)} {v.dose && `· ${v.dose}`} {v.cost && `· ${formatCurrency(v.cost)}`}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Medicine usage" subtitle="Every treatment logged against the batch" />
          <CardBody className="!px-0 !py-0">
            {usageLoading ? (
              <LoadingBlock />
            ) : !usage || usage.length === 0 ? (
              <EmptyState title="No medicine usage recorded" />
            ) : (
              <table className="ledger-table w-full px-5">
                <thead>
                  <tr>
                    <th className="pl-5">Date</th>
                    <th>Medicine</th>
                    <th>Qty</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.map((m) => (
                    <tr key={m.id}>
                      <td className="pl-5">{formatDate(m.date)}</td>
                      <td>
                        {m.medicineName}
                        {m.reason && <span className="block text-xs text-barn-400">{m.reason}</span>}
                      </td>
                      <td>{m.quantity} {m.unit}</td>
                      <td>{formatCurrency(m.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  )
}
