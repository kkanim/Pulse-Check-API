/**
 * Possible lifecycle states for a monitor.
 * - active: timer is running, counting down normally
 * - paused: timer is frozen (bonus "snooze" feature, Phase 7)
 * - down: timer expired without a heartbeat, alert has fired
*/
export const MonitorStatus = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    DOWN: 'down',
};

/**
 * Creates a new Monitor object with a consistent shape.
 * Keeping this in one factoryfunction means every monitor
 * in the system - no matter which route created it - has the 
 * exact same fields, defaults, and types.
 */
export function createMonitorEntity({id, timeout, alertEmail}) {
    const now = new Date().toISOString();

    return{
        id,                         // string, unique device identifier
        timeout,                   // number, seconds until expiry
        alertEmail,                // string, where alerts would be "sent"
        status: MonitorStatus.ACTIVE,
        createdAt: now,
        lastHeartbeatAt: now,
        timerHandle: null,        // will hold the setTimeout reference (Phase 5)
    };
}

/**
 * Strips internal-only fields (like timerHandle) before a monitor
 * is sent back in an API response. 
*/
export function toPublicMonitor(monitor) {
    const { timerHandle, ...publicFields } = monitor;
    return publicFields;
}