import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { BoardPicker } from '@/components/board-picker'
import { FirmwarePicker, type ImageDownload } from '@/components/firmware-picker'
import { Footer, Help, NextSteps, UnsupportedBrowser } from '@/components/guide'
import { type InstallMode, InstallPanel } from '@/components/install-panel'
import { type BoardId, findBoard } from '@/boards'
import { formatBytes, pad } from '@/lib/format'
import { serialSupported, useInstall } from '@/lib/install'
import { downloadImage, fetchReleases } from '@/lib/releases'

/** The board sits in the URL (?board=fnk0104b), so that a link can name it. */
function useBoardParam() {
  const [board, setBoard] = useState<BoardId | undefined>(
    () => findBoard(new URLSearchParams(location.search).get('board'))?.id,
  )
  useEffect(() => {
    const url = new URL(location.href)
    if (board) url.searchParams.set('board', board)
    else url.searchParams.delete('board')
    history.replaceState(null, '', url)
  }, [board])
  return [board, setBoard] as const
}

export function App() {
  const [boardId, setBoardId] = useBoardParam()
  const [tag, setTag] = useState<string>()
  const [mode, setMode] = useState<InstallMode>('update')
  const [progress, setProgress] = useState(0)
  const install = useInstall()

  const releases = useQuery({ queryKey: ['releases'], queryFn: fetchReleases, staleTime: 5 * 60_000, retry: 1 })
  const list = releases.data ?? []
  const release = list.find((r) => r.tag === tag) ?? list.find((r) => !r.prerelease) ?? list[0]
  const board = findBoard(boardId)
  const image = release?.images.find((i) => i.board === boardId)

  // The image downloads as soon as board and version are picked. A blob stays in memory for the session.
  const blob = useQuery({
    queryKey: ['image', image?.url],
    queryFn: () => {
      setProgress(0)
      return downloadImage(image!, setProgress)
    },
    enabled: Boolean(image),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  })
  const download: ImageDownload = blob.data
    ? { status: 'ready', progress: 1 }
    : blob.isError
      ? { status: 'error', progress: 0, error: blob.error.message }
      : blob.isFetching
        ? { status: 'pending', progress }
        : { status: 'idle', progress: 0 }

  const state = install.state
  const running = state.status === 'running'

  const blocker = !serialSupported
    ? 'Web Serial is needed: Chrome, Edge or Opera on a computer.'
    : !board
      ? 'Pick a board first.'
      : !release
        ? releases.isPending
          ? 'Loading the releases.'
          : 'No release to install.'
        : !image
          ? 'Pick a version that has an image for this board.'
          : download.status !== 'ready'
            ? 'Waiting for the download.'
            : undefined

  const readout =
    state.status === 'running'
      ? state.step === 'write'
        ? `${pad(state.percent)}%`
        : state.step.toUpperCase()
      : state.status === 'done'
        ? 'DONE'
        : state.status === 'error'
          ? 'ERR'
          : download.status === 'ready'
            ? 'READY'
            : '–'
  const readoutClass =
    state.status === 'done'
      ? 'text-sig-ok'
      : state.status === 'error'
        ? 'text-sig-warn'
        : state.status === 'running' || download.status === 'ready'
          ? 'text-silk'
          : undefined

  // Leaving during a write leaves the board without firmware. Ask the browser to warn.
  useEffect(() => {
    if (!running) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    addEventListener('beforeunload', warn)
    return () => removeEventListener('beforeunload', warn)
  }, [running])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-5 px-4 pb-10">
      <AppHeader
        readout={readout}
        readoutClass={readoutClass}
        readings={[
          { legend: 'Board', value: board?.name ?? '–' },
          { legend: 'Firmware', value: release ? `V.${release.version}` : '–' },
          { legend: 'Size', value: image ? formatBytes(image.size) : '–' },
        ]}
      />
      {!serialSupported ? <UnsupportedBrowser /> : null}
      <main className="flex flex-col gap-5">
        <BoardPicker
          value={boardId}
          disabled={running}
          onChange={(id) => {
            setBoardId(id)
            install.reset()
          }}
        />
        <FirmwarePicker
          board={board}
          releases={list}
          loading={releases.isPending}
          error={releases.error?.message}
          release={release}
          image={image}
          download={download}
          disabled={running}
          onChange={(next) => {
            setTag(next)
            install.reset()
          }}
          onRetry={() => void blob.refetch()}
        />
        <InstallPanel
          state={state}
          mode={mode}
          onModeChange={(next) => {
            setMode(next)
            install.reset()
          }}
          canInstall={!blocker}
          blocker={blocker}
          version={release?.version}
          onInstall={() => {
            if (!board || !release || !blob.data) return
            void install.start({
              image: blob.data,
              erase: mode === 'clean',
              name: `Dōjōsha ${board.name}`,
              version: release.version,
            })
          }}
        />
        <NextSteps />
        <Help />
      </main>
      <Footer />
    </div>
  )
}
