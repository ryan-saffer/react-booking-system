import path from 'path'

import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            '@ui-components': path.resolve(__dirname, './src/ui-components/ui'),
            '@constants': path.resolve(__dirname, './src/constants'),
            '@drawables': path.resolve(__dirname, './src/drawables'),
            '@utils': path.resolve(__dirname, './src/utilities'),
        },
    },
    plugins: [react()],
})
