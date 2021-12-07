# Developer/local environment setup

**Disclaimer**: This guide assumes a fairly high level of pre-existing knowledge regarding development practices, Matrix,
integration managers, and troubleshooting. The guide covers the happy path, though sometimes it doesn't work out that way.
Troubleshooting the system is best before jumping into support rooms: it helps build context on how all this works.

Prerequisites:
* A local Synapse.
* A local Element Web.
* All the other dependencies which would be required by a production install.

**Note**: As a local environment, you do not need to use https for any of the setup. In fact, it is recommended to stick
to plain http as it involves less certificate issues. For added benefit, set your homeserver name to `localhost`.

## Part 1: Configuration

Copy the default configuration and give it an edit. The major settings will be the `web`, `homeserver`, and `admins`
sections.

It is recommended to run Dimension on `0.0.0.0:8184` for demonstration purposes. Your homeserver's `clientServerUrl`
*and* `federationUrl` should be pointed to your local Synapse. This will bypass a lot of the federation-level stuff
by pointing your Dimension directly at the Synapse instance rather than it trying to resolve `localhost` on the public
federation.

The `accessToken` should be a dedicated user **that has not ever opened Dimension**. Set this up now before configuring
the client.

```bash
# Edit the configuration to your specifications.
# Be sure to add yourself as an admin!
cp config/default.yaml config/development.yaml
nano config/development.yaml
```

## Part 2: Installation and running

In a bash terminal:

```bash
npm install
npm run start:apponly
```

If that starts up without issue (ie: doesn't crash) then open a second terminal with:

```bash
npm run start:web
```

You should now have **2** terminals, one for the web app and one for the backend. Both should live reload if you make
changes to the respective layers.

The web server will start on port `8082`.

## Part 3: Element configuration

In your local `config.json`, add/edit the following keys:

```json
{
  "integrations_ui_url": "http://localhost:8082/element",
  "integrations_rest_url": "http://localhost:8082/api/v1/scalar",
  "integrations_widgets_urls": ["http://localhost:8082/widgets"],
  "integrations_jitsi_widget_url": "http://localhost:8082/widgets/jitsi"
}
```

## Part 4: Using Dimension

If everything went according to plan, Dimension should now be accessible from the "Add widgets, bridges & bots" button on
the room information card.

You should see a cog/gear icon in the top right of the dialog window. This indicates that you are an admin. If you do not
see this, fix the Dimension config and restart the `npm run start:apponly` process.

## Part 5: Configuring integrations in Dimension

Click the gear icon in the Dimension window within Element. The menu on the left side should guide you through the process
of setting up and configuring integrations.

**Danger**: Upstream (matrix.org) integrations will not work. Do not enable them in local environments.

**Note**: Dimension enforces a maximum of one bridge instance per type. It does this by disabling buttons despite indicating
that there's potential for multiple to be added. Adding a self-hosted bridge will disable all future options of adding a
second bridge, but it should be possible to edit the added instance.

For the purposes of this guide, we'll set up Hookshot and a custom bot.

## Part 6: Hookshot

First, set up a local instance of [matrix-hookshot](https://github.com/Half-Shot/matrix-hookshot) within your test environment.
It is recommended to proxy some of the endpoints through ngrok (or similar) to make external integration a lot easier.

For testing purposes it's often best to use a single Hookshot instance, though Dimension will assume that you'll have
multiple instances, one for each capable service, however it is perfectly fine to point all the Dimension configs at the
same Hookshot instance.

The Hookshot-capable bridges can be configured from here:
![](https://i.imgur.com/42dTDuk.png)
*UI may vary. Note the subtle difference in descriptions for the two webhook bridges.*

Simply configure the bridges from that view and click "Browse integrations" in the top left to go work with the bridges.
They should appear as integrations within Dimension.

## Part 7: Custom bots

Custom bots can be configured from the admin section under "Custom bots". Dimension will need an access token, and will
assume that the bots do not need special power levels or invite handling - they will be required to operate at the default
power level for rooms, and auto-accept invites on their own. Dimension will take care of removing the bot from the room
when the time comes, and the bot should be okay with this happening outside of its process.

Maubot bots are great options for inclusion here.

## Part 8: Troubleshooting

Occasionally the live reload functionality either doesn't work or causes problems. Re-open Dimension within Element to 
fix most issues, and restart the relevant processes if needed.

Note that Dimension will do its best to avoid crashing, but will produce cryptic errors if an integration is down or
misconfigured.

For all other troubleshooting, please visit the support room.
