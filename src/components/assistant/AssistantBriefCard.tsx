import type { MeetingBrief as MeetingBriefType } from '../../types'
import { MemoriesUsedChip } from '../ui/MemoriesUsedChip'

interface AssistantBriefCardProps {
  brief: MeetingBriefType
}

export function AssistantBriefCard({ brief }: AssistantBriefCardProps) {
  return (
    <article className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
      <div className="border-b border-line bg-memory-soft px-4 py-3">
        <MemoriesUsedChip count={brief.memoriesUsed} />
      </div>
      <div className="space-y-4 p-4">
        <p className="text-sm leading-relaxed text-ink-soft">{brief.quickContext}</p>
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
            Suggested agenda
          </p>
          <ol className="mt-2 space-y-1.5">
            {brief.suggestedAgenda.map((item, index) => (
              <li key={item} className="text-sm text-ink">
                <span className="mr-2 font-display text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  )
}
