// Worker that first loads the Locale, then loads the actual HTML/CSS/TYPESCRIPT/JSON worker.

(function(workerScope) {
    // Taken from
    //   https://github.com/sindresorhus/query-string/blob/master/license
    // Slightly adapted to work without a node/require environment, and removed parts I don't need.
    // START https://github.com/sindresorhus/query-string/
    function parserForArrayFormat() {
        return function (key, value, accumulator) {
            if (accumulator[key] === undefined) {
                accumulator[key] = value;
                return;
            }
            accumulator[key] = [].concat(accumulator[key], value);
        };
    }

    function keysSorter(input) {
        if (Array.isArray(input)) {
            return input.sort();
        } else if (typeof input === 'object') {
            return keysSorter(Object.keys(input)).sort(function (a, b) {
                return Number(a) - Number(b);
            }).map(function (key) {
                return input[key];
            });
        }

        return input;
    }

    function extract(str) {
        var queryStart = str.indexOf('?');
        if (queryStart === -1) {
            return '';
        }
        return str.slice(queryStart + 1);
    }

    function parse(str) {
        var formatter = parserForArrayFormat();

        // Create an object with no prototype
        // https://github.com/sindresorhus/query-string/issues/47
        var ret = Object.create(null);

        if (typeof str !== 'string') {
            return ret;
        }

        str = str.trim().replace(/^[?#&]/, '');

        if (!str) {
            return ret;
        }

        str.split('&').forEach(function (param) {
            var parts = param.replace(/\+/g, ' ').split('=');
            // Firefox (pre 40) decodes `%3D` to `=`
            // https://github.com/sindresorhus/query-string/pull/37
            var key = parts.shift();
            var val = parts.length > 0 ? parts.join('=') : undefined;

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            formatter(decodeURIComponent(key), val, ret);
        });

        return Object.keys(ret).sort().reduce(function (result, key) {
            var val = ret[key];
            if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
                // Sort object keys, not values
                result[key] = keysSorter(val);
            } else {
                result[key] = val;
            }

            return result;
        }, Object.create(null));
    }
    // END https://github.com/sindresorhus/query-string/

    function parseLocation() {
        return parse(extract(workerScope.location.href));
    }

    var query = parseLocation();
    var locale = query.locale;
    var worker = query.worker;

    if (!worker) {
        throw new Error("No worker URL was given.");
    }

    if (locale) {
        workerScope.importScripts(locale, worker);
    }
    else {
        workerScope.importScripts(worker);
    }
})(self);