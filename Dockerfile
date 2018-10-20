FROM node:9.11.2-alpine

LABEL maintainer="Andreas Peters <support@aventer.biz>"
#Upstream URL: https://git.aventer.biz/AVENTER/docker-matrix-dimension

RUN apk add dos2unix --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/community/ --allow-untrusted

RUN apk update && \
    apk add --no-cache bash gcc python make g++ sqlite && \
    mkdir /home/node/.npm-global && \
    mkdir -p /home/node/app 

COPY ./docker-entrypoint.sh /
COPY . /home/node/matrix-dimension


RUN chown -R node:node /home/node/app && \
    chown -R node:node /home/node/.npm-global && \
    chown -R node:node /home/node/matrix-dimension

USER node

ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

RUN cd /home/node/matrix-dimension && \
    npm install -D wd rimraf webpack webpack-command sqlite3 && \
    NODE_ENV=production npm run-script build:web && npm run-script build:app 

USER root

RUN apk del gcc make g++ && \
    rm /home/node/matrix-dimension/Dockerfile && \
    rm /home/node/matrix-dimension/docker-entrypoint.sh && \
    dos2unix /docker-entrypoint.sh

USER node

VOLUME ["/data"]

# Ensure the database doesn't get lost to the container
ENV DIMENSION_DB_PATH=/data/dimension.db

EXPOSE 8184
#CMD ["/bin/sh"]
ENTRYPOINT ["/docker-entrypoint.sh"]
 
