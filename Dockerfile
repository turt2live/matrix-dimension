FROM node:9.11.2-alpine

RUN apk update && \
    apk add bash gcc git python make g++ sqlite && \
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

RUN apk del gcc git make g++ && \
    rm /home/node/matrix-dimension/Dockerfile && \
    rm /home/node/matrix-dimension/docker-entrypoint.sh

USER node

VOLUME ["/data"]

EXPOSE 8184
#CMD ["/bin/sh"]
ENTRYPOINT ["/docker-entrypoint.sh"]
 
