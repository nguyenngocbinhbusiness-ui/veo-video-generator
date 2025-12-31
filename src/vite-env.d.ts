/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DOWNLOAD_FOLDER: string;
    readonly VITE_FLOW_URL: string;
    readonly VITE_MAX_CONCURRENT: string;
    readonly VITE_RETRY_ATTEMPTS: string;
    readonly VITE_GENERATION_TIMEOUT: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
