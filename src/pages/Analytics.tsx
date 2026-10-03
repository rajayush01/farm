import React from 'react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useFarmContext } from '@/lib/farmContext'
import { batchService, analyticsService } from '@/api'
import type { BatchMetrics } from '@/types'
import { formatCurrency } from '@/lib/format'

export default function Analytics() {
  const { currentFarm } = useFarmContext()
  const { data: batches, loading: batchesLoading } = useAsync(
    () => (currentFarm ? batchService.list(currentFarm.id) : Promise.resolve([])),
    [currentFarm?.id],
  )

  const { data: metricsList, loading: metricsLoading } = useAsync(async () => {
    if (!batches) return []
    const results = await Promise.all(batches.map((b) => analyticsService.batchMetrics(b.id)))
    return results.map((m, i) => ({ ...m, code: batches[i].code }))
  }, [batches])

  const loading = batchesLoading || metricsLoading

  return (
    <Layout title="Analytics">
      {loading ? (
        <LoadingBlock />
      ) : !metricsList || metricsList.length === 0 ? (
        <EmptyState title="No batches to compare yet" />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="FCR by batch" subtitle="Lower is better" />
              <CardBody>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={metricsList as (BatchMetrics & { code: string })[]}>
                    <CartesianGrid vertical={false} stroke="#EEF1EC" />
                    <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#D7DED3' }} />
                    <Bar dataKey="fcr" fill="#3C5A3E" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Mortality % by batch" />
              <CardBody>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={metricsList as (BatchMetrics & { code: string })[]}>
                    <CartesianGrid vertical={false} stroke="#EEF1EC" />
                    <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#D7DED3' }} />
                    <Bar dataKey="mortalityPercent" fill="#9A2B1F" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Batch comparison" subtitle="Cost, FCR, and mortality side by side" />
            <CardBody className="!px-0 !py-0">
              <table className="ledger-table w-full px-5">
                <thead>
                  <tr>
                    <th className="pl-5">Batch</th>
                    <th>Age</th>
                    <th>FCR</th>
                    <th>Mortality %</th>
                    <th>Feed consumed</th>
                    <th>Cost / bird</th>
                    <th>Cost / kg</th>
                    <th>Total cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(metricsList as (BatchMetrics & { code: string })[]).map((m) => (
                    <tr key={m.batchId}>
                      <td className="pl-5 font-medium text-barn-700">{m.code}</td>
                      <td>{m.ageInDays}d</td>
                      <td>{m.fcr ? m.fcr.toFixed(2) : '—'}</td>
                      <td className={m.mortalityPercent > 3 ? 'text-alert font-medium' : ''}>{m.mortalityPercent.toFixed(2)}%</td>
                      <td>{m.feedConsumedKg.toFixed(0)} kg</td>
                      <td>{formatCurrency(m.costPerBird)}</td>
                      <td>{formatCurrency(m.costPerKg)}</td>
                      <td>{formatCurrency(m.totalCost)}</td>
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
