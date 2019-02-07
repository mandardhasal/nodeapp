#!/bin/bash
cd "$(dirname "$0")"
npm install
./node_modules/nodemon/bin/nodemon.js app.js