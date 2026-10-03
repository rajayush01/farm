import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Field, Input, Select } from '@/components/ui/Form'
import { Button } from '@/components/ui/Button'
import { useFarmContext } from '@/lib/farmContext'

export default function Settings() {
  const { currentFarm } = useFarmContext()

  return (
    <Layout title="Settings">
      <div className="max-w-2xl flex flex-col gap-6">
        <Card>
          <CardHeader title="Farm information" subtitle="Used across dashboards, reports, and daily entry" />
          <CardBody className="grid grid-cols-2 gap-4">
            <Field label="Farm name">
              <Input defaultValue={currentFarm?.name} />
            </Field>
            <Field label="Farm type">
              <Select defaultValue={currentFarm?.type}>
                <option value="poultry">Poultry / Broiler</option>
                <option value="layer">Layer</option>
                <option value="goat">Goat / Goatry</option>
              </Select>
            </Field>
            <Field label="Owner name">
              <Input defaultValue={currentFarm?.ownerName} />
            </Field>
            <Field label="Location">
              <Input defaultValue={currentFarm?.location} />
            </Field>
            <Field label="Number of sheds">
              <Input type="number" defaultValue={currentFarm?.shedCount} />
            </Field>
            <Field label="Total capacity">
              <Input type="number" defaultValue={currentFarm?.totalCapacity} />
            </Field>
            <Field label="Currency">
              <Input defaultValue={currentFarm?.currency} />
            </Field>
            <Field label="Default feed unit">
              <Input defaultValue={currentFarm?.defaultFeedUnit} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Users & permissions" subtitle="Owner, Farm Manager, Farm Worker, Accountant, Veterinarian" />
          <CardBody>
            <p className="text-sm text-barn-400">Role-based access will appear here once connected to the auth backend.</p>
          </CardBody>
        </Card>

        <div>
          <Button>Save changes</Button>
        </div>
      </div>
    </Layout>
  )
}
