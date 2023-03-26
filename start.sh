#!/bin/sh
cd ./server/
node session.js &
node main.js &
cd ./../
node ./server/live-server/live-server.js