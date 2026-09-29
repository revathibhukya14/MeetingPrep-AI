import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <article className="card flex items-start justify-between p-5">
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-2 font-display text-3xl tracking-tight text-ink">{value}</p>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon size={18} strokeWidth={1.75} />
      </span>
    </article>
  )
}
