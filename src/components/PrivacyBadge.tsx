export function PrivacyBadge({ processing }: { processing: 'client' | 'server' }) {
  const isClient = processing === 'client'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isClient ? 'border-success/30 bg-success-soft text-success' : 'border-warning/30 bg-warning-soft text-warning'
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {isClient ? 'Processed locally in your browser' : 'Processed temporarily, deleted right after'}
    </span>
  )
}
