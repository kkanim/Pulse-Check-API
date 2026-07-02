import { sendJSON } from './utils/respond.js';

/**
 * A minimal, dependency-free router for  plain Node.js http servers.
 * 
 * Design notes: 
 * - Routes are stored as an array (not a Map) because match order matters -
 * more specific patterns could otherwise be shadowed by looser ones.
 * - Each registered path is compiled into a RegExp once, at registration
 * time, not every request - matching a live request should be cheap.
 * - Dynamic segments (":id") are captured by name so handlers get a clean
 * req.params.id instead of having to parse the URL themselves.
 */
export class  Router {
    constructor() {
        this.routes = [];
    }

    _register(method, path, handler) {
        const paramNames = [];

        // Convert "/monitors/:id/heartbeat" into a regex like
        // /^\/monitors\/([^/]+)\/heartbeat$/ and remember that
        // capture group #1 corresponds to "id".
        const pattern = path
        .split('/')
        .map((segment) => {
            if (segment.startsWith(':')) {
                paramNames.push(segment.slice(1));
                return '([^/]+)';
            }
            return segment;
        })
        .join('/');

        const regex = new RegExp(`^${pattern}$`);
        this.routes.push({ method, regex, paramNames, handler });
    }

    get(path, handler) {
        this._register('GET', path, handler);
    }

    post(path, handler) {
        this._register('POST', path, handler);
    }

    /**
     * Finds a matching route for the given method + pathname,
     * extracts params from the URL, and invikes the handler.
     * Returns true if a route matched, false otherwise - so the
     * caller (server.js) knows whether to fall back to a 404.
     */
    handle(req, res, pathname) {
        for (const route of this.routes) {
            if (route.method !== req.method) continue;

            const match = pathname.match(route.regex);
            if (!match) continue;

            //match[0] is the full match, match[1..] are captured params in order
            const params = {};
            route.paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });

            req.params = params;
            route.handler(req, res);
            return true;
        }
        return false;
    }
}

export function notFoundHandler(req, res) {
    sendJSON(res, 404, {error: 'Not FOund', path: req.url});
}