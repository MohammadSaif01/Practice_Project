import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const port = Number.parseInt(process.env.PORT || "5173", 10);
const distDir = join(process.cwd(), "dist");

const mimeByExt = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const safePath = (urlPath) => {
  const cleaned = normalize(urlPath).replace(/^\.\.(\/|\\|$)+/g, "");
  return join(distDir, cleaned);
};

const serveFile = (res, filePath) => {
  const ext = extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": mimeByExt[ext] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
};

createServer((req, res) => {
  const reqPath = req.url?.split("?")[0] || "/";
  const targetPath = reqPath === "/" ? join(distDir, "index.html") : safePath(reqPath);

  if (existsSync(targetPath) && statSync(targetPath).isFile()) {
    return serveFile(res, targetPath);
  }

  const fallback = join(distDir, "index.html");
  if (existsSync(fallback)) {
    return serveFile(res, fallback);
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
}).listen(port, () => {
  console.log(`Frontend server listening on ${port}`);
});
