import type * as React from 'react'
import { type Accent, accents } from '@/components/ui/button'
import { Glyph } from '@/components/ui/glyph'
import { cn } from '@/lib/utils'

/**
 * A key that shows its value and opens the native list, which works best on phones.
 * The accent rule along the bottom names the family of the value (SOUND, BACKGROUND).
 */
function NativeSelect({ className, children, accent, ...props }: React.ComponentProps<'select'> & { accent?: Accent }) {
  return (
    <div className="relative w-full">
      <select
        data-slot="native-select"
        className={cn(
          'h-11 w-full appearance-none rounded-xs border border-edge bg-ink pr-10 pl-3 text-[15px] font-bold uppercase tracking-[0.04em] text-silk outline-none disabled:text-silk-off',
          'focus-visible:border-silk focus-visible:outline-none',
          'aria-invalid:border-sig-warn',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <Glyph name="chevron" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-silk-dim" />
      {accent ? <span aria-hidden="true" className={cn('absolute inset-x-0 bottom-0 h-0.5', accents[accent])} /> : null}
    </div>
  )
}

export { NativeSelect }
