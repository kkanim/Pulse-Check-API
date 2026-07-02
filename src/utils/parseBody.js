/**
 * Node's http.IncomingMessage delivers the body as a streamof chunks,
 * not a ready-made object. We have to manually collect the chunks,
 * concatenate them, and parse as JSON ourselves.
 * 
 * Returns a Promise so route handlers can simply `await parseBody(req)`.
 */
export function parseBody(req) {
    return new Promise((resolve, reject) => {
        let rawData = '';

        req.on('data', (chunk) => {
            rawData += chunk;
        });

        req.on('end', () => {
            if (!rawData) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(rawData));
            } catch (err) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}