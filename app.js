/* global L */
require('mapbox.js')
require('leaflet-draw')
require('./css/styles.css')
var polypop = require('./')

var accessToken = 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJWQlQ1NlNVIn0.IT_b8KVeZDvOFZLWF7DpvQ'

var tileOptions = {
  mapId: 'devseed.z6mt2o6r',
  densityProp: 'density',
  multiplier: 10000,
  limits: {
    min_zoom: 11,
    max_zoom: 11
  }
}

function density (feature) {
  return feature.properties[tileOptions.densityProp] / tileOptions.multiplier
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
  var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/{mapid}.json?access_token={access}'
    .split('{mapid}').join(tileOptions.mapId)
    .split('{access}').join(accessToken)

  var testPoly = e.layer.toGeoJSON()

  spinner.classList.add('show')
  polypop(tileOptions.limits, tilesUri, density, testPoly,
  function (err, total) {
    if (err) console.error(err)
    spinner.classList.remove('show')
    featureGroup.clearLayers()
    featureGroup.addLayer(e.layer)
    e.layer.bindPopup(total / 10 + ' people')
    e.layer.openPopup()
  })
}


