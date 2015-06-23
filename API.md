## `worldpop`

Computes the total population within the given polygon.

### Parameters

* `opts` **``** Options
* `opts.max_zoom` **`number`** 
* `opts.min_zoom` **`number`** 
* `opts.source` **`string or ReadableStream<Feature>`** A GeoJSON Feature stream or Tilelive uri for the tiled population data, where each feature represents an area of constant population density.
* `opts.layer` **`string`** If `source` is a tile source, the layer in which to find the population features.
* `opts.density` **`function`** A function that accepts a feature from `source` and returns the population density for that feature.
* `opts.polygon` **`Feature<Polygon>`** The polygon whose interior population we want.
* `opts.progress` **`function`** A progress callback, called periodically with the current state of {totalPopulation, totalArea, polygonArea}. (You can estimate % complete with totalArea/polygonArea.)
* `opts.progressFrequency` **`Number`** Frequency in ms of the callback (default 100)
* `cb` **``** completion callback, called with {totalPopulation, totalArea, polygonArea}.





