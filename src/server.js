import http from 'node:http';
import { handleCreateMonitor } from './routes/monitors.js';
import { sendJSON } from './utils/respond.js';
import { Router, notFoundHandler } from './router.js'

const PORT = process.env.PORT || 3000;
const router = new Router();

//Temporary health-check route - proves the router works end-to-end.
// Real /monitors routes get registered here in Phase 4.
router.get('/', (req, res) => {
    sendJSON(res, 200, { message: 'Pulse-Check-API is alive'});
})

router.post('/monitors', handleCreateMonitor);

const server = http.createServer((req, res) => {
    // req.url can include a query string (e.g. "/monitors?staus=down"),
    // so we parse it properly rather than treating the raw string as the path
    const { pathname } = new URL(req.url, `http://${req.headers.host}`)

        const matched = router.handle(req, res, pathname)
        if (!matched) {
            notFoundHandler(req, res);
        }
});

server.listen(PORT, () => {
    console.log('Pulse-CHeck-API listening on http://localhost:${PORT');
});