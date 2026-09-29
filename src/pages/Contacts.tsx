import { useEffect, useMemo, useState } from 'react'
import { ContactCard } from '../components/contacts/ContactCard'
import { PageHeader } from '../components/layout/PageHeader'
import { SearchField } from '../components/ui/SearchField'
import { countMemoriesByContact, getContacts, getMemories } from '../services/api'
import type { Contact } from '../types'

export function Contacts() {
  const [contactList, setContactList] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [memoryUnavailable, setMemoryUnavailable] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getContacts(), getMemories().catch(() => null)])
      .then(([items, memories]) => {
        if (!active) return
        if (memories === null) {
          setMemoryUnavailable(true)
          setContactList(items)
          return
        }
        const counts = countMemoriesByContact(memories)
        setContactList(items.map((contact) => ({ ...contact, memoryCount: counts[contact.id] ?? 0 })))
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load contacts.')
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
    return contactList.filter((contact) => {
      const haystack = `${contact.name} ${contact.role} ${contact.companyName ?? ''} ${contact.lastInteraction}`.toLowerCase()
      return needle.length === 0 || haystack.includes(needle)
    })
  }, [contactList, query])

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle="Your professional relationships, with context that grows over time."
      />
      <div className="mb-6 max-w-xl">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by name, role, or company"
        />
      </div>
      {memoryUnavailable ? <p className="mb-4 text-sm text-muted">Hindsight is unavailable; memory counts cannot be loaded.</p> : null}
      {error ? <p role="alert" className="mb-4 text-sm text-warm">{error}</p> : null}
      {loading ? (
        <p role="status" className="py-10 text-center text-sm text-muted">Loading contacts...</p>
      ) : filtered.length === 0 ? (
        <div className="card px-5 py-10 text-center text-sm text-muted">
          No contacts match that search.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  )
}
