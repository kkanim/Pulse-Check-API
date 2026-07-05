// Validate a POST /monitors payload; returns an array of error messages (empty = valid).
export function validateCreateMonitor(body) {
    const errors = [];

    if(!body.id || typeof body.id !== 'string') {
        errors.push('"id" is required and must be a string');
    }

    if (body.timeout === undefined || typeof body.timeout !== 'number' || body.timeout <= 0 ) {
        errors.push('"timeout" is required and must be a positive number (seconds)');
    } 

    if (!body.alert_email || typeof body.alert_email !== 'string') {
        errors.push('"alert_email" is required and must be a string');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.alert_email)) {
        errors.push('"alert_email" must be a valid email address');
    }
    return errors;
}