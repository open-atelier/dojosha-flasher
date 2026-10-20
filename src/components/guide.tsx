import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Glyph } from '@/components/ui/glyph'
import { config } from '@/config'
import { pad } from '@/lib/format'

/** Shown instead of the INSTALL key's promise when the browser has no Web Serial. */
export function UnsupportedBrowser() {
  return (
    <Alert variant="destructive" className="mt-5">
      <AlertTitle className="text-sig-warn">This browser cannot install</AlertTitle>
      <AlertDescription>
        The install talks to the board over USB with Web Serial. Open this page in Chrome, Edge or Opera on a computer.
        Safari, Firefox and phones do not have Web Serial.
      </AlertDescription>
    </Alert>
  )
}

/**
 * The defaults and the addresses come from the dojosha firmware (src/core/settings.h, and
 * "Web interface addresses" in AGENTS.md). Change them here when they change there.
 */
export function NextSteps() {
  const steps = [
    <>The board restarts and shows the Dōjōsha screen.</>,
    <>
      On a phone or computer, join the Wi–Fi network <code className="te-literal text-silk">Dojosha</code> with the
      password <code className="te-literal text-silk">dojosha123</code>. An update keeps the name and password you set.
    </>,
    <>
      Open <code className="te-readout text-silk">http://192.168.86.1</code> or{' '}
      <code className="te-readout text-silk">http://dojosha.local</code> to add sounds and backgrounds. For uploads, open{' '}
      <code className="te-readout text-silk">http://192.168.86.1</code> in your browser.
    </>,
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="te-readout">04</span> After the install
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <li key={index} className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="te-readout text-sm text-silk-dim">{pad(index + 1, 2)}</span>
              <p className="te-prose">{step}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

const problems: { title: string; answer: ReactNode }[] = [
  {
    title: 'The board is not in the port list',
    answer: (
      <>
        Use a USB cable that carries data: many charging cables do not. Close other programs that use the port (Arduino
        IDE, the PlatformIO monitor, another tab of this page). On the UART port of a DevKitC, Windows can need the CP210x
        or CH343 driver.
      </>
    ),
  },
  {
    title: 'The board does not answer',
    answer: (
      <>
        Put it in download mode: hold BOOT, press and release RESET (RST or EN), then release BOOT. Press INSTALL again
        and pick the port, which can have a new name now. After the install, press RESET once.
      </>
    ),
  },
  {
    title: 'The screen stays dark after the install',
    answer: <>Press RESET. If the screen is still dark, install again with CLEAN.</>,
  },
  {
    title: 'The firmware does not download',
    answer: (
      <>
        Check the internet connection, then press RETRY. The page downloads the image from GitHub before it opens the
        port, so the board is not touched.
      </>
    ),
  },
]

export function Help() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help</CardTitle>
        <CardDescription>Most problems are the cable or download mode.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col">
        {problems.map(({ title, answer }) => (
          <details key={title} className="group border-b last:border-b-0">
            <summary className="flex h-11 cursor-pointer list-none items-center justify-between gap-3 select-none [&::-webkit-details-marker]:hidden">
              <span className="te-legend text-silk">{title}</span>
              <Glyph name="chevron" className="text-silk-dim group-open:rotate-180" />
            </summary>
            <p className="te-prose pb-3">{answer}</p>
          </details>
        ))}
      </CardContent>
    </Card>
  )
}

export function Footer() {
  return (
    <footer className="te-prose flex flex-col gap-1 border-t pt-3">
      <p>
        Dōjōsha is open source, under the AGPL–3.0.{' '}
        <a href={config.sourceUrl} target="_blank" rel="noreferrer" className="text-silk underline underline-offset-2">
          Source
        </a>
      </p>
      <p>
        Flashing by{' '}
        <a
          href="https://esphome.github.io/esp-web-tools/"
          target="_blank"
          rel="noreferrer"
          className="text-silk underline underline-offset-2"
        >
          ESP Web Tools
        </a>{' '}
        and esptool–js. The page has no server: it asks GitHub for the firmware and talks to the board over USB.
      </p>
    </footer>
  )
}
