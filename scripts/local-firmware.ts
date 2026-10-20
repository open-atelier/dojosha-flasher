/**
 * Copies the firmware images of a local dojosha build into public/local/, with a
 * releases.json in the shape that src/lib/releases.ts reads. Then `pnpm dev:local` offers them.
 *
 *   node scripts/local-firmware.ts [--build] [<dojosha folder>]
 *
 * The folder defaults to $DOJOSHA_DIR, then ../dojosha. --build runs `pio run` for each board first.
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { boards } from '../src/boards.ts'
import type { FirmwareImage, Release } from '../src/lib/releases.ts'

const args = process.argv.slice(2)
const build = args.includes('--build')
const source = resolve(args.find((a) => !a.startsWith('--')) ?? process.env.DOJOSHA_DIR ?? '../dojosha')
const out = resolve('public/local')

if (!existsSync(join(source, 'platformio.ini'))) {
  console.error(`No platformio.ini in ${source}. Pass the dojosha folder, or set DOJOSHA_DIR.`)
  process.exit(1)
}

const ini = readFileSync(join(source, 'platformio.ini'), 'utf8')
const version = /-DFIRMWARE_VERSION=\\"([^"\\]+)\\"/.exec(ini)?.[1] ?? '0.0.0'
const commit = git(['rev-parse', '--short', 'HEAD'])
const dirty = git(['status', '--porcelain', '--untracked-files=no']) !== ''

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

const images: FirmwareImage[] = []
let newest = 0
for (const board of boards) {
  if (build) execFileSync('pio', ['run', '-e', board.id, '-d', source], { stdio: 'inherit' })
  // pioarduino writes the merged image (bootloader, partitions, boot_app0, app) for 0x0.
  const file = join(source, '.pio/build', board.id, 'firmware.factory.bin')
  if (!existsSync(file)) {
    console.warn(`skip ${board.id}: no ${file}. Run \`pio run -e ${board.id}\` in ${source}, or pass --build.`)
    continue
  }
  const stat = statSync(file)
  newest = Math.max(newest, stat.mtimeMs)
  copyFileSync(file, join(out, board.asset))
  images.push({ board: board.id, name: board.asset, size: stat.size, url: `local/${board.asset}` })
  console.log(`${board.id}: ${board.asset} (${stat.size} bytes)`)
}

if (images.length === 0) {
  console.error('No images found.')
  process.exit(1)
}

const release: Release = {
  tag: 'local',
  version: `${version}+${commit}${dirty ? '.dirty' : ''}`,
  publishedAt: new Date(newest).toISOString(),
  prerelease: false,
  pageUrl: '',
  images,
}
writeFileSync(join(out, 'releases.json'), `${JSON.stringify([release], null, 2)}\n`)
console.log(`Wrote ${join(out, 'releases.json')}. Run \`pnpm dev:local\`.`)

function git(gitArgs: string[]): string {
  try {
    return execFileSync('git', ['-C', source, ...gitArgs], { encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}
