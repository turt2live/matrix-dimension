# Dimension API

Dimension has its own API that allows for management of integrations in Riot/Matrix.

## Types of integrations

### Simple Bots

* Can only be in a room or not
* No state information held

### Complex Bots

* Simple Bots that hold state information

### Bridges

* Manage their own state through dedicated API endpoints

## Endpoints

### `GET /api/v1/dimension/integrations/{roomId}?scalar_token=your_token_here`

**Parameters**
* `{roomId}` - The room ID to get integrations for
* `scalar_token` - The scalar (dimension) token to authenticate with

**Example Response**
```
TODO
```

### `DELETE /api/v1/dimension/integrations/{roomId}/{type}/{integrationType}?scalar_token=your_token_here`

**Parameters**
* `{roomId}` - The room ID to remove the integration from
* `{type}` - The integration type (eg: `bot`, `complex-bot`, `bridge`, etc)
* `{integrationType}` - The integration subtype (eg: `irc`, `rssbot`, `giphy`, etc)
* `scalar_token` - The scalar (dimension) token to authenticate with

**Example Response**
```
TODO
```

### `PUT /api/v1/dimension/integrations/{roomId}/{type}/{integrationType}/state`

**Parameters**
* `{roomId}` - The room ID to update the integration state in
* `{type}` - The integration type (eg: `bot`, `complex-bot`, `bridge`, etc)
* `{integrationType}` - The integration subtype (eg: `irc`, `rssbot`, `giphy`, etc)

**Example Body**
```
{
    "scalar_token": "your_token_here",
    "state": {
        // integration specific state goes here
    }
}
```

### `GET /api/v1/dimension/integrations/{roomId}/{type}/{integrationType}/state?scalar_token=your_token_here`

**Parameters**
* `{roomId}` - The room ID to get the integration state in
* `{type}` - The integration type (eg: `bot`, `complex-bot`, `bridge`, etc)
* `{integrationType}` - The integration subtype (eg: `irc`, `rssbot`, `giphy`, etc)
* `scalar_token` - The scalar (dimension) token to authenticate with

**Response**

An object representing the integration-specific state. See the documentation for the desired integration for more information.

### `GET /api/v1/dimension/{type}/{integrationType}/oauth/url?redirect=your_url_here&scalar_token=your_token_here`

**Parameters**
* `{type}` - The integration type (eg: `bot`, `complex-bot`, `bridge`, etc)
* `{integrationType}` - The integration subtype (eg: `irc`, `rssbot`, `giphy`, etc)
* `redirect` - The URL to redirect to when complete
* `scalar_token` - The scalar (dimension) token to authenticate with

**Example Response**
```
{
  "url": "https://github.com/somewhere?with=params"
}
```

### `DELETE /api/v1/dimension/{type}/{integrationType}/oauth?scalar_token=your_token_here`

**Parameters**
* `{type}` - The integration type (eg: `bot`, `complex-bot`, `bridge`, etc)
* `{integrationType}` - The integration subtype (eg: `irc`, `rssbot`, `giphy`, etc)
* `scalar_token` - The scalar (dimension) token to authenticate with

**Example Response**
```
{}
```

## Integration State Information

### Simple Bots

Do not hold state.

### Complex Bots

#### RSS Bot
```
{
    // Mutable using state API
    "feeds": [
        "https://some.domain.com/feed.rss",
        "https://some.domain.com/another_feed.rss"
    ],
    
    // Read only. Controlled by other users.
    "immutableFeeds": [
        "https://some.domain.com/third_feed.rss",
        "https://some.domain.com/fourth_feed.rss"
    ]
}
```

#### Github
```
{
  // Mutable using state API
  "repositories": {
    "turt2live/matrix-dimension": ["push", "pull_request", "issues", "issue_comment", "pull_request_review_comment", "labels", "milestones", "assignments"],
    "turt2live/matrix-voyager-bot": []
  },

  // Read only.
  "authenticated": true
}
```

*Unauthenticated response*
```
{
  // Read only.
  "repositories": {},

  // Read only.
  "authenticated": false
}
```

### Bridges

#### IRC
```
{
    // Read only
    "availableNetworks": [
        {"name": "Freenode", "id": "freenode"},
        {"name": "EsperNet", "id": "espernet"},
        {"name": "OFTC", "id": "oftc"}
    ],
    
    // Read only. Use IRC API to mutate
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