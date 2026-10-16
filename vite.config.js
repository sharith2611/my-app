import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';




export default defineConfig({
    plugins: [sveltekit()],
    preview: {
        host: '0.0.0.0',
        allowedHosts: ['my-app-rlib.onrender.com']
    }
});