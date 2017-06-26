#!/bin/bash
npm --version
node --version
npm install
npm run build
rm -f web.zip
zip -r web.zip web-dist/*
