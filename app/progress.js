var numeral = require('numeral')
var Nanobar = require('nanobar')

module.exports = class ProgressBar {
  constructor (element) {
    element.innerHTML = `
    <div class="current">
      <div class="loader">Loading...</div>
      Counted so far: <span id="current-count"></span> people
      in <span id="current-area"></span> km<sup>2</sup>.
    </div>
    `
    this.nano = new Nanobar({
      id: 'bar',
      target: element
    })
    this.element = element
    this.currentCount = this.element.querySelector('#current-count')
    this.currentArea = this.element.querySelector('#current-area')
  }

  updateCount (count, area) {
    count = numeral(count).format('0,0')
    area = numeral(area / 1e6).format('0,0.0')
    this.currentCount.innerHTML = count
    this.currentArea.innerHTML = area
  }

  finish (snapshot) {
    this.nano.go(99)
    this.updateCount(snapshot.totalPopulation, snapshot.totalArea)
    var element = this.element
    setTimeout(function () {
      element.classList.remove('show')
    }, 500)
  }

  reset () {
    // initialize progress view to starting position.
    this.nano.go(10)
    this.updateCount(0, 0)
    this.element.classList.add('show')
  }

  update (snapshot) {
    var percentage = snapshot.totalArea / snapshot.polygonArea
    percentage = Math.round(percentage * 100)
    this.nano.go(Math.min(10 + percentage, 99))
    this.updateCount(snapshot.totalPopulation, snapshot.totalArea)
  }
}
