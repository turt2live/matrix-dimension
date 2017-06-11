# Dimension IRC Bridge API

As with most bridges, the IRC bridge uses a dedicated set of API endpoints to manage the state of the bridge. The IRC bridge still uses the state API provided by Dimension to report basic state information, but does not allow edits through the regular API. Instead, it is expected that the IRC API be used to mutate the state.

## Getting available networks/bridged channels

Make a call to the Dimension state API: `GET /api/v1/dimension/integrations/{roomId}/bridge/irc/state?scalar_token=...`.

*Example state*
```
{
    "availableNetworks": [
        {"name": "Freenode", "id": "freenode"},
        {"name": "Espernet", "id": "espernet"},
        {"name": "OFTC", "id": "oftc"}
    ],
    "channels": {
        "freenode": [
            "#dimensiontesting",
            "#dimensiontest"
        ],
        "espernet": [],
        "oftc": []
    }
}
```

## Getting the OPs in a channel

IRC API Endpoint: `GET /api/v1/irc/{roomId}/ops/{network}/{channel}?scalar_token=...`. The channel should not include the prefix (`#test` becomes `test`).

*Example response*
```
["turt2live", "johndoe"]
```

## Linking a new channel

IRC API Endpoint: `PUT /api/v1/irc/{roomId}/channels/{network}/{channel}?op=turt2live&scalar_token=...`. The channel should not include the prefix (`#test` becomes `test`).

A 200 OK is returned if the request to add the channel was sent. The channel will not appear in the state information until the op has approved the bridge.

## Unlinking a channel

IRC API Endpoint: `DELETE /api/v1/irc/{roomId}/channels/{network}/{channel}?scalar_token=...`. The channel should not include the prefix (`#test` becomes `test`).

A 200 OK is returned if the delete was successful.