window.myDebug = require('debug')
var xtend = require('xtend')
var dragDrop = require('drag-drop/buffer')
var userAgent = require('ua_parser').userAgent()

var worldpop = require('./')
var HashState = require('./app/hash-state')
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

var results = document.querySelector('.results')
var hash = new HashState(defaults, hashStateChange)
var map = new MapView('map', calculateTotal, onMapMove)
var progress = new Progress(document.querySelector('#progress'))
var download = new DownloadLink(document.querySelector('a.download'))

// current hash options, updated in hashStateChange
var state = {}
hash.parse()

dragDrop(document.body, function (files) {
  files.forEach(function (file) {
    map.setPolygon(JSON.parse(file))
  })
})

function onMapMove (zoom, longitude, latitude) {
  hash.update({ zoom, longitude, latitude })
}

function hashStateChange (newState) {
  state = newState
  if (!state.polygon) {
    results.classList.remove('show')
  }
  var {zoom, longitude, latitude} = state
  map.setView({zoom, longitude, latitude})
  map.setPolygon(state.polygon)
}

function calculateTotal (layer) {
  progress.reset()
  var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/' +
    `${state.source}.json?access_token=${accessToken}`
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

    var geojsonResult = map.drawnPolygonsToGeoJSON()
    hash.update({ polygon: geojsonResult })
    download.setString(JSON.stringify(geojsonResult), 'application/json')
    results.classList.add('show')
    progress.finish(result)
  })
}

function density (feature) {
  return feature.properties[state.densityProp] / state.multiplier
}
