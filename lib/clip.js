var kinks = require('turf-kinks')
var intersect = require('turf-intersect')
var buffer = require('turf-buffer')
var turfarea = require('turf-area')
var through = require('through2')
var debug = require('debug')('polypop:clip')

/**
 * Transform stream that takes GeoJSON features and writes features
 * that are clipped to the given poly.
 */
module.exports = function (poly) {
  return through.obj(function (feature, _, next) {
    // clean up any self-intersecting polygons with a naive polygon
    // offset (aka 'buffer') algorithm.
    var k = kinks(feature)
    if (k.intersections.features.length > 0) {
      var buffed = buffer(feature, 0)
      buffed.properties = feature.properties
      feature = buffed
    }

    // TODO: this could be done faster
    var featureArea = turfarea(feature)
    debug('feature area', featureArea)
    if (featureArea < 1) return next()

    try {
      var intersection = intersect(poly, feature)
      if (intersection) {
        intersection.properties = feature.properties
        next(null, intersection)
      } else {
        debug('no intersection')
        next()
      }
    } catch(e) {
      debug(e)
      debug(JSON.stringify(feature))
      next(e)
    }
  })
}
