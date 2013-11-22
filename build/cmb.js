#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    imgbase = require('imgbase'),
    webRoot = process.argv[2] || '.',
    data = '';

function combineHtml(html, callback) {
  var count = 0;

  function done() {
    if (--count === 0) callback(html);
  }

  html = html.replace(/<link [^>]*href="(.*?)"[^>]*\/?>/g, function(_, url) {
    var token = '{{{style-'+(count++)+'}}}',
        url = webRoot + '/' + url;
    fs.readFile(url, 'utf-8', function(err, data) {
      imgbase(data, function(css) {
        html = html.replace(token, css);
        done();
      }, { rel:path.dirname(url) });
    });
    return '<style>'+token+'</style>';
  }).replace(/<script [^>]*src="(.*?)"[^>]*>[^<]*<\/script>/g, function(_, url) {
    if (/<script [^>]*\bcmb-ignore\b/.test(_)) return _;
    var token = '{{{script-'+(count++)+'}}}';
    fs.readFile(webRoot+'/'+url, 'utf-8', function(err, data) {
      html = html.replace(token, data);
      done();
    });
    return '<script>'+token+'</script>';
  });
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
  data += chunk;
});

process.stdin.on('end', function() {
  combineHtml(data, function(html) {
    process.stdout.write(html);
  });
});
