import { Dojosha } from '@/components/app-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Glyph } from '@/components/ui/glyph'
import { NativeSelect } from '@/components/ui/native-select'
import { Progress } from '@/components/ui/progress'
import type { Board } from '@/boards'
import { config } from '@/config'
import { formatBytes, formatDate, pad } from '@/lib/format'
import type { FirmwareImage, Release } from '@/lib/releases'

export interface ImageDownload {
  status: 'idle' | 'pending' | 'ready' | 'error'
  /** 0 to 1. */
  progress: number
  error?: string
}

function releaseLabel(release: Release, latest: boolean): string {
  return [`V.${release.version}`, formatDate(release.publishedAt), release.prerelease ? 'Pre' : latest ? 'Latest' : '']
    .filter(Boolean)
    .join(' · ')
}

/**
 * The release to install, and the download of its image for the board. The image downloads
 * as soon as it is picked, so that the install starts without a wait and a failed download
 * shows before the port is open.
 */
export function FirmwarePicker({
  board,
  releases,
  loading,
  error,
  release,
  image,
  download,
  onChange,
  onRetry,
  disabled,
}: {
  board: Board | undefined
  releases: Release[]
  loading: boolean
  error?: string
  release: Release | undefined
  image: FirmwareImage | undefined
  download: ImageDownload
  onChange: (tag: string) => void
  onRetry: () => void
  disabled?: boolean
}) {
  const latestTag = releases.find((r) => !r.prerelease)?.tag
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="te-readout">02</span> Firmware
        </CardTitle>
        <CardAction>{releases.length > 0 ? pad(releases.length, 2) : '––'}</CardAction>
        <CardDescription>
          {config.source === 'local'
            ? 'Local build from the dojosha folder.'
            : `Releases of ${config.repo} on GitHub. The newest release is picked for you.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? <p className="te-legend text-silk-off">Loading releases</p> : null}
        {error ? (
          <Alert variant="destructive">
            <AlertTitle className="text-sig-warn">Could not load the releases</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {!loading && !error && releases.length === 0 ? (
          <p className="te-legend py-2 text-silk-off">No release has a <Dojosha /> image yet.</p>
        ) : null}

        {releases.length > 0 ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="release" className="te-legend">
              Version
            </label>
            <NativeSelect
              id="release"
              value={release?.tag ?? ''}
              disabled={disabled}
              onChange={(event) => onChange(event.target.value)}
              className="te-readout"
            >
              {releases.map((r) => (
                <option key={r.tag} value={r.tag}>
                  {releaseLabel(r, r.tag === latestTag)}
                </option>
              ))}
            </NativeSelect>
            {release?.pageUrl ? (
              <a
                href={release.pageUrl}
                target="_blank"
                rel="noreferrer"
                className="te-legend inline-flex items-center gap-1.5 self-start py-1 active:text-silk"
              >
                Release notes
                <Glyph name="external" className="size-3.5" />
              </a>
            ) : null}
          </div>
        ) : null}

        {board && release && !image ? (
          <Alert variant="destructive">
            <AlertTitle className="text-sig-warn">No image for {board.name}</AlertTitle>
            <AlertDescription>V.{release.version} has no {board.asset}. Pick another version.</AlertDescription>
          </Alert>
        ) : null}

        {image ? <DownloadState image={image} download={download} onRetry={onRetry} /> : null}
      </CardContent>
    </Card>
  )
}

function DownloadState({
  image,
  download,
  onRetry,
}: {
  image: FirmwareImage
  download: ImageDownload
  onRetry: () => void
}) {
  if (download.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle className="flex items-center justify-between gap-3 text-sig-warn">
          Could not download {image.name}
          <button type="button" onClick={onRetry} className="te-legend inline-flex items-center gap-1.5 text-silk">
            <Glyph name="retry" className="size-3.5" />
            Retry
          </button>
        </AlertTitle>
        <AlertDescription>{download.error}</AlertDescription>
      </Alert>
    )
  }
  const ready = download.status === 'ready'
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="te-readout truncate text-[12px] text-silk-dim">{image.name}</span>
        <span className={ready ? 'te-readout text-sm text-sig-ok' : 'te-readout text-sm text-silk'}>
          {ready ? `${formatBytes(image.size)} · Ready` : `${pad(download.progress * 100)}%`}
        </span>
      </div>
      <Progress label="Download" value={download.progress * 100} accent={ready ? 'ok' : 'white'} />
    </div>
  )
}
