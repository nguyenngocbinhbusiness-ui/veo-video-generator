import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

<<<<<<< HEAD
export default defineConfig({
    plugins: [react()],
    base: './',
=======
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // Use relative paths for Electron
>>>>>>> 7e166733f58fefd5483c3fe5562b91014d982f04
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@features': path.resolve(__dirname, './src/features'),
            '@shared': path.resolve(__dirname, './src/shared'),
        },
    },
    build: {
        outDir: 'dist/renderer',
        emptyOutDir: true,
    },
    server: {
        port: 5173,
    },
});
