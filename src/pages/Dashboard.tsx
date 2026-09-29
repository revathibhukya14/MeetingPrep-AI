import { Brain, CalendarDays, ListTodo, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { FollowUpCard } from '../components/meetings/FollowUpCard'
import { UpcomingMeetingRow } from '../components/meetings/UpcomingMeetingRow'
import { ButtonLink } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { countMemoriesByContact, getContacts, getMeetings, getMemories } from '../services/api'
import type { Contact, Meeting, MemoryItem } from '../types'

const activityIcons = [Brain, ListTodo] as const

export function Dashboard() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [memoryUnavailable, setMemoryUnavailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getMeetings(), getContacts(), getMemories().catch(() => null)])
      .then(([meetingItems, contactItems, memoryItems]) => {
        if (active) {
          if (memoryItems === null) {
            setMemoryUnavailable(true)
            setMeetings(meetingItems)
            setContacts(contactItems)
          } else {
            const counts = countMemoriesByContact(memoryItems)
            setMemories(memoryItems)
            setMeetings(meetingItems.map((meeting) => ({ ...meeting, memoryCount: counts[meeting.contactId] ?? 0 })))
            setContacts(contactItems.map((contact) => ({ ...contact, memoryCount: counts[contact.id] ?? 0 })))
          }
        }
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load the dashboard.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const upcomingMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.status !== 'completed').slice(0, 3),
    [meetings],
  )
  const pendingCommitments = memories.filter((memory) => memory.status === 'Pending').slice(0, 4)
  const todaysMeetingCount = meetings.filter((meeting) => meeting.dateLabel === 'Today').length
  const pendingFollowUps = contacts.reduce((total, contact) => total + contact.pendingFollowUps, 0)

  return (
    <div>
      <PageHeader
        title="Good morning 👋"
        subtitle="Everything you need to walk into your next meeting prepared."
        actions={
          <ButtonLink to="/assistant" variant="secondary">
            Ask MeetingPrep AI
          </ButtonLink>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Meetings" value={todaysMeetingCount} icon={CalendarDays} />
        <StatCard label="Pending Follow-ups" value={pendingFollowUps} icon={ListTodo} />
        <StatCard label="Contacts" value={contacts.length} icon={Users} />
        <StatCard
          label="Remembered Interactions"
          value={memories.length}
          icon={Brain}
        />
      </section>

      {error ? <p role="alert" className="mt-4 text-sm text-warm">{error}</p> : null}
      {memoryUnavailable ? <p className="mt-3 text-sm text-muted">Hindsight is unavailable; remembered details will appear when the memory service is connected.</p> : null}

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Upcoming Meetings</h2>
            <p className="mt-1 text-sm text-muted">Walk in with the context that already exists.</p>
          </div>
          <ButtonLink to="/meetings" variant="ghost" className="hidden sm:inline-flex">
            View all
          </ButtonLink>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? <p className="card px-4 py-6 text-sm text-muted">Loading meetings...</p> : null}
          {!loading && upcomingMeetings.length === 0 ? <p className="card px-4 py-6 text-sm text-muted">No upcoming meetings are scheduled.</p> : null}
          {upcomingMeetings.map((meeting) => (
            <UpcomingMeetingRow key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <h2 className="text-lg font-semibold text-ink">Pending Follow-ups</h2>
          <div className="mt-4 space-y-3">
            {pendingCommitments.map((item) => <FollowUpCard key={item.id} item={item.body} />)}
            {!memoryUnavailable && pendingCommitments.length === 0 ? <p className="text-sm text-muted">No open follow-ups are currently remembered.</p> : null}
            {memoryUnavailable ? <p className="text-sm text-muted">Connect Hindsight to view remembered follow-ups.</p> : null}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
          <ul className="card mt-4 divide-y divide-line">
            {memories.slice(0, 4).map((memory, index) => {
              const Icon = activityIcons[index % activityIcons.length]
              return (
                <li key={memory.id} className="flex items-start gap-3 px-4 py-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink-soft">
                    {memory.body}
                  </p>
                </li>
              )
            })}
            {memories.length === 0 ? <li className="px-4 py-4 text-sm text-muted">No stored interactions to show yet.</li> : null}
          </ul>
        </div>
      </section>
    </div>
  )
}
