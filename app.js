window.myDebug = require('debug')
var qs = require('querystring')
var xtend = require('xtend')
var dragDrop = require('drag-drop/buffer')
var hash = require('hash-change')
var userAgent = require('ua_parser').userAgent()
var d64 = require('d64')
var fc = require('turf-featurecollection')
var polygon = require('turf-polygon')
var worldpop = require('./')
var MapView = require('./app/map-view')
var Progress = require('./app/progress')
var DownloadLink = require('./app/download-link')
var accessToken = require('./app/mapbox-access-token')
var styles = require('./css/styles.css')
styles()

/*
 * Add "chrome" class so we can warn against non-chrome usage.
 */
if (userAgent.browser.chrome) {
  document.querySelector('html').classList.add('chrome')
}

var map = new MapView('map', calculateTotal, updateMapView)
var progress = new Progress(document.querySelector('#progress'))
var download = new DownloadLink(document.querySelector('a.download'))
var results = document.querySelector('.results')

var options = {}
parseOptions()

dragDrop(document.body, function (files) {
  files.forEach(function (file) {
    console.log('file', file, file.toString())
    map.setPolygon(file)
  })
})

function updateMapView (zoom, longitude, latitude) {
  options.zoom = zoom
  options.longitude = longitude
  options.latitude = latitude
  updateHash()
}

function calculateTotal (layer) {
  progress.reset()
  var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/' +
    `${options.source}.json?access_token=${accessToken}`
  var testPoly = layer.toGeoJSON()

  worldpop({
    source: tilesUri,
    density: density,
    polygon: testPoly,
    min_zoom: 11,
    max_zoom: 11,
    progress: progress.update.bind(progress),
    progressFrequency: 100
  }, function (err, result) {
    if (err) console.error(err)
    testPoly.properties = xtend(testPoly.properties, result)
    map.updatePolygon(layer, testPoly)
    var currentResult = map.drawnPolygonsToGeoJSON()
    download.setString(JSON.stringify(currentResult), 'application/json')
    updateHash(currentResult)
    results.classList.add('show')
    progress.finish(result)
  })
}

function density (feature) {
  return feature.properties[options.densityProp] / options.multiplier
}

function parseOptions () {
  var defaults = {
    source: 'devseed.oexqd7vi',
    densityProp: 'density',
    multiplier: 10000,
    min_zoom: 11,
    max_zoom: 11,
    longitude: 85.3171,
    latitude: 27.7007,
    zoom: 10
  }

  var hash = window.location.hash || '#'
  var params = qs.parse(hash.slice(1).split(',').join('&'))
  options = xtend(defaults, params)

  console.log(hash, params, options)
  // numeric options
  void [
    'multiplier',
    'min_zoom',
    'max_zoom',
    'longitude',
    'latitude',
    'zoom'
  ].forEach((k) => options[k] = Number(options[k]))

  if (options.polygon) {
    options.polygon = decodeGeoJson(options.polygon)
  } else {
    results.classList.remove('show')
  }

  updateHash()
  map.setView(options)
  map.setPolygon(options.polygon)
}

function updateHash (poly) {
  if (poly) {
    options.polygon = encodeGeoJson(poly)
  }

  hash.removeAllListeners()
  hash.once('change', function () {
    hash.on('change', parseOptions)
  })
  window.location.hash = Object.keys(options)
    .map((k) => [k, options[k]].map(encodeURIComponent).join('='))
    .join(',')
}

/*
 * FeatureCollection of Polygons --> [ [ [ [x,y], ... ] ], ... ]
 */
function encodeGeoJson (geojson) {
  if (geojson.type === 'FeatureCollection') {
    geojson = geojson.features.map((f) => f.geometry.coordinates)
  } else {
    geojson = [geojson.geometry.coordinates]
  }

  return d64.encode(new Buffer(JSON.stringify(geojson), 'utf-8'))
}

function decodeGeoJson (str) {
  var coordinates = JSON.parse(d64.decode(str).toString('utf-8'))
  console.log(coordinates)
  return fc(coordinates .map((poly) => polygon(poly)))
}
