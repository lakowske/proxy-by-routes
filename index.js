/*
 * (C) 2015 Seth Lakowske
 */

var http        = require('http');
var router      = require('routes')();
var util        = require('util');

function proxyByRoute(routesDescription) {

    var routes = Object.keys(routesDescription);

    for (var i = 0 ; i < routes.length ; i++) {
        var route   = routes[i];
        console.log(route);
        var options = routesDescription[route]
        console.log(options);

        router.addRoute(route, function(req, res, params) {

            var serverOptions = JSON.parse(JSON.stringify(options));

            serverOptions.method  = req.method;
            serverOptions.headers = req.headers;
            console.log(serverOptions);
            console.log(options);
            var serverReq = http.request(serverOptions, function(serverRes) {
                serverRes.pipe(res);
            })

            req.pipe(serverReq);
        })

    }

    return router;

}

module.exports.proxyByRoute = proxyByRoute;
