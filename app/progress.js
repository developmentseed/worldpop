var Nanobar = require('nanobar')

module.exports = class ProgressBar {
  constructor (element) {
    element.innerHTML = `
    <div class="current">
      <div class="loader">Loading...</div> 
      Counted so far: <span id="current-count"></span> people.
    </div>
    `
    this.nano = new Nanobar({
      id: 'bar',
      target: element
    })
    this.element = element
    this.currentCount = this.element.querySelector('#current-count')
  }

  updateCount (count) {
    this.currentCount.innerHTML = Math.round(count)
  }

  finish (snapshot) {
    this.nano.go(99)
    this.updateCount(snapshot.totalPopulation)
    var element = this.element
    setTimeout(function () {
      element.classList.remove('show')
    }, 500)
  }

  reset () {
    // initialize progress view to starting position.
    this.nano.go(10)
    this.updateCount(0)
    this.element.classList.add('show')
  }

  update (snapshot) {
    var percentage = snapshot.totalArea / snapshot.polygonArea
    percentage = Math.round(percentage * 100)
    this.nano.go(Math.min(10 + percentage, 99))
    this.updateCount(snapshot.totalPopulation)
  }
}
