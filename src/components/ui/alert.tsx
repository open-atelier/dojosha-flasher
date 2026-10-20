import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'
import { cn } from '@/lib/utils'

/** A message on the panel: a 2 px signal rule at the left, a legend, one line of prose. */
const alertVariants = cva('flex flex-col gap-1 border-l-2 py-1 pl-3', {
  variants: {
    variant: {
      default: 'border-sig-ok',
      destructive: 'border-sig-warn',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('te-legend text-silk', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('te-prose', className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
