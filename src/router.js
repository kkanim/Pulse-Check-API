import { sendJSON } from './utils/respond.js';

//Minimal manual router: matches method + path patterns, supports : params.
export class  Router {
    constructor() {
        this.routes = [];
    }

    _register(method, path, handler) {
        const paramNames = [];

        //Compiles a path pattern into a regex and stores it with its handler.
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

    //Registers a GET route.
    get(path, handler) {
        this._register('GET', path, handler);
    }

    //Registers a POST route.
    post(path, handler) {
        this._register('POST', path, handler);
    }

    // Matches a request against registered rotes and invokes the handler.
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

//Fallback handler for unmatched routes.
export function notFoundHandler(req, res) {
    sendJSON(res, 404, {error: 'Not FOund', path: req.url});
}