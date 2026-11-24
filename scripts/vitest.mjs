import { realpathSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = realpathSync.native(join(import.meta.dirname, ".."));
// Same Windows casing fix as vite.config.ts: run Vitest from the real-cased path.
process.chdir(root);
await import(pathToFileURL(join(root, "node_modules/vitest/vitest.mjs")).href);
