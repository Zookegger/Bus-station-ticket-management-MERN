import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
	// Loads all .env files for the given mode; '' means no prefix filter
	const env = loadEnv(mode, process.cwd(), '');
	
	return defineConfig({
		plugins: [react(), tsconfigPaths()],
		define: {
			// Stringify to avoid JSON issues; access as a global in client code if needed
			'import.meta.env.VITE_CUSTOM_VAR': JSON.stringify(env.VITE_CUSTOM_VAR),
		},
		envPrefix: ['VITE_']
	});
} 
