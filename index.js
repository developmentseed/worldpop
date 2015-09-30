'use strict'

var xtend = require('xtend')
var turfarea = require('turf-area')
var through = require('through2')
var throttle = require('lodash.throttle')
var tiledData = require('./lib/tiled-data')
var clip = require('./lib/clip')
var fix = require('./lib/fix')
var debug = require('debug')('polypop:main')
var debugTotal = require('debug')('polypop:totalTime')

module.exports = worldpop

/**
 * Computes the total population within the given polygon.
 *
 * @param opts - Options
 * @param {number} opts.max_zoom
 * @param {number} opts.min_zoom
 * @param {(string|ReadableStream<Feature>)} opts.source - A GeoJSON Feature
 * stream or Tilelive uri for the tiled population data, where each feature
 * represents an area of constant population density.
 * @param {string} opts.layer - If `source` is a tile source, the layer in
 * which to find the population features.
 * @param {function} opts.density - A function that accepts a feature from
 * `source` and returns the population density for that feature.
 * @param {Feature<Polygon>} opts.polygon - The polygon whose interior
 * population we want.
 * @param {function} opts.progress - A progress callback, called periodically
 * with the current state of {totalPopulation, totalArea, polygonArea}. (You
 * can estimate % complete with totalArea/polygonArea.)
 * @param {Number} opts.progressFrequency - Frequency in ms of the callback
 * (default 100)
 * @param cb - completion callback, called with {totalPopulation, totalArea,
 * polygonArea}.
 * @return - a GeoJSON feature stream of constant-population polygon features,
 * clipped to the poly of interest and annotated with `area` and `population`
 * propeties.
 */
function worldpop (opts, cb) {
  opts = xtend({
    min_zoom: 8,
    max_zoom: 12,
    progressFrequency: 100
  }, opts || {})

  if (opts.progress) {
    opts.progress = throttle(opts.progress, opts.progressFrequency)
  }

  var poly = opts.polygon
  var source = typeof opts.source.pipe === 'function' ? opts.source
    : tiledData(opts.source, opts.layer, poly, opts)

  var result = {
    count: 0,
    totalPopulation: 0,
    totalArea: 0,
    polygonArea: turfarea(poly)
  }

  debugTotal('start', Date.now())
  var outputStream = source
    .pipe(fix())
    .pipe(clip(poly))
    .pipe(through.obj(function write (feat, _, next) {
      next(null, popped(opts.density, poly, feat))
    }))
    .on('data', function (feat) {
      result.totalPopulation += feat.properties.population
      result.totalArea += feat.properties.area
      result.count++
      if (opts.progress) {
        opts.progress(xtend({}, result))
      }
    })

  if (cb) {
    outputStream
    .on('end', function () {
      debugTotal('end', Date.now())
      debugTotal(result)
      cb(null, result)
    })
    .on('error', cb)
  }

  return outputStream
}

function popped (densityFn, poly, feat) {
  var density = densityFn(feat)
  feat.properties.area = turfarea(feat)
  feat.properties.population = feat.properties.area * density
  debug(feat.properties)
  return feat
}
