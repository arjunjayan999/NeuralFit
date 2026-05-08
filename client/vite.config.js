import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		react(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["icons/*.png", "icons/*.svg"],
			manifest: {
				name: "NeuralFit",
				short_name: "NeuralFit",
				description: "Real-time AI-powered bodyweight exercise analysis",
				theme_color: "#0f172a",
				background_color: "#0f172a",
				display: "standalone",
				orientation: "any",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "/icons/icon-192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any maskable",
					},
					{
						src: "/icons/icon-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "mediapipe-cdn",
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						urlPattern:
							/^https:\/\/storage\.googleapis\.com\/mediapipe-models\/.*/i,
						handler: "CacheFirst",
						options: {
							cacheName: "mediapipe-models",
							expiration: {
								maxEntries: 5,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					// {
					// 	urlPattern: /^https?:\/\/.*\/api\/.*/i,
					// 	handler: "NetworkOnly",
					// },
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
