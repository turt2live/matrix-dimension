FROM node:14.17.5-alpine AS builder

LABEL maintainer="Andreas Peters <support@aventer.biz>"
#Upstream URL: https://git.aventer.biz/AVENTER/docker-matrix-dimension

WORKDIR /home/node/matrix-dimension

RUN mkdir -p /home/node/matrix-dimension

COPY . /home/node/matrix-dimension

RUN chown -R node /home/node/matrix-dimension

USER node

RUN npm clean-install && \
    node /home/node/matrix-dimension/scripts/convert-newlines.js /home/node/matrix-dimension/docker-entrypoint.sh  && \
    NODE_ENV=production npm run-script build

FROM node:14.17.5-alpine

WORKDIR /home/node/matrix-dimension

COPY --from=builder /home/node/matrix-dimension/docker-entrypoint.sh /

COPY --from=builder /home/node/matrix-dimension/build /home/node/matrix-dimension/build
COPY --from=builder /home/node/matrix-dimension/package* /home/node/matrix-dimension/
COPY --from=builder /home/node/matrix-dimension/config /home/node/matrix-dimension/config

RUN chown -R node /home/node/matrix-dimension

RUN mkdir /data && chown -R node /data

USER node

RUN npm clean-install --production

VOLUME ["/data"]

# Ensure the database doesn't get lost to the container
ENV DIMENSION_DB_PATH=/data/dimension.db

EXPOSE 8184
# CMD ["/bin/sh"]
ENTRYPOINT ["/docker-entrypoint.sh"]

