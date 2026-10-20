/** Formats a byte count for people: 1.2 MB, 48 KB, 12 B. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '?'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const digits = unit === 0 ? 0 : value < 10 ? 1 : 0
  return `${value.toFixed(digits)} ${units[unit]}`
}

/** A number padded with zeros to a fixed width, for a readout: pad(7) is "007", pad(7, 2) is "07". */
export function pad(value: number, width = 3): string {
  return String(Math.max(0, Math.round(value))).padStart(width, '0')
}

/** An ISO date as a readout: 2026.10.20. Empty for a missing date. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (!iso || Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}.${pad(date.getMonth() + 1, 2)}.${pad(date.getDate(), 2)}`
}
