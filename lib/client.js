var p4l = require('proj4leaflet'),
    L = require('leaflet'),
    conf = window.conf,
    crs = new p4l.CRS(conf.crs.name, conf.crs.proj4, conf.crs.opt),
    mapOpt = clone({
      center: [57.7023, 11.9511],
      zoom: 6,
      continuousWorld: true,
      worldCopyJump: false,
      crs:crs
    }, conf.map),
    mapLeft, mapRight,
    layersLeft, layersRight,
    layerMapLeft, layerMapRight;

function clone(a, b) {
  var item;
  for (var i in b) a[i] = b[i];
  return a;
}

layersLeft = conf.wms.map(function(opt) {
  return L.tileLayer.wms(opt.url, clone({crs:crs}, opt));
});
layerMapLeft = conf.wms.reduce(function(dict, opt, i) {
  return (dict[opt.name] = layersLeft[i], dict);
}, {});

layersRight = conf.wms.map(function(opt) {
  return L.tileLayer.wms(opt.url, clone({crs:crs}, opt));
});
layerMapRight = conf.wms.reduce(function(dict, opt, i) {
  return (dict[opt.name] = layersRight[i], dict);
}, {});

global.L = L;
require('./L.Map.Sync');

mapLeft = L.map('map-left', clone({ layers:layersLeft[0] }, mapOpt));
mapRight = L.map('map-right', clone({ layers:layersRight[1] }, mapOpt));

L.control.layers(layerMapLeft, null, {position:'bottomleft'}).addTo(mapLeft);
L.control.layers(layerMapRight, null, {position:'bottomright'}).addTo(mapRight);

mapLeft.sync(mapRight);
mapRight.sync(mapLeft);
