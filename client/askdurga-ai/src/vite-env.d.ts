interface ImportMetaEnv {
  readonly VITE_API_EXPLAIN_CODE: string;
  // add other env vars here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
