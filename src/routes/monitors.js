import { sendJSON } from '../utils/respond.js';
import { parseBody } from '../utils/parseBody.js';
import { validateCreateMonitor } from '../utils/validate.js';
import { createMonitor, monitorExists, getMonitor, updateMonitor } from '../store/monitorStore.js';
import { toPublicMonitor, MonitorStatus } from '../models/monitor.js';
import { startTimer, resetTimer, pauseTimer } from '../services/timerEngine.js';
import { recordAlert } from '../store/alertStore.js';
import { recordEvent, EventType } from '../store/eventStore.js';



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

    recordEvent(monitor.id, EventType.CREATED, { timeout: monitor.timeout });

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
    recordEvent(id, EventType.HEARTBEAT);

    return sendJSON(res, 200, {
        message: `Heartbeat received for "${id}". Timer reset.`,
        monitor: toPublicMonitor(getMonitor(id)),
    });
}

/**
 * Fires when a monitor's countdown reaches zero without a heartbeat.
 * Satisfies User Story 3: logs the required JSON shape from the brief,
 * marks the monitor "down", and records the alert for the later retrieval
 * via GET /alerts.
 */
function onMonitorExpire(id) {
    updateMonitor(id, { status: MonitorStatus.DOWN });
    
    const alert = recordAlert({ monitorId: id });
    recordEvent(id, EventType.EXPIRED, { alertMessage: alert.message });

    //Exact JSON shape required the brief's acceptance criteria:
    //{"ALERT": "Device device-123 is down!", "time": <timestamp>}
    console.log(JSON.stringify({
        ALERT: alert.message,
        time: alert.firedAt,
    }));
}

export async function handlePause(req, res) {
    const { id } = req.params;
    const monitor = getMonitor(id);

    if (!monitor) {
        return sendJSON(res, 404, { error: `Monitor with id "${id}" not found` });
    }

    const paused = pauseTimer(id);
    recordEvent(id, EventType.PAUSED);

    return sendJSON(res, 200, {
        message: `Monitor "${id}" paused. No alerts will fire until the next heartbeat.`,
        monitor: toPublicMonitor(paused),
    });
}