window.myDebug = require('debug')

/* global L */
require('mapbox.js')
require('leaflet-draw')
require('./css/styles.css')
var url = require('url')
var xtend = require('xtend')
var worldpop = require('./')

var accessToken = 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJWQlQ1NlNVIn0.IT_b8KVeZDvOFZLWF7DpvQ'

var defaults = {
  source: 'devseed.oexqd7vi',
  densityProp: 'density',
  multiplier: 10000,
  min_zoom: 11,
  max_zoom: 11
}
var params = url.parse(window.location.href, true).query
var options = xtend(defaults, params)

function density (feature) {
  return feature.properties[options.densityProp] / options.multiplier
}

document.body.innerHTML = '<div id="map"></div><div id="spinner"><div class="atebits">Calculating</div></div>'

var spinner = document.querySelector('#spinner')

L.mapbox.accessToken = accessToken
var map = window.themap = L.mapbox.map('map', 'mapbox.light')
  .setView([-1.9449, 29.8806], 9)

var featureGroup = L.featureGroup().addTo(map)

var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: featureGroup
  },
  draw: {
    polygon: true,
    polyline: false,
    rectangle: false,
    circle: false,
    marker: false
  }
})

drawControl.addTo(map)

map.on('draw:created', calculateTotal)
map.on('draw:edited', (e) => { e.layers.eachLayer(calculateTotal) })

function calculateTotal (e) {
  var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/' +
    '{mapid}.json?access_token={access}'
    .split('{mapid}').join(options.source)
    .split('{access}').join(accessToken)

  var testPoly = e.layer.toGeoJSON()

  spinner.classList.add('show')
  worldpop(options, tilesUri, density, testPoly, function (err, result) {
    if (err) console.error(err)
    spinner.classList.remove('show')
    featureGroup.clearLayers()
    featureGroup.addLayer(e.layer)
    e.layer.bindPopup(`${result.totalPopulation} people in
      ${result.totalArea} (${result.polygonArea}) m^2`)
    e.layer.openPopup()
  })
}
