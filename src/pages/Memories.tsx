import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/PageHeader'
import { MemoryCard } from '../components/memories/MemoryCard'
import { FilterChips } from '../components/ui/FilterChips'
import { SearchField } from '../components/ui/SearchField'
import { createMemory, getMemories } from '../services/api'
import type { MemoryCategory, MemoryItem } from '../types'

type MemoryFilter = MemoryCategory | 'all'

const categories: { id: MemoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'people', label: 'People' },
  { id: 'meetings', label: 'Past conversations' },
  { id: 'commitments', label: 'Commitments' },
  { id: 'follow-ups', label: 'Follow-ups' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'important-context', label: 'Key context' },
]

export function Memories() {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [contactName, setContactName] = useState('Rahul Sharma')
  const [company, setCompany] = useState('ABC Technologies')
  const [role, setRole] = useState('CTO')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [category, setCategory] = useState<MemoryFilter>('all')
  const [query, setQuery] = useState('')

  async function loadMemories() {
    try {
      setMemories(await getMemories())
    } catch (requestError) {
      setLoadError(requestError instanceof Error ? requestError.message : 'Could not load memories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    getMemories()
      .then((items) => {
        if (active) {
          setMemories(items)
          setLoadError('')
        }
      })
      .catch((requestError: unknown) => {
        if (active) setLoadError(requestError instanceof Error ? requestError.message : 'Could not load memories.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function saveMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setLoadError('')
    setSaveError('')
    setNotice('')
    try {
      await createMemory({ contact_name: contactName, company, role, content })
      setNotice('Memory saved.')
      setContent('')
      await loadMemories()
    } catch (requestError) {
      setSaveError(requestError instanceof Error ? requestError.message : 'Could not save this meeting note.')
    } finally {
      setSaving(false)
    }
  }

  const filtered = useMemo(
    () => {
      const searchTerm = query.trim().toLowerCase()
      return memories.filter((memory) => {
        const matchesCategory = category === 'all' || memory.category === category
        const matchesSearch =
          searchTerm.length === 0 ||
          `${memory.title} ${memory.body} ${memory.contactName ?? ''} ${memory.companyName ?? ''}`
            .toLowerCase()
            .includes(searchTerm)
        return matchesCategory && matchesSearch
      })
    },
    [category, memories, query],
  )
  const pendingCount = memories.filter((memory) => memory.status === 'Pending').length
  const peopleCount = new Set(memories.flatMap((memory) => memory.contactId ?? [])).size

  return (
    <div>
      <PageHeader
        title="Memories"
        subtitle="The details worth carrying into your next conversation, kept in one place."
      />

      <form onSubmit={saveMemory} className="card mb-7 space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-semibold text-ink">Save a meeting note</h2>
          <p className="mt-1 text-sm text-muted">Store a conversation in Hindsight for future meeting preparation.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm text-muted">
            <span>Contact</span>
            <input value={contactName} onChange={(event) => setContactName(event.target.value)} required className="w-full rounded-lg border border-line bg-white px-3 py-2 text-ink outline-none focus:border-accent" />
          </label>
          <label className="space-y-1 text-sm text-muted">
            <span>Company</span>
            <input value={company} onChange={(event) => setCompany(event.target.value)} required className="w-full rounded-lg border border-line bg-white px-3 py-2 text-ink outline-none focus:border-accent" />
          </label>
          <label className="space-y-1 text-sm text-muted">
            <span>Role</span>
            <input value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-ink outline-none focus:border-accent" />
          </label>
        </div>
        <label className="block space-y-1 text-sm text-muted">
          <span>Conversation details</span>
          <textarea value={content} onChange={(event) => setContent(event.target.value)} required rows={3} placeholder="Decisions, requirements, commitments, preferences, or follow-ups..." className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-accent" />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving || !content.trim()}>{saving ? 'Saving note...' : 'Save meeting note'}</Button>
          {notice ? <p role="status" className="text-sm text-accent">{notice}</p> : null}
          {saveError ? <p role="alert" className="text-sm text-warm">{saveError}</p> : null}
        </div>
      </form>

      <section aria-label="Memory overview" className="mb-7 grid grid-cols-3 border-y border-line py-4">
        <div className="pr-3">
          <p className="text-2xl font-semibold tabular-nums text-ink">{memories.length}</p>
          <p className="mt-1 text-xs text-muted sm:text-sm">Details remembered</p>
        </div>
        <div className="border-l border-line px-3 sm:px-5">
          <p className="text-2xl font-semibold tabular-nums text-warm">{pendingCount}</p>
          <p className="mt-1 text-xs text-muted sm:text-sm">Actions to follow up</p>
        </div>
        <div className="border-l border-line pl-3 sm:pl-5">
          <p className="text-2xl font-semibold tabular-nums text-accent">{peopleCount}</p>
          <p className="mt-1 text-xs text-muted sm:text-sm">People in context</p>
        </div>
      </section>

      <div className="mb-4">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search people, companies, or details"
        />
      </div>
      <div className="mb-6">
        <FilterChips value={category} options={categories} onChange={setCategory} />
      </div>
      {loading ? (
        <p role="status" className="py-10 text-center text-sm text-muted">Loading remembered details...</p>
      ) : loadError ? (
        <p role="alert" className="border-y border-line px-5 py-10 text-center text-sm text-warm">{loadError}</p>
      ) : filtered.length === 0 ? (
        <div className="border-y border-line px-5 py-12 text-center">
          <h2 className="font-medium text-ink">No matching memories</h2>
          <p className="mt-1 text-sm text-muted">Try another search or choose a different category.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  )
}
