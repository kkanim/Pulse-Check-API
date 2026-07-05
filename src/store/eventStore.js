// In-memory, append-only log of every monitor lifecycle event.
const events = [];

//Event types tracked in a monitor's history.
export const EventType = {
    CREATED: 'created',
    HEARTBEAT: 'heartbeat',
    PAUSED: 'paused',
    EXPIRED: 'expired',
};

//Appends a new event to a monitor's history.
export function recordEvent(monitorId, type, detail = {}) {
    const event = {
        monitorId,
        type,
        detail,
        timestamp: new Date().toISOString(),
    };
    events.push(event);
    return event;
}

// Returns all events for one monitor, oldest first.
export function getHistory(monitorId) {
    return events.filter((e) => e.monitorId === monitorId);
}