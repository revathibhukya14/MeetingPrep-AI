import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  to: string
  label: string
  icon: LucideIcon
  onNavigate?: () => void
}

export function NavItem({ to, label, icon: Icon, onNavigate }: NavItemProps) {
  const location = useLocation()
  const isPrepareRoute = to === '/meetings' && location.pathname.includes('/prepare')

  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onNavigate}
      className={({ isActive }) => {
        const active = isActive || isPrepareRoute
        return `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
          active
            ? 'bg-white text-ink shadow-[0_1px_2px_rgba(20,23,28,0.05)] ring-1 ring-line'
            : 'text-ink-soft hover:bg-white/70 hover:text-ink'
        }`
      }}
    >
      <Icon size={17} strokeWidth={1.75} />
      <span className="font-medium">{label}</span>
    </NavLink>
  )
}
