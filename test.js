/*
 * (C) 2015 Seth Lakowske
 */

var test      = require('tape');
var http      = require('http');
var freeport  = require('freeport');
var proxy     = require('./');

test('can proxy a get request', function(t) {

    freeport(function(er, port) {

        //Our backing server
        var server = http.createServer(function(req, res) {
            res.end('hello wisconsin');
        }).listen(port);
        console.log('server listening on ' + port);

        //Generate the proxy functions attached to the router
        var router = proxy.proxyByRoute({'/articles*' : {host:'localhost', port: port}});

        freeport(function(er, proxyPort) {

            //Our proxy server
            var proxyServer = http.createServer(function(req, res) {
                var m = router.match(req.url);
                if (m) m.fn(req, res, m.params)
                else {
                    //no matching proxy routes
                    res.end('not found')
                }
            }).listen(proxyPort, function() {

                //Connect to the proxy
                var response = '';
                var clientReq = http.request({host:'localhost', port : proxyPort, path : '/articles'}, function(res) {
                    res.on('data', function(data) {
                        var message = data.toString();
                        console.log(message);
                        response += message;
                    })
                    res.on('end', function() {
                        t.equal(response, 'hello wisconsin');
                        proxyServer.close();
                        server.close();
                        t.end();
                    })
                })
                clientReq.end();
            });

            console.log('proxy listening on ' + proxyPort);

        })
    })

})

test('can manage a missing backend server', function(t) {

    //Generate the proxy functions attached to the router
    var router = proxy.proxyByRoute({'/articles*' : {host:'localhost', port: 19999}});

    freeport(function(er, proxyPort) {

        //Our proxy server
        var proxyServer = http.createServer(function(req, res) {
            var m = router.match(req.url);
            if (m) m.fn(req, res, m.params)
            else {
                //no matching proxy routes
                res.end('not found')
            }
        }).listen(proxyPort, function() {

            //Connect to the proxy, but we shouldn't get a positive response
            var response = '';
            var clientReq = http.request({host:'localhost', port : proxyPort, path : '/articles'}, function(res) {
                res.on('data', function(data) {
                    var message = data.toString();
                    console.log(message);
                    response += message;
                })
                res.on('end', function() {
                    t.equal(response, 'error when connecting to localhost:19999' );
                    proxyServer.close();
                    t.end();
                })
            })
            clientReq.end();
        });

        console.log('proxy listening on ' + proxyPort);

    })

})
