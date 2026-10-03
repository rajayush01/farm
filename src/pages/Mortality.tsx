import React, { useState } from 'react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Field, Select } from '@/components/ui/Form'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useFarmContext } from '@/lib/farmContext'
import { batchService, mortalityService } from '@/api'
import { formatDate, formatDateShort, formatNumber } from '@/lib/format'

const reasonLabels: Record<string, string> = {
  disease: 'Disease', heat_stress: 'Heat stress', weak_bird: 'Weak bird', injury: 'Injury',
  unknown: 'Unknown', predation: 'Predation', other: 'Other',
}

export default function Mortality() {
  const { currentFarm } = useFarmContext()
  const [batchId, setBatchId] = useState('')

  const { data: batches } = useAsync(() => (currentFarm ? batchService.list(currentFarm.id) : Promise.resolve([])), [currentFarm?.id])
  const activeBatches = (batches ?? []).filter((b) => b.status === 'active')
  const selectedBatchId = batchId || activeBatches[0]?.id || ''

  const { data: records, loading } = useAsync(
    () => (selectedBatchId ? mortalityService.history(selectedBatchId) : Promise.resolve([])),
    [selectedBatchId],
  )

  const totalMortality = (records ?? []).reduce((s, r) => s + r.mortality, 0)
  const initial = activeBatches.find((b) => b.id === selectedBatchId)?.initialQuantity ?? 0
  const mortalityPct = initial ? (totalMortality / initial) * 100 : 0

  const reasonTotals: Record<string, number> = {}
  ;(records ?? []).forEach((r) => (r.reasons ?? []).forEach((reason) => {
    reasonTotals[reason.reason] = (reasonTotals[reason.reason] ?? 0) + reason.count
  }))

  return (
    <Layout title="Mortality">
      <div className="flex items-center gap-4 mb-5">
        <Field label="Batch">
          <Select value={selectedBatchId} onChange={(e) => setBatchId(e.target.value)} className="min-w-[220px]">
            {activeBatches.map((b) => (
              <option key={b.id} value={b.id}>{b.code} · {b.animalType}</option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-6 ml-auto text-sm">
          <div>
            <span className="text-barn-400">Total mortality: </span>
            <span className="font-medium text-barn-700">{formatNumber(totalMortality)}</span>
          </div>
          <div>
            <span className="text-barn-400">Mortality %: </span>
            <span className="font-medium text-alert">{mortalityPct.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingBlock />
      ) : !records || records.length === 0 ? (
        <EmptyState title="No mortality records for this batch" />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader title="Daily mortality" subtitle="Helps identify unusual spikes" />
              <CardBody>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={records.map((r) => ({ date: formatDateShort(r.date), count: r.mortality }))}>
                    <CartesianGrid vertical={false} stroke="#EEF1EC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#D7DED3' }} />
                    <Bar dataKey="count" fill="#9A2B1F" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="By reason" />
              <CardBody>
                {Object.keys(reasonTotals).length === 0 ? (
                  <EmptyState title="No reasons logged" />
                ) : (
                  <ul className="flex flex-col gap-2.5">
                    {Object.entries(reasonTotals).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                      <li key={reason} className="flex items-center justify-between text-sm">
                        <span className="text-barn-600">{reasonLabels[reason] ?? reason}</span>
                        <span className="font-medium text-barn-800">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Daily records" />
            <CardBody className="!px-0 !py-0">
              <table className="ledger-table w-full px-5">
                <thead>
                  <tr>
                    <th className="pl-5">Date</th>
                    <th>Opening</th>
                    <th>Mortality</th>
                    <th>Closing</th>
                  </tr>
                </thead>
                <tbody>
                  {[...records].reverse().map((r) => (
                    <tr key={r.id}>
                      <td className="pl-5">{formatDate(r.date)}</td>
                      <td>{formatNumber(r.openingCount)}</td>
                      <td className={r.mortality > 10 ? 'text-alert font-medium' : ''}>{r.mortality}</td>
                      <td>{formatNumber(r.closingCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}
    </Layout>
  )
}
