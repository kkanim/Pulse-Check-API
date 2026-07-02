import { sendJSON } from '../utils/respond.js';
import { parseBody } from '../utils/parseBody.js';
import { validateCreateMonitor } from '../utils/validate.js';
import { createMonitor, monitorExists } from '../store/monitorStore.js';
import { toPublicMonitor } from '../models/monitor.js';

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

    return sendJSON(res, 201, {
        message: `Monitor "${monitor.id}" created successfully`,
        monitor: toPublicMonitor(monitor),
    });
}