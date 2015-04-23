window.myDebug = require('debug')
var qs = require('querystring')
var xtend = require('xtend')
var dragDrop = require('drag-drop/buffer')

var worldpop = require('./')
var MapView = require('./app/map-view')
var accessToken = require('./app/mapbox-access-token')

var styles = require('./css/styles.css')
styles()

document.body.innerHTML = '<div id="map"></div><div id="spinner"><div class="atebits">Calculating</div></div>'

var spinner = document.querySelector('#spinner')
var map = new MapView('map', calculateTotal)

var options = parseOptions()
if (options.polygon) {
  options.polygon = decodeURIComponent(options.polygon)
  map.setPolygon(options.polygon)
}
updateHash()

dragDrop(document.body, function (files) {
  files.forEach(function (file) {
    console.log('file', file, file.toString())
    map.setPolygon(file)
  })
})

function calculateTotal ({layer}) {
  var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/' +
    `${options.source}.json?access_token=${accessToken}`
  var testPoly = layer.toGeoJSON()
  updateHash(testPoly)
  spinner.classList.add('show')
  worldpop(options, tilesUri, density, testPoly, function (err, result) {
    if (err) console.error(err)
    spinner.classList.remove('show')
    map.updatePolygon(layer, result)
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
    max_zoom: 11
  }

  var hash = window.location.hash || '#'
  var params = qs.parse(hash.slice(1).split(',').join('&'))
  var options = xtend(defaults, params)

  void ['multiplier', 'min_zoom', 'max_zoom']
    .forEach((k) => options[k] = Number(options[k]))

  return options
}

function updateHash (poly) {
  if (poly) {
    options.polygon = encodeURIComponent(JSON.stringify(poly))
  }
  window.location.hash = Object.keys(options)
    .map((k) => [k, options[k]].map(encodeURIComponent).join('='))
    .join(',')
}
