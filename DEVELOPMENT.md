# Dimension Development

Dimension is split into two layers: the frontend (web) and backend. The frontend is responsible for interacting with the client (Riot) directly and hands off any complex work to the backend for processing.

**For help and support related to Dimension development, please visit:**
[![#dimension:t2bot.io](https://img.shields.io/badge/matrix-%23dimension:t2bot.io-brightgreen.svg)](https://matrix.to/#/#dimension:t2bot.io)

## Running

The prerequisites for development are the same as running Dimension in a production environment.

```
# Edit the configuration to your specifications.
# Be sure to add yourself as an admin!
cp config/default.yaml config/development.yaml
nano config/development.yaml

# Run the webserver (it watches for changes)
npm run start:dev

# Run the backend (does not watch for changes)
npm run build:app && node build/app/index.js
```

## General architecture

Integrations are defined in the database for administrators to enable, disable, and configure as they please. They are added using migrations (or in some cases, manually by the administrators) and should always be added as "disabled" by default.

The frontend has two sections: the admin and non-admin sections. The admin section is used by authorized users to configure the various integrations, or parts of integrations. The non-admin section is used by everyone else to add the integrations to their rooms.

The frontend automatically routes edit pages in both the admin and non-admin sections to the appropriate routes. It does this by using a combination of the `category` and `type` of the integrations. For example, a `widget` with the type `jitsi` will be redirected to the `/riot-app/widget/jitsi` route for editing. Both the admin and non-admin routes need to be declared in the `app.routing.ts` class. After that, it is best to copy/paste a similar widget component and edit it to your needs.

The backend is slightly more complicated, where particular integrations may have their own API defined depending on the complexity involved. For example, all bridges have their own admin and non-admin API to configure the various parts. The required changes to the backend are described in the later sections of this document.

## Adding new widgets

TODO

## Adding new go-neb services

TODO

## Adding new bridges

TODO

## Adding new bots

TODO

*note to self: are simple bots even a thing anymore?*
