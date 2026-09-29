interface FilterOption<T extends string> {
  id: T
  label: string
}

interface FilterChipsProps<T extends string> {
  value: T
  options: FilterOption<T>[]
  onChange: (value: T) => void
}

export function FilterChips<T extends string>({
  value,
  options,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              active
                ? 'border-accent bg-accent text-white'
                : 'border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
