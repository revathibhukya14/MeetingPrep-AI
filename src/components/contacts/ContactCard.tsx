import { ArrowRight } from 'lucide-react'
import type { Contact } from '../../types'
import { ButtonLink } from '../ui/Button'

interface ContactCardProps {
  contact: Contact
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <article className="card flex h-full flex-col gap-4 p-5 transition-shadow duration-150 hover:shadow-[0_8px_24px_rgba(20,23,28,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
          {contact.initials}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold tracking-tight text-ink">{contact.name}</h3>
          <p className="text-sm text-muted">
            {contact.role} · {contact.companyName}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 rounded-xl bg-canvas px-3 py-3 text-center">
        <div>
          <dt className="text-[11px] tracking-wide text-muted uppercase">Meetings</dt>
          <dd className="mt-1 text-base font-semibold text-ink">{contact.meetingCount}</dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-wide text-muted uppercase">Memories</dt>
          <dd className="mt-1 text-base font-semibold text-ink">{contact.memoryCount}</dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-wide text-muted uppercase">Follow-ups</dt>
          <dd className="mt-1 text-base font-semibold text-ink">{contact.pendingFollowUps}</dd>
        </div>
      </dl>

      <p className="text-sm leading-relaxed text-ink-soft">
        <span className="font-medium text-ink">Last interaction: </span>
        “{contact.lastInteraction}”
      </p>

      <div className="mt-auto pt-1">
        <ButtonLink to={`/contacts/${contact.id}`} variant="secondary" className="w-full">
          View Contact
          <ArrowRight size={15} />
        </ButtonLink>
      </div>
    </article>
  )
}
