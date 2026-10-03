import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useFarmContext } from '@/lib/farmContext'
import { expenseService, saleService } from '@/api'
import { formatCurrency, formatDate } from '@/lib/format'

const categoryLabels: Record<string, string> = {
  feed: 'Feed', medicine: 'Medicine', vaccination: 'Vaccination', labour: 'Labour', electricity: 'Electricity',
  water: 'Water', transport: 'Transport', maintenance: 'Maintenance', rent: 'Rent', equipment: 'Equipment',
  veterinary: 'Veterinary', misc: 'Miscellaneous',
}

export default function Finance() {
  const { currentFarm } = useFarmContext()
  const { data: expenses, loading } = useAsync(
    () => (currentFarm ? expenseService.list(currentFarm.id) : Promise.resolve([])),
    [currentFarm?.id],
  )
  const { data: sales } = useAsync(() => saleService.list(), [])

  const totalExpenses = (expenses ?? []).reduce((s, e) => s + e.amount, 0)
  const totalRevenue = (sales ?? []).reduce((s, sale) => s + sale.revenue, 0)
  const byCategory: Record<string, number> = {}
  ;(expenses ?? []).forEach((e) => (byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount))

  return (
    <Layout title="Finance">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total expenses" value={formatCurrency(totalExpenses, currentFarm?.currency)} />
        <StatCard label="Total revenue" value={formatCurrency(totalRevenue, currentFarm?.currency)} />
        <StatCard
          label="Gross profit"
          value={formatCurrency(totalRevenue - totalExpenses, currentFarm?.currency)}
          tone={totalRevenue - totalExpenses < 0 ? 'alert' : 'default'}
        />
        <StatCard label="Sales recorded" value={String((sales ?? []).length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Expenses by category" />
          <CardBody>
            {loading ? (
              <LoadingBlock />
            ) : Object.keys(byCategory).length === 0 ? (
              <EmptyState title="No expenses recorded" />
            ) : (
              <ul className="flex flex-col gap-3">
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                  <li key={cat} className="flex items-center gap-3">
                    <span className="text-sm text-barn-600 w-28 shrink-0">{categoryLabels[cat] ?? cat}</span>
                    <div className="flex-1 h-2 rounded-full bg-barn-100 overflow-hidden">
                      <div
                        className="h-full bg-barn-500 rounded-full"
                        style={{ width: `${Math.min(100, (amount / totalExpenses) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-barn-800 w-24 text-right">{formatCurrency(amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Sales" />
          <CardBody className="!px-0 !py-0">
            {!sales || sales.length === 0 ? (
              <EmptyState title="No sales recorded yet" />
            ) : (
              <table className="ledger-table w-full px-5">
                <thead>
                  <tr>
                    <th className="pl-5">Date</th>
                    <th>Qty</th>
                    <th>Avg weight</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="pl-5">{formatDate(s.date)}</td>
                      <td>{s.quantity}</td>
                      <td>{s.avgWeightKg} kg</td>
                      <td className="font-medium">{formatCurrency(s.revenue)}</td>
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
