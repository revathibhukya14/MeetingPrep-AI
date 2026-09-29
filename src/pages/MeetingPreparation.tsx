import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { MeetingBrief } from '../components/meetings/MeetingBrief'
import { Badge } from '../components/ui/Badge'
import { Button, ButtonLink } from '../components/ui/Button'
import { MemoriesUsedChip } from '../components/ui/MemoriesUsedChip'
import { getContacts, getMeetings, prepareMeeting, recordMeetingOutcome } from '../services/api'
import type { Contact, Meeting } from '../types'

export function MeetingPreparation() {
  const { id } = useParams()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [preparing, setPreparing] = useState(false)
  const [savingOutcome, setSavingOutcome] = useState(false)
  const [error, setError] = useState('')
  const [outcomeError, setOutcomeError] = useState('')
  const [notice, setNotice] = useState('')
  const [outcome, setOutcome] = useState('')
  const [brief, setBrief] = useState<Awaited<ReturnType<typeof prepareMeeting>> | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getMeetings(), getContacts()])
      .then(([meetings, contacts]) => {
        if (!active) return
        const selectedMeeting = meetings.find((item) => item.id === id)
        setMeeting(selectedMeeting ?? null)
        setContact(contacts.find((item) => item.id === selectedMeeting?.contactId) ?? null)
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load this meeting.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  const company = contact?.companyName

  async function prepare() {
    if (!meeting) return
    setPreparing(true)
    setError('')
    try {
      setBrief(await prepareMeeting(meeting.id))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not prepare this meeting.')
    } finally {
      setPreparing(false)
    }
  }

  async function submitOutcome(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!meeting) return
    setSavingOutcome(true)
    setOutcomeError('')
    setNotice('')
    try {
      await recordMeetingOutcome(meeting.id, outcome)
      setOutcome('')
      setNotice('Meeting outcome saved to memory. Prepare again to include the new details.')
    } catch (requestError) {
      setOutcomeError(requestError instanceof Error ? requestError.message : 'Could not save this outcome.')
    } finally {
      setSavingOutcome(false)
    }
  }

  if (loading) {
    return <p role="status" className="py-10 text-center text-sm text-muted">Loading meeting context...</p>
  }

  if (error && !meeting) {
    return <p role="alert" className="card p-8 text-sm text-warm">{error}</p>
  }

  if (!meeting || !contact || !company) {
    return (
      <div className="card p-8">
        <h1 className="page-title">Meeting not found</h1>
        <p className="mt-2 text-sm text-muted">This meeting is not in the current workspace.</p>
        <Link to="/meetings" className="mt-4 inline-flex text-sm font-medium text-accent">Back to meetings</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/meetings" className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft size={15} />
        Back to meetings
      </Link>
      <PageHeader
        title={company}
        subtitle={`${contact.name} · ${contact.role}`}
        actions={<Badge tone={meeting.status === 'follow-up' ? 'warm' : 'accent'}>{meeting.type}</Badge>}
      />
      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-accent/10 bg-accent-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">Your meeting brief</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">
            {brief?.brief.summary ?? 'Recall prior conversations and prepare a focused brief for this meeting.'}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft">
            <Clock3 size={15} aria-hidden="true" />
            {meeting.when}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {brief ? <MemoriesUsedChip count={brief.memories.length} /> : null}
          <Button onClick={() => void prepare()} disabled={preparing}>
            <Sparkles size={15} aria-hidden="true" />
            {preparing ? 'Preparing your meeting...' : 'Prepare for meeting'}
          </Button>
        </div>
      </section>
      {error ? <p role="alert" className="mb-5 text-sm text-warm">{error}</p> : null}
      {brief ? (
        <>
          <MeetingBrief brief={brief.brief} />
          {brief.memories.length ? (
            <section className="card mt-6 p-5 sm:p-6">
              <h2 className="text-sm font-semibold tracking-[0.1em] text-ink uppercase">What I Remember</h2>
              <ul className="mt-4 space-y-3">
                {brief.memories.map((memory, index) => (
                  <li key={`${memory.text}-${index}`} className="border-l-2 border-memory/40 pl-4 text-sm leading-relaxed text-ink-soft">{memory.text}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : (
        <div className="card px-5 py-10 text-center text-sm text-muted">
          Your brief will appear here after Hindsight recalls relevant meeting context and the preparation service is available.
        </div>
      )}

      <form onSubmit={submitOutcome} className="card mt-6 space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-semibold text-ink">Record the meeting outcome</h2>
          <p className="mt-1 text-sm text-muted">Decisions and follow-ups saved here can improve future preparation.</p>
        </div>
        <textarea value={outcome} onChange={(event) => setOutcome(event.target.value)} required rows={4} placeholder="What was decided? What was promised or left open?" className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-accent" />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={savingOutcome || !outcome.trim()}>{savingOutcome ? 'Saving outcome...' : 'Save outcome to memory'}</Button>
          {notice ? <p role="status" className="text-sm text-accent">{notice}</p> : null}
          {outcomeError ? <p role="alert" className="text-sm text-warm">{outcomeError}</p> : null}
        </div>
      </form>
      <div className="mt-5">
        <ButtonLink to="/memories" variant="ghost">View all remembered details</ButtonLink>
      </div>
    </div>
  )
}
