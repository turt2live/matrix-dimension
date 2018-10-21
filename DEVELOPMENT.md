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

# Install dependencies
npm install

# Run the webserver (it watches for changes)
npm run start:web

# Run the backend (does not support watching for changes)
npm run build:app && node build/app/index.js
```

## Backend Architecture

Integrations are defined into one of four categories:
* Simple bots - Bots that can be invited to the room and left alone (Imgur, Giphy, etc)
* Complex bots - Bots that require some sort of per-room configuration (RSS, Github, etc)
* Bridges - Application services that bridge the room in some way to an external network (IRC, Webhooks, etc)
* Widgets - Added functionality through iframes for rooms/users

The backend further breaks these categories out to redirect traffic to the correct place. For instance, the admin backend 
breaks out go-neb specifically as it's configuration is fairly involved.

The backend has 3 major layers:
* The webserver (where all the requests come from)
* The data stores (where requests normally get routed to)
* The proxy (where we flip between using upstream configurations and self-hosted)

Many of the API routes are generic, however many of the integrations require additional structure that the routes cannot 
provide. For example, the IRC bridge is complicated in that it needs a dedicated API in order to be configured, however
the bots can work well within their constraints.

## Frontend Architecture

The frontend app is split into two major parts: The Riot frontend and the admin section. The components are nested under
their respective categories and route. For example, the edit page for the Jitsi widget is under the Widgets directory.

The frontend is otherwise a fairly basic Angular 5 application: there's components, services, etc. The services should be
kept small and generic where possible (almost always matching the Service classes in the backend). Components are more of
a judgement call and should be split out where it makes sense. For example, it doesn't make sense to create a component
for every instance where an `ngFor` is used because the number of components would be astronomical.

## Reference Material

Adding a bridge to Dimension: https://github.com/turt2live/matrix-dimension/pull/217
