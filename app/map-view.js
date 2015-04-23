/* global L */
var accessToken = require('./mapbox-access-token')
module.exports = class MapView {

  constructor (mapElementId, onPolygonChange) {
    this.onPolygonChange = onPolygonChange
    L.mapbox.accessToken = accessToken
    this.map = window.themap = L.mapbox.map('map', 'mapbox.light')
      .setView([-1.9449, 29.8806], 9)

    this.featureGroup = L.featureGroup().addTo(this.map)
    new L.Control.Draw({
      edit: {
        featureGroup: this.featureGroup
      },
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false
      }
    }).addTo(this.map)

    this.map.on('draw:created', ({layer}) => onPolygonChange(layer))
    this.map.on('draw:edited', ({layers}) => layers.eachLayer(onPolygonChange))
  }

  updatePolygon (layer, result) {
    // only allow one polygon
    this.featureGroup.clearLayers()
    this.featureGroup.addLayer(layer)

    // attach popup with population data
    layer.bindPopup(`${result.totalPopulation} people in
      ${result.totalArea} (${result.polygonArea}) m^2`)
    layer.openPopup()
  }

  /**
   * @param {string|GeoJSON} A GeoJSON polygon feature.
   */
  setPolygon (geojson) {
    try {
      L.geoJson(JSON.parse(geojson), {
        onEachFeature: (feat, layer) => {
          console.log('layer', layer.toGeoJSON)
          this.onPolygonChange(layer)
        }
      })
    } catch(e) {
      console.error(e)
    }
  }
}
