var p4l = require('proj4leaflet'),
    L = require('leaflet'),
    conf = window.conf,
    crs = new p4l.CRS(conf.crs.name, conf.crs.proj4, conf.crs.opt),
    mapOpt = clone({
      center: [57.7023, 11.9511],
      zoom: 6,
      continuousWorld: true,
      worldCopyJump: false,
      crs:crs,
      trackResize: false
    }, conf.map),
    handle = document.getElementById('handle'),
    leftEl = document.getElementById('mask-left'),
    grayscaleEl = document.getElementById('grayscale'),
    handleStart = false,
    mapLeft, mapRight,
    layersLeft, layersRight,
    layerMapLeft, layerMapRight;

require('./pointer');

function clone(a, b) {
  var item;
  for (var i in b) a[i] = b[i];
  return a;
}

function layers(opt) {
  return conf.layers.map(function(opt) {
    return L.tileLayer.wms(opt.url, clone({crs:crs}, opt.wms));
  });
}

function layerMap(layers) {
  return conf.layers.reduce(function(dict, opt, i) {
    return (dict[opt.name] = layers[i], dict);
  }, {});
}

function split(split) {
  handle.style.left = split -10 + 'px';
  leftEl.style.right = window.innerWidth - split + 'px';
}
function start(e) { handleStart = true; }
function end(e) { handleStart = false; }
function move(e) {
  if (handleStart) split(Math.max(Math.min(e.x, window.innerWidth), 0));
}

layersLeft = layers();
layerMapLeft = layerMap(layersLeft);

layersRight = layers();
layerMapRight = layerMap(layersRight);

global.L = L;
require('./L.Map.Sync');

mapLeft = L.map('map-left', clone({
  layers:layersLeft[0]
}, mapOpt));
mapRight = L.map('map-right', clone({
  layers:layersRight[1] || layersRight[0],
  attributionControl: false
}, mapOpt));

L.control.layers(layerMapLeft, null, {position:'bottomleft'}).addTo(mapLeft);
L.control.layers(layerMapRight, null, {position:'bottomright'}).addTo(mapRight);

mapLeft.sync(mapRight);
mapRight.sync(mapLeft);

grayscaleEl.addEventListener('change', function(e) {
  document.getElementById('map-left').classList.toggle('grayscale', grayscaleEl.checked);
  document.getElementById('map-right').classList.toggle('grayscale', grayscaleEl.checked);
});

handle.addEventListener('pointerdown', start);
window.addEventListener('pointermove', move);
window.addEventListener('pointerup', end);

split(window.innerWidth / 2);
