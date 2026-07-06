export function hoursSince(isoTimestamp: string, now: number = Date.now()): number {
  const then = new Date(isoTimestamp).getTime()
  return Math.max(0, (now - then) / (1000 * 60 * 60))
}

export function minutesSince(isoTimestamp: string, now: number = Date.now()): number {
  return hoursSince(isoTimestamp, now) * 60
}

/** "2 minutes ago" / "5 hours ago" style relative label for the "Checked ..." UI copy. */
export function formatRelativeTime(isoTimestamp: string, now: number = Date.now()): string {
  const minutes = minutesSince(isoTimestamp, now)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${Math.round(minutes)} minute${Math.round(minutes) === 1 ? '' : 's'} ago`
  const hours = minutes / 60
  if (hours < 24) return `${Math.round(hours)} hour${Math.round(hours) === 1 ? '' : 's'} ago`
  const days = hours / 24
  return `${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'} ago`
}
