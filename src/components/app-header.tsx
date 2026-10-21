import { cn } from '@/lib/utils'

/** The name Dōjōsha, with the macrons the Operator faces do not have. Inherits the text class around it. */
export function Dojosha() {
  return (
    <span aria-label="Dōjōsha">
      D<span className="te-macron">o</span>j<span className="te-macron">o</span>sha
    </span>
  )
}

/** The Dōjōsha mark. */
export function Mark() {
  return (
    <span className="te-mark">
      <Dojosha />
    </span>
  )
}

export interface Reading {
  legend: string
  value: string
}

/**
 * The status strip, as on the device and in the dojosha web app: mark, mode word, and a readout
 * at the right. Beneath it three readings.
 */
export function AppHeader({
  readout,
  readoutClass,
  readings,
}: {
  readout: string
  readoutClass?: string
  readings: [Reading, Reading, Reading]
}) {
  return (
    <header className="sticky top-0 z-10 -mx-4 flex flex-col bg-ink px-4 pt-2">
      <div className="flex h-7 items-center gap-3 border-b">
        <h1 className="flex items-center gap-3">
          <Mark />
          <span className="te-legend">Flasher</span>
        </h1>
        <span className={cn('te-readout ml-auto text-sm', readoutClass ?? 'text-silk-off')} aria-live="polite">
          {readout}
        </span>
      </div>
      <dl className="grid grid-cols-3 gap-4 py-3">
        {readings.map(({ legend, value }) => (
          <div key={legend} className="flex min-w-0 flex-col gap-1">
            <dt className="te-legend truncate">{legend}</dt>
            <dd className="te-readout truncate text-[15px] text-silk">{value}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}
