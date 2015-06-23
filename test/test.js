var fs = require('fs')
var path = require('path')
var test = require('tape')
var getTotal = require('../')

function density (feature) {
  return feature.properties['density'] / 10000
}

var fixtures = path.join(__dirname, 'fixtures')

test('basic', function (t) {
  var testPoly = fs.readFileSync(path.join(fixtures, 'small-test-box.json'))
  var updates = 0
  var start = Date.now()
  getTotal({
    source: 'mbtiles://' + path.join(fixtures, 'rwa-uga.mbtiles'),
    density: density,
    layer: 'population',
    polygon: JSON.parse(testPoly),
    min_zoom: 11,
    max_zoom: 11,
    progress: function (progress) {
      if (updates++ === 0) {
        t.ok(progress.totalArea, 'progress update')
        t.ok(progress.polygonArea)
      }
    },
    progressFrequency: 50
  }, function (err, result) {
    t.ok(result)
    roundEqual(t, result.totalPopulation, 95720, 1000, 'correct population count')
    roundEqual(t, result.totalArea, 97000000, 1000000, 'correct total area')
    roundEqual(t, result.polygonArea, 98000000, 1000000, 'correct polygon area')
    t.equal(updates >= 2, true, 'progress callback fired')
    t.equal(updates <= Math.ceil((Date.now() - start) / 50), true,
      'progress updates throttled')
    t.end(err)
  })
})

function roundEqual (t, num1, num2, precision, message) {
  return t.equal(
    Math.round(num1 / precision) * precision,
    Math.round(num2 / precision) * precision,
    message
  )
}
