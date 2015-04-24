'use strict'

var turfarea = require('turf-area')
var through = require('through2')
var tiledData = require('./lib/tiled-data')
var clip = require('./lib/clip')
var fix = require('./lib/fix')
var debug = require('debug')('polypop:main')
var debugTotal = require('debug')('polypop:totalTime')

var DEFAULT_PROGRESS_FREQ = 100

/**
 * Computes the total population within the given polygon.
 *
 * @param opts - Options
 * @param {Number} opts.max_zoom
 * @param {Number} opts.min_zoom
 * @param {ReadableStream<Feature>|string} opts.source - A GeoJSON Feature
 * stream or Tilelive uri for the tiled population data, where each feature
 * represents an area of constant population density.
 * @param {function} opts.density - A function that accepts a feature from
 * `source` and returns the population density for that feature.
 * @param {Feature<Polygon>} opts.polygon - The polygon whose interior
 * population we want.
 * @param {function} opts.progress - A progress callback, called periodically
 * with the current state of {totalPopulation, totalArea, polygonArea}. (You can
 * estimate % complete with totalArea/polygonArea.)
 * @param {Number} opts.progressFrequency - Frequency (in # of features) of
 * progress callback.
 * @param cb - completion callback, called with {totalPopulation, totalArea,
 * polygonArea}.
 * @return - a GeoJSON feature stream of constant-population polygons, clipped
 * to the poly of interest
 */
module.exports = function getTotalForPoly (opts, cb) {
  opts.min_zoom = opts.min_zoom || 8
  opts.max_zoom = opts.max_zoom || 12

  var poly = opts.polygon
  var source = typeof opts.source.pipe === 'function' ? opts.source :
    tiledData(opts.source, poly, opts)
  var progressFrequency = opts.progressFrequency || DEFAULT_PROGRESS_FREQ

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
      next(null, popped(opts.density, poly, feat))
    }))
    .on('data', function (feat) {
      result.totalPopulation += feat.properties.population
      result.totalArea += feat.properties.area
      result.count++
      if (opts.progress && result.count % progressFrequency === 0) {
        opts.progress(result)
      }
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
