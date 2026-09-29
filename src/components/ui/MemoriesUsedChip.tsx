interface MemoriesUsedChipProps {
  count: number
}

export function MemoriesUsedChip({ count }: MemoriesUsedChipProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-memory/15 bg-memory-soft px-3 py-1.5 text-sm font-medium text-memory">
      <span aria-hidden="true">🧠</span>
      {count} relevant memories used
    </div>
  )
}
