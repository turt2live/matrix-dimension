#!/bin/bash
set -e

cd /home/node/matrix-dimension/

if [ -f "/data/config.yaml" ]; then
	cp /data/config.yaml /home/node/matrix-dimension/config/production.yaml
	NODE_ENV=production node build/app/index.js
else
	cp /home/node/matrix-dimension/config/default.yaml /data/config.yaml
	echo "A default config file has been placed in the /data/ volume please review and make any required changes and start the container again"
fi
