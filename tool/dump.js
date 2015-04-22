#!/usr/bin/env node

/**
 * Dump raster data from the PostGIS db as GeoJSON polygons
 *
 * Usage: cat boundingPoly.geojson | node dump.js [--db user:pass@host:port/dbname]
 */

var query = require('pg-query')
var wk = require('wellknown')
var concat = require('concat-stream')
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    db: 'worldpop:password@localhost:5432/worldpop'
  }
})

query.connectionParameters = 'postgres://' + argv.db

var clip = 'ST_Clip(rast, ST_GeomFromText($1, 4326)) '

var q1 = 'SELECT val, ST_AsGeoJSON(geom) As geomGeoJson FROM (' +
  'SELECT (ST_DumpAsPolygons(' + clip + ')).*  FROM pop' +
  ') as foo'

process.stdin.pipe(concat(function (input) {
  var poly = JSON.parse(input)
  if (poly.features) poly = poly.features[0]
  var wkt = wk.stringify(poly.geometry)
  query(q1, [ wkt ], function (err, rows, result) {
      if (err) console.error(err)
      rows = rows.map(function (row) {
        return {
          type: 'Feature',
          properties: { density: row.val },
          geometry: JSON.parse(row.geomgeojson)
        }
      })

      console.log(JSON.stringify({
        type: 'FeatureCollection',
        properties: {},
        features: rows
      }))
      process.exit()
    })
}))


