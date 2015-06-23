var xtend = require('xtend')
var dragDrop = require('drag-drop/buffer')
var work = require('webworkify')

var worldpop = work(require('./app/worker.js'))
var HashState = require('./app/hash-state')
var MapView = require('./app/map-view')
var Progress = require('./app/progress')
var DownloadLink = require('./app/download-link')
var accessToken = require('./app/mapbox-access-token')
var styles = require('./css/styles.css')
styles()

window.worldpop = {
  worldpop: worldpop,
  debug: require('debug')
}

var defaults = {
  source: 'devseed.isnka9k9',
  layer: 'population',
  densityProp: 'density',
  multiplier: 10000,
  min_zoom: 11,
  max_zoom: 11,
  longitude: 5.625,
  latitude: 6.6646,
  zoom: 3
}

var results = document.querySelector('.results')
var hash = new HashState(defaults, hashStateChange)
var map = new MapView('map', calculateTotal, onMapMove)
var progress = new Progress(document.querySelector('#progress'))
var download = new DownloadLink(document.querySelector('a.download'))

var drawnLayer = null
var testPoly = null

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

  var mv = document.querySelector('.map-view')

  if (zoom >= 6) {
    mv.classList.remove('draw-disabled')
  } else {
    mv.classList.add('draw-disabled')
  }
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
  drawnLayer = layer
  testPoly = layer.toGeoJSON()
  var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/' +
    `${state.source}.json?access_token=${accessToken}`

  worldpop.postMessage({
    source: tilesUri,
    layer: state.layer,
    polygon: testPoly,
    min_zoom: 11,
    max_zoom: 11,
    progressFrequency: 100
  })
}

worldpop.addEventListener('message', function (ev) {
  var type = ev.data.type
  if (type === 'progress') {
    progress.update(ev.data.result)
  } else if (type === 'complete') {
    var err = ev.data.error
    var result = ev.data.result

    if (err) console.error(err)

    testPoly.properties = xtend(testPoly.properties, result)
    map.updatePolygon(drawnLayer, testPoly)

    var geojsonResult = map.drawnPolygonsToGeoJSON()
    hash.update({ polygon: geojsonResult })
    download.setString(JSON.stringify(geojsonResult), 'application/json')
    results.classList.add('show')
    progress.finish(result)
  }
})

