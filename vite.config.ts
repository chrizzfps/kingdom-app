import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vibedit } from '@vibedit/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vibedit()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
