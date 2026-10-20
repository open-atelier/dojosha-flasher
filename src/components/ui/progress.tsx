import type * as React from 'react'
import { type Accent, accents } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** A hairline well that fills in an accent. No transition: it jumps, as on the device. */
function Progress({
  className,
  value,
  accent = 'white',
  label,
  ...props
}: React.ComponentProps<'div'> & { value: number; accent?: Accent; label: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      data-slot="progress"
      className={cn('relative h-1.5 w-full overflow-hidden border border-rule bg-ink', className)}
      {...props}
    >
      <div className={cn('h-full', accents[accent])} style={{ width: `${clamped}%` }} />
    </div>
  )
}

export { Progress }
