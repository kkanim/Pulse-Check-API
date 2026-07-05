// Reads and parse a JSON request body from a raw Node http request.
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