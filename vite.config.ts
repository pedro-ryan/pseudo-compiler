import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/pseudo-compiler/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          language: ["@/compiler/language"],
          generator: ["@/compiler/generator"],
          transform: ["@/compiler/transform"],
          parser: ["@/compiler/parser"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
