# WorldPop Data Extractor
[![Build Status](https://travis-ci.org/developmentseed/worldpop.svg?branch=master)](https://travis-ci.org/developmentseed/worldpop)

Compute the population within a polygon from GeoJSON population data. 

Go to [http://devseed.com/worldpop](http://devseed.com/worldpop) and draw
some polygons.

## Locally

Clone the repo, then:
```
cd worldpop
npm install
npm run-script develop
```

Open [http://localhost:9966](http://localhost:9966) in your browser.


## Node API
```
var worldpop = require('worldpop')
worldpop({
  source: 'tilejson+http://...',
  polygon: { /* geojson */ },
  density: funciton (feat) { /* returns density */ },
}, function done (err, result) {
  console.log(result)
})
```

Read the [API docs](API.md).

