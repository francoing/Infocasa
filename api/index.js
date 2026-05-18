import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const server = jsonServer.create();

let router;
try {
  const dbPath1 = path.join(__dirname, '../db.json');
  const dbPath2 = path.join(process.cwd(), 'db.json');
  let dbContent;
  
  if (fs.existsSync(dbPath1)) {
    dbContent = fs.readFileSync(dbPath1, 'utf8');
  } else if (fs.existsSync(dbPath2)) {
    dbContent = fs.readFileSync(dbPath2, 'utf8');
  } else {
    // Si no lo encuentra, mostramos qué archivos hay en las carpetas para diagnosticar
    const cwdFiles = fs.readdirSync(process.cwd()).join(', ');
    const dirFiles = fs.readdirSync(__dirname).join(', ');
    throw new Error(`db.json not found. cwd: ${cwdFiles} | dirname: ${dirFiles}`);
  }
  
  const db = JSON.parse(dbContent);
  router = jsonServer.router(db);
  
  const routesPath = path.join(process.cwd(), 'routes.json');
  if (fs.existsSync(routesPath)) {
    const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
    server.use(jsonServer.rewriter(routes));
  }
  
  server.use(router);
} catch (error) {
  // Si algo falla, creamos una ruta temporal para ver el error real
  server.use((req, res) => {
    res.status(500).json({
      message: "Error de inicializacion",
      error: error.message,
      stack: error.stack
    });
  });
}

export default server;

