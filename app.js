var xtend = require('xtend')
var dragDrop = require('drag-drop/buffer')
var work = require('webworkify')
var hat = require('hat')

var worldpop = work(require('./app/worker.js'))
var HashState = require('./app/hash-state')
var MapView = require('./app/map-view')
var Progress = require('./app/progress')
var DownloadLink = require('./app/download-link')
var accessToken = require('./app/mapbox-access-token')
var styles = require('./css/styles.css')
styles()

// expose these on window for debugging purposes
window.worldpop = {
  worldpop: worldpop,
  debug: require('debug')
}

var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/' +
  'devseed.isnka9k9.json?access_token=' + accessToken
var tileLayer = 'population'

var defaults = {
  longitude: 5.625,
  latitude: 6.6646,
  zoom: 3
}

var results = document.querySelector('.results')
var hash = new HashState(defaults, hashStateChange)
var map = new MapView('map', calculateTotal, onMapMove)
var progress = new Progress(document.querySelector('#progress'))
var download = new DownloadLink(document.querySelector('a.download'))

document.querySelector('#clear').addEventListener('click', function (e) {
  hash.clear()
})

var drawnLayers = hat.rack()
var testPoly = null

// current hash options, updated in hashStateChange
var state = {}
hash.parse()

dragDrop(document.body, function (files) {
  files.forEach(function (file) {
    map.setPolygon(JSON.parse(file))
    map.setView({polygon: JSON.parse(file)})
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
  testPoly = layer.toGeoJSON()
  var drawnLayerId = drawnLayers({layer, testPoly})

  worldpop.postMessage({
    drawnLayerId,
    source: tilesUri,
    layer: tileLayer,
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

    var {layer, testPoly} = drawnLayers.get(ev.data.drawnLayerId)
    testPoly.properties = xtend(testPoly.properties, result)
    map.updatePolygon(layer, testPoly)

    var geojsonResult = map.drawnPolygonsToGeoJSON()
    hash.update({ polygon: geojsonResult })
    download.setString(JSON.stringify(geojsonResult), 'application/json')
    results.classList.add('show')
    progress.finish(result)
  }
})

