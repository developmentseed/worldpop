'use strict';

var intersect = require('turf-intersect');
var turfarea = require('turf-area');
var kinks = require('turf-kinks');
var buffer = require('turf-buffer');

var debug = require('debug')('polypop');

function populationInIntersection(feature, densityFn, poly) {
    debug(feature);

    // clean up any self-intersecting polygons with a naive polygon
    // offset (aka 'buffer') algorithm.
    var k = kinks(feature);
    if(k.intersections.features.length > 0) {
      var buffed = buffer(feature, 0);
      buffed.properties = feature.properties;
      feature = buffed;
    }

    var intersection;
    try {
      intersection = intersect(poly, feature);
    } catch(e) {
      debug(JSON.stringify(feature));
      throw e;
    }
    var hasIntersection = intersection !== undefined;
    debug('Area has intersection: ', hasIntersection);

    if (!hasIntersection) {
      return 0;
    }

    var area = turfarea(intersection);
    var density = densityFn(feature);
    var areaTotal = area * density;

    debug('Area of intersection (sq meters)', area);
    debug('Density of feature', density)
    debug('Population in feature area', areaTotal);

    return areaTotal;
}

/**
 * Computes the total population within the given polygon.
 *
 * @param {FeatureCollection<Polygon>} dataset - The population data, where
 * each feature represents an area of constant population density.
 * @param densityFn - A function that accepts a feature from `dataset` and
 * returns the population density for that feature.
 * @param {Feature<Polygon>} poly - The polygon whose interior population we
 * want.
 */

module.exports = function getTotalForPoly(dataset, densityFn, poly) {
  var features = (dataset.type === 'Feature') ? [dataset] : dataset.features;
  var total = features
    .map(function(feat) {
      return populationInIntersection(feat, densityFn, poly)
    })
    .reduce(function(a, b) { return a + b })

  debug('Total:', total)

  return total
}

