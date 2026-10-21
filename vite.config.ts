import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Appen oppdaterer seg selv når en ny versjon er publisert
      registerType: "autoUpdate",
      manifest: {
        name: "Sudoku Helper",
        short_name: "Sudoku",
        description: "Scan et sudokubrett med kameraet og løs det på telefonen",
        lang: "no",
        theme_color: "#16171d",
        background_color: "#16171d",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // OpenCV gjør JS-filen ~17 MB, standardgrensen er 2 MB
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        // Ta med ML-modellen (json + bin), så scanning virker offline
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json,bin}"],
      },
    }),
  ],
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
});
