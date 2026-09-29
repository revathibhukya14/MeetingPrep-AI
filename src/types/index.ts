export type MeetingStatus = 'upcoming' | 'completed' | 'follow-up'

export type MemoryCategory =
  | 'people'
  | 'meetings'
  | 'commitments'
  | 'follow-ups'
  | 'preferences'
  | 'important-context'

export interface Company {
  id: string
  name: string
}

export interface Contact {
  id: string
  name: string
  role: string
  companyId: string
  companyName?: string
  meetingCount: number
  memoryCount: number
  pendingFollowUps: number
  lastInteraction: string
  initials: string
}

export interface Meeting {
  id: string
  contactId: string
  companyId: string
  contactName?: string
  contactRole?: string
  companyName?: string
  dateLabel: string
  time: string
  type: string
  status: MeetingStatus
  lastInteraction: string
  pendingFollowUps: number
  memoryCount: number
  when: string
}

export interface MemoryItem {
  id: string
  category: MemoryCategory
  title: string
  body: string
  companyId?: string
  contactId?: string
  companyName?: string
  contactName?: string
  status?: 'Pending' | 'Resolved' | 'Noted'
}

export interface ActivityItem {
  id: string
  text: string
  time: string
}

export interface WorkspaceStats {
  todaysMeetings: number
  pendingFollowUps: number
  contacts: number
  rememberedInteractions: number
}

export interface MeetingBrief {
  meetingId: string
  summary: string
  quickContext: string
  previousDiscussions: string[]
  pendingFollowUps: string[]
  keyInsights: string[]
  suggestedAgenda: string[]
  suggestedQuestions: string[]
  memoriesUsed: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  intent?: 'GENERAL_CONVERSATION' | 'LIST_MEETINGS' | 'RECALL_MEMORY' | 'PREPARE_MEETING' | 'STORE_MEMORY'
  conversationId?: string
  meetingId?: string
  memoryIds?: string[]
  brief?: MeetingBrief
  memoriesUsed?: { text: string; type: string }[]
}
