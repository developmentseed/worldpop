#!/usr/bin/env bash
set -e # halt script on error

rm -rf dist
mkdir -p dist
cp -R assets/* dist/
ls -al dist
node_modules/.bin/browserify app.js -o dist/js/main.js
