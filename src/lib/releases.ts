import { type BoardId, boards } from '@/boards'
import { assetUrl, config } from '@/config'

/** A firmware image for one board in one release. */
export interface FirmwareImage {
  board: BoardId
  name: string
  size: number
  /** Where the browser downloads it from (after the `assetUrl` template). */
  url: string
}

export interface Release {
  tag: string
  /** The tag without a leading "v". */
  version: string
  publishedAt: string
  prerelease: boolean
  /** The release page, for the notes. Empty for local builds. */
  pageUrl: string
  images: FirmwareImage[]
}

/** The subset of the GitHub release object that the flasher reads. */
interface GitHubRelease {
  tag_name: string
  html_url: string
  draft: boolean
  prerelease: boolean
  published_at: string | null
  assets: { name: string; size: number; browser_download_url: string }[]
}

/** The releases, newest first. Releases without an image for any board are left out. */
export async function fetchReleases(): Promise<Release[]> {
  const releases = config.source === 'local' ? await fetchLocalReleases() : await fetchGitHubReleases()
  return releases.filter((release) => release.images.length > 0)
}

async function fetchGitHubReleases(): Promise<Release[]> {
  const response = await fetch(`https://api.github.com/repos/${config.repo}/releases?per_page=30`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (response.status === 404) throw new Error(`${config.repo} was not found. The repository must be public.`)
  if (response.status === 403 || response.status === 429) {
    const reset = Number(response.headers.get('x-ratelimit-reset'))
    const when = reset ? ` Try again after ${new Date(reset * 1000).toLocaleTimeString()}.` : ''
    throw new Error(`GitHub limits how often a browser can ask for releases.${when}`)
  }
  if (!response.ok) throw new Error(`GitHub answered ${response.status} for the release list.`)

  const list = (await response.json()) as GitHubRelease[]
  return list
    .filter((release) => !release.draft)
    .map((release) => ({
      tag: release.tag_name,
      version: release.tag_name.replace(/^v/, ''),
      publishedAt: release.published_at ?? '',
      prerelease: release.prerelease,
      pageUrl: release.html_url,
      images: boards.flatMap((board) => {
        const asset = release.assets.find((a) => a.name === board.asset)
        if (!asset) return []
        const url = assetUrl({ url: asset.browser_download_url, repo: config.repo, tag: release.tag_name, name: asset.name })
        return [{ board: board.id, name: asset.name, size: asset.size, url }]
      }),
    }))
}

async function fetchLocalReleases(): Promise<Release[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}local/releases.json`, { cache: 'no-store' })
  if (!response.ok) throw new Error('No local build. Run `pnpm firmware:local` after `pio run` in the dojosha folder.')
  return (await response.json()) as Release[]
}

/** The first byte of every ESP image. */
const ESP_IMAGE_MAGIC = 0xe9

/**
 * Downloads a firmware image and checks that it is one, so that an HTML error page from a
 * proxy fails here and not halfway through a write.
 */
export async function downloadImage(image: FirmwareImage, onProgress: (fraction: number) => void): Promise<Blob> {
  let response: Response
  try {
    response = await fetch(image.url)
  } catch {
    // fetch() gives no reason for a CORS or network failure.
    throw new Error(
      config.assetUrl === '{url}'
        ? 'The browser could not download the image: GitHub does not allow it from another site. Set VITE_ASSET_URL to a proxy or a mirror.'
        : 'The browser could not download the image. Check the connection and the VITE_ASSET_URL proxy.',
    )
  }
  if (!response.ok) throw new Error(`The download answered ${response.status}.`)

  const total = Number(response.headers.get('content-length')) || image.size
  const chunks: Uint8Array<ArrayBuffer>[] = []
  let received = 0
  const reader = response.body?.getReader()
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.length
      onProgress(Math.min(1, received / total))
    }
  }
  const blob = reader ? new Blob(chunks) : await response.blob()
  const first = new Uint8Array(await blob.slice(0, 1).arrayBuffer())[0]
  if (blob.size < 1024 || first !== ESP_IMAGE_MAGIC) throw new Error(`${image.name} is not an ESP32 firmware image.`)
  onProgress(1)
  return blob
}
