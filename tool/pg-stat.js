#!/usr/bin/env node

var query = require('pg-query')
var wk = require('wellknown')
var area = require('turf-area')
var concat = require('concat-stream')
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    db: 'worldpop:password@localhost:5432/worldpop'
  }
})

query.connectionParameters = 'postgres://' + argv.db

var clip = 'ST_Clip(rast, ST_GeomFromText($1, 4326)) '

var q1 = 'SELECT (stats).* FROM (' +
  'SELECT ST_SummaryStats(' + clip + ') as stats FROM pop' +
  ') as foo'

process.stdin.pipe(concat(function (input) {
  var poly = JSON.parse(input)
  if (poly.features) poly = poly.features[0]
  var wkt = wk.stringify(poly.geometry)
  query(q1, [ wkt ], function (err, rows, result) {
      if (err) console.error(err)
      console.log('test polygon area:', area(poly))
      console.log(rows[0])
      process.exit()
    })
}))


