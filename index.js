'use strict';

var intersect = require('turf-intersect');
var turfarea = require('turf-area');

var debug = require('debug')('polypop')

function populationInIntersection(poly, feature, densityFn) {
    var intersection = intersect(poly, feature);
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
 * @param {FeatureCollection<Polygon>} dataset - The population data, where each feature represents an area of constant population density.
 * @param densityFn - A function that accepts a feature from `dataset` and returns the population density for that feature.
 * @param {Feature<Polygon>} poly - The polygon whose interior population we want.
 */

module.exports = function getTotalForPoly(dataset, densityFn, poly) {
  var total = dataset.features
    .map(function(feat) { return populationInIntersection(poly, feat, densityFn)})
    .reduce(function(a, b) { return a + b })

  debug('Total:', total)

  return total
}

