/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Per-app Parse application id, injected at promote build time by the
   * worker (sandboxBuildImages → VITE_PARSE_APP_ID = app.id). Unset in the
   * sandbox dev build, where the client falls back to 'sandbox-app-id'.
   */
  readonly VITE_PARSE_APP_ID?: string;
  readonly VITE_PARSE_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
