/**
 * An append-only log of every meaningful state change for every
 * monitor. Separate from alertStore.js because alerts are a 
 * specifi *type* of event (a down-trigger) - this store captures
 * the full lifecycle: creation, every heartbeat, every pause, and 
 * every expiry, giving a complete audit trail per device.
 */
const events = [];

export const EventType = {
    CREATED: 'created',
    HEARTBEAT: 'heartbeat',
    PAUSED: 'paused',
    EXPIRED: 'expired',
};

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

/**
 * Return all events for one monitor, oldest first - a history
 * makes sense read chronologically, unlike alerts (Phase 6) which
 * we deliberately showed newest-first for quick "what's wrong right
 * now" scanning. Different resource, different natural order.
 */
export function getHistory(monitorId) {
    return events.filter((e) => e.monitorId === monitorId);
}