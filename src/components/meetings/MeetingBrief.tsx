import type { MeetingBrief as MeetingBriefType } from '../../types'
import { FollowUpCard } from './FollowUpCard'
import { InsightCard } from './InsightCard'

interface MeetingBriefProps {
  brief: MeetingBriefType
}

export function MeetingBrief({ brief }: MeetingBriefProps) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
      <div className="space-y-5">
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold tracking-[0.1em] text-ink uppercase">Quick Context</h2>
          </div>
          <p className="text-[15px] leading-relaxed text-ink-soft">{brief.quickContext}</p>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-[0.1em] text-ink uppercase">Previous Discussions</h2>
            <span className="text-xs text-muted">What you have covered</span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {brief.previousDiscussions.map((item) => (
              <li key={item} className="rounded-full border border-line bg-canvas px-3 py-1.5 text-sm text-ink-soft">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-[0.1em] text-ink uppercase">Suggested Agenda</h2>
            <span className="text-xs text-muted">A path for the conversation</span>
          </div>
          <ol className="space-y-0">
            {brief.suggestedAgenda.map((item, index) => (
              <li key={item} className="flex gap-4 border-l border-line pb-5 pl-4 last:border-transparent last:pb-0">
                <span className="-ml-[1.32rem] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-white font-display text-sm text-accent">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-[15px] leading-relaxed text-ink">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="space-y-3">
          <div className="px-1">
            <h2 className="text-sm font-semibold tracking-[0.1em] text-ink uppercase">Pending Follow-ups</h2>
            <p className="mt-1 text-xs text-muted">Open loops to bring into the conversation</p>
          </div>
          {brief.pendingFollowUps.length === 0 ? (
            <p className="border-l-2 border-line px-4 py-3 text-sm leading-relaxed text-muted">No open follow-ups to bring into this meeting.</p>
          ) : (
            brief.pendingFollowUps.map((item) => <FollowUpCard key={item} item={item} />)
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <h2 className="text-sm font-semibold tracking-[0.1em] text-ink uppercase">Key Insights</h2>
            <span className="text-xs text-memory">Patterns to keep in mind</span>
          </div>
          {brief.keyInsights.map((insight) => <InsightCard key={insight} insight={insight} />)}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold tracking-[0.1em] text-ink uppercase">Suggested Questions</h2>
          <ul className="space-y-4">
            {brief.suggestedQuestions.map((question, index) => (
              <li key={question} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                <span className="mt-0.5 font-display text-lg text-accent">{String(index + 1).padStart(2, '0')}</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  )
}
