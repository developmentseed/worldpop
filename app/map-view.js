 /* global L */
var fc = require('turf-featurecollection')
var extent = require('turf-extent')
var numeral = require('numeral')

var accessToken = require('./mapbox-access-token')
var polyColor = '#0571b0'
var polygonDataArray = []

module.exports = class MapView {

  /**
   * @param {string} mapElementId - the id of the DOM element meant to contain
   * the Leaflet map
   * @param {function} onPolygonChange - called when the user draws or edits
   * a polygon.
   * @param {function} updateMapView - called with (zoom, longitude, latitude)
   * when the user finishes moving or zooming the map.
   */
  constructor (mapElementId, onPolygonChange, updateMapView) {
    var self = this
    this.onPolygonChange = onPolygonChange
    L.mapbox.accessToken = accessToken
    this.map = window.themap = L.mapbox.map('map', 'devseed.3a52f684')
    var map = this.map

    this.featureGroup = L.featureGroup().addTo(this.map)

    // !!!!!!!!!!!!!!!!!!!!//
    // Draw Controls //
    // !!!!!!!!!!!!!!!!!!!!//
    // Normal setup of draw control
    var drawnItems = new L.FeatureGroup()
    this.map.addLayer(drawnItems)

    var drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: 'Self-interecting polygons are not supported.'
          },
          shapeOptions: {
            color: polyColor
          }
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false
      }
    })
    // Turns on old draw controls
    // this.map.addControl(drawControl)

    // Attaches Draw Control to div
    document.getElementById('shapedrawer').addEventListener('click', function () {
      new L.Draw.Polygon(map, drawControl.options.polyline).enable()
      /* eslint-disable no-new */
      new L.EditToolbar.Edit(map, {
        featureGroup: drawControl.options.featureGroup,
        selectedPathOptions: drawControl.options.edit.selectedPathOptions
      })
    })
 // !!!!!!!!!!!!!!!!!!!//
 // Draw Control Ends //
 // !!!!!!!!!!!!!!!!!!!//

    this.map.on('draw:created', ({layer}) => onPolygonChange(layer))
    this.map.on('draw:edited', ({layers}) => layers.eachLayer(onPolygonChange))

    function updateView (e) {
      var {lat, lng} = self.map.getCenter()
      updateMapView(self.map.getZoom(), lng, lat)
    }
    this.map.on('moveend', updateView)
    this.map.on('zoomend', updateView)
  }

  /**
   * @param layer - the layer to update (will be removed)
   * @param {GeoJSON} annotatedPoly - A GeoJSON polygon feature, annotated with
   * `totalPopulation`, `totalArea`, and `polygonArea` properties.
   */

  updatePolygon (layer, annotatedPoly) {
    let newLayer = L.geoJson(annotatedPoly, {
      style: function (feature) {
        return { color: polyColor }
      }
    })
    this.featureGroup.removeLayer(layer)
    this.featureGroup.addLayer(newLayer)

    let props = annotatedPoly.properties

    newPoly(props)

    // attach popup with population data
    // var ppl = numeral(props.totalPopulation).format('0,0')
    // var area = numeral(props.polygonArea / 1e6).format('0,0.00')
    // var density = numeral(props.totalPopulation / props.polygonArea * 1e6)
    //   .format('0,0.0')
    // newLayer.bindPopup(`
    //   <dl>
    //     <dt>Population:</dt><dd>${ppl} persons</dd>
    //     <dt>Area:</dt><dd>${area} km<sup>2</sup></dd>
    //     <dt>Density:</dt><dd>${density} persons / km<sup>2</sup></dd>
    //   </dl>
    // `, { className: 'result-popup' })
    // newLayer.openPopup()
  }

  /**
   * @param {string|GeoJSON} geojson - A GeoJSON polygon feature.
   */
  setPolygon (geojson) {
    var self = this
    this.featureGroup.eachLayer(function (layer) {
      self.featureGroup.removeLayer(layer)
    })
    if (!geojson) return
    let parsed = typeof geojson === 'string' ? JSON.parse(geojson) : geojson
    L.geoJson(parsed, {
      onEachFeature: (feat, layer) => {
        this.onPolygonChange(layer)
      }
    })
  }

  /**
   * @return {FeatureCollection} GeoJSON representation of the user-drawn
   * polygons.
   */
  drawnPolygonsToGeoJSON () {
    let features = []
    this.featureGroup.eachLayer((layer) => {
      features.push(layer.toGeoJSON().features)
    })
    return fc(Array.prototype.concat.apply([], features))
  }

  /**
   * @param options - An object with `zoom`, `latitude`, and `longitude`, OR
   * `polygon` a GeoJSON object.
   */
  setView (options) {
    if (options.polygon) {
      var bounds = extent(options.polygon)
      this.map.fitBounds([
        [bounds[1], bounds[0]],
        [bounds[3], bounds[2]]
      ])
    } else {
      this.map.setZoom(options.zoom)
      this.map.panTo([options.latitude, options.longitude])
    }
  }
}
// !!!!!!!!!!!!!!!!!!!!//
// PolygonStatBars //
// !!!!!!!!!!!!!!!!!!!!//
function newPoly (props) {
  polygonDataArray.push(props)

  // Hides 'draw a shape on the map...' block of text
  document.getElementById('helper-initial').style.display = 'none'

  // Clears away previous Bars when a new polygon is added
  var elements = document.getElementsByClassName('drawn-polygon-stats-block')
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0])
  }

  for (var i = 0; i < polygonDataArray.length; i++) {
    var divmaker = document.createElement('div')
    divmaker.id = i + '_drawn-polygon-stats-block'
    divmaker.className = 'drawn-polygon-stats-block'

    document.getElementById('helper').appendChild(divmaker)
    // document.querySelectorAll('.results').appendChild(divmaker)

    var data = polygonDataArray[i]
    var ppl = numeral(data.totalPopulation).format('0,0')
    var area = numeral(data.polygonArea / 1e6).format('0,0.00')
    var density = numeral(data.totalPopulation / props.polygonArea * 1e6)
      .format('0,0.0')
    divmaker.innerHTML = `
      <div><strong>${ppl}</strong> persons / <strong>${area}</strong> km<sup>2</sup></div>
      <div>(<strong>${density}</strong> persons / km<sup>2</sup>)</div>
    `
  }
// !!!!!!!!!!!!!!!!!!!!//
// End PolygonStatBars//
// !!!!!!!!!!!!!!!!!!!!//
}

// Sets up clear button to also reset the Polygon data and array
document.getElementById('clear').addEventListener('click', function () {
  var elements = document.getElementsByClassName('drawn-polygon-stats-block')
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0])
  }
  polygonDataArray = []
})
