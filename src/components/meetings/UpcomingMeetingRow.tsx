import { ArrowRight, Brain } from 'lucide-react'
import type { Meeting } from '../../types'
import { Badge } from '../ui/Badge'
import { ButtonLink } from '../ui/Button'

interface UpcomingMeetingRowProps {
  meeting: Meeting
}

export function UpcomingMeetingRow({ meeting }: UpcomingMeetingRowProps) {
  return (
    <article className="card flex h-full flex-col gap-4 p-5 transition-shadow duration-150 hover:shadow-[0_8px_24px_rgba(20,23,28,0.06)]">
      <div>
        <p className="text-sm font-medium text-muted">{meeting.companyName}</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">{meeting.contactName}</h3>
        <p className="text-sm text-muted">{meeting.contactRole}</p>
      </div>

      <div>
        <p className="text-base font-medium text-ink">{meeting.time}</p>
        <p className="text-sm text-muted">{meeting.dateLabel}</p>
      </div>

      <Badge tone={meeting.status === 'follow-up' ? 'warm' : 'accent'}>{meeting.type}</Badge>

      <p className="mt-auto inline-flex items-center gap-1.5 text-sm text-muted">
        <Brain size={14} />
        {meeting.memoryCount} relevant memories
      </p>

      <ButtonLink to={`/meetings/${meeting.id}/prepare`}>
        Prepare
        <ArrowRight size={14} />
      </ButtonLink>
    </article>
  )
}
