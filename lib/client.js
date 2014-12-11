var p4l = require('proj4leaflet'),
    L = require('leaflet'),
    conf = window.conf,
    crs = new p4l.CRS(conf.crs.name, conf.crs.proj4, conf.crs.opt),
    initView = location.hash.substr(1).split('/'),
    mapOpt = clone({
      center: [57.7023, 11.9511],
      zoom: 6,
      continuousWorld: true,
      worldCopyJump: false,
      crs:crs,
      trackResize: false,
      inertia: false
    }, conf.map),
    handle = document.getElementById('handle'),
    leftEl = document.getElementById('mask-left'),
    grayscaleEl = document.getElementById('grayscale'),
    handleStart = false,
    mapLeft, mapRight,
    layersLeft, layersRight,
    layerMapLeft, layerMapRight,
    defaultLeft, defaultRight;

require('./pointer');

function clone(a, b) {
  for (var i in b) a[i] = b[i];
  return a;
}

function layers(opt) {
  return conf.layers.map(function(opt) {
    return L.tileLayer.wms(opt.url, clone({}, opt.wms));
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

function pushState() {
  if (!history.replaceState) return;
  var z = mapLeft.getZoom(),
      latlng = mapLeft.getCenter();
  history.replaceState(null, null, '#' + [z, latlng.lat, latlng.lng].join('/'));
}

function changeLayer(map, layer) {
  if (map._currentBaseLayer) map.removeLayer(map._currentBaseLayer);
  layer.addTo(map);
  map._currentBaseLayer = layer;
}

layersLeft = layers();
layerMapLeft = layerMap(layersLeft);
defaultLeft = layerMapLeft[conf.defaultLeft] || layersLeft[0];

layersRight = layers();
layerMapRight = layerMap(layersRight);
defaultRight = layerMapRight[conf.defaultRight] || layersRight[0];

global.L = L;
require('./L.Map.Sync');

if (initView.length === 3) {
  mapOpt.zoom = parseInt(initView[0]);
  mapOpt.center = [parseFloat(initView[1]), parseFloat(initView[2])];
}
mapLeft = L.map('map-left', clone({}, mapOpt));
mapRight = L.map('map-right', clone({ attributionControl: false }, mapOpt));

changeLayer(mapLeft, layersLeft[0]);
changeLayer(mapRight, layersRight[0]);

L.control.layers(layerMapLeft, null, {position:'bottomleft'}).addTo(mapLeft);
L.control.layers(layerMapRight, null, {position:'bottomright'}).addTo(mapRight);

changeLayer(mapLeft, defaultLeft);
changeLayer(mapRight, defaultRight);

mapLeft.sync(mapRight);
mapRight.sync(mapLeft);

mapLeft.on('zoomend', pushState);
mapLeft.on('dragend', pushState);
mapRight.on('dragend', pushState);

grayscaleEl.addEventListener('change', function(e) {
  document.getElementById('map-left').classList.toggle('grayscale', grayscaleEl.checked);
  document.getElementById('map-right').classList.toggle('grayscale', grayscaleEl.checked);
});

handle.addEventListener('pointerdown', start);
window.addEventListener('pointermove', move);
window.addEventListener('pointerup', end);

split(window.innerWidth / 2);
