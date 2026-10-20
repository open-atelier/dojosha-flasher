/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIRMWARE_SOURCE?: string
  readonly VITE_FIRMWARE_REPO?: string
  readonly VITE_ASSET_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
