# Integrations in Dimension

Integrations take the form of bots, bridges, widgets, and other tools that enhance user experience in particular rooms. This document goes through the various setup procedures for the different types of integrations.

Several integrations already have configuration files in the `config/integrations` folder. Each default configuration has additional information as to how to configure it. Some integrations are disabled by default and can be found in the `config/integrations/samples` folder.

## Simple Bots

A simple bot is a bot that requires no configuration by users. It simply exists in the room and provides some minor functionality. Examples of this are the Giphy, Guggy, and Wikipedia bots.

1. Create a new configuration file in `config/integrations` for the bot.
2. Put the following contents in the configuration file:
   ```
   # This is required. Leave it as "bot" for this configuration.
   type: "bot"

   # We should probably make sure it is enabled too ;)
   enabled: true
   
   # This is a unique key to identify your bot. For example, "giphy".
   integrationType: "YOUR_BOT_NAME"

   # The matrix user ID for the bot. This is likely to be on your server.
   userId: "@userID:server.com"

   # The name to use in the UI for Dimension. Try to keep this short.
   name: "Some Friendly Bot"

   # A brief description of the bot. These are best kept under 60 characters.
   about: "Use `!some command` to interact with the bot"

   # A logo for your bot. We'll upload this in a moment.
   avatar: "img/avatars/YOUR_BOT_NAME.png"

   # This is the actual bot configuration so Dimension can control some aspects of the bot's behaviour (leaving rooms, etc).
   hosted:
     # The URL to the client/server API. This is the "Homeserver URL" in Riot.
     homeserverUrl: "https://matrix.org"

     # The access token for the bot. For information on how to get this, visit https://t2bot.io/docs/access_tokens
     accessToken: "your_matrix_access_token_here"
   ```
3. Upload/copy the logo for the bot to the `img/avatars` folder, as mentioned above.
4. Restart Dimension

Your bot should now be in Dimension!

## Complex Bots

Complex bots are the bots that require configuration within Dimension in order to work. Examples include the Github bot or RSS bot. Currently these bots are not as easy to set up in Dimension as they could be, and require a developer to write code for Dimension to understand the requirements.

To request a particular complex bot to be supported, please open a new issue on Github.

## Bridges

Bridges allow people in matrix to talk to people not in matrix, and vice-versa. Like complex bots, bridges require additional code in Dimension in order to be supported.

To request a particular bridge to be supported, please open a new issue on Github.

## Widgets

Widgets are web applications that can be embedded in a room for users to interact with. Like bridges and complex bots, widgets require additional code in Dimension to be supported.

To request a particular widget, please open a new issue on Github.
