import http from 'node:http';
import { handleCreateMonitor, handleHeartbeat, handlePause } from './routes/monitors.js';
import { sendJSON } from './utils/respond.js';
import { Router, notFoundHandler } from './router.js'
import { handleGetAlerts } from './routes/alerts.js';
import { handleGetHistory } from './routes/history.js';

const PORT = process.env.PORT || 3000;
const router = new Router();


router.get('/', (req, res) => {
    sendJSON(res, 200, { message: 'Pulse-Check-API is alive'});
});

router.post('/monitors', handleCreateMonitor);
router.post('/monitors/:id/heartbeat', handleHeartbeat);
router.get('/alerts', handleGetAlerts);
router.post('/monitors/:id/pause', handlePause);
router.get('/monitors/:id/history', handleGetHistory);

const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`)

        const matched = router.handle(req, res, pathname)
        if (!matched) {
            notFoundHandler(req, res);
        }
});

server.listen(PORT, () => {
    console.log(` 🟢 Pulse-Check-API listening on http://localhost:${PORT}`);
});