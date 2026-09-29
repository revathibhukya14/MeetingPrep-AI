import { useRef, useState } from 'react'
import { ChatInput } from '../components/assistant/ChatInput'
import { ChatMessage } from '../components/assistant/ChatMessage'
import { PageHeader } from '../components/layout/PageHeader'
import { chatWithAssistant } from '../services/api'
import type { ChatMessage as ChatMessageType } from '../types'

const welcomeMessage: ChatMessageType = {
  id: 'assistant-welcome',
  role: 'assistant',
  text: 'Tell me who you are meeting with. I will look for relevant conversations and prepare a focused brief from what has actually been remembered.',
}

export function Assistant() {
  const [conversationId] = useState(() => crypto.randomUUID())
  const [messages, setMessages] = useState<ChatMessageType[]>([welcomeMessage])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingText, setLoadingText] = useState('Thinking...')
  const endRef = useRef<HTMLDivElement>(null)

  function getLoadingText(message: string): string {
    const normalized = message.toLowerCase()
    if (/prepare|prep|brief|do it|go ahead|what should i know/.test(normalized)) return 'Preparing your meeting brief...'
    if (/remember|recall|previous discussion|what did .* discuss/.test(normalized)) return 'Checking what I remember...'
    if (/meeting list|meetings do i have|upcoming meetings|check .* meetings/.test(normalized)) return 'Checking your meetings...'
    if (/asked|requested|promised|agreed|prefers|wants|pending|follow-up/.test(normalized)) return 'Remembering this meeting detail...'
    return 'Thinking...'
  }

  async function send() {
    const text = draft.trim()
    if (!text || sending) return

    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
    }
    setMessages((current) => [...current, userMessage])
    setDraft('')
    setSending(true)
    setLoadingText(getLoadingText(text))

    try {
      const response = await chatWithAssistant(text, conversationId)
      setMessages((current) => [...current, response])
    } catch (requestError) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: requestError instanceof Error ? requestError.message : 'The assistant could not complete that request.',
        },
      ])
    } finally {
      setSending(false)
      window.setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-7rem)] flex-col">
      <PageHeader
        title="MeetingPrep AI"
        subtitle="A little context goes a long way before the next conversation."
      />
      <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
          {sending ? <p role="status" className="pl-11 text-sm text-muted">{loadingText}</p> : null}
          <div ref={endRef} />
        </div>
        <div className="border-t border-line p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              'Prepare me for my meeting with Rahul tomorrow.',
              'What should I remember about Rahul at ABC Technologies?',
              'Prepare me for my meeting with Sarah.',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={sending}
                onClick={() => setDraft(prompt)}
                className="rounded-full border border-line bg-canvas px-3 py-1.5 text-left text-xs text-ink-soft transition-colors hover:border-line-strong hover:text-ink disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <ChatInput value={draft} onChange={setDraft} onSend={() => void send()} disabled={sending} />
        </div>
      </div>
    </div>
  )
}
