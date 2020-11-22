const http = require('http');
const app = require('./modules/express');
const { server: { PORT } } = require('./config');
const server = http.createServer(app);

server.on('listening', () => console.log(`Server listening on port ${PORT}.`));
server.on('error', error => console.error(`Server error ${error}. Exiting...`));

server.listen(PORT);
