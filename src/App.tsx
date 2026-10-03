import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { FarmProvider } from '@/lib/farmContext'
import Dashboard from '@/pages/Dashboard'
import Batches from '@/pages/Batches'
import BatchDetail from '@/pages/BatchDetail'
import DailyEntry from '@/pages/DailyEntry'
import Mortality from '@/pages/Mortality'
import Medicine from '@/pages/Medicine'
import Inventory from '@/pages/Inventory'
import Finance from '@/pages/Finance'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <FarmProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/batches/:id" element={<BatchDetail />} />
        <Route path="/daily-entry" element={<DailyEntry />} />
        <Route path="/mortality" element={<Mortality />} />
        <Route path="/medicine" element={<Medicine />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </FarmProvider>
  )
}
