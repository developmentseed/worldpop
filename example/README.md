
# Example

## Pull GeoJSON from a vector tile:
You should be in a directory that has tiles in ./z/x/y.vector.pbf form.
```
cd gnb-tiles
../../tool/vt-geojson.js 11 939 954 > ../z7-example.json
```

## Calculate population within a test-polygon
From `example` directory.
```
node example.js z7-example.json DN test-polygon.json
```


