/**
 * The boards the flasher offers. One entry for each firmware environment in the dojosha
 * platformio.ini. To add a board: add an entry here, and attach `asset` to every release.
 *
 * Every board is an ESP32-S3, so the chip cannot tell them apart: the user picks the board.
 */
export const boards = [
  {
    id: 'fnk0104b',
    name: 'FNK0104B',
    title: 'Freenove ESP32–S3 Display',
    parts: ['2.8" ILI9341 touch', 'ES8311 codec', 'SD card'],
    /** The release asset: the merged image (pioarduino `firmware.factory.bin`), flashed at 0x0. */
    asset: 'dojosha-fnk0104b.bin',
    port: 'Connect the board with a USB–C cable that carries data, not only power.',
  },
  {
    id: 'diy_s3_max98357',
    name: 'DIY S3',
    title: 'ESP32–S3–DevKitC–1 N16R8',
    parts: ['ILI9341 + XPT2046 module', 'MAX98357A', 'SD card'],
    asset: 'dojosha-diy_s3_max98357.bin',
    port: 'Connect either USB port of the DevKitC. If one does not connect, try the other.',
  },
] as const

export type Board = (typeof boards)[number]
export type BoardId = Board['id']

export function findBoard(id: string | null | undefined): Board | undefined {
  return boards.find((board) => board.id === id)
}
