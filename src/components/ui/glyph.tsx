import type * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Silkscreen glyphs: flat, single-weight, square corners, built from circle, square,
 * triangle and line. The same drawing rules as the dojosha web app.
 */
const paths = {
  check: <path d="M3.5 9.5l3.5 3.5 7.5-8" />,
  chevron: <path d="M4.5 7l4.5 4.5L13.5 7" />,
  close: <path d="M4 4l10 10M14 4L4 14" />,
  /** Down into the board: install. */
  install: <path d="M9 2.5v9M4.5 7L9 11.5 13.5 7M3 15.5h12" />,
  /** Out of the page: a link to another site. */
  external: <path d="M7 4H3.5v10.5H14V11M10 3.5h4.5V8M14.5 3.5L8 10" />,
  retry: <path d="M14.5 9A5.5 5.5 0 1 1 12.5 4.8M13 2v3.5H9.5" />,
} as const

export type GlyphName = keyof typeof paths

export function Glyph({ name, className, ...props }: { name: GlyphName } & React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className={cn('size-4.5 shrink-0', className)}
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
