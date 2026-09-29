interface InsightCardProps {
  insight: string
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <article className="rounded-2xl border border-memory/10 bg-memory-soft px-4 py-4 text-[15px] leading-relaxed text-ink">
      “{insight}”
    </article>
  )
}
