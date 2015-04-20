'use strict'

var turfarea = require('turf-area')
var reduce = require('through2-reduce')
var map = require('through2-map')
var tiledData = require('./lib/tiled-data')
var clip = require('./lib/clip')
var fix = require('./lib/fix')
var debug = require('debug')('polypop:main')

/**
 * Computes the total population within the given polygon.
 *
 * @param opts - Options: { min_zoom: 8, max_zoom: 12 }
 * @param source - A GeoJSON Feature stream or Tilelive uri for the tiled
 * population data, where each feature represents an area of constant
 * population density.
 * @param densityFn - A function that accepts a feature from `dataset` and
 * returns the population density for that feature.
 * @param {Feature<Polygon>} poly - The polygon whose interior population we
 * want.
 * @param cb - completion callback, called with total pop.
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

  source
    .pipe(fix())
    .pipe(clip(poly))
    .pipe(map.obj(pop.bind(null, densityFn, poly)))
    .pipe(reduce({objectMode: true}, function (a, b) { return a + b }))
    .on('data', function (total) {
      debug('Total', total)
      cb(null, total)
    })
    .on('error', cb)
}

function pop (densityFn, poly, intersection) {
  var area = turfarea(intersection)
  var density = densityFn(intersection)
  var areaTotal = area * density

  debug('Area of intersection (sq meters)', area)
  debug('Density of feature', density)
  debug('Population in feature area', areaTotal)

  return areaTotal
}
