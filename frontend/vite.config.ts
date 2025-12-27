import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Mengizinkan host agar tidak diblokir fitur security Vite 7
    allowedHosts: [
      "vscode-0e93eb11-5748-4cc6-b20e-4dd6987663bf.preview.emergentagent.com"
    ],
  
  }
})