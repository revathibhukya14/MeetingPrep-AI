interface BadgeProps {
  children: string
  tone?: 'neutral' | 'warm' | 'accent' | 'memory'
}

const tones: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-canvas text-ink-soft border-line',
  warm: 'bg-warm-soft text-warm border-warm/15',
  accent: 'bg-accent-soft text-accent border-accent/10',
  memory: 'bg-memory-soft text-memory border-memory/10',
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
