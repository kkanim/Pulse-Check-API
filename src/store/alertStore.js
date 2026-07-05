// In-memory, append-only log of fired alerts.
const alerts = [];

//Records a new alert for a monitor that went down.
export function recordAlert({ monitorId }) {
    const alert = {
        monitorId,
        message: `Device ${monitorId} is down!`,
        firedAt: new Date().toISOString(),
    };
    alerts.push(alert);
    return alert;
}

//Returns all fired alerts, newest first.
export function getAllAlerts() {
    return [...alerts].reverse();
}