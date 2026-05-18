import jsonServer from 'json-server';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const db = require('../db.json');
const routes = require('../routes.json');

const server = jsonServer.create();
const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  next();
});

server.use(jsonServer.rewriter(routes));
server.use(router);

export default server;
