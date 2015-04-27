## `worldpop`

Computes the total population within the given polygon.

### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| `opts` | `` | Options:
max_zoom, min_zoom

{(string|ReadableStream<Feature>)} source - A GeoJSON Feature
stream or Tilelive uri for the tiled population data, where each feature
represents an area of constant population density.

{function} density - A function that accepts a feature from
`source` and returns the population density for that feature.

{Feature<Polygon>} polygon - The polygon whose interior
population we want.

{function} progress - A progress callback, called periodically
with the current state of {totalPopulation, totalArea, polygonArea}. (You can
estimate % complete with totalArea/polygonArea.)

{Number} progressFrequency - Frequency (in # of features) of
progress callback. |
| `cb` | `` | completion callback, called with {totalPopulation, totalArea,
polygonArea}. |




