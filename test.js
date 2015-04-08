/*
 * (C) 2015 Seth Lakowske
 */

var test      = require('tape');
var http      = require('http');
var freeport  = require('freeport');
var proxy     = require('./');

test('can proxy a get request', function(t) {

    freeport(function(er, port) {
        port = 12345;
        http.createServer(function(req, res) {
            res.end('hello wisconsin');
        }).listen(port);
        console.log('server listening on ' + port);

        var router = proxy.proxyByRoute({'/articles*' : {host:'localhost', port: port}});

        freeport(function(er, proxyPort) {
            proxyPort = 12346;
            http.createServer(function(req, res) {
                var m = router.match(req.url);
                if (m) m.fn(req, res, m.params)
                else {
                    //no matching proxy routes
                    res.end('not found')
                }
            }).listen(proxyPort, function() {
                http.request({host:'localhost', port : proxyPort, path : '/articles'}, function(req, res) {
                    res.pipe(process.stdout);
                })
            });
            console.log('proxy listening on ' + proxyPort);
        })
    })

})

