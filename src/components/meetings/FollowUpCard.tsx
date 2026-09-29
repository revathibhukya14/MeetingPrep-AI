import { CircleAlert } from 'lucide-react'

interface FollowUpCardProps {
  item: string
}

export function FollowUpCard({ item }: FollowUpCardProps) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-warm/15 bg-warm-soft px-4 py-3 text-sm text-ink">
      <CircleAlert size={16} className="text-warm" />
      <span>{item}</span>
      <span className="ml-auto text-xs font-medium text-warm">Pending</span>
    </article>
  )
}
