import http from 'node:http';
import {sendJSON} from './utils/respond.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    //Placeholder - real routing logic arrives in Phase 3
    sendJSON(res, 200, {message: 'Pusle-Check-API is alive', path: req.url});
});

server.listen(PORT, () => {
    console.log('Pulse-CHeck-API listening on http://localhost:${PORT');
});