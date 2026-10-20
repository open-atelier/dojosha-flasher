/**
 * Build-time settings, from VITE_* environment variables (see README.md).
 */
export const config = {
  /**
   * Where the releases come from:
   * - `github`: the releases of `repo`, from the GitHub API.
   * - `local`: public/local/releases.json, written by `pnpm firmware:local` from a dojosha build.
   */
  source: import.meta.env.VITE_FIRMWARE_SOURCE === 'local' ? 'local' : 'github',

  /** The GitHub repository whose releases carry the firmware images. It must be public. */
  repo: import.meta.env.VITE_FIRMWARE_REPO || 'open-atelier/dojosha',

  /**
   * The URL the browser downloads a release asset from. Placeholders: {url} (the asset's
   * browser_download_url), {repo}, {tag}, {name}.
   *
   * GitHub serves release assets without CORS headers, so a browser cannot download `{url}`
   * itself. Point this at a proxy (for example `https://proxy.example/?url={url}`) or a mirror
   * that sends `Access-Control-Allow-Origin` (for example
   * `https://cdn.jsdelivr.net/gh/<owner>/<repo>@{tag}/{name}`).
   */
  assetUrl: import.meta.env.VITE_ASSET_URL || '{url}',

  /** Shown in the footer. */
  sourceUrl: 'https://github.com/open-atelier/dojosha',
} as const

export function assetUrl(values: { url: string; repo: string; tag: string; name: string }): string {
  return config.assetUrl.replace(/\{(url|repo|tag|name)\}/g, (_, key: keyof typeof values) => values[key])
}
