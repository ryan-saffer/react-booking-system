import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            '@constants': path.resolve(__dirname, './src/constants'),
            '@drawables': path.resolve(__dirname, './src/drawables'),
            '@utils': path.resolve(__dirname, './src/utilities'),
        },
    },
    plugins: [react()],
})