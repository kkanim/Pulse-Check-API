import { createMonitorEntity} from '../models/monitor.js';

// In-memory store of all monitors, keyed by id.
const monitors = new Map();

// Registers a new monitor; throws if the id already exists.
export function createMonitor({ id, timeout, alertEmail }) {
    if (monitors.has(id)) {
        throw new Error(`Monitor with id "${id}" already exists`);
    }
    const monitor = createMonitorEntity({ id, timeout, alertEmail });
    monitors.set(id, monitor);
    return monitor;
}

//Looks up a single monitor by id.
export function getMonitor(id) {
    return monitors.get(id) || null;
}

//Returns all monitors, in insertion order.
export function getAllMonitors() {
    return Array.from(monitors.values());
}

//Merges partial updates into an existing monitor.
export function updateMonitor(id, updates) {
    const existing = monitors.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    monitors.set(id, updated);
    return updated;
}

//Remove a monitor entirely.
export function deleteMonitor(id) {
    return monitors.delete(id);   //returns true/false
}

//Checks whether a monitor id is already registered.
export function monitorExists(id) {
    return monitors.has(id);
}