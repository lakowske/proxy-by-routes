/*
 * (C) 2015 Seth Lakowske
 */

var http        = require('http');
var routesMod   = require('routes');
var util        = require('util');

/*
 * Returns a router with proxy functions attached.
 *
 * routesDescription - patterns and proxy request destinations
 * { '/my/example/route*' : {host: 'myhost.com', port: '31337' },
 *   '/my/next/example*'  : {host: 'myotherhost.com', port: '11111' } }
 *
 * proxyFn - optional callback used to define custom proxying behavior.
 * function(serverReq, options, req, res)
 */
function proxyByRoute(routesDescription, proxyFn) {

    var router = routesMod();

    routesDescription.forEach(function(routeDescription) {
        var route   = routeDescription.pattern;
        router.addRoute(route, function(req, res, params) {
            var options       = routeDescription;
            var serverOptions = JSON.parse(JSON.stringify(options))

            serverOptions.method  = req.method;
            serverOptions.headers = req.headers;
            serverOptions.path    = req.url;
            var serverReq = http.request(serverOptions);
            if (proxyFn) {
                proxyFn(serverReq, serverOptions, req, res, params);
            } else {
                simplePiper(serverReq, serverOptions, req, res, params);
            }
        })

    })

    return router;

}

function simplePiper(serverReq, options, req, res, params) {
    serverReq.on('response', function(serverRes) {
        serverRes.pipe(res);
    })

    serverReq.on('error', function(er) {
        res.end('error when connecting to ' + options.host + ':' + options.port);
        console.log('error when connecting to ' + JSON.stringify(er));
    })

    req.pipe(serverReq);
}

module.exports.proxyByRoute = proxyByRoute;
