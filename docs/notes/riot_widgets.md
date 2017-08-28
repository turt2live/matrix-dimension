# Riot Widgets

Riot uses some special interaction with the integration manager to make for a clean user experience. 


### Edit Widget button

Ends up calling `$scalar_ui_url?integ_id=...&screen=...` alongside the standard parameters for the scalar token and room ID.

**`screen` known values**:
* `type_jitsi`
* `type_etherpad`
* `type_grafana`
* `type_youtube`
* `type_googledocs` - may be a bug? See [vector-im/riot-web#4917](https://github.com/vector-im/riot-web/issues/4917)
* `type_customwidget`

### Permissions

* Creators of widgets do not get prompted for permission to load
* Only people with permission to add widgets can remove widgets (otherwise it just revokes permission)
* Only creators of widgets can edit them