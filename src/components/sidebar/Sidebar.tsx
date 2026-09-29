import { Link } from 'react-router-dom'
import {
  Brain,
  Building2,
  CalendarDays,
  LayoutGrid,
  MessageSquare,
  Users,
  X,
} from 'lucide-react'
import { companies, currentUser } from '../../data/mockData'
import { NavItem } from './NavItem'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-ink/20 transition-opacity duration-200 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col overflow-y-auto border-r border-line bg-sidebar px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-7 flex items-center justify-between px-2">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
              <Brain size={18} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-ink">
                MeetingPrep AI
              </span>
              <span className="block text-xs text-muted">Your meetings, remembered.</span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted hover:bg-white lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem to="/" label="Overview" icon={LayoutGrid} onNavigate={onClose} />
          <NavItem to="/meetings" label="Meetings" icon={CalendarDays} onNavigate={onClose} />
          <NavItem to="/contacts" label="Contacts" icon={Users} onNavigate={onClose} />
          <NavItem to="/memories" label="Memories" icon={Brain} onNavigate={onClose} />
          <NavItem
            to="/assistant"
            label="AI Assistant"
            icon={MessageSquare}
            onNavigate={onClose}
          />
        </nav>

        <div className="my-5 border-t border-line" />

        <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          Recent
        </p>
        <div className="flex flex-col gap-1">
          {companies.map((company) => (
            <Link
              key={company.id}
              to={`/meetings?company=${company.id}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-white/70 hover:text-ink"
            >
              <Building2 size={16} strokeWidth={1.75} />
              <span>{company.name}</span>
            </Link>
          ))}
        </div>

        <div className="mt-auto space-y-3 pt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
              {currentUser.initials}
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">{currentUser.name}</span>
              <span className="block text-xs text-muted">{currentUser.role}</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
