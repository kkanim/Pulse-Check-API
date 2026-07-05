import { getMonitor, updateMonitor } from '../store/monitorStore.js';
import { MonitorStatus } from '../models/monitor.js';

// Starts a countdown for a monitor; calls onExpire(id) if it runs out.
export function startTimer(id, onExpire) {
    const monitor = getMonitor(id);
    if (!monitor) return;

    const handle = setTimeout(() => {
        onExpire(id);
    }, monitor.timeout * 1000);

    updateMonitor(id, {timerHandle: handle});
}

// Resets the countdown on heartbeat; also resumes a paused monitor.
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

//Pauses a monitor: clears its timer and marks it PAUSED.
export function pauseTimer(id) {
    const monitor = getMonitor(id);
    if (!monitor) return null;

    if (monitor.timerHandle) {
        clearTimeout(monitor.timerHandle);
    }

    return updateMonitor(id, {
        status: MonitorStatus.PAUSED,
        timerHandle: null,
    });
}

//Stops a monitor's timer without changing its status.
export function clearTimer(id) {
    const monitor = getMonitor(id);
    if (monitor?.timerHandle) {
        clearTimeout(monitor.timerHandle);
        updateMonitor(id, { timerHandle: null });
    }
}