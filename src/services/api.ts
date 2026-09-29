import type {
  ChatMessage,
  Contact,
  Meeting,
  MeetingBrief,
  MemoryItem,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

interface ContactApi {
  id: string
  name: string
  company: string
  company_id: string
  role: string
  last_interaction: string
  memory_count: number
  meeting_count: number
  pending_followups: number
  initials: string
}

interface MeetingApi {
  id: string
  contact_id: string
  company_id: string
  contact_name: string
  company: string
  role: string
  date: string
  time: string
  type: string
  status: Meeting['status']
  last_interaction: string
  pending_followups: number
  memory_count: number
}

interface MemoryApi {
  id: string
  body: string
  category: MemoryItem['category']
  contact_id: string | null
  company_id: string | null
  status: MemoryItem['status']
  type: string
  contact_name: string | null
  company: string | null
}

interface PreparationApi {
  contact: { name: string; company: string; role: string }
  quick_context: string
  previous_discussions: string[]
  pending_followups: string[]
  key_insights: string[]
  suggested_agenda: string[]
  suggested_questions: string[]
}

interface MemoryReferenceApi {
  text: string
  type: string
}

interface PreparationResponseApi {
  meeting_id: string
  preparation: PreparationApi
  memories_used: MemoryReferenceApi[]
}

interface ChatResponseApi {
  intent: NonNullable<ChatMessage['intent']>
  conversation_id: string
  message: string
  memories_used: MemoryReferenceApi[]
  preparation: PreparationApi | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new Error('The backend is unavailable. Start the FastAPI server and try again.')
  }

  if (!response.ok) {
    let detail = ''
    try {
      const body = (await response.json()) as { detail?: string }
      detail = body.detail ?? ''
    } catch {
      detail = ''
    }
    throw new Error(detail || `The request could not be completed (${response.status}).`)
  }

  return (await response.json()) as T
}

function formatDate(date: string): string {
  const today = new Date()
  const meetingDate = new Date(`${date}T12:00:00`)
  const offset = Math.round((meetingDate.getTime() - new Date(today.toDateString()).getTime()) / 86_400_000)
  if (offset === 0) return 'Today'
  if (offset === 1) return 'Tomorrow'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(meetingDate)
}

function formatTime(time: string): string {
  const [hours = '0', minutes = '00'] = time.split(':')
  const parsedHours = Number(hours)
  const suffix = parsedHours >= 12 ? 'PM' : 'AM'
  return `${parsedHours % 12 || 12}:${minutes} ${suffix}`
}

function mapContact(contact: ContactApi): Contact {
  return {
    id: contact.id,
    name: contact.name,
    role: contact.role,
    companyId: contact.company_id,
    companyName: contact.company,
    meetingCount: contact.meeting_count,
    memoryCount: contact.memory_count,
    pendingFollowUps: contact.pending_followups,
    lastInteraction: contact.last_interaction,
    initials: contact.initials,
  }
}

function mapMeeting(meeting: MeetingApi): Meeting {
  const dateLabel = formatDate(meeting.date)
  const time = formatTime(meeting.time)
  return {
    id: meeting.id,
    contactId: meeting.contact_id,
    companyId: meeting.company_id,
    contactName: meeting.contact_name,
    contactRole: meeting.role,
    companyName: meeting.company,
    dateLabel,
    time,
    type: meeting.type,
    status: meeting.status,
    lastInteraction: meeting.last_interaction,
    pendingFollowUps: meeting.pending_followups,
    memoryCount: meeting.memory_count,
    when: `${dateLabel} · ${time}`,
  }
}

function mapMemory(memory: MemoryApi): MemoryItem {
  return {
    id: memory.id,
    body: memory.body,
    title: memory.category === 'commitments' ? 'Commitment' : memory.category === 'follow-ups' ? 'Follow-up' : 'Remembered detail',
    category: memory.category,
    contactId: memory.contact_id ?? undefined,
    companyId: memory.company_id ?? undefined,
    status: memory.status,
    contactName: memory.contact_name ?? undefined,
    companyName: memory.company ?? undefined,
  }
}

export function countMemoriesByContact(memories: MemoryItem[]): Record<string, number> {
  return memories.reduce<Record<string, number>>((counts, memory) => {
    if (memory.contactId) counts[memory.contactId] = (counts[memory.contactId] ?? 0) + 1
    return counts
  }, {})
}

function mapBrief(meetingId: string, preparation: PreparationApi, memoriesUsed: number): MeetingBrief {
  return {
    meetingId,
    summary: preparation.quick_context,
    quickContext: preparation.quick_context,
    previousDiscussions: preparation.previous_discussions,
    pendingFollowUps: preparation.pending_followups,
    keyInsights: preparation.key_insights,
    suggestedAgenda: preparation.suggested_agenda,
    suggestedQuestions: preparation.suggested_questions,
    memoriesUsed,
  }
}

export async function getContacts(): Promise<Contact[]> {
  const contacts = await request<ContactApi[]>('/contacts')
  return contacts.map(mapContact)
}

export async function getMeetings(): Promise<Meeting[]> {
  const meetings = await request<MeetingApi[]>('/meetings')
  return meetings.map(mapMeeting)
}

export async function getMemories(): Promise<MemoryItem[]> {
  const response = await request<{ memories: MemoryApi[] }>('/memories')
  return response.memories.map(mapMemory)
}

export async function searchMemories(query: string): Promise<MemoryReferenceApi[]> {
  const params = new URLSearchParams({ q: query })
  const response = await request<{ memories: MemoryReferenceApi[] }>(`/memories/search?${params}`)
  return response.memories
}

export async function createMemory(input: {
  contact_name: string
  company: string
  role?: string
  content: string
}): Promise<void> {
  await request('/memories', { method: 'POST', body: JSON.stringify(input) })
}

export async function prepareMeeting(meetingId: string, message = 'Prepare me for this meeting') {
  const response = await request<PreparationResponseApi>(`/meetings/${encodeURIComponent(meetingId)}/prepare`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
  return {
    brief: mapBrief(meetingId, response.preparation, response.memories_used.length),
    memories: response.memories_used,
  }
}

export async function recordMeetingOutcome(meetingId: string, summary: string): Promise<void> {
  await request(`/meetings/${encodeURIComponent(meetingId)}/outcome`, {
    method: 'POST',
    body: JSON.stringify({ summary }),
  })
}

export async function chatWithAssistant(message: string, conversationId: string): Promise<ChatMessage> {
  const response = await request<ChatResponseApi>('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId }),
  })
  const brief = response.preparation
    ? mapBrief('assistant-response', response.preparation, response.memories_used.length)
    : undefined
  return {
    id: crypto.randomUUID(),
    role: 'assistant',
    text: response.message,
    intent: response.intent,
    conversationId: response.conversation_id,
    brief,
    memoriesUsed: response.memories_used,
  }
}

export async function healthCheck(): Promise<{ status: string; service: string }> {
  return request('/health')
}
