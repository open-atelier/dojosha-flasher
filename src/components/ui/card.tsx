import type * as React from 'react'
import { cn } from '@/lib/utils'

/** A group on the panel: no box, no shadow. A hairline above and whitespace around do the work. */
function Card({ className, ...props }: React.ComponentProps<'section'>) {
  return <section data-slot="card" className={cn('flex flex-col gap-4 border-t pt-3', className)} {...props} />
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 data-slot="card-title" className={cn('te-legend', className)} {...props} />
}

/** Right of the title: a count or a readout. */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-action" className={cn('te-readout text-sm text-silk', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('te-prose col-span-2', className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn(className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardAction, CardDescription, CardContent }
