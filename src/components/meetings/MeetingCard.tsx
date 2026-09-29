import { ArrowRight, Brain, Clock3 } from 'lucide-react'
import type { Meeting } from '../../types'
import { Badge } from '../ui/Badge'
import { ButtonLink } from '../ui/Button'

interface MeetingCardProps {
  meeting: Meeting
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <article className="card flex h-full flex-col gap-4 p-5 transition-shadow duration-150 hover:shadow-[0_8px_24px_rgba(20,23,28,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{meeting.companyName}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">{meeting.contactName}</h3>
          <p className="text-sm text-muted">{meeting.contactRole}</p>
        </div>
        <Badge tone={meeting.status === 'follow-up' ? 'warm' : 'accent'}>{meeting.type}</Badge>
      </div>

      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <Clock3 size={15} />
        {meeting.dateLabel} · {meeting.time}
      </p>

      <p className="text-sm leading-relaxed text-ink-soft">
        <span className="font-medium text-ink">Last interaction: </span>
        “{meeting.lastInteraction}”
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
        <span>
          {meeting.pendingFollowUps} pending follow-up
          {meeting.pendingFollowUps === 1 ? '' : 's'}
        </span>
        <span className="hidden h-1 w-1 rounded-full bg-line-strong sm:inline-flex" />
        <span className="inline-flex items-center gap-1.5">
          <Brain size={14} />
          {meeting.memoryCount} relevant memories
        </span>
      </div>

      <div className="mt-auto pt-1">
        <ButtonLink to={`/meetings/${meeting.id}/prepare`} className="w-full sm:w-auto">
          Prepare Meeting
          <ArrowRight size={15} />
        </ButtonLink>
      </div>
    </article>
  )
}
