import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
	// Loads all .env files for the given mode; '' means no prefix filter
	const env = loadEnv(mode, process.cwd(), '');

	return defineConfig({
		plugins: [react(), tsconfigPaths()],
		server: {
			watch: {
				usePolling: true,
				interval: 300,
				binaryInterval: 1000,
				ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
			},
			hmr: {
				overlay: true,
				port: 5174, // Use a different port for HMR
			},
			host: true,
			port: 5173,
			strictPort: false, // Allow fallback to next available port
			open: true,
			fs: {
				// Allow serving files from one level up to the project root
				allow: ['..']
			}
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
				"@components": path.resolve(__dirname, "./src/components"),
				"@utils": path.resolve(__dirname, "./src/utils"),
				"@assets": path.resolve(__dirname, "./src/assets"),
				"@constants": path.resolve(__dirname, "./src/constants"),
				"@my-types": path.resolve(__dirname, "./src/types"),
				"@services": path.resolve(__dirname, "./src/services"),
				"@pages": path.resolve(__dirname, "./src/pages"),
				"@hooks": path.resolve(__dirname, "./src/hooks"),
				"@contexts": path.resolve(__dirname, "./src/contexts"),
				"@layouts": path.resolve(__dirname, "./src/layouts"),
				"@common": path.resolve(__dirname, "./src/common"),
				"@data": path.resolve(__dirname, "./src/data"),
			},
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						// Separate MUI into its own chunk
						'mui-core': [
							'@mui/material',
							'@mui/icons-material',
							'@emotion/react',
							'@emotion/styled',
						],
						// Separate React and related libraries
						'react-vendor': [
							'react',
							'react-dom',
							'react-router-dom',
						],
						// Separate Leaflet (map library)
						'leaflet-vendor': [
							'leaflet',
							'react-leaflet',
						],
					},
				},
			},
			chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
			sourcemap: (env.NODE_ENV === "production"), // Disable sourcemaps in production for smaller builds
		},
		define: {
			// Stringify to avoid JSON issues; access as a global in client code if needed
			'import.meta.env.VITE_CUSTOM_VAR': JSON.stringify(env.VITE_CUSTOM_VAR),
		},
		envPrefix: ['VITE_']
	});
};