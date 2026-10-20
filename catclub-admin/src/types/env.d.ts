/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_REFRESH_URL?: string // если рефреш на другом домене/пути
}
interface ImportMeta {
    readonly env: ImportMetaEnv
}