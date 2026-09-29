import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { MeetingCard } from '../components/meetings/MeetingCard'
import { FilterChips } from '../components/ui/FilterChips'
import { SearchField } from '../components/ui/SearchField'
import { countMemoriesByContact, getMeetings, getMemories } from '../services/api'
import type { Meeting, MeetingStatus } from '../types'

type MeetingFilter = 'upcoming' | 'completed' | 'follow-up'

const filters: { id: MeetingFilter; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'follow-up', label: 'Follow-up Required' },
]

function matchesFilter(status: MeetingStatus, filter: MeetingFilter): boolean {
  if (filter === 'upcoming') {
    return status !== 'completed'
  }
  return status === filter
}

export function Meetings() {
  const [searchParams] = useSearchParams()
  const [meetingList, setMeetingList] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [memoryUnavailable, setMemoryUnavailable] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<MeetingFilter>('upcoming')
  const contactId = searchParams.get('contact')
  const companyId = searchParams.get('company')

  useEffect(() => {
    let active = true
    Promise.all([getMeetings(), getMemories().catch(() => null)])
      .then(([items, memories]) => {
        if (!active) return
        if (memories === null) {
          setMemoryUnavailable(true)
          setMeetingList(items)
          return
        }
        const counts = countMemoriesByContact(memories)
        setMeetingList(items.map((meeting) => ({ ...meeting, memoryCount: counts[meeting.contactId] ?? 0 })))
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load meetings.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return meetingList.filter((meeting) => {
      const haystack = `${meeting.contactName ?? ''} ${meeting.companyName ?? ''} ${meeting.type} ${meeting.lastInteraction}`.toLowerCase()
      const matchesQuery = needle.length === 0 || haystack.includes(needle)
      const matchesContact = !contactId || meeting.contactId === contactId
      const matchesCompany = !companyId || meeting.companyId === companyId
      return (
        matchesQuery &&
        matchesContact &&
        matchesCompany &&
        matchesFilter(meeting.status, filter)
      )
    })
  }, [companyId, contactId, filter, meetingList, query])

  const contact = contactId ? meetingList.find((meeting) => meeting.contactId === contactId) : undefined
  const company = companyId ? meetingList.find((meeting) => meeting.companyId === companyId) : undefined

  return (
    <div>
      <PageHeader
        title="Meetings"
        subtitle="Prepare for every conversation with the context that matters."
      />

      {(contact || company) && (
        <p className="mb-4 text-sm text-muted">
          Showing meetings
          {contact ? ` with ${contact.contactName}` : ''}
          {company ? ` at ${company.companyName}` : ''}.{' '}
          <Link to="/meetings" className="font-medium text-accent hover:text-accent-hover">
            Clear filter
          </Link>
        </p>
      )}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search meetings, contacts, or companies"
        />
        <FilterChips value={filter} options={filters} onChange={setFilter} />
      </div>

      {memoryUnavailable ? <p className="mb-4 text-sm text-muted">Hindsight is unavailable; memory counts cannot be loaded.</p> : null}
      {error ? <p role="alert" className="mb-4 text-sm text-warm">{error}</p> : null}
      {loading ? (
        <p role="status" className="py-10 text-center text-sm text-muted">Loading meetings...</p>
      ) : filtered.length === 0 ? (
        <div className="card px-5 py-10 text-center text-sm text-muted">
          No meetings match the current filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  )
}
