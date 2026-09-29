import { BookmarkCheck, Sparkles } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '../../types'
import { AssistantBriefCard } from './AssistantBriefCard'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const brief = message.brief
  const memoriesUsed = message.memoriesUsed ?? []

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-3xl items-start gap-3 ${isUser ? 'w-fit flex-row-reverse' : 'w-full'}`}>
        {!isUser ? (
          <span className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <Sparkles size={15} aria-hidden="true" />
          </span>
        ) : null}
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-br-md bg-accent px-4 py-3 text-sm leading-relaxed text-white'
              : 'rounded-2xl rounded-bl-md border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink'
          }
        >
          <p className={`mb-1 text-[11px] font-semibold tracking-[0.08em] ${isUser ? 'text-white/70' : 'text-muted'}`}>
            {isUser ? 'You' : 'MeetingPrep AI'}
          </p>
          {message.text}
          {!isUser && brief ? <AssistantBriefCard brief={brief} /> : null}
          {!isUser && memoriesUsed.length > 0 ? (
            <section className="mt-4 border-t border-line pt-3">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink">
                <BookmarkCheck size={15} className="text-memory" aria-hidden="true" />
                What I Remember
              </h3>
              <ul className="divide-y divide-line">
                {memoriesUsed.map((memory, index) => (
                  <li key={`${memory.text}-${index}`} className="py-2 text-sm text-ink-soft">
                    {memory.text}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
