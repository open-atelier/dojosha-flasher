# AGENTS.md

Conventions for anyone, human or agent, who commits to this repository.

## Commit messages

Every commit uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Documentation

`README.md` and `AGENTS.md` share some information (the release asset names, the `VITE_*` settings). If you change shared information in one file, change it in the other file in the same commit.

## What this is

A static single-page app that installs the Dōjōsha firmware over Web Serial. It has no server and stores no firmware: it reads the GitHub releases of the dojosha repository at run time. See `README.md` for the data flow and the CORS limit on release assets.

```
src/
  boards.ts              the boards: one entry for each firmware environment. Edit this to add a board.
  config.ts              VITE_* settings: release source, repository, asset URL template
  app.tsx                the page: board → firmware → install → after the install
  lib/releases.ts        GitHub release list, image download and check
  lib/install.ts         useInstall(): serial port + esp-web-tools flash()
  components/            page sections
  components/ui/         keys, cards, alerts, progress, glyphs (from the dojosha web app)
  styles.css             design tokens, the same as dojosha web/src/styles.css
scripts/local-firmware.ts  copies a local dojosha build into public/local/ (pnpm firmware:local)
fonts/                   FirstOperator-Bold, FirstOperator-Black, SecondOperator-Bold (from dojosha fonts/)
.github/workflows/pages.yml  typecheck, build, deploy to GitHub Pages
```

## Stack

| Part | Tool |
|------|------|
| Package manager | [pnpm](https://pnpm.io). Pin the version in `packageManager` in `package.json`. |
| Build | [Vite](https://vite.dev), `base: './'` |
| UI | [React](https://react.dev), TypeScript in `strict` mode |
| Styles | [Tailwind CSS](https://tailwindcss.com) 4 |
| Server state | [TanStack Query](https://tanstack.com/query): the release list and the image download |
| Flashing | [ESP Web Tools](https://github.com/esphome/esp-web-tools) `flash()` from `esp-web-tools/dist/flash.js` (esptool-js inside) |

Do not use Next.js or another framework with a server. The page must work from any static host.

## Rules

- Pin every dependency to an exact version in `package.json` (no `^` or `~`). Commit `pnpm-lock.yaml`. Before you add a package, make sure that its license agrees with AGPL-3.0.
- Use the ESP Web Tools `flash()` API, not its `<esp-web-install-button>` dialog: the dialog has its own Material design. Its states are a `const enum` in the typings, which `isolatedModules` cannot read: compare the string values (see `RawState` in `src/lib/install.ts`).
- Call `navigator.serial.requestPort()` first in the click handler, before any `await`: the browser shows the port list only during a user gesture. Download the image before the click (the page does it when a board and a version are picked).
- An image is one merged file flashed at `0x0`: the pioarduino `firmware.factory.bin`, renamed to the `asset` name in `src/boards.ts`. Its header carries the flash mode, frequency, and size, and `flash()` writes it with `keep`.
- Release asset names: `dojosha-<board id>.bin`, for example `dojosha-fnk0104b.bin`. Change `src/boards.ts` and `README.md` together when they change.
- The texts in "After the install" (`src/components/guide.tsx`) repeat the dojosha defaults: the Wi-Fi name `Dojosha`, the password `dojosha123` (`src/core/settings.h`), and the addresses `192.168.86.1` and `dojosha.local` (dojosha `AGENTS.md`, "Web interface addresses"). Change them when dojosha changes them.

## Design

Follow the dojosha web app (dojosha `AGENTS.md`, "Device UI" and "Web app"): the teenage engineering direction.
- One true-black field, hairline rules, 2 px corners, no shadows, no animation, no transitions.
- First Operator Bold and Black for silkscreen text (`te-legend`, `te-value`, `te-prose`). Second Operator Bold (`te-readout`) for every number, and for names with digits (board names, file names): First Operator draws `1` like `I`.
- Text that must be typed back exactly (the Wi–Fi name and password) uses the system monospace (`te-literal`).
- Colour only as an index or a signal: white latch for a choice, yellow (`sig-warn`) for CLEAN and errors, green (`sig-ok`) for done and ready.
- A key is an ink face with a 1 px edge; pressed = the edge turns silk; latched = a 2 px rule along its bottom edge.
- Numbers padded (`01`, `042%`), versions as `V.0.1.0`, product names with an en dash (ESP32–S3, Wi–Fi).
- Draw icons in `src/components/ui/glyph.tsx`, not with an icon library.
