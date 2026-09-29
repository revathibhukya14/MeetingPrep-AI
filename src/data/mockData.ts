import type {
  ActivityItem,
  ChatMessage,
  Company,
  Contact,
  Meeting,
  MeetingBrief,
  MemoryItem,
  WorkspaceStats,
} from '../types'

export const currentUser = {
  name: 'Alex Rivera',
  role: 'Account Executive',
  initials: 'AR',
}

export const companies: Company[] = [
  { id: 'abc', name: 'ABC Technologies' },
  { id: 'acme', name: 'Acme Corporation' },
  { id: 'technova', name: 'TechNova Solutions' },
]

export const contacts: Contact[] = [
  {
    id: 'rahul',
    name: 'Rahul Sharma',
    role: 'CTO',
    companyId: 'abc',
    meetingCount: 5,
    memoryCount: 12,
    pendingFollowUps: 2,
    lastInteraction: 'Discussed security requirements.',
    initials: 'RS',
  },
  {
    id: 'sarah',
    name: 'Sarah Williams',
    role: 'Product Director',
    companyId: 'acme',
    meetingCount: 3,
    memoryCount: 8,
    pendingFollowUps: 1,
    lastInteraction: 'Aligned on the Q4 product discussion.',
    initials: 'SW',
  },
  {
    id: 'david',
    name: 'David Chen',
    role: 'VP Engineering',
    companyId: 'technova',
    meetingCount: 4,
    memoryCount: 9,
    pendingFollowUps: 0,
    lastInteraction: 'Reviewed engineering capacity for the rollout.',
    initials: 'DC',
  },
  {
    id: 'priya',
    name: 'Priya Nair',
    role: 'Head of Partnerships',
    companyId: 'abc',
    meetingCount: 2,
    memoryCount: 4,
    pendingFollowUps: 1,
    lastInteraction: 'Asked for a joint customer case study.',
    initials: 'PN',
  },
  {
    id: 'marcus',
    name: 'Marcus Hale',
    role: 'Procurement Lead',
    companyId: 'acme',
    meetingCount: 2,
    memoryCount: 5,
    pendingFollowUps: 0,
    lastInteraction: 'Confirmed commercial review timeline.',
    initials: 'MH',
  },
  {
    id: 'elena',
    name: 'Elena Rossi',
    role: 'Staff Engineer',
    companyId: 'technova',
    meetingCount: 2,
    memoryCount: 4,
    pendingFollowUps: 0,
    lastInteraction: 'Shared notes on the technical demo.',
    initials: 'ER',
  },
]

export const meetings: Meeting[] = [
  {
    id: 'meet-abc-today',
    contactId: 'rahul',
    companyId: 'abc',
    dateLabel: 'Today',
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'follow-up',
    lastInteraction: 'Discussed API integration and security requirements.',
    pendingFollowUps: 2,
    memoryCount: 5,
    when: 'Today · 10:00 AM',
  },
  {
    id: 'meet-acme-today',
    contactId: 'sarah',
    companyId: 'acme',
    dateLabel: 'Today',
    time: '2:30 PM',
    type: 'Product discussion',
    status: 'upcoming',
    lastInteraction: 'Reviewed roadmap priorities and launch sequencing.',
    pendingFollowUps: 1,
    memoryCount: 3,
    when: 'Today · 2:30 PM',
  },
  {
    id: 'meet-technova-today',
    contactId: 'david',
    companyId: 'technova',
    dateLabel: 'Today',
    time: '4:15 PM',
    type: 'Technical review',
    status: 'upcoming',
    lastInteraction: 'Walked through architecture constraints for the integration.',
    pendingFollowUps: 0,
    memoryCount: 4,
    when: 'Today · 4:15 PM',
  },
  {
    id: 'meet-abc-tomorrow',
    contactId: 'rahul',
    companyId: 'abc',
    dateLabel: 'Tomorrow',
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'follow-up',
    lastInteraction: 'Discussed API integration and security requirements.',
    pendingFollowUps: 2,
    memoryCount: 5,
    when: 'Tomorrow · 10:00 AM',
  },
  {
    id: 'meet-acme-thu',
    contactId: 'sarah',
    companyId: 'acme',
    dateLabel: 'Thursday',
    time: '11:00 AM',
    type: 'Working session',
    status: 'upcoming',
    lastInteraction: 'Requested a clearer view of implementation trade-offs.',
    pendingFollowUps: 0,
    memoryCount: 3,
    when: 'Thursday · 11:00 AM',
  },
  {
    id: 'meet-abc-pricing',
    contactId: 'rahul',
    companyId: 'abc',
    dateLabel: 'Sep 18',
    time: '3:00 PM',
    type: 'Pricing',
    status: 'completed',
    lastInteraction: 'Discussed pricing and the scope of a technical demo.',
    pendingFollowUps: 0,
    memoryCount: 5,
    when: 'Sep 18 · 3:00 PM',
  },
  {
    id: 'meet-abc-security',
    contactId: 'rahul',
    companyId: 'abc',
    dateLabel: 'Sep 11',
    time: '9:30 AM',
    type: 'Security review',
    status: 'completed',
    lastInteraction: 'Discussed security requirements in detail.',
    pendingFollowUps: 0,
    memoryCount: 5,
    when: 'Sep 11 · 9:30 AM',
  },
]

export const memories: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'commitments',
    title: 'Commitment',
    body: 'Send API documentation to Rahul.',
    companyId: 'abc',
    contactId: 'rahul',
    status: 'Pending',
  },
  {
    id: 'mem-2',
    category: 'commitments',
    title: 'Commitment',
    body: 'Arrange a technical demo for ABC Technologies.',
    companyId: 'abc',
    contactId: 'rahul',
    status: 'Pending',
  },
  {
    id: 'mem-3',
    category: 'preferences',
    title: 'Preference',
    body: 'Rahul prefers technical discussions and implementation detail over high-level summaries.',
    companyId: 'abc',
    contactId: 'rahul',
    status: 'Noted',
  },
  {
    id: 'mem-4',
    category: 'important-context',
    title: 'Discussion',
    body: 'Security requirements were raised during the previous meeting.',
    companyId: 'abc',
    contactId: 'rahul',
    status: 'Noted',
  },
  {
    id: 'mem-5',
    category: 'meetings',
    title: 'Meeting',
    body: 'Previous conversations covered API integration, security requirements, and pricing.',
    companyId: 'abc',
    contactId: 'rahul',
    status: 'Noted',
  },
  {
    id: 'mem-6',
    category: 'follow-ups',
    title: 'Follow-up',
    body: 'Follow up on unresolved security concerns before the next ABC conversation.',
    companyId: 'abc',
    contactId: 'rahul',
    status: 'Pending',
  },
  {
    id: 'mem-7',
    category: 'people',
    title: 'People',
    body: 'Rahul Sharma is the CTO at ABC Technologies and the primary technical decision-maker.',
    companyId: 'abc',
    contactId: 'rahul',
    status: 'Noted',
  },
  {
    id: 'mem-8',
    category: 'preferences',
    title: 'Preference',
    body: 'Sarah prefers product framing first, then implementation implications.',
    companyId: 'acme',
    contactId: 'sarah',
    status: 'Noted',
  },
  {
    id: 'mem-9',
    category: 'follow-ups',
    title: 'Follow-up',
    body: 'Share a concise product discussion brief with Sarah before Thursday.',
    companyId: 'acme',
    contactId: 'sarah',
    status: 'Pending',
  },
  {
    id: 'mem-10',
    category: 'important-context',
    title: 'Important context',
    body: 'TechNova is evaluating engineering capacity before committing to the rollout window.',
    companyId: 'technova',
    contactId: 'david',
    status: 'Noted',
  },
  {
    id: 'mem-11',
    category: 'meetings',
    title: 'Meeting',
    body: 'David asked for a clearer view of architecture constraints during the last technical review.',
    companyId: 'technova',
    contactId: 'david',
    status: 'Noted',
  },
  {
    id: 'mem-12',
    category: 'people',
    title: 'People',
    body: 'Sarah Williams is Product Director at Acme Corporation and owns the Q4 launch narrative.',
    companyId: 'acme',
    contactId: 'sarah',
    status: 'Noted',
  },
]

export const activities: ActivityItem[] = [
  {
    id: 'act-1',
    text: 'Remembered your discussion about API integration with Rahul.',
    time: '2 hours ago',
  },
  {
    id: 'act-2',
    text: 'Follow-up added for ABC Technologies.',
    time: 'Yesterday',
  },
  {
    id: 'act-3',
    text: 'New meeting context saved for Acme Corporation.',
    time: 'Yesterday',
  },
  {
    id: 'act-4',
    text: 'Noted Rahul’s preference for technical implementation detail.',
    time: 'Sep 18',
  },
]

export const stats: WorkspaceStats = {
  todaysMeetings: 3,
  pendingFollowUps: 2,
  contacts: 18,
  rememberedInteractions: 42,
}

export const meetingBriefs: MeetingBrief[] = [
  {
    meetingId: 'meet-abc-today',
    summary: 'Prepared from your previous interactions with Rahul.',
    quickContext:
      'Rahul is the CTO at ABC Technologies. Previous conversations focused on API integration, security requirements, and pricing.',
    previousDiscussions: [
      'API integration',
      'Security requirements',
      'Pricing',
      'Technical demo',
    ],
    pendingFollowUps: ['API documentation', 'Technical demo'],
    keyInsights: [
      'Security concerns appeared in 3 previous meetings.',
      'Rahul tends to focus on technical implementation details.',
    ],
    suggestedAgenda: [
      'Resolve security concerns',
      'Review API integration',
      'Discuss technical demo',
      'Confirm next steps',
    ],
    suggestedQuestions: [
      'Which security requirements are still blocking progress?',
      'What would a successful technical demo need to prove?',
      'How should API documentation be structured for your team?',
    ],
    memoriesUsed: 5,
  },
  {
    meetingId: 'meet-abc-tomorrow',
    summary: 'Prepared from your previous interactions with Rahul.',
    quickContext:
      'Rahul is the CTO at ABC Technologies. Previous conversations focused on API integration, security requirements, and pricing.',
    previousDiscussions: [
      'API integration',
      'Security requirements',
      'Pricing',
      'Technical demo',
    ],
    pendingFollowUps: ['API documentation', 'Technical demo'],
    keyInsights: [
      'Security concerns appeared in 3 previous meetings.',
      'Rahul tends to focus on technical implementation details.',
    ],
    suggestedAgenda: [
      'Resolve security concerns',
      'Review API integration',
      'Discuss technical demo',
      'Confirm next steps',
    ],
    suggestedQuestions: [
      'Which security requirements are still blocking progress?',
      'What would a successful technical demo need to prove?',
      'How should API documentation be structured for your team?',
    ],
    memoriesUsed: 5,
  },
  {
    meetingId: 'meet-acme-today',
    summary: 'Prepared from your previous product conversations with Sarah.',
    quickContext:
      'Sarah is Product Director at Acme Corporation. Recent conversations focused on the Q4 launch narrative and implementation trade-offs.',
    previousDiscussions: [
      'Q4 product discussion',
      'Launch sequencing',
      'Implementation trade-offs',
    ],
    pendingFollowUps: ['Share a concise product discussion brief'],
    keyInsights: [
      'Sarah prefers product framing before technical depth.',
      'The Thursday working session will likely revisit launch sequencing.',
    ],
    suggestedAgenda: [
      'Confirm the product narrative',
      'Review remaining launch risks',
      'Agree on the Thursday working session',
    ],
    suggestedQuestions: [
      'What does a successful Q4 launch look like from your side?',
      'Where do implementation trade-offs still feel unresolved?',
    ],
    memoriesUsed: 3,
  },
  {
    meetingId: 'meet-technova-today',
    summary: 'Prepared from your previous technical reviews with David.',
    quickContext:
      'David is VP Engineering at TechNova Solutions. He is evaluating engineering capacity before committing to a rollout window.',
    previousDiscussions: [
      'Architecture constraints',
      'Engineering capacity',
      'Rollout timing',
    ],
    pendingFollowUps: [],
    keyInsights: [
      'Capacity is the current decision bottleneck, not product interest.',
      'A clear architecture walkthrough will land better than a sales recap.',
    ],
    suggestedAgenda: [
      'Recap architecture constraints',
      'Review capacity assumptions',
      'Propose a realistic rollout window',
    ],
    suggestedQuestions: [
      'What would need to be true for your team to take this on this quarter?',
      'Which architecture constraints still feel unclear?',
    ],
    memoriesUsed: 4,
  },
  {
    meetingId: 'meet-acme-thu',
    summary: 'Prepared from your previous product conversations with Sarah.',
    quickContext:
      'Sarah is Product Director at Acme Corporation. This working session should convert the product discussion into a practical launch sequence.',
    previousDiscussions: ['Q4 product discussion', 'Launch sequencing', 'Implementation trade-offs'],
    pendingFollowUps: ['Share a concise product discussion brief'],
    keyInsights: [
      'Sarah prefers product framing before technical depth.',
      'Thursday is the right moment to lock sequencing, not reopen strategy.',
    ],
    suggestedAgenda: [
      'Confirm the product narrative',
      'Sequence the remaining launch work',
      'Assign owners for open questions',
    ],
    suggestedQuestions: [
      'Which launch items still feel under-owned?',
      'What would you want decided before the end of this session?',
    ],
    memoriesUsed: 3,
  },
  {
    meetingId: 'meet-abc-pricing',
    summary: 'Prepared from your pricing and demo conversation with Rahul.',
    quickContext:
      'This completed conversation covered pricing after security and API integration had already been raised.',
    previousDiscussions: ['Pricing', 'Technical demo', 'API integration'],
    pendingFollowUps: ['API documentation', 'Technical demo'],
    keyInsights: [
      'Pricing landed after technical risk was already on the table.',
      'Rahul is likely to reopen security before agreeing commercial terms.',
    ],
    suggestedAgenda: [
      'Recap the pricing discussion',
      'Reconnect it to security follow-ups',
      'Confirm what the demo needs to prove',
    ],
    suggestedQuestions: [
      'Which commercial questions are still open?',
      'Should the demo happen before another pricing conversation?',
    ],
    memoriesUsed: 5,
  },
  {
    meetingId: 'meet-abc-security',
    summary: 'Prepared from your security review with Rahul.',
    quickContext:
      'Security requirements were a recurring theme and later became the reason for a follow-up.',
    previousDiscussions: ['Security requirements', 'API integration'],
    pendingFollowUps: ['Follow up on unresolved security concerns'],
    keyInsights: [
      'Security concerns appeared in 3 previous meetings.',
      'Rahul tends to focus on technical implementation details.',
    ],
    suggestedAgenda: [
      'Restate the security requirements',
      'Identify what is still unresolved',
      'Agree what documentation would close the loop',
    ],
    suggestedQuestions: [
      'Which requirements are still blocking a recommendation?',
      'What evidence would make this feel settled for your team?',
    ],
    memoriesUsed: 5,
  },
]

export const assistantSeedMessages: ChatMessage[] = [
  {
    id: 'chat-1',
    role: 'user',
    text: 'Prepare me for my meeting with Rahul tomorrow.',
  },
  {
    id: 'chat-2',
    role: 'assistant',
    text: 'I found 5 relevant memories from your previous interactions with Rahul. Here is what you should know before the meeting.',
    meetingId: 'meet-abc-tomorrow',
  },
  {
    id: 'chat-3',
    role: 'user',
    text: 'What did I promise him last time?',
  },
  {
    id: 'chat-4',
    role: 'assistant',
    text: 'I found 2 open commitments from your previous conversations with Rahul.',
    memoryIds: ['mem-1', 'mem-2'],
  },
]

export function getCompany(companyId: string): Company | undefined {
  return companies.find((company) => company.id === companyId)
}

export function getContact(contactId: string): Contact | undefined {
  return contacts.find((contact) => contact.id === contactId)
}

export function getMeeting(meetingId: string): Meeting | undefined {
  return meetings.find((meeting) => meeting.id === meetingId)
}

export function getBrief(meetingId: string): MeetingBrief | undefined {
  return meetingBriefs.find((brief) => brief.meetingId === meetingId)
}

export function getUpcomingMeetings(): Meeting[] {
  return meetings.filter((meeting) => meeting.status !== 'completed')
}

export function getTodaysMeetings(): Meeting[] {
  return meetings.filter((meeting) => meeting.dateLabel === 'Today')
}

export function getPendingCommitments(): MemoryItem[] {
  return memories
    .filter(
      (memory) =>
        memory.status === 'Pending' &&
        (memory.category === 'commitments' || memory.category === 'follow-ups'),
    )
    .slice(0, 2)
}
