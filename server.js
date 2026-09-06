import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compiledServer = path.join(__dirname, 'dist', 'server.mjs');

// If the compiled bundle exists, launch the full NutrinK application server
if (fs.existsSync(compiledServer)) {
  await import('./dist/server.mjs');
} else {
  // Fallback server when dist/ has not been compiled yet
  const express = (await import('express')).default;
  const PORT = (Number(process.env.PORT) === 8080 || !process.env.PORT) ? 3000 : Number(process.env.PORT);
  const app = express();

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Idempotency-Key");
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors *;");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      app: "NutrinK",
      nodeVersion: process.version,
      env: process.env.NODE_ENV || "production",
      port: PORT,
      message: "Build in progress or dist/server.mjs missing. Run npm run build."
    });
  });

  app.use(express.static(__dirname));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NutrinK Server] Fallback server running on http://0.0.0.0:${PORT}`);
  });
}

