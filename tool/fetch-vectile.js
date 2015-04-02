#!/usr/bin/env node

var fs = require('fs')
var request = require('request')
var mkdirp = require('mkdirp')

function long2tile (lon, zoom) { return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom))) }
function lat2tile (lat, zoom) { return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))) }

if (process.argv.length < 5) {
  console.log('Usage: ', process.argv[0], process.argv[1], 'mapid zoom longitude latitude')
  process.exit()
}

var mapid = process.argv[2]
var zoom = Number(process.argv[3])
var lng = Number(process.argv[4])
var lat = Number(process.argv[5])

var endpoint = 'http://a.tiles.mapbox.com/v4/'
var access = 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q'
var tile = [zoom, long2tile(lng, zoom), lat2tile(lat, zoom)]

var url = endpoint + mapid + '/' + tile.join('/') +
  '.vector.pbf?access_token=' + access

mkdirp.sync('./' + tile[0] + '/' + tile[1])

request.get({
  method: 'GET',
  uri: url,
  gzip: true
}).pipe(fs.createWriteStream('./' + tile.join('/') + '.vector.pbf'))
