const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const routes = require('../routes.json');

server.use(middlewares);

// Reescribir rutas según routes.json
server.use(jsonServer.rewriter(routes));

server.use(router);

module.exports = server;
