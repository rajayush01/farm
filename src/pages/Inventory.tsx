import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { inventoryService, feedService } from '@/api'
import { formatNumber, formatCurrency } from '@/lib/format'

const categoryLabels: Record<string, string> = {
  feed: 'Feed', medicine: 'Medicine', vaccine: 'Vaccine', supplement: 'Supplement', equipment: 'Equipment', other: 'Other',
}

export default function Inventory() {
  const { data: items, loading } = useAsync(() => inventoryService.list(), [])
  const { data: purchases } = useAsync(() => feedService.purchases('farm-1'), [])

  return (
    <Layout title="Inventory">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Stock levels" subtitle="Opening + Purchases − Consumption = Closing stock" />
          <CardBody className="!px-0 !py-0">
            {loading ? (
              <LoadingBlock />
            ) : !items || items.length === 0 ? (
              <EmptyState title="No inventory items yet" />
            ) : (
              <table className="ledger-table w-full px-5">
                <thead>
                  <tr>
                    <th className="pl-5">Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Minimum</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const low = item.quantity < item.minimumStock
                    return (
                      <tr key={item.id}>
                        <td className="pl-5 font-medium text-barn-700">{item.name}</td>
                        <td>{categoryLabels[item.category] ?? item.category}</td>
                        <td className={low ? 'text-alert font-medium' : ''}>{formatNumber(item.quantity)} {item.unit}</td>
                        <td className="text-barn-400">{formatNumber(item.minimumStock)} {item.unit}</td>
                        <td>{low ? <Badge tone="red">Low stock</Badge> : <Badge tone="green">OK</Badge>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent feed purchases" />
          <CardBody className="!px-0 !py-0">
            {!purchases || purchases.length === 0 ? (
              <EmptyState title="No purchases yet" />
            ) : (
              <ul className="divide-y divide-barn-100 px-5">
                {[...purchases].reverse().map((p) => (
                  <li key={p.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-barn-700">{formatNumber(p.quantity)} kg</span>
                      <Badge tone={p.paymentStatus === 'paid' ? 'green' : 'amber'}>{p.paymentStatus}</Badge>
                    </div>
                    <p className="text-xs text-barn-400 mt-0.5">
                      {p.supplier} · {formatCurrency(p.totalAmount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  )
}
