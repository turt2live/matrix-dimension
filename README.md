![dimension](https://t2bot.io/_matrix/media/r0/download/t2l.io/b3101d429588673087f457a4bdd52f45)


[![TravisCI badge](https://travis-ci.org/turt2live/matrix-dimension.svg?branch=master)](https://travis-ci.org/turt2live/matrix-dimension)
[![#dimension:t2bot.io](https://img.shields.io/badge/matrix-%23dimension:t2bot.io-brightgreen.svg)](https://matrix.to/#/#dimension:t2bot.io)

An open source integrations manager for matrix clients, like Riot.

# Configuring Riot to use Dimension

Change the values in Riot's `config.json` as shown below. If you do not have a `config.json`, copy the `config.sample.json` from Riot.

```
"integrations_ui_url": "https://dimension.t2bot.io/riot",
"integrations_rest_url": "https://dimension.t2bot.io/api/v1/scalar",
"integrations_widgets_urls": ["https://dimension.t2bot.io/widgets"],
"integrations_jitsi_widget_url": "https://dimension.t2bot.io/widgets/jitsi",
``` 

The remaining settings should be tailored for your Riot deployment. If you're self-hosting Dimension, replace "dimension.t2bot.io" with your Dimension URL.

# Running your own

### Docker

To get started quickly, run the following command or build the Docker image:
```bash
docker run -p 8184:8184 -v /path/to/dimension/store:/data turt2live/matrix-dimension
```

In the `/path/to/dimension/store` make sure there is a file named `config.yaml`. This will be the configuration that Dimension uses.

### Compiling it yourself

Prerequisites:
* [NodeJS](https://nodejs.org/en/download/) 8
* npm 5 or higher (`npm install -g npm@latest`)
* A webserver running Riot or another supported client

```bash
# Download dimension 
git clone https://github.com/turt2live/matrix-dimension.git
cd matrix-dimension

# Edit the configuration to your specifications.
# Be sure to add yourself as an admin!
cp config/default.yaml config/production.yaml
nano config/production.yaml

# Install dependencies
npm install

# Run
NODE_ENV=production npm run start:app
```

### Setting up Dimension

If you didn't change the port, Dimension should now be running on port 8184. It's best to set up your environment so that Dimension runs on a dedicated subdomain that *is not* the same as your Riot domain. This is to help keep Riot and Dimension safe and secure. 

In your Riot `config.json`, set the integration manager to be your Dimension URL. Replace `dimension.t2bot.io` in the example above (under "Configuring Riot to use Dimension") with your Dimension URLs.

After Riot has been configured to use Dimension, refresh Riot and click the "Integrations" button in the top right of the room. It should be an icon that looks like this:

![3x3 square](https://t2bot.io/_matrix/media/r0/download/t2l.io/gOgboDPEMfiYOQryYwvvHkFz)

That button should open Dimension. If you've configured everything correctly, you'll see a gear icon in the top right of the window - click this to start editing your integrations.

### Running Dimension behind nginx

1. Follow the steps outlined above.
2. Set the host for Dimension to listen on to `localhost` or `127.0.0.1`
3. Restart Dimension (`CTRL+C` and run `NODE_ENV=production npm run start:app` again)
4. Set up the following reverse proxy information as applicable
    ```
    location / {
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_pass http://localhost:8184;
    }
    ```
   Be sure to also configure any SSL offloading.

### "Could not contact integrations server" error

1. **Check that federation is enabled and working on your homeserver.** Even in a private, or non-federated environment, the federation API still needs to be accessible. If federation is a major concern, limit the servers that can use the API by IP or install Dimension on the same server as your homeserver, only exposing federation to localhost.
2. **Check your SRV records.** If you are using SRV records to point to your federation port, make sure that the hostname and port are correct, and that HTTPS is listening on that port. Dimension will use the first record it sees and will only communicate over HTTPS.
3. **Verify the homeserver information in your configuration.** The name, access token, and client/server API URL all need to be set to point towards your homeserver. It may also be necessary to set the federation URL if you're running a private server.

# Development

For more information about working on Dimension, see DEVELOPMENT.md.

# Do I need an integrations manager?

Integration managers aim to ease a user's interaction with the various services a homeserver may provide. Often times the integrations manager provided by Riot.im, named Modular, is more than suitable. However, there are a few cases where running your own makes more sense:

* Wanting to self-host all aspects of your services (client, homeserver, and integrations)
* Wanting to advertise custom bots specific to your homeserver
* Corporate or closed environments where the default integration manager won't work

# How do integration managers work?

Integration managers sit between your users and your integrations (bots, bridges, etc). It helps guide users through the configuration of your integrations for their rooms. The integrations manager can only manage integrations it is configured for. For example, Modular can only provide configuration for the bridges and bots running on matrix.org, while Dimension can provide configuration for your own bots and bridges.

The infrastructure diagram looks something like this:
![infrastructure](https://t2bot.io/_matrix/media/r0/download/t2l.io/3bb5674d85ee22c070e36be0d9582b4d)

# License

For information about Dimension's license, please see the LICENSE file included in this repository.
