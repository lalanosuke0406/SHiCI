import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: {outDir: "../../frontend/private", emptyOutDir: false,
    lib: {entry: {client:"src/entry.js","free-client":"src/free-entry.js"}, formats: ["es"], fileName: (_format,name) => name+".js"}},
  worker: {format: "es"}
});
