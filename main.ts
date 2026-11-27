// DealHound — Black Friday deal finder, make.fun program/v1 entrypoint.
// Node 22, standard library only. The site is the plain static files in app/:
// index.html opens in a browser with no build step and no network request, and
// the deals it shows live in its own app/deals.js, checked by the maker on
// 27 November 2026. This program hands the site in: it copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads (screenshots first, then the first load's files
// and bytes, then the source), built with the vendored make.fun library.
// Leave vendor/makefun-frontend.ts exactly as the kit shipped it: the gate
// rebuilds the dossier with its own copy and compares the two byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Copy the whole static site, then the screenshots, then write the dossier.
mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// The gate's caps: at most 4 screenshots of 256 KiB each, app/ at most 993
// files and directories and 16 MiB, and the dossier text at most 160 KiB.
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
