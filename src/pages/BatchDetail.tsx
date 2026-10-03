import React from 'react'
import { useParams } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { batchService, analyticsService, weightService, mortalityService, feedService, medicineService } from '@/api'
import { formatCurrency, formatNumber, formatWeight, formatDateShort, formatDate } from '@/lib/format'

export default function BatchDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: batch, loading: batchLoading } = useAsync(() => (id ? batchService.get(id) : Promise.resolve(undefined)), [id])
  const { data: metrics } = useAsync(() => (id ? analyticsService.batchMetrics(id) : Promise.resolve(undefined)), [id])
  const { data: weightHistory } = useAsync(() => (id ? weightService.history(id) : Promise.resolve([])), [id])
  const { data: mortalityHistory } = useAsync(() => (id ? mortalityService.history(id) : Promise.resolve([])), [id])
  const { data: feedHistory } = useAsync(() => (id ? feedService.consumptionHistory(id) : Promise.resolve([])), [id])
  const { data: vaccinations } = useAsync(() => (id ? medicineService.vaccinations(id) : Promise.resolve([])), [id])

  if (batchLoading) {
    return (
      <Layout title="Batch">
        <LoadingBlock />
      </Layout>
    )
  }

  if (!batch) {
    return (
      <Layout title="Batch">
        <EmptyState title="Batch not found" />
      </Layout>
    )
  }

  // Chronological timeline, built from the batch's own records (spec section 33).
  const timeline = [
    { date: batch.startDate, label: `${formatNumber(batch.initialQuantity)} ${batch.animalType.toLowerCase()}s placed` },
    ...(vaccinations ?? []).map((v) => ({ date: v.date, label: `Vaccination: ${v.vaccine}` })),
    ...(mortalityHistory ?? []).filter((m) => m.mortality > 10).map((m) => ({ date: m.date, label: `${m.mortality} mortality recorded` })),
    ...(weightHistory ?? []).map((w) => ({ date: w.date, label: `Weight measured: ${formatWeight(w.avgWeightG)} avg` })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Layout title={`Batch ${batch.code}`}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-barn-800">
              {batch.code} <span className="text-barn-300 font-body text-sm font-normal">· {batch.breed ?? batch.animalType}</span>
            </h2>
            <p className="text-xs text-barn-400 mt-0.5">Placed {formatDate(batch.startDate)} · {metrics?.ageInDays ?? '—'} days old</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Current population" value={`${formatNumber(batch.currentQuantity)} / ${formatNumber(batch.initialQuantity)}`} />
          <StatCard
            label="Mortality"
            value={metrics ? `${metrics.mortalityCount} (${metrics.mortalityPercent.toFixed(2)}%)` : '—'}
            tone={metrics && metrics.mortalityPercent > 3 ? 'alert' : 'default'}
          />
          <StatCard label="Average weight" value={formatWeight(batch.currentAvgWeightG)} />
          <StatCard label="FCR" value={metrics?.fcr ? metrics.fcr.toFixed(2) : '—'} />
          <StatCard label="Feed consumed" value={metrics ? `${formatNumber(metrics.feedConsumedKg)} kg` : '—'} />
          <StatCard label="Total cost" value={metrics ? formatCurrency(metrics.totalCost) : '—'} />
          <StatCard label="Cost per bird" value={metrics ? formatCurrency(metrics.costPerBird) : '—'} />
          <StatCard label="Cost per kg" value={metrics ? formatCurrency(metrics.costPerKg) : '—'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Growth" subtitle="Average bird weight over time" />
            <CardBody>
              {weightHistory && weightHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weightHistory.map((w) => ({ date: formatDateShort(w.date), g: w.avgWeightG }))}>
                    <CartesianGrid vertical={false} stroke="#EEF1EC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#D7DED3' }} />
                    <Line type="monotone" dataKey="g" stroke="#C9A34C" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No weight records yet" />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Mortality trend" subtitle="Daily mortality" />
            <CardBody>
              {mortalityHistory && mortalityHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={mortalityHistory.map((m) => ({ date: formatDateShort(m.date), count: m.mortality }))}>
                    <CartesianGrid vertical={false} stroke="#EEF1EC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#D7DED3' }} />
                    <Bar dataKey="count" fill="#9A2B1F" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title="No mortality records yet" />
              )}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Feed consumption" subtitle="Daily kg, most recent first" />
          <CardBody className="!px-0 !py-0">
            {feedHistory && feedHistory.length > 0 ? (
              <table className="ledger-table w-full px-5">
                <thead>
                  <tr>
                    <th className="pl-5">Date</th>
                    <th>Feed breakdown</th>
                    <th>Total</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {[...feedHistory].reverse().slice(0, 8).map((f) => (
                    <tr key={f.id}>
                      <td className="pl-5">{formatDate(f.date)}</td>
                      <td className="text-barn-500">{f.entries.length} feed type(s)</td>
                      <td>{formatNumber(f.totalKg)} kg</td>
                      <td>{formatCurrency(f.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No feed entries yet" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Batch timeline" subtitle="Chronological history" />
          <CardBody>
            <ol className="flex flex-col gap-4">
              {timeline.map((event, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-barn-500" />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-barn-100 mt-1" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-xs text-barn-400">{formatDate(event.date)}</p>
                    <p className="text-sm text-barn-700">{event.label}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>
    </Layout>
  )
}
