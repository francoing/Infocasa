import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();

// Resolución de rutas absoluta para Vercel (subiendo un nivel desde /api)
const dbPath = path.join(__dirname, '..', 'db.json');
const routesPath = path.join(__dirname, '..', 'routes.json');

// Verificar si el archivo existe para evitar crash
if (!fs.existsSync(dbPath)) {
  console.error("db.json not found at", dbPath);
}

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

// Leer routes.json de forma manual para evitar problemas de importación
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

server.use(middlewares);

// Reescribir rutas para quitar el prefijo /api que envía Vercel
// de modo que json-server encuentre los recursos
server.use(jsonServer.rewriter({
  "/api/*": "/$1",
  ...routes
}));

server.use(router);

export default server;
