import jsonServer from 'json-server';
import db from './db.js';
import routes from './routes.js';

const server = jsonServer.create();
const router = jsonServer.router(db);

server.use(jsonServer.defaults());
server.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }
  next();
});

server.use(jsonServer.rewriter(routes));
server.use(router);

export default server;
