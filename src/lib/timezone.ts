/** All conversion here runs on the browser's own built-in IANA timezone
 * database via Intl -- no library, always as accurate/up to date as the
 * browser itself, and handles DST correctly for every real zone. */

export function allTimeZones(): string[] {
  // Intl.supportedValuesOf is widely available in modern browsers; a
  // handful of well-known zones as a fallback keeps the tool usable on
  // anything older instead of showing an empty list.
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return [
      'UTC', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Tokyo', 'Asia/Shanghai',
      'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Australia/Sydney', 'Australia/Perth',
      'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Pacific/Auckland',
    ]
  }
}

/** The UTC offset (in ms) a given IANA zone has at a specific instant --
 * varies with DST, so this must be computed per-instant, not cached. */
function offsetMsAt(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const parts: Record<string, string> = {}
  for (const p of dtf.formatToParts(date)) parts[p.type] = p.value
  // Intl reports hour "24" for midnight in some locales/zones -- normalize.
  const hour = parts.hour === '24' ? '00' : parts.hour
  const asIfUTC = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(hour), Number(parts.minute), Number(parts.second))
  return asIfUTC - date.getTime()
}

/** Interprets a wall-clock date+time as belonging to `timeZone` and
 * returns the real UTC instant it represents. Two passes handle the rare
 * case where the offset itself changes between the guess and the answer
 * (right around a DST transition). */
export function zonedTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const naive = new Date(`${dateStr}T${timeStr}:00Z`)
  const offset1 = offsetMsAt(naive, timeZone)
  const guess = new Date(naive.getTime() - offset1)
  const offset2 = offsetMsAt(guess, timeZone)
  return new Date(naive.getTime() - offset2)
}

export interface ZonedResult {
  timeZone: string
  label: string
  time: string
  date: string
  weekday: string
  utcOffset: string
  offsetHours: number // this zone's UTC offset in hours, at the given instant
  hour24: number // for day/night visualization
}

/** This zone's UTC offset, in hours, at a specific instant (varies with DST). */
export function offsetHoursAt(instant: Date, timeZone: string): number {
  return offsetMsAt(instant, timeZone) / 3600000
}

export function formatInZone(instant: Date, timeZone: string): ZonedResult {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: true,
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
  const parts: Record<string, string> = {}
  for (const p of dtf.formatToParts(instant)) parts[p.type] = p.value

  const hourDtf = new Intl.DateTimeFormat('en-US', { timeZone, hour12: false, hour: '2-digit' })
  const hour24 = Number(hourDtf.format(instant).replace('24', '0'))

  const offsetHours = offsetHoursAt(instant, timeZone)
  const sign = offsetHours >= 0 ? '+' : '-'
  const abs = Math.abs(offsetHours * 60)
  const utcOffset = `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`

  return {
    timeZone,
    label: cityLabel(timeZone),
    time: `${parts.hour}:${parts.minute} ${parts.dayPeriod}`,
    date: `${parts.month} ${parts.day}, ${parts.year}`,
    weekday: parts.weekday,
    utcOffset,
    offsetHours,
    hour24,
  }
}

export function cityLabel(timeZone: string): string {
  if (timeZone === 'UTC') return 'UTC'
  const parts = timeZone.split('/')
  const city = (parts[parts.length - 1] ?? timeZone).replace(/_/g, ' ')
  const region = parts[0]
  return `${city} (${region})`
}

export const POPULAR_ZONES = [
  'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Dhaka', 'Asia/Shanghai', 'Asia/Tokyo',
  'Asia/Jakarta', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'Africa/Cairo', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Australia/Sydney', 'Australia/Perth', 'Pacific/Auckland', 'UTC',
]
