import { sendJSON } from "../utils/respond.js";
import { getAllAlerts } from "../store/alertStore.js";

export function handleGetAlerts(req, res) {
    const alerts = getAllAlerts();
    return sendJSON(res, 200, {
        count: alerts.length,
        alerts,
    });
}