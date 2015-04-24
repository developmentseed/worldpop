## `worldpop`

Computes the total population within the given polygon.

### Parameters

| name | type | description |
| ---- | ---- | ----------- |
| `opts` | `` | Options |
| `opts.max_zoom` | `Number` |  |
| `opts.min_zoom` | `Number` |  |
| `opts.source` | `ReadableStream<Feature> or string` | A GeoJSON Feature
stream or Tilelive uri for the tiled population data, where each feature
represents an area of constant population density. |
| `opts.density` | `function` | A function that accepts a feature from
`source` and returns the population density for that feature. |
| `opts.polygon` | `Feature<Polygon>` | The polygon whose interior
population we want. |
| `opts.progress` | `function` | A progress callback, called periodically
with the current state of {totalPopulation, totalArea, polygonArea}. (You can
estimate % complete with totalArea/polygonArea.) |
| `opts.progressFrequency` | `Number` | Frequency (in # of features) of
progress callback. |
| `cb` | `` | completion callback, called with {totalPopulation, totalArea,
polygonArea}. |




