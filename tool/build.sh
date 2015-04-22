#!/usr/bin/env bash
set -e # halt script on error

mkdir -p dist
cp -R assets/ dist/
node_modules/.bin/browserify app.js > dist/js/main.js
