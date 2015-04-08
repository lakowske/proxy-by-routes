/*
 * (C) 2015 Seth Lakowske
 */

var http        = require('http');
var routesMod   = require('routes');
var util        = require('util');

/*
 * Returns a router with proxy functions attached.
 *
 * routesDescription:
 * { '/my/example/route*' : {host: 'myhost.com', port: '31337' },
 *   '/my/next/example*'  : {host: 'myotherhost.com', port: '11111' } }
 *
 */
function proxyByRoute(routesDescription) {

    var router = routesMod();

    var routes = Object.keys(routesDescription);

    for (var i = 0 ; i < routes.length ; i++) {
        var route   = routes[i];
        var options = routesDescription[route]

        router.addRoute(route, function(req, res, params) {

            var serverOptions = JSON.parse(JSON.stringify(options));

            serverOptions.method  = req.method;
            serverOptions.headers = req.headers;
            var serverReq = http.request(serverOptions, function(serverRes) {
                serverRes.pipe(res);
            })

            serverReq.on('error', function(er) {
                res.end('error when connecting to ' + options.host + ':' + options.port);
                console.log('error when connecting to ' + JSON.stringify(er));
            })

            req.pipe(serverReq);
        })

    }

    return router;

}

module.exports.proxyByRoute = proxyByRoute;
