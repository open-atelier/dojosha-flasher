# Dōjōsha Flasher

A web page that installs the [Dōjōsha](https://github.com/open-atelier/dojosha) firmware on an ESP32-S3 over USB, from the browser. No tools to install: pick the board, pick the version, press INSTALL.

Boards:
- **FNK0104B**: Freenove ESP32-S3 Display (the reference board).
- **DIY S3**: ESP32-S3-DevKitC-1 N16R8 with an ILI9341 module and a MAX98357A.

The page needs Web Serial: Chrome, Edge, or Opera on a computer. Safari, Firefox, and phones do not have it.

## How it works

```
Browser ──── api.github.com ────▶ release list (tag, date, asset names and sizes)
   │
   ├──────── VITE_ASSET_URL ────▶ firmware image (.bin), checked for the ESP image magic byte
   │
   └──────── Web Serial (USB) ──▶ board: esp-web-tools flash() writes the image at 0x0
```

The page is static. It has no server and stores no firmware: it reads the releases of the dojosha repository when it loads.

- **Release list**: `GET https://api.github.com/repos/<repo>/releases`. Drafts are left out. The newest release that is not a pre-release is picked by default.
- **Images**: each release carries one merged image for each board, named as in `src/boards.ts` (`dojosha-fnk0104b.bin`, `dojosha-diy_s3_max98357.bin`). A merged image is the pioarduino `.pio/build/<board>/firmware.factory.bin`: bootloader, partition table, `boot_app0`, and the app, flashed at `0x0`.
- **Install**: `src/lib/install.ts` asks for the serial port and calls `flash()` from [ESP Web Tools](https://github.com/esphome/esp-web-tools) with a manifest built in memory. UPDATE writes the image; CLEAN erases the whole flash first (settings back to the defaults).

### Release assets and CORS

GitHub serves release assets (`browser_download_url`) without `Access-Control-Allow-Origin`, so a browser cannot download them from another site. The release list works (the API sends CORS headers), the image download does not.

Set `VITE_ASSET_URL` to a URL that does send CORS headers. Placeholders: `{url}` (the asset's `browser_download_url`), `{repo}`, `{tag}`, `{name}`. For example:

| Host | `VITE_ASSET_URL` |
|------|------------------|
| A proxy (for example a Cloudflare Worker) | `https://dojosha-assets.example.workers.dev/?url={url}` |
| A public repository or branch that holds the images, through jsDelivr | `https://cdn.jsdelivr.net/gh/open-atelier/dojosha-firmware@{tag}/{name}` |

Until then, the page shows the release list and says that the download is blocked.

The release list also needs the dojosha repository to be public: the page makes unauthenticated API calls (60 an hour for each IP address).

## Develop

You need [Node.js](https://nodejs.org) 24 or newer and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev            # the releases from GitHub
pnpm typecheck
pnpm build          # writes dist/
```

Web Serial works only in a secure context: `http://localhost` is one, a LAN address is not.

### Test with a local build

To flash a firmware that is not released yet:

```sh
cd ../dojosha && pio run -e fnk0104b      # or let the script build: --build
cd ../dojosha-flasher
pnpm firmware:local                       # copies firmware.factory.bin of each board into public/local/
pnpm dev:local                            # the page offers the local build
```

The script reads `../dojosha`, or the folder in `DOJOSHA_DIR`, or the folder you pass: `pnpm firmware:local --build /path/to/dojosha`. `public/local/` is not committed.

## Settings

Build-time environment variables. On GitHub, set them as repository variables (Settings → Secrets and variables → Actions → Variables): `FIRMWARE_REPO` and `ASSET_URL`.

| Variable | Default | Meaning |
|----------|---------|---------|
| `VITE_FIRMWARE_REPO` | `open-atelier/dojosha` | The repository whose releases carry the images |
| `VITE_ASSET_URL` | `{url}` | Where the browser downloads an image (see [Release assets and CORS](#release-assets-and-cors)) |
| `VITE_FIRMWARE_SOURCE` | `github` | `local` reads `public/local/releases.json` instead (`pnpm dev:local`) |

## Deploy

`.github/workflows/pages.yml` typechecks and builds on every push and pull request, and deploys `dist/` to GitHub Pages on a push to `main`. Turn on Pages once: Settings → Pages → Source: **GitHub Actions**.

The build uses relative paths (`base: './'`), so `dist/` also works on any other static host and under any path.

## Add a board

1. Add the board to `src/boards.ts`: `id` (the PlatformIO environment), `name`, `title`, `parts`, `asset`, `port`.
2. Attach `<asset>` to the next dojosha release.

## License

AGPL-3.0, the same as Dōjōsha. ESP Web Tools and esptool-js use Apache-2.0.
