import { sendJSON } from "../utils/respond.js";
import { getMonitor } from '../store/monitorStore.js'
import { getHistory } from "../store/eventStore.js";
import { toPublicMonitor } from "../models/monitor.js";

//Handles GET /monitors/:id/history - returns a monitor's full event timeline.
export function handleGetHistory(req, res) {
    const { id } = req.params;
    const monitor = getMonitor(id);

    if(!monitor) {
        return sendJSON(res, 404, { error: `Monitor with id "${id}" not found` });
    }

    const history = getHistory(id);

    return sendJSON(res, 200, {
        monitor: toPublicMonitor(monitor),
        eventCount: history.length,
        history,
    });
}