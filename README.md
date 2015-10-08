# WorldPop Data Extractor
[![Build Status](https://travis-ci.org/developmentseed/worldpop.svg?branch=master)](https://travis-ci.org/developmentseed/worldpop)

Compute the population within a given polygon using the high resolution
WorldPop population dataset. Go to
[http://devseed.com/worldpop](http://devseed.com/worldpop) and draw some
polygons.

# About

The WorldPop Data Explorer is a web tool (and underlying Node module) designed
to enable useful compuation and analysis using the
[WorldPop](http://www.worldpop.co.uk) dataset. It makes heavy use of, among
other things, [Mapbox Vector
Tiles](https://www.mapbox.com/developers/vector-tiles/), and
[Turf](http://turfjs.org/) to enable efficient storage, access to, and
computation over the otherwise prohibitively large WorldPop dataset.

**NOTE:** This tool is currently in an early beta stage, and is under very active
development. At present, the web app only supports Chrome, and only a few countries'
data is available.

[Bug reports, suggestions](https://github.com/developmentseed/worldpop/issues), and pull requests
are very welcome!


## Related Repositories:

 - [worldpop-data](http://www.github.com/developmentseed/worldpop-data): the data processing
   pipeline, taking WorldPop GeoTIFFs and producing Mapbox Vector Tiles.
 - [worldpop-basemap.tm2](http://www.github.com/developmentseed/worldpop-basemap.tm2): the
   Mapbox Studio project for the web app's base map.

# Node API
```
var worldpop = require('worldpop')
worldpop({
  source: 'tilejson+http://...',
  polygon: { /* geojson */ },
  density: function (feat) { /* returns density */ },
}, function done (err, result) {
  console.log(result)
})
```

Read the [API docs](API.md).

# Developing

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

# License

[BSD](LICENSE)
