import type { MemoryItem } from '../../types'
import { Badge } from '../ui/Badge'

interface MemoryCardProps {
  memory: MemoryItem
}

const categoryTone: Record<MemoryItem['category'], 'memory' | 'warm' | 'accent' | 'neutral'> = {
  people: 'accent',
  meetings: 'neutral',
  commitments: 'warm',
  'follow-ups': 'warm',
  preferences: 'memory',
  'important-context': 'memory',
}

const categoryLabel: Record<MemoryItem['category'], string> = {
  people: 'People',
  meetings: 'Past conversation',
  commitments: 'Commitment',
  'follow-ups': 'Follow-up',
  preferences: 'Preference',
  'important-context': 'Key context',
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const statusLabel =
    memory.status === 'Pending'
      ? 'Action needed'
      : memory.status === 'Resolved'
        ? 'Completed'
        : memory.status === 'Noted'
          ? 'Remembered'
          : undefined

  return (
    <article className="card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <Badge tone={categoryTone[memory.category]}>{categoryLabel[memory.category]}</Badge>
        {statusLabel ? (
          <Badge tone={memory.status === 'Pending' ? 'warm' : 'neutral'}>{statusLabel}</Badge>
        ) : null}
      </div>
      <p className="text-[15px] leading-relaxed text-ink">{memory.body}</p>
      {memory.contactName || memory.companyName ? (
        <p className="mt-auto border-t border-line pt-3 text-sm text-muted">
          {memory.contactName}
          {memory.contactName && memory.companyName ? ' · ' : ''}
          {memory.companyName}
        </p>
      ) : null}
    </article>
  )
}
