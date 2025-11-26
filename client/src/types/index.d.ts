declare module '*.module.css' {
    const content: Record<string, string>
    export default content
}

interface FacebookPixel {
    (command: 'init', pixelId: string): void
    (command: 'track', event: string, parameters?: Record<string, unknown>): void
    (command: 'trackCustom', event: string, parameters?: Record<string, unknown>): void
    push: (...args: unknown[]) => void
}

declare global {
    interface Window {
        fbq?: FacebookPixel
    }
}
export {}
