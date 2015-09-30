global.window = global
const worldpop = require('../')

module.exports = function (self) {
  const queue = []
  let running = false
  self.addEventListener('message', function (ev) {
    queue.push(ev)
    if (!running) {
      next()
    }
  })

  function next () {
    running = true
    var ev = queue.shift()
    if (ev) {
      ev.data.progress = function progress (snapshot) {
        self.postMessage({
          type: 'progress',
          result: snapshot
        })
      }
      ev.data.density = density

      worldpop(ev.data, function (err, result) {
        self.postMessage({
          drawnLayerId: ev.data.drawnLayerId,
          type: 'complete',
          error: err,
          result: result
        })
        next()
      })
    } else {
      running = false
    }
  }
}

function density (feature) {
  return feature.properties['density'] / 10000
}
