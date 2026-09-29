import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Building2, CalendarDays, MessageSquareText } from 'lucide-react'
import { MemoryCard } from '../components/memories/MemoryCard'
import { MeetingCard } from '../components/meetings/MeetingCard'
import { PageHeader } from '../components/layout/PageHeader'
import { ButtonLink } from '../components/ui/Button'
import { countMemoriesByContact, getContacts, getMeetings, getMemories } from '../services/api'
import type { Contact, Meeting, MemoryItem } from '../types'

export function ContactDetails() {
  const { id } = useParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [memoryUnavailable, setMemoryUnavailable] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getContacts(), getMeetings(), getMemories().catch(() => null)])
      .then(([contactItems, meetingItems, memoryItems]) => {
        if (active) {
          if (memoryItems === null) {
            setMemoryUnavailable(true)
            setContacts(contactItems)
          } else {
            const counts = countMemoriesByContact(memoryItems)
            setContacts(contactItems.map((contact) => ({ ...contact, memoryCount: counts[contact.id] ?? 0 })))
            setMemories(memoryItems)
          }
          setMeetings(meetingItems)
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load this contact.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const contact = contacts.find((item) => item.id === id)

  if (loading) {
    return <p role="status" className="py-10 text-center text-sm text-muted">Loading contact...</p>
  }

  if (error) {
    return <p role="alert" className="card p-8 text-sm text-warm">{error}</p>
  }

  if (!contact) {
    return (
      <div className="card p-8">
        <h1 className="page-title">Contact not found</h1>
        <p className="mt-2 text-sm text-muted">This contact is not in your workspace.</p>
        <Link to="/contacts" className="mt-4 inline-flex text-sm font-medium text-accent">
          Back to contacts
        </Link>
      </div>
    )
  }

  const contactMeetings = meetings.filter((meeting) => meeting.contactId === contact.id)
  const contactMemories = memories.filter((memory) => memory.contactId === contact.id)

  return (
    <div>
      <Link
        to="/contacts"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Back to contacts
      </Link>
      <PageHeader
        title={contact.name}
        subtitle={`${contact.role} · ${contact.companyName}`}
        actions={
          <ButtonLink to={`/meetings?contact=${contact.id}`} variant="secondary">
            View meetings
            <CalendarDays size={15} aria-hidden="true" />
          </ButtonLink>
        }
      />

      <section aria-label="Contact overview" className="mb-8 grid grid-cols-3 border-y border-line py-4">
        <div className="pr-3">
          <p className="text-2xl font-semibold tabular-nums text-ink">{contact.meetingCount}</p>
          <p className="mt-1 text-xs text-muted sm:text-sm">Meetings</p>
        </div>
        <div className="border-l border-line px-3 sm:px-5">
          <p className="text-2xl font-semibold tabular-nums text-accent">{contact.memoryCount}</p>
          <p className="mt-1 text-xs text-muted sm:text-sm">Remembered details</p>
        </div>
        <div className="border-l border-line pl-3 sm:pl-5">
          <p className="text-2xl font-semibold tabular-nums text-warm">{contact.pendingFollowUps}</p>
          <p className="mt-1 text-xs text-muted sm:text-sm">Open follow-ups</p>
        </div>
      </section>

      <section className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
        <div className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MessageSquareText size={16} className="text-accent" aria-hidden="true" />
            Last interaction
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{contact.lastInteraction}</p>
        </div>
        <div className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Building2 size={16} className="text-accent" aria-hidden="true" />
            Organization
          </h2>
          <p className="mt-3 text-[15px] text-ink-soft">{contact.companyName}</p>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Conversation history</h2>
            <p className="mt-1 text-sm text-muted">Prepare with the context from previous meetings.</p>
          </div>
        </div>
        {contactMeetings.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {contactMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)}
          </div>
        ) : (
          <p className="border-y border-line py-8 text-sm text-muted">No meetings recorded for this contact yet.</p>
        )}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-ink">Remembered details</h2>
          <p className="mt-1 text-sm text-muted">Preferences, commitments, and context to carry forward.</p>
        </div>
        {contactMemories.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {contactMemories.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}
          </div>
        ) : (
          <p className="border-y border-line py-8 text-sm text-muted">
            {memoryUnavailable ? 'Hindsight is unavailable, so remembered details cannot be loaded right now.' : 'No remembered details for this contact yet.'}
          </p>
        )}
      </section>
    </div>
  )
}