import { type BoardId, boards } from '@/boards'
import { LatchRule } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { pad } from '@/lib/format'

/** One tall key for each board. The chip is the same on every board, so the user picks. */
export function BoardPicker({
  value,
  onChange,
  disabled,
}: {
  value: BoardId | undefined
  onChange: (id: BoardId) => void
  disabled?: boolean
}) {
  const selected = boards.find((b) => b.id === value)
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="te-readout">01</span> Board
        </CardTitle>
        <CardAction>{pad(boards.length, 2)}</CardAction>
        <CardDescription>
          {selected ? selected.port : 'Pick the board you install on. Each one needs its own firmware.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Board">
        {boards.map((board, index) => {
          const checked = board.id === value
          return (
            <button
              key={board.id}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => onChange(board.id)}
              className="relative flex flex-col items-start gap-2 rounded-xs border border-edge bg-ink p-3 text-left outline-none select-none active:border-silk disabled:text-silk-off"
            >
              <span className="flex w-full items-baseline gap-3">
                <span className="te-readout text-sm text-silk-dim">{pad(index + 1, 2)}</span>
                <span className="te-readout text-[15px] text-silk">{board.name}</span>
              </span>
              <span className="te-legend text-silk">{board.title}</span>
              <span className="te-prose">{board.parts.join(' · ')}</span>
              {checked ? <LatchRule /> : null}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
