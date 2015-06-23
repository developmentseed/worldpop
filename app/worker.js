global.window = global
var worldpop = require('../')

module.exports = function (self) {
  self.addEventListener('message', function (ev) {
    ev.data.progress = function progress (snapshot) {
      self.postMessage({
        type: 'progress',
        result: snapshot
      })
    }
    ev.data.density = density

    worldpop(ev.data, function (err, result) {
      self.postMessage({
        type: 'complete',
        error: err,
        result: result
      })
    })
  })
}

function density (feature) {
  return feature.properties['density'] / 10000
}
