import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const require = createRequire(import.meta.url);
const jsonServer = require('json-server');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();

// Buscar los archivos de base de datos y rutas
const dbPath = fs.existsSync(path.join(__dirname, '../db.json')) 
  ? path.join(__dirname, '../db.json') 
  : path.join(process.cwd(), 'db.json');

const routesPath = fs.existsSync(path.join(__dirname, '../routes.json'))
  ? path.join(__dirname, '../routes.json')
  : path.join(process.cwd(), 'routes.json');

// Vercel tiene un sistema de archivos de SOLO LECTURA.
// Si le pasamos el path del archivo a json-server, intentará escribir y lanzará Error 500.
// Para solucionarlo, leemos el archivo y le pasamos el OBJETO en memoria.
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const router = jsonServer.router(db);

const middlewares = jsonServer.defaults();

server.use(middlewares);

// Middleware manual para limpiar el prefijo /api
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
