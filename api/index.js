import jsonServer from 'json-server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();

let router;
try {
  // Intentar encontrar el archivo en varias posibles ubicaciones comunes de Vercel
  const possiblePaths = [
    path.join(process.cwd(), 'api', 'db.json'),
    path.join(process.cwd(), 'db.json'),
    path.join(__dirname, 'db.json'),
    '/var/task/api/db.json',
    '/var/task/db.json'
  ];
  
  let dbContent = null;
  let foundPath = null;
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dbContent = fs.readFileSync(p, 'utf8');
      foundPath = p;
      break;
    }
  }

  if (!dbContent) {
    // Escanear directorios para diagnosticar
    const listDir = (dir) => {
      try { return fs.readdirSync(dir).join(', '); } catch (e) { return e.message; }
    };
    
    throw new Error(
      `db.json not found. ` +
      `CWD: ${process.cwd()} [${listDir(process.cwd())}] | ` +
      `__dirname: ${typeof __dirname !== 'undefined' ? __dirname : 'undefined'} | ` +
      `API dir: [${listDir(path.join(process.cwd(), 'api'))}] | ` +
      `/var/task: [${listDir('/var/task')}]`
    );
  }

  const db = JSON.parse(dbContent);
  router = jsonServer.router(db);

  const routesPath = foundPath.replace('db.json', 'routes.json');
  if (fs.existsSync(routesPath)) {
    const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
    server.use(jsonServer.rewriter(routes));
  }

  server.use(jsonServer.defaults());
  server.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      req.url = req.url.replace(/^\/api/, '');
    }
    next();
  });
  
  server.use(router);
} catch (error) {
  server.use((req, res) => {
    res.status(500).json({ error: error.message });
  });
}

export default server;

