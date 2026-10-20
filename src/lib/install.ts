import type { FlashState, Manifest } from 'esp-web-tools/dist/const.js'
import { flash } from 'esp-web-tools/dist/flash.js'
import { useCallback, useRef, useState } from 'react'

/** The steps of an install, in order. ERASE runs only for a clean install. */
export const STEPS = ['port', 'connect', 'erase', 'write', 'restart'] as const
export type Step = (typeof STEPS)[number]

export type InstallStatus = 'idle' | 'running' | 'done' | 'error'

export interface InstallState {
  status: InstallStatus
  /** The step that runs, or the one that failed. */
  step: Step
  /** 0 to 100, for WRITE. */
  percent: number
  chip?: string
  error?: string
  log: string[]
}

const initial: InstallState = { status: 'idle', step: 'port', percent: 0, log: [] }

/**
 * esp-web-tools declares its states as a `const enum`, which isolatedModules cannot read.
 * The values are plain strings at run time.
 */
interface RawState {
  state: 'initializing' | 'preparing' | 'erasing' | 'writing' | 'finished' | 'error'
  message: string
  chipFamily?: string
  details?: { done?: boolean; percentage?: number; error?: string; details?: unknown }
}

/** Plain words for the esp-web-tools errors. */
function explain(raw: RawState): string {
  switch (raw.details?.error) {
    case 'failed_initialize':
      return 'The board did not answer. Hold BOOT, press and release RESET, release BOOT, then install again.'
    case 'not_supported':
      return `This board is an ${raw.chipFamily ?? 'unknown chip'}. Dōjōsha runs only on an ESP32–S3.`
    case 'write_failed':
      return `The write stopped: ${raw.message}. Check the cable, then install again. The board keeps working in download mode until it has firmware.`
    default:
      return raw.message
  }
}

/**
 * Runs one install: asks for the serial port, then flashes `image` at 0x0 through
 * esp-web-tools. Call `start` from a click: the browser shows the port list only for a user gesture.
 */
export function useInstall() {
  const [state, setState] = useState<InstallState>(initial)
  const running = useRef(false)
  /** The last percent written to the log: the log keeps every tenth percent, not every packet. */
  const logged = useRef(-1)

  const update = useCallback((patch: Partial<InstallState>, line?: string) => {
    setState((s) => ({ ...s, ...patch, log: line ? [...s.log, line] : s.log }))
  }, [])

  const start = useCallback(
    async ({ image, erase, name, version }: { image: Blob; erase: boolean; name: string; version: string }) => {
      if (running.current) return
      running.current = true
      logged.current = -1
      setState({ ...initial, status: 'running', log: [] })

      let port: SerialPort
      try {
        port = await navigator.serial.requestPort()
      } catch {
        // The user closed the list without a port.
        setState(initial)
        running.current = false
        return
      }
      const info = port.getInfo()
      const ids =
        info.usbVendorId !== undefined
          ? ` (USB ${hex(info.usbVendorId)}:${hex(info.usbProductId ?? 0)})`
          : ''
      update({ step: 'connect' }, `Port chosen${ids}`)

      // flash() fetches every part by URL. A blob URL keeps the image that was already downloaded.
      const url = URL.createObjectURL(image)
      const manifest: Manifest = {
        name,
        version,
        builds: [{ chipFamily: 'ESP32-S3', parts: [{ path: url, offset: 0 }] }],
      }

      const onEvent = (event: FlashState) => {
        const raw = event as unknown as RawState
        switch (raw.state) {
          case 'initializing':
            update({ step: 'connect', chip: raw.chipFamily }, raw.message)
            break
          case 'preparing':
            update({}, raw.message)
            break
          case 'erasing':
            update({ step: 'erase' }, raw.message)
            break
          case 'writing': {
            const percent = raw.details?.percentage ?? 0
            const tenth = percent - (percent % 10)
            const line = tenth > logged.current ? `Writing ${tenth}%` : undefined
            logged.current = tenth
            update({ step: 'write', percent }, line)
            break
          }
          case 'finished':
            update({ status: 'done', step: 'restart', percent: 100 }, 'Done. The board restarts.')
            break
          case 'error':
            setState((s) => ({ ...s, status: 'error', error: explain(raw), log: [...s.log, `Error: ${raw.message}`] }))
            break
        }
      }

      try {
        await flash(onEvent, port, location.href, manifest, erase)
      } catch (error) {
        // flash() reports most failures as events. Erasing and closing the port can still throw.
        const message = error instanceof Error ? error.message : String(error)
        setState((s) => ({ ...s, status: 'error', error: message, log: [...s.log, `Error: ${message}`] }))
        await port.close().catch(() => {})
      } finally {
        URL.revokeObjectURL(url)
        running.current = false
      }
    },
    [update],
  )

  const reset = useCallback(() => {
    if (!running.current) setState(initial)
  }, [])

  return { state, start, reset }
}

function hex(value: number): string {
  return value.toString(16).padStart(4, '0')
}

/** Web Serial exists only in Chromium browsers on a computer (Chrome, Edge, Opera). */
export const serialSupported = typeof navigator !== 'undefined' && 'serial' in navigator
