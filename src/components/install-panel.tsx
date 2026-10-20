import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Glyph } from '@/components/ui/glyph'
import { Progress } from '@/components/ui/progress'
import { type InstallState, STEPS, type Step } from '@/lib/install'
import { pad } from '@/lib/format'
import { cn } from '@/lib/utils'

export type InstallMode = 'update' | 'clean'

const modes: { id: InstallMode; label: string; description: string }[] = [
  {
    id: 'update',
    label: 'Update',
    description: 'Writes the firmware and keeps the settings: volume, startup sound, background, Wi–Fi.',
  },
  {
    id: 'clean',
    label: 'Clean',
    description:
      'Erases the whole flash first, then writes the firmware. The settings go back to the defaults. Use it for the first install, or when the board does not start. Files on the SD card stay.',
  },
]

const stepLabels: Record<Step, string> = {
  port: 'Port',
  connect: 'Connect',
  erase: 'Erase',
  write: 'Write',
  restart: 'Restart',
}

/** The install: mode, the INSTALL key, and the steps with their state. */
export function InstallPanel({
  state,
  mode,
  onModeChange,
  onInstall,
  canInstall,
  blocker,
  version,
}: {
  state: InstallState
  mode: InstallMode
  onModeChange: (mode: InstallMode) => void
  onInstall: () => void
  canInstall: boolean
  /** Why the INSTALL key is off, when it is. */
  blocker?: string
  version?: string
}) {
  const running = state.status === 'running'
  const steps = STEPS.filter((step) => step !== 'erase' || mode === 'clean')
  const current = steps.indexOf(state.step)
  const label =
    state.status === 'running'
      ? 'Installing'
      : state.status === 'done'
        ? 'Install again'
        : state.status === 'error'
          ? 'Try again'
          : 'Install'

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="te-readout">03</span> Install
        </CardTitle>
        <CardDescription>{modes.find((m) => m.id === mode)?.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Mode">
          {modes.map((m) => (
            <Button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              latched={mode === m.id}
              accent={m.id === 'clean' ? 'warn' : 'white'}
              disabled={running}
              onClick={() => onModeChange(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <Button type="button" size="lg" disabled={!canInstall || running} onClick={onInstall}>
          <Glyph name={state.status === 'error' ? 'retry' : 'install'} />
          {label}
        </Button>
        {blocker && !running ? <p className="te-prose text-center">{blocker}</p> : null}

        {state.status !== 'idle' ? (
          <ol className="flex flex-col" aria-label="Steps">
            {steps.map((step, index) => (
              <StepRow
                key={step}
                index={index}
                label={stepLabels[step]}
                state={rowState(state, index, current)}
                detail={detail(state, step)}
              />
            ))}
          </ol>
        ) : null}

        {state.status === 'running' && state.step === 'write' ? (
          <Progress label="Write" value={state.percent} />
        ) : null}

        {state.status === 'error' ? (
          <Alert variant="destructive">
            <AlertTitle className="text-sig-warn">Install stopped</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.status === 'done' ? (
          <Alert>
            <AlertTitle>Installed{version ? ` V.${version}` : ''}</AlertTitle>
            <AlertDescription>
              The board restarts with the new firmware. If the screen stays dark, press RESET on the board.
            </AlertDescription>
          </Alert>
        ) : null}

        {state.log.length > 0 ? (
          <details className="border-t pt-3">
            <summary className="te-legend cursor-pointer select-none active:text-silk">
              Log <span className="te-readout">{pad(state.log.length, 2)}</span>
            </summary>
            <pre className="te-literal mt-3 overflow-x-auto text-[12px] leading-5 whitespace-pre-wrap text-silk-dim">
              {state.log.join('\n')}
            </pre>
          </details>
        ) : null}
      </CardContent>
    </Card>
  )
}

type RowState = 'wait' | 'run' | 'ok' | 'err'

function rowState(state: InstallState, index: number, current: number): RowState {
  if (state.status === 'done') return 'ok'
  if (index < current) return 'ok'
  if (index > current) return 'wait'
  return state.status === 'error' ? 'err' : 'run'
}

function detail(state: InstallState, step: Step): string | undefined {
  if (step === 'port' && state.status === 'running' && state.step === 'port') return 'Pick the port'
  if (step === 'connect' && state.chip) return state.chip
  if (step === 'write' && (state.step === 'write' || state.status === 'done')) return `${pad(state.percent)}%`
  return undefined
}

const marks: Record<RowState, { text: string; className: string }> = {
  wait: { text: '–', className: 'text-silk-off' },
  run: { text: 'Run', className: 'text-silk' },
  ok: { text: 'OK', className: 'text-sig-ok' },
  err: { text: 'Err', className: 'text-sig-warn' },
}

function StepRow({ index, label, state, detail }: { index: number; label: string; state: RowState; detail?: string }) {
  const mark = marks[state]
  return (
    <li className="grid h-9 grid-cols-[2rem_1fr_auto_3rem] items-center gap-3 border-b last:border-b-0">
      <span className="te-readout text-sm text-silk-dim">{pad(index + 1, 2)}</span>
      <span className={cn('te-legend', state === 'wait' ? 'text-silk-off' : 'text-silk')}>{label}</span>
      <span className="te-readout truncate text-sm text-silk-dim">{detail}</span>
      <span className={cn('te-readout text-right text-sm uppercase', mark.className)}>{mark.text}</span>
    </li>
  )
}
