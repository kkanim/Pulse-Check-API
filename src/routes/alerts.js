import { sendJSON } from "../utils/respond.js";
import { getAllAlerts } from "../store/alertStore.js";

//Hanldes GET /alerts - returns all fired alerts, newest first.
export function handleGetAlerts(req, res) {
    const alerts = getAllAlerts();
    return sendJSON(res, 200, {
        count: alerts.length,
        alerts,
    });
}