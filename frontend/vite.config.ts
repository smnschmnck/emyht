import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import "./src/env";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
});
