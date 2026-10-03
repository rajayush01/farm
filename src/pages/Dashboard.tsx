import React from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useFarmContext } from '@/lib/farmContext'
import { batchService, alertService, analyticsService, feedService } from '@/api'
import { formatCurrency, formatNumber, formatWeight, formatDateShort } from '@/lib/format'
import { Bird, Skull, Wheat, Wallet } from 'lucide-react'

export default function Dashboard() {
  const { currentFarm } = useFarmContext()
  const farmId = currentFarm?.id

  const { data: batches, loading: batchesLoading } = useAsync(
    () => (farmId ? batchService.list(farmId) : Promise.resolve([])),
    [farmId],
  )
  const { data: alerts } = useAsync(() => (farmId ? alertService.list(farmId) : Promise.resolve([])), [farmId])

  const activeBatches = (batches ?? []).filter((b) => b.status === 'active')
  const primaryBatch = activeBatches[0]

  const { data: metrics } = useAsync(
    () => (primaryBatch ? analyticsService.batchMetrics(primaryBatch.id) : Promise.resolve(undefined)),
    [primaryBatch?.id],
  )
  const { data: feedHistory } = useAsync(
    () => (primaryBatch ? feedService.consumptionHistory(primaryBatch.id) : Promise.resolve([])),
    [primaryBatch?.id],
  )

  const totalBirds = activeBatches.reduce((s, b) => s + b.currentQuantity, 0)
  const todaysFeed = feedHistory && feedHistory.length > 0 ? feedHistory[feedHistory.length - 1] : undefined

  return (
    <Layout title="Dashboard">
      {batchesLoading ? (
        <LoadingBlock />
      ) : activeBatches.length === 0 ? (
        <EmptyState title="No active batches yet" hint="Create a batch to start recording daily operations." />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active birds" value={formatNumber(totalBirds)} icon={<Bird className="h-4 w-4" />} />
            <StatCard
              label="Mortality (primary batch)"
              value={metrics ? `${metrics.mortalityPercent.toFixed(2)}%` : '—'}
              icon={<Skull className="h-4 w-4" />}
              tone={metrics && metrics.mortalityPercent > 3 ? 'alert' : 'default'}
            />
            <StatCard
              label="Today's feed"
              value={todaysFeed ? `${formatNumber(todaysFeed.totalKg)} kg` : '—'}
              icon={<Wheat className="h-4 w-4" />}
            />
            <StatCard
              label="Total cost so far"
              value={metrics ? formatCurrency(metrics.totalCost, currentFarm?.currency) : '—'}
              icon={<Wallet className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Feed consumption trend"
                subtitle={primaryBatch ? `${primaryBatch.code} · daily kg consumed` : undefined}
              />
              <CardBody>
                {feedHistory && feedHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={feedHistory.map((f) => ({ date: formatDateShort(f.date), kg: f.totalKg }))}>
                      <defs>
                        <linearGradient id="feedFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3C5A3E" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#3C5A3E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#EEF1EC" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#879D7C' }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#D7DED3' }} />
                      <Area type="monotone" dataKey="kg" stroke="#3C5A3E" strokeWidth={2} fill="url(#feedFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No feed entries yet" />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Alerts" subtitle={`${alerts?.length ?? 0} active`} />
              <CardBody className="!py-2">
                {!alerts || alerts.length === 0 ? (
                  <EmptyState title="All clear" hint="No alerts right now." />
                ) : (
                  <ul className="flex flex-col divide-y divide-barn-100">
                    {alerts.map((a) => (
                      <li key={a.id} className="py-3 flex items-start gap-2.5">
                        <Badge tone={a.severity === 'critical' ? 'red' : a.severity === 'warning' ? 'amber' : 'neutral'}>
                          {a.severity}
                        </Badge>
                        <p className="text-sm text-barn-600 leading-snug">{a.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader title="Active batches" subtitle="Tap a batch to see its full dashboard" />
            <CardBody className="!px-0 !py-0">
              <table className="ledger-table w-full px-5">
                <thead>
                  <tr>
                    <th className="pl-5">Batch</th>
                    <th>Shed</th>
                    <th>Age</th>
                    <th>Population</th>
                    <th>Avg weight</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBatches.map((b) => {
                    const ageDays = Math.round((Date.now() - new Date(b.startDate).getTime()) / 86400000)
                    return (
                      <tr key={b.id}>
                        <td className="pl-5">
                          <Link to={`/batches/${b.id}`} className="font-medium text-barn-700 hover:underline">
                            {b.code}
                          </Link>
                          <span className="text-barn-300 ml-1.5">{b.animalType}</span>
                        </td>
                        <td>{b.shedId}</td>
                        <td>{ageDays} days</td>
                        <td>{formatNumber(b.currentQuantity)} / {formatNumber(b.initialQuantity)}</td>
                        <td>{formatWeight(b.currentAvgWeightG)}</td>
                        <td>
                          <Badge tone="green">{b.status}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}
    </Layout>
  )
}
