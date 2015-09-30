var kinks = require('turf-kinks')
var intersect = require('turf-intersect')
var buffer = require('turf-buffer')
var turfarea = require('turf-area')
var explode = require('turf-explode')
var inside = require('turf-inside')
var through = require('through2')
var debug = require('debug')('polypop:clip')

/*
 * Transform stream that takes GeoJSON features and writes features
 * that are clipped to the given poly.
 */
module.exports = function clip (poly) {
  return through.obj(function (feature, _, next) {
    feature = bufferDegenerate(feature)
    if (filterDegenerate(feature)) {
      return next()
    }

    if (isInside(feature, poly)) {
      return next(null, feature)
    } else {
      clipPolygon(poly, feature, next)
    }
  })
}

function bufferDegenerate (feature) {
  // clean up any self-intersecting polygons with a naive polygon
  // offset (aka 'buffer') algorithm.
  var k = kinks(feature)
  if (k.intersections.features.length > 0) {
    var buffed = buffer(feature, 0)
    buffed.properties = feature.properties
    return buffed
  } else {
    return feature
  }
}

function filterDegenerate (feature) {
  // TODO: this could be done faster
  var featureArea = turfarea(feature)
  debug('feature area', featureArea)
  return featureArea < 1
}

function isInside (feature, poly) {
  var points = explode(feature)
  return points.features.map(function (pt) {
    return inside(pt, poly)
  })
  .reduce(function (a, b) { return a && b }, true)
}

function clipPolygon (poly, feature, next) {
  try {
    var intersection = intersect(poly, feature)
    if (intersection) {
      intersection.properties = feature.properties
      next(null, intersection)
    } else {
      debug('no intersection')
      next()
    }
  } catch (e) {
    debug(e)
    debug(JSON.stringify(feature))
    next(e)
  }
}
