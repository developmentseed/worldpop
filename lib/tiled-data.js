var vtGeoJson = require('vt-geojson')
var cover = require('tile-cover')
var debug = require('debug')('polypop:tiles')
/*
 * Get vector tile data to cover the given polygon.
 */
module.exports = function tiledData (sourceUri, layer, polygon, limits) {
  var tiles = cover.tiles(polygon.geometry, limits)
  debug(tiles)
  return vtGeoJson(sourceUri, tiles, [layer])
}
