var url = require('url')
var params = url.parse(window.location.href, true).query

var polypop = require('../')

window.options = {
  mapId: 'devseed.z6mt2o6r',
  densityProp: 'density',
  multiplier: 10000,
  limits: {
    min_zoom: 11,
    max_zoom: 11
  },
  testPoly: {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [
        [
          [
            30.04829406738281,
            -2.0663548944784704
          ],
          [
            30.04829406738281,
            -1.978519026596244
          ],
          [
            30.138244628906246,
            -1.978519026596244
          ],
          [
            30.138244628906246,
            -2.0663548944784704
          ],
          [
            30.04829406738281,
            -2.0663548944784704
          ]
        ]
      ]
    }
  }
}

function density (feature) {
  return feature.properties[window.options.densityProp] / window.options.multiplier
}

window.calculateTotal = function () {
  var tilesUri = 'tilejson+http://api.tiles.mapbox.com/v4/{mapid}.json?access_token={access}'
    .split('{mapid}').join(window.options.mapId)
    .split('{access}').join(params.access_token)

  polypop(window.options.limits, tilesUri, density, window.options.testPoly,
  function (err, total) {
    if (err) console.error(err)
    console.log('Total population: ', total)
  })
}

console.log(params)
console.log('Options (window.options):', window.options)
console.log('Usage: window.calculateTotal()')
