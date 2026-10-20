import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * A key: ink face, 1 px edge, 2 px corners. Pressed, the edge turns silk; the face never changes.
 * Latched, a 2 px accent rule runs along the bottom edge. The same key as in the dojosha web app.
 */
const buttonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xs bg-ink text-[15px] font-bold uppercase tracking-[0.04em] text-silk outline-none select-none disabled:pointer-events-none disabled:text-silk-off [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border border-edge active:border-silk disabled:border-rule',
        ghost: 'text-silk-dim active:text-silk',
        warn: 'border border-sig-warn text-sig-warn',
      },
      size: {
        default: 'h-11 px-4',
        lg: 'h-14 px-5',
        sm: 'h-8 px-3 text-[12px] tracking-[0.14em]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const accents = {
  sound: 'bg-acc-sound',
  image: 'bg-acc-image',
  white: 'bg-acc-white',
  ok: 'bg-sig-ok',
  warn: 'bg-sig-warn',
} as const

export type Accent = keyof typeof accents

/** The accent rule along the bottom edge of a latched key. */
function LatchRule({ accent = 'white' }: { accent?: Accent }) {
  return <span aria-hidden="true" className={cn('absolute inset-x-0 -bottom-px h-0.5', accents[accent])} />
}

function Button({
  className,
  variant,
  size,
  latched,
  accent,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Draws the accent rule along the bottom edge. */
    latched?: boolean
    accent?: Accent
  }) {
  return (
    <button
      data-slot="button"
      data-latched={latched || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      {latched ? <LatchRule accent={accent} /> : null}
    </button>
  )
}

export { Button, LatchRule, buttonVariants, accents }
