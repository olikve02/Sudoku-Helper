import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

// Lager app-ikonene i public/ ut fra public/favicon.svg.
// Kjør med: npm run generate-icons
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // Mørk bakgrunn (samme som appen) i stedet for hvit på Android og iPhone
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: "#16171d" },
    },
    // iPhone runder av hjørnene selv, så ikonet kan fylle mer av flaten
    apple: {
      ...minimal2023Preset.apple,
      padding: 0.12,
      resizeOptions: { background: "#16171d" },
    },
  },
  images: ["public/favicon.svg"],
});
