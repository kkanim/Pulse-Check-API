import { getMonitor, updateMonitor } from '../store/monitorStore.js';
import { MonitorStatus } from '../models/monitor.js';

/**
 * Starts a fresh countdown for a monitor. When the timeout elapses
 * without a reset, `onExpire(id)` is invoked.
 * the caller's responsibility (Phase 6 will pass the real alert
 * logic). This keeps the timer engine reusable and easy to reason 
 * about in isolation.
 */
export function startTimer(id, onExpire) {
    const monitor = getMonitor(id);
    if (!monitor) return;

    const handle = setTimeout(() => {
        onExpire(id);
    }, monitor.timeout * 1000);

    updateMonitor(id, {timerHandle: handle});
}

/**
 * Called on every heartbeat. Clears the existing timer (if any)
 * and starts a brand new one - this IS the "reset the countdown"
 * requirement from the brief.
 */
export function resetTimer(id, onExpire) {
    const monitor = getMonitor(id);
    if (!monitor) return;

    if(monitor.timerHandle) {
        clearTimeout(monitor.timerHandle);
    }

    updateMonitor(id, {
        lastHeartbeatAt: new Date().toISOString(),
        status: MonitorStatus.ACTIVE,
    });

    startTimer(id, onExpire);
}

/**
 * Stops the countdown entirely without starting a new one.
 * Not used yet - this is what Phase 7 (pause/snooze) will call.
 * Included now so the engine's public API is complete in one place.
 */
export function clearTimer(id) {
    const monitor = getMonitor(id);
    if (monitor?.timerHandle) {
        clearTimeout(monitor.timerHandle);
        updateMonitor(id, { timerHandle: null });
    }
}