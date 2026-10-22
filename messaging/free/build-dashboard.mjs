import {bundleWorker} from "./bundle.mjs";
import {fileURLToPath} from "node:url";
await bundleWorker(fileURLToPath(new URL("worker-dashboard.mjs",import.meta.url)));
console.log("worker-dashboard.mjs regenerated from the production entry (no secrets).");
