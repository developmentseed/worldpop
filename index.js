'use strict'

var turfarea = require('turf-area')
var through = require('through2')
var tiledData = require('./lib/tiled-data')
var clip = require('./lib/clip')
var fix = require('./lib/fix')
var debug = require('debug')('polypop:main')
var debugTotal = require('debug')('polypop:totalTime')

/**
 * Computes the total population within the given polygon.
 *
 * @param opts - Options: { min_zoom: 8, max_zoom: 12 }
 * @param source - A GeoJSON Feature stream or Tilelive uri for the tiled
 * population data, where each feature represents an area of constant
 * population density.
 * @param densityFn - A function that accepts a feature from `source` and
 * returns the population density for that feature.
 * @param {Feature<Polygon>} poly - The polygon whose interior population we
 * want.
 * @param cb - completion callback, called with {totalPopulation, totalArea,
 * polygonArea}.
 * @return - a GeoJSON feature stream of constant-population polygons, clipped
 * to the poly of interest
 */
module.exports = function getTotalForPoly (opts, source, densityFn, poly, cb) {
  if (typeof cb === 'undefined') {
    cb = poly
    poly = densityFn
    densityFn = source
    source = opts
    opts = {}
  }
  opts.min_zoom = opts.min_zoom || 8
  opts.max_zoom = opts.max_zoom || 12

  if (typeof source.pipe !== 'function') {
    source = tiledData(source, poly, opts)
  }

  var result = {
    count: 0,
    totalPopulation: 0,
    totalArea: 0,
    polygonArea: turfarea(poly)
  }

  debugTotal('start')
  return source
    .pipe(fix())
    .pipe(clip(poly))
    .pipe(through.obj(function write (feat, _, next) {
      next(null, popped(densityFn, poly, feat))
    }))
    .on('data', function (feat) {
      result.totalPopulation += feat.properties.population
      result.totalArea += feat.properties.area
      result.count++
    })
    .on('end', function () {
      debugTotal('end')
      debugTotal(result)
      cb(null, result)
    })
    .on('error', cb)
}

function popped (densityFn, poly, feat) {
  var density = densityFn(feat)
  feat.properties.area = turfarea(feat)
  feat.properties.population = feat.properties.area * density
  debug(feat.properties)
  return feat
}
