window.myDebug = require('debug')
/* global L */
require('./css/styles.css')
var qs = require('querystring')
var xtend = require('xtend')
var worldpop = require('./')

var accessToken = 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJWQlQ1NlNVIn0.IT_b8KVeZDvOFZLWF7DpvQ'

/**
 * Set up the map.
 */

document.body.innerHTML = '<div id="map"></div><div id="spinner"><div class="atebits">Calculating</div></div>'

var spinner = document.querySelector('#spinner')

L.mapbox.accessToken = accessToken
var map = window.themap = L.mapbox.map('map', 'mapbox.light')
  .setView([-1.9449, 29.8806], 9)

var featureGroup = L.featureGroup().addTo(map)
new L.Control.Draw({
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
}).addTo(map)

map.on('draw:created', calculateTotal)
map.on('draw:edited', (e) => { e.layers.eachLayer(calculateTotal) })

var options = parseHash()
if (options.polygon) {
  try {
    options.polygon = decodeURIComponent(options.polygon)
    L.geoJson(JSON.parse(options.polygon), {
      onEachFeature: (feat, layer) => {
        calculateTotal({ layer })
      }
    })
  } catch(e) {
    console.error(e)
  }
}
updateHash()

function calculateTotal ({layer}) {
  var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/' +
    '{mapid}.json?access_token={access}'
    .split('{mapid}').join(options.source)
    .split('{access}').join(accessToken)

  var testPoly = layer.toGeoJSON()
  updateHash(testPoly)

  spinner.classList.add('show')
  worldpop(options, tilesUri, density, testPoly, function (err, result) {
    if (err) console.error(err)
    spinner.classList.remove('show')
    featureGroup.clearLayers()
    featureGroup.addLayer(layer)
    layer.bindPopup(`${result.totalPopulation} people in
      ${result.totalArea} (${result.polygonArea}) m^2`)
    layer.openPopup()
  })
}

function density (feature) {
  return feature.properties[options.densityProp] / options.multiplier
}

function parseHash () {
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
