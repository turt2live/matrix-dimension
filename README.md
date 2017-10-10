# Dimension
 
[![TravisCI badge](https://travis-ci.org/turt2live/matrix-dimension.svg?branch=master)](https://travis-ci.org/turt2live/matrix-dimension)

An alternative integrations manager for [Riot](https://riot.im). Join us on matrix: [#dimension:t2l.io](https://matrix.to/#/#dimension:t2l.io)

![screenshot](https://t2bot.io/_matrix/media/v1/download/t2l.io/kWDyaWXqdsjOJgGYAMMRgGiE)

[![Sponsor](https://app.codesponsor.io/embed/jKVLa6iNMWGmozmfcMYKPPpz/turt2live/matrix-dimension.svg)](https://app.codesponsor.io/link/jKVLa6iNMWGmozmfcMYKPPpz/turt2live/matrix-dimension)

# ⚠️ Dimension is in Alpha ⚠️

Dimension supports some bridges and bots, however using Dimension in a production scenario is not recommended. Dimension uses features available in recent builds of Riot and may not work on older versions.

There are plans on the matrix.org front to better support integration managers. Those changes may require an updated homeserver and Riot when made available.

# Configuring Riot to use Dimension

Change the values in Riot's `config.json` as shown below. If you do not have a `config.json`, copy the `config.sample.json` from Riot.

```
"integrations_ui_url": "https://dimension.t2bot.io/riot",
"integrations_rest_url": "https://dimension.t2bot.io/api/v1/scalar",
"integrations_widgets_urls": ["https://dimension.t2bot.io/widgets"],
``` 

The remaining settings should be tailored for your Riot deployment.

# Building

To create a production build of Dimension, run `npm run build`. For development environments, see the Development section below.

# Running your own

1. Run `npm run build`
2. Copy `config/default.yaml` to `config/production.yaml` and edit `config/production.yaml`
3. Edit any integration settings in `config/integrations`
4. Run Dimension with `NODE_ENV=production node app.js`

Dimension is now available on the port/host you configured.

### Running Dimension behind nginx

1. Run `npm run build`
2. Copy `config/default.yaml` to `config/production.yaml` and edit `config/production.yaml`
3. Edit any integration settings in `config/integrations`
4. Set the host for Dimension to listen on to `localhost` or `127.0.0.1`
5. Run Dimension with `NODE_ENV=production node app.js`
6. Set up the following reverse proxy information as applicable
    ```
    location / {
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_pass http://localhost:8184;
    }
    ```
   Be sure to also configure any SSL offloading.

# Development

1. Copy `config/default.yaml` to `config/development.yaml` and make any edits
2. Run Dimension with `NODE_ENV=development node app.js`
3. Run the web app with `npm run dev`

# Do I need an integrations manager?

Integration managers aim to ease a user's interaction with the various services a homeserver may provide. Often times the integrations manager provided by Riot.im, named Modular, is more than suitable. However, there are a few cases where running your own makes more sense:

* Wanting to self-host all aspects of your Riot install
* Wanting to advertise custom bots specific to your homeserver
* Corporate or closed environments where Modular's integrations won't work

# How do integration managers work?

Integration managers sit between your users and your integrations (bots, bridges, etc). It helps guide users through the configuration of your integrations for their rooms. The integrations manager can only manage integrations it is configured for. For example, Modular can only provide configuration for the bridges and bots running on matrix.org, while Dimension can provide configuration for your own bots and bridges.

The infrastructure diagram looks something like this:
```
+-----------+         +----------------------+                          +--------------------+
|           |========>|                      |=========================>|                    |
|           |         | Integrations Manager |                          | Bots, bridges, etc |
|           |         |     (Dimension)      |    +-------------+       | (go-neb, irc, etc) |
|  Clients  |         |                      |===>|             |<=====>|                    |
|  (Riot)   |         +----------------------+    |  Homeserver |       +--------------------+
|           |                                     |  (synapse)  |
|           |============client/server API=======>|             |
+-----------+                                     +-------------+
```

# Common Problems / Setup Questions

Dimension uses unstable and undocumented parts of Riot and can sometimes be a bit difficult to set up. If you're running into issues, check the solutions below. If you're still having issues, come by [#dimension:t2bot.io](https://matrix.to/#/#dimension:t2bot.io) and we can help you out.

## Setting up integrations (including custom)

The INTEGRATIONS.md file in this repository explains how to add custom integrations. For assistance, please visit [#dimension:t2bot.io](https://matrix.to/#/#dimension:t2bot.io)

## "Could not contact integrations server"

1. **Check that federation is enabled and working on your homeserver.** Even in a private, or non-federated environment, the federation API still needs to be accessible. If federation is a major concern, limit the servers that can use the API by IP or install Dimension on the same server as your homeserver, only exposing federation to localhost.
2. **Check your SRV records.** If you are using SRV records to point to your federation port, make sure that the hostname and port are correct, and that HTTPS is listening on that port. Dimension will use the first record it sees and will only communicate over HTTPS.
3. **Log out of Riot and log back in.** When switching from the default integrations manager (Scalar) to Dimension the authentication tokens can change. Logging out and back in will reset this token, allowing Dimension to work. More advanced users can delete the "mx_scalar_token" localstorage key.

## Turning off matrix.org/Scalar dependency

To completely disconnect Dimension from using the matrix.org bots and bridges, remove the `vector` upstream from your config. This will force anything using the upstream (matrix.org bots and bridges) to not load.