'use strict';

var fs = require('fs');
var polypop = require('../');

if(process.argv.length < 4) {
  console.log('Usage: ' + process.argv[0] + ' ' + process.argv[1] +
    'population-data.json property-name test-polygon.json')
  process.exit()
}

var data = JSON.parse(fs.readFileSync(process.argv[2]))
var testPoly = JSON.parse(fs.readFileSync(process.argv[4]))
function density(feature) {
  return feature.properties[process.argv[3]] / 1E5
}

var total = polypop(data, density, testPoly);

console.log('Total population in feature area is', total);
