/**
 * A separate in-memory store just for fired alerts.
 * kept independent from monitorStore.js because alerts are an
 * append-only log (you never "update" a past alert), which is a
 * different access pattern from monitors (which get read/updated
 * constantly). Separating them keeps each store's responsibility
 * single-purpose.
 */
const alerts = [];

export function recordAlert({ monitorId }) {
    const alert = {
        monitorId,
        message: `Device ${monitorId} is down!`,
        firedAt: new Date().toISOString(),
    };
    alerts.push(alert);
    return alert;
}

export function getAllAlerts() {
    //Return newest-first - when demoing, the most recent alert
    //is almost always the one you want to see first.
    return [...alerts].reverse();
}