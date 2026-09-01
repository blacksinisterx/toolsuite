export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="w-full" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      {label && <p className="mb-1.5 text-xs text-text-muted">{label}</p>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-sunken">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}
