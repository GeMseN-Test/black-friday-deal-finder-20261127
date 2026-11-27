// DealHound local server — serves app/ at http://localhost:8080 so the site
// can be opened in a desktop browser and at a phone size. Standard library
// only; run with `node serve.ts` (add --port <n> for another port).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.argv[process.argv.indexOf("--port") + 1] || 8080);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json" };

createServer(async (req, res) => {
  const path = req.url === "/" ? "/index.html" : req.url.split("?")[0].split("#")[0];
  try {
    const body = await readFile(join(here, "app", path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  }
}).listen(port, () => console.log("DealHound at http://localhost:" + port));
