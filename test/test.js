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
  getTotal({
    source: 'mbtiles://' + path.join(fixtures, 'rwa-uga.mbtiles'),
    density: density,
    layer: 'population',
    polygon: JSON.parse(testPoly),
    min_zoom: 11,
    max_zoom: 11,
    progress: function (progress) {
      t.ok(progress.totalArea, 'progress update')
      t.ok(progress.polygonArea)
      updates++
    },
    progressFrequency: 1000
  }, function (err, result) {
    t.ok(result)
    roundEqual(t, result.totalPopulation / 10, 9572, 'correct population count')
    roundEqual(t, result.totalArea / 10, 9668048, 'correct total area')
    roundEqual(t, result.polygonArea / 10, 9784701, 'correct polygon area')
    t.equal(updates, parseInt(result.count / 1000, 10), 'progress updates')
    console.log('result', result)
    t.end(err)
  })
})

function roundEqual (t, num1, num2, message) {
  return t.equal(
    Math.round(num1),
    Math.round(num2),
    message
  )
}
