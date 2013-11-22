var http = require('http'),
    url = require('url'),

    conf = require('./proxy.json'),

    server = http.createServer(function(req, res) {
      if (req.method !== 'GET') return (res.writeHead(404), res.end());

      var srvUrl = url.parse(req.url);

      console.log(srvUrl.href);

      srvUrl.host = conf.host;
      srvUrl.port = conf.port;
      if (conf.headers) srvUrl.headers = conf.headers;

      var req = http.get(srvUrl, function(getRes) {
        res.writeHead(getRes.statusCode, getRes.headers);
        getRes.pipe(res);
      }).on("socket", function (socket) {
        socket.setTimeout(10000);
        socket.on('timeout', function() {
          console.error("Timeout reached for:", srvUrl.href);
          req.abort();
        });
      }).on('error', function(err) {
        console.error("Error on target host:", err);
      });
    });

http.globalAgent.maxSockets = 16;
server.listen.apply(server, conf.listen.split(':').slice(0,2).reverse());
