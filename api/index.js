import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const require = createRequire(import.meta.url);
const jsonServer = require('json-server');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();

// Resolución de rutas absoluta para Vercel
// Vercel despliega las funciones en /api, db.json está en la raíz
const dbPath = path.join(process.cwd(), 'db.json');
const routesPath = path.join(process.cwd(), 'routes.json');

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Middleware manual para limpiar el prefijo /api antes de que llegue al router
server.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  next();
});

// Cargar rutas personalizadas si existen
if (fs.existsSync(routesPath)) {
  const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
  server.use(jsonServer.rewriter(routes));
}

server.use(router);

export default server;
