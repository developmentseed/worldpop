#!/usr/bin/env node

// convert a tile to geojson
// run from a directory containing tiles in z/x/y.vector.Pbf form.

var fs = require('fs')
var JSONStream = require('JSONStream')
// var belt = require('tilebelt')
var Pbf = require('Pbf')
var VectorTile = require('vector-tile').VectorTile
// var SphericalMercator = require('sphericalmercator')

if (process.argv.length < 5) {
  console.log('Usage:' + process.argv[0] + '/' + process.argv[1] + ' z x y')
  process.exit()
}

var t = process.argv.slice(2, 5).map(Number)
var data = fs.readFileSync('./' + t.join('/') + '.vector.Pbf')
var tile = new VectorTile(new Pbf(data))
// var [w, s, e, n] = belt.tileToBBOX([t[1], t[2], t[0]]) // x, y, z

var layers = Object.keys(tile.layers)
var json = JSONStream.stringify('{ "type": "FeatureCollection", "features": [ ',
  '\n,\n', '] }')
json.pipe(process.stdout)
layers.forEach(function (l) {
  var layer = tile.layers[l]
  // var merc = new SphericalMercator({size: layer.extent})
  // var tileOrigin = merc.xyz([w, s, e, n], t[0])
  for (var i = 0; i < layer.length; i++) {
    // not really sure what x and y should be in toGeoJSON()
    var feat = layer.feature(i).toGeoJSON(t[1], t[2], t[0])
    json.write(feat)
  }
  json.end()
})
