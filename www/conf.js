window.conf = {
  crs: {
    name: 'EPSG:4326',
    proj4: '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ',
    opt: {
      origin: [-180.0000, -85.0511287798],
      resolutions: new Array(16).join(',').split(',').map(function(x, i) {
        return (1/111195) * Math.pow(2, i);
      }).reverse(),
    }
  },
  map: {
    center: [52.5091, 13.3865],
    zoom: 12,
    maxZoom: 15,
    minZoom: 0
  },
  layers: [
    {
      name: 'GIF',
      url: "http://osm.omniscale.net/proxy/service",
      wms: {
        layers: "osm",
        format: 'image/gif',
        continuousWorld: true
      }
    },
    {
      name: 'PNG',
      url: "http://osm.omniscale.net/proxy/service",
      wms: {
        layers: "osm",
        format: 'image/png',
        continuousWorld: true
      }
    }
  ]
};
