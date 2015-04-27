# WorldPop Data Extractor
[![Build Status](https://travis-ci.org/developmentseed/worldpop.svg?branch=master)](https://travis-ci.org/developmentseed/worldpop)

Compute the population within a polygon from GeoJSON population data. 

Go to [http://devseed.com/worldpop](http://devseed.com/worldpop) and draw
some polygons.

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

## Developing

Clone the repo, then:
```
cd worldpop
npm install
npm run-script develop
```

This starts a [budo](https://github.com/mattdesl/budo) dev server that watches
for changes; open [http://localhost:9966](http://localhost:9966).

Run `tool/build.sh` to build the project into the `dist/` directory.

The project build uses browserify to bundle javascript and PostCSS/cssnext for
styles.  Entry points:

 - index.js - main node module (e.g., the actual bean-counting logic)
 - app.js - the web app
 - css/styles.css - the main styles file.  It gets bundled with the javascript
   and included into the page via app.js

