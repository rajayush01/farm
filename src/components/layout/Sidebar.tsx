import React from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import {
  LayoutGrid, Wheat, Skull, Scale, Syringe, Wallet, BarChart3, Package, Settings as SettingsIcon,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/daily-entry', label: 'Daily entry', icon: Wheat },
  { to: '/batches', label: 'Batches', icon: Scale },
  { to: '/mortality', label: 'Mortality', icon: Skull },
  { to: '/medicine', label: 'Medicine & vaccination', icon: Syringe },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-barn-700 text-parchment/90 flex flex-col">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="font-display text-lg font-medium text-parchment">Farmstead</div>
        <div className="text-[11px] text-parchment/50 mt-0.5">Farm operations &amp; analytics</div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-white/10 text-parchment font-medium' : 'text-parchment/70 hover:bg-white/5 hover:text-parchment',
              )
            }
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-parchment/40">
        Record → Track → Calculate → Analyze
      </div>
    </aside>
  )
}
