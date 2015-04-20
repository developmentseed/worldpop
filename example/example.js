var fs = require('fs')
var path = require('path')
var geojson = require('geojson-stream')
var polypop = require('../')

if (process.argv.length < 5) {
  console.log('Usage: ' + process.argv[0] + ' ' + process.argv[1],
    '(tileliveUri|geojson_file|mbtiles_file)',
    'density_property_name ',
    'test-polygon.json',
    '[multiplier=10000]',
    '[min_zoom=8]',
    '[max_zoom=12]')
  process.exit()
}

var tilesUri = process.argv[2]
var densityProp = process.argv[3]
var testPoly = JSON.parse(fs.readFileSync(process.argv[4]))
var multiplier = +(process.argv[5] || 10000)
var limits = {
  min_zoom: +(process.argv[6] || 8),
  max_zoom: +(process.argv[7] || 12)
}

if (testPoly.features) testPoly = testPoly.features[0]

function density (feature) {
  return feature.properties[densityProp] / multiplier
}

// set up source
if (/json$/.test(tilesUri)) {
  tilesUri = fs.createReadStream(tilesUri).pipe(geojson.parse())
} else if (!/^[^\/]*\:\/\//.test(tilesUri)) {
  tilesUri = 'mbtiles://' + path.resolve(tilesUri)
}

polypop(limits, tilesUri, density, testPoly, function (err, total) {
  if (err) console.error(err)
  console.log('Total population: ', total)
})

