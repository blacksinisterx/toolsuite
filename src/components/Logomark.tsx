/** ToolSuite's mark: four rounded tiles in a loose grid, two solid (the
 * gradient), two outlined -- "a suite of tools," not a wrench/shield
 * cliche. Scales cleanly from favicon to header size. */
export function Logomark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--bg-sunken)" />
      <rect x="5" y="5" width="10" height="10" rx="3" fill="url(#ts-grad)" />
      <rect x="17" y="17" width="10" height="10" rx="3" fill="url(#ts-grad)" opacity="0.55" />
      <rect x="17.75" y="5.75" width="8.5" height="8.5" rx="2.25" stroke="var(--accent2)" strokeWidth="1.5" />
      <rect x="5.75" y="17.75" width="8.5" height="8.5" rx="2.25" stroke="var(--accent)" strokeWidth="1.5" />
      <defs>
        <linearGradient id="ts-grad" x1="5" y1="5" x2="27" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent2)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
