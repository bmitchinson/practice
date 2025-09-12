import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss()],
	root: '.',
	build: {
		outDir: 'build',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: './index.html'
			}
		}
	},
	base: './'
});
