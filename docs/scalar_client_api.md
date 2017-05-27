# Scalar API (Riot)

Scalar and Riot communicate using cross-origin messages in a defined format (described in this document). The full source for the messaging layer in Riot can be seen [here](https://github.com/matrix-org/matrix-react-sdk/blob/develop/src/ScalarMessaging.js). With this API, the integrations manager is able to invite users, get some basic state information, and interact with the room in a limited capacity. The API is intentionally restricted to ensure that misbehaving domains don't have full control over Riot.

## Setting up communications

Riot will automatically open a channel for receiving messages. The integrations manager needs to do the same so it can speak to Riot. Here's some sample JavaScript that will do this for us:

```
window.addEventListener("message", function(event) {
  if (!event.data || !event.data.response) return; // invalid
  if (event.data.error) throw new Error(event.data.error); // TODO: Better error handling

  // TODO: Process response
});

function sendMessage(action, roomId, userId, otherFields) {
  if (!otherFields) otherFields = {};
  
  var request = otherFields;
  request["user_id"] = userId;
  request["room_id"] = roomId;
  request["action"] = action;

  window.opener.postMessage(request, "*"); // "*" posts to all origins
}
```

## Response format

For all requests, the request is returned with the response. As an example, if we made a request like this:
```
{
  "action": "invite",
  "room_id": "!curbf:matrix.org",
  "user_id": "@voyager:t2bot.io"
}
```
then we can expect a response object that looks like this:
```
{
  "action": "invite",
  "room_id": "!curbf:matrix.org",
  "user_id": "@voyager:t2bot.io",
  "response": {
    "success": true
  }
}
```

### Errors

An error response will always have the following structure under `response`:
```
{
  "message": "Something went wrong",
  "_error": <original Error object>
}
```

## Actions

The examples in this section assume the helper function in "Setting up communication" is present.

### Inviting users

**Action**: `"invite"`
**Required params**:
* `room_id` - where to invite the user to
* `user_id` - the user to invite

**Sample call**:
```
sendMessage("invite", "!curbf:matrix.org", "@voyager:t2bot.io");
```

**Success Response**:
```
{
  "action": "invite",
  "room_id": "!curbf:matrix.org",
  "user_id": "@voyager:t2bot.io",
  "response": {
    "success": true
  }
}
```

### Get membership state for a user

**Action**: `"membership_state"`
**Required params**:
* `room_id` - where to try and find the user
* `user_id` - the user to lookup

**Sample call**:
```
sendMessage("membership_state", "!curbf:matrix.org", "@voyager:t2bot.io");
```

**Success Response**:
```
{
  "action": "membership_state",
  "room_id": "!curbf:matrix.org",
  "user_id": "@voyager:t2bot.io",
  "response": {
    "membership": "join",
    "avatar_url": "mxc://t2bot.io/hcSELkhLCNMRxLLTXKffPPSn",
    "displayname": "Matrix Traveler"
  }
}
```

*Note*: The `response` will be the content of the `m.room.member` state event. An error may be returned if the user is not in the room.

### Get defined options for a bot

**Action**: `"bot_options"`
**Required params**:
* `room_id` - where to try and find the options
* `user_id` - the bot (user) to get options for

**Sample call**:
```
sendMessage("bot_options", "!curbf:matrix.org", "@voyager:t2bot.io");
```

**Success Response**:
```
{
  "action": "bot_options",
  "room_id": "!curbf:matrix.org",
  "user_id": "@voyager:t2bot.io",
  "response": {
    "botOption": "hello world"
  }
}
```

*Note*: The `response` will be the content of the `m.room.bot.options` state event, which is defined using `set_bot_options`.

### Setting options for a bot

**Action**: `"set_bot_options"`
**Required params**:
* `room_id` - where to try and set the options
* `user_id` - the bot (user) to set options for
* `content` - the options to specify (extra data)

**Sample call**:
```
sendMessage("set_bot_options", "!curbf:matrix.org", "@voyager:t2bot.io", {content: {botOption: 'hello world'}});
```

**Success Response**:
```
{
  "action": "set_bot_options",
  "room_id": "!curbf:matrix.org",
  "user_id": "@voyager:t2bot.io",
  "content": {
    "botOption": "hello world"
  },
  "response": {
    "success": true
  }
}
```

*Note*: The options will be set to the state event `m.room.bot.options`, keyed to the bot/user.

### Setting powerlevel for a bot

**Action**: `"set_bot_power"`
**Required params**:
* `room_id` - where to try and set the options
* `user_id` - the bot (user) to set options for
* `level` - the powerlevel for the bot (integer)

**Sample call**:
```
sendMessage("set_bot_power", "!curbf:matrix.org", "@voyager:t2bot.io", {level: 50});
```

**Success Response**:
```
{
  "action": "set_bot_power",
  "room_id": "!curbf:matrix.org",
  "user_id": "@voyager:t2bot.io",
  "level": 50,
  "response": {
    "success": true
  }
}
```

### Getting join rules for the room

**Action**: `"join_rules_state"`
**Required params**:
* `room_id` - where to try and set the options

**Sample call**:
```
sendMessage("join_rules_state", "!curbf:matrix.org");
```

**Success Response**:
```
{
  "action": "join_rules_state",
  "room_id": "!curbf:matrix.org",
  "response": {
    "join_rule": "public"
  }
}
```

*Note*: This returns the content of the state event `m.room.join_rules` in the room.

### Setting the plumbing state for a room

**Action**: `"set_plumbing_state"`
**Required params**:
* `room_id` - where to try and set the options
* `status` - the plumbing state (string)

**Sample call**:
```
sendMessage("set_plumbing_state", "!curbf:matrix.org", null, {status:"whatever"});
```

**Success Response**:
```
{
  "action": "set_plumbing_state",
  "room_id": "!curbf:matrix.org",
  "status": "whatever",
  "response": {
    "success": true
  }
}
```

*Note*: This sets the `m.room.plumbing` state event for the room.

### Closing the integrations manager (scalar)

**Action**: `"close_scalar"`
**Required params**:
* *None*

**Sample call**:
```
sendMessage("close_scalar");
```

**Success Response**:
```
{
  "action": "close_scalar",
  "response": null
}
```