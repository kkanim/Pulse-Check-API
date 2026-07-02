import { createMonitorEntity} from '../models/monitor.js';

/**
 * Single source of truth for all monitors, in-memorry
 * A Map is used instead of a plain object because: 
 * - key lookups (has/get/delete) are 0(1) and more explicit than
 * hasOwnProperty checks on a plain object
 * - Map preserves insertion order, which is handy if we ever need
 * to list monitors in the order they registered
 * - no risk of prototype pollution or collisions with Object.prototype keys
 */
const monitors = new Map();

export function createMonitor({ id, timeout, alertEmail }) {
    if (monitors.has(id)) {
        throw new Error(`Monitor with id "${id}" already exists`);
    }
    const monitor = createMonitorEntity({ id, timeout, alertEmail });
    monitors.set(id, monitor);
    return monitor;
}

export function getMonitor(id) {
    return monitors.get(id) || null;
}

export function getAllMonitors() {
    return Array.from(monitors.values());
}

export function updateMonitor(id, updates) {
    const existing = monitors.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    monitors.set(id, updated);
    return updated;
}

export function deleteMonitor(id) {
    return monitors.delete(id);   //returns true/false
}

export function monitorExists(id) {
    return monitors.has(id);
}