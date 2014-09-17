/**
 *
 */
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: 9000, path: '/myapp'});

server.on('connection', function(id) {
  console.log("connection");
  console.log(id);
});
server.on('disconnect', function(id) {
  console.log("disconnection");
  console.log(id);
});
