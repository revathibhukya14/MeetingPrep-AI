import type { FormEvent } from 'react'
import { ArrowUp } from 'lucide-react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export function ChatInput({ value, onChange, onSend, disabled = false }: ChatInputProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSend()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-2xl border border-line bg-white p-2 shadow-[0_8px_24px_rgba(20,23,28,0.05)]"
    >
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ask MeetingPrep AI..."
        rows={1}
        className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-muted"
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSend()
          }
        }}
      />
      <button
        type="submit"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white transition-colors hover:bg-accent-hover"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
      >
        <ArrowUp size={18} />
      </button>
    </form>
  )
}
