'use strict'

var xtend = require('xtend')
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
 * @name worldpop
 * @param {WorldpopOpts} opts - Options.
 * @param cb - completion callback, called with {totalPopulation, totalArea,
 * polygonArea}.
 * @returns {ReadableStream<Feature>} - a GeoJSON feature stream of
 * constant-population polygons, clipped to the poly of interest
 */
module.exports = worldpop

/**
 * Options object for the `worldpop` function.
 * @name WorldpopOpts
 * @typedef {Object} WorldpopOpts
 * @property {number} minzoom
 * @property {number} maxzoom
 * @property {(string|ReadableStream<Feature>)} source - A GeoJSON Feature
 * stream or Tilelive uri for the tiled population data, where each feature
 * represents an area of constant population density.
 * @property {string} layer - If `source` is a tile source, the layer in which
 * to find the population features.
 * @property {function} density - A function that accepts a feature from
 * `source` and returns the population density for that feature.
 * @property {Feature<Polygon>} polygon - The polygon whose interior population
 * we want.
 * @property {function} progress - A progress callback, called periodically
 * with the current state of {totalPopulation, totalArea, polygonArea}. (You
 * can estimate % complete with totalArea/polygonArea.)
 * @property {Number} progressFrequency - Frequency (in # of features) of
 * progress callback.
 */

function worldpop (opts, cb) {
  opts.min_zoom = opts.min_zoom || 8
  opts.max_zoom = opts.max_zoom || 12

  var poly = opts.polygon
  var source = typeof opts.source.pipe === 'function' ? opts.source :
    tiledData(opts.source, opts.layer, poly, opts)
  var progressFrequency = opts.progressFrequency || DEFAULT_PROGRESS_FREQ

  var result = {
    count: 0,
    totalPopulation: 0,
    totalArea: 0,
    polygonArea: turfarea(poly)
  }

  debugTotal('start', Date.now())
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
        var snap = xtend({}, result)
        setTimeout(function () { opts.progress(snap) }, 0)
      }
    })
    .on('end', function () {
      debugTotal('end', Date.now())
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

