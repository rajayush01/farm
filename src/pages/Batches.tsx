import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingBlock, EmptyState } from '@/components/ui/States'
import { Button } from '@/components/ui/Button'
import { useAsync } from '@/hooks/useAsync'
import { useFarmContext } from '@/lib/farmContext'
import { batchService } from '@/api'
import { formatNumber, formatWeight, formatDate } from '@/lib/format'
import { Plus } from 'lucide-react'
import type { BatchStatus } from '@/types'

const statusTone: Record<BatchStatus, 'green' | 'amber' | 'red' | 'neutral'> = {
  active: 'green',
  completed: 'neutral',
  sold: 'amber',
  cancelled: 'red',
}

export default function Batches() {
  const { currentFarm } = useFarmContext()
  const { data: batches, loading } = useAsync(
    () => (currentFarm ? batchService.list(currentFarm.id) : Promise.resolve([])),
    [currentFarm?.id],
  )

  return (
    <Layout title="Batches">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-barn-400">Every batch tracks its own population, feed, mortality, and cost.</p>
        <Button>
          <Plus className="h-4 w-4" /> New batch
        </Button>
      </div>

      <Card>
        <CardBody className="!px-0 !py-0">
          {loading ? (
            <LoadingBlock />
          ) : !batches || batches.length === 0 ? (
            <EmptyState title="No batches yet" hint="Create your first batch to begin recording daily operations." />
          ) : (
            <table className="ledger-table w-full px-5">
              <thead>
                <tr>
                  <th className="pl-5">Batch</th>
                  <th>Breed</th>
                  <th>Placed</th>
                  <th>Population</th>
                  <th>Avg weight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-barn-50/60">
                    <td className="pl-5">
                      <Link to={`/batches/${b.id}`} className="font-medium text-barn-700 hover:underline">
                        {b.code}
                      </Link>
                      <span className="text-barn-300 ml-1.5">{b.animalType}</span>
                    </td>
                    <td>{b.breed ?? '—'}</td>
                    <td>{formatDate(b.startDate)}</td>
                    <td>
                      {formatNumber(b.currentQuantity)} / {formatNumber(b.initialQuantity)}
                    </td>
                    <td>{formatWeight(b.currentAvgWeightG)}</td>
                    <td>
                      <Badge tone={statusTone[b.status]}>{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </Layout>
  )
}
