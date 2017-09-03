# Dimension
 
[![TravisCI badge](https://travis-ci.org/turt2live/matrix-dimension.svg?branch=master)](https://travis-ci.org/turt2live/matrix-dimension)
[![Targeted for next release](https://badge.waffle.io/turt2live/matrix-dimension.png?label=sorted&title=Targeted+for+next+release)](https://waffle.io/turt2live/waffle-matrix?utm_source=badge) 
[![WIP](https://badge.waffle.io/turt2live/matrix-dimension.png?label=wip&title=WIP)](https://waffle.io/turt2live/waffle-matrix?utm_source=badge)

An alternative integrations manager for [Riot](https://riot.im). Join us on matrix: [#dimension:t2l.io](https://matrix.to/#/#dimension:t2l.io)

![screenshot](https://t2bot.io/_matrix/media/v1/download/t2l.io/kWDyaWXqdsjOJgGYAMMRgGiE)

# ⚠️ Dimension is in Alpha ⚠️

Dimension supports some bridges and bots, however using Dimension in a production scenario is not recommended. Dimension uses features available in recent builds of Riot and may not work on older versions.

There are plans on the matrix.org front to better support integration managers. Those changes may require an updated homeserver and Riot when made available.

# Configuring Riot to use Dimension

Change the values in Riot's `config.json` as shown below. If you do not have a `config.json`, copy the `config.sample.json` from Riot.

```
"integrations_ui_url": "https://dimension.t2bot.io/riot",
"integrations_rest_url": "https://dimension.t2bot.io/api/v1/scalar",
``` 

The remaining settings should be tailored for your Riot deployment.

# Running your own

TODO

# Building

TODO

# Development

TODO