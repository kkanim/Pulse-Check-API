import { sendJSON } from '../utils/respond.js';
import { parseBody } from '../utils/parseBody.js';
import { validateCreateMonitor } from '../utils/validate.js';
import { createMonitor, monitorExists, getMonitor, updateMonitor } from '../store/monitorStore.js';
import { toPublicMonitor, MonitorStatus } from '../models/monitor.js';
import { startTimer, resetTimer } from '../services/timerEngine.js';

/**
 * Temporary expiry handler for Phase 5. Phase 6 will replace the
 * body of this function with the real alert-firing logic (console.log
 * JSON + alerts array + GET /alerts). Kept here, not in the timer
 * engine, because "what happens on expiry" is business logic, not 
 * timer mechanics.
 */
function onMonitorExpire(id) {
    updateMonitor(id, { status: MonitorStatus.DOWN });
    console.log(` ⚠️  [Phase 6 TODO] Monitor "${id}" expired — alert logic goes here.`)
}

export async function handleCreateMonitor(req, res) {
    let body;
    try {
        body = await parseBody(req);
    } catch (err) {
        return sendJSON(res, 400, { error: 'Invalid JSON in request body'});
    }

    const errors = validateCreateMonitor(body);
    if (errors.length > 0) {
        return sendJSON(res, 400, { error: 'Validation failed', details: errors});
    }

    if (monitorExists(body.id)) {
        return sendJSON(res, 409, { error: `Monitor with id "${body.id}" already exists`});
    }

    const monitor = createMonitor({
        id: body.id,
        timeout: body.timeout,
        alertEmail: body.alert_email,
    }); 

    // The countdown starts the instant the monitor is registered -
    // not on the first heartbeat. This matches the brief: "the system
    // starts a countdown timer for 60 seconds associated with device-123."
    startTimer(monitor.id, onMonitorExpire);

    return sendJSON(res, 201, {
        message: `Monitor "${monitor.id}" created successfully`,
        monitor: toPublicMonitor(monitor),
    });
}

export async function handleHeartbeat(req, res) {
    const { id } = req.params;
    const monitor = getMonitor(id);

    if (!monitor) {
        return sendJSON(res, 404, { error: `Monitor with id "${id}" not found` });
    }

    resetTimer(id, onMonitorExpire);

    

    return sendJSON(res, 200, {
        message: `Heartbeat received for "${id}". Timer reset.`,
        monitor: toPublicMonitor(getMonitor(id)),
    });
}