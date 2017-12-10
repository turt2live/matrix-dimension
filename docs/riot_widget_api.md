# Riot's Widget API

Widgets and Riot communicate using cross-origin messages in a defined format (described in this document). Widgets have access to the entire Scalar Client API, but generally do not need any of the endpoints there. Riot provides additional APIs available to particular widgets for which the integrations manager can not access. The full source for the widget messaging layer in Riot can be seen [here](https://github.com/matrix-org/matrix-react-sdk/blob/develop/src/WidgetMessaging.js). The API is restricted to ensure rogue widgets cannot take over the Riot instance.

## Setting up communications

Riot will automatically open a channel for receiving messages. The widget needs to do the same so it can speak to Riot. Here's some sample JavaScript that will do this for us:

```
window.addEventListener("message", function(event) {
  if (!event.data || !event.data.response) return; // invalid
  if (event.data.error) throw new Error(event.data.error); // TODO: Better error handling

  // TODO: Process response
});

function sendMessage(action, widgetId, otherFields) {
  if (!otherFields) otherFields = {};
  
  var request = otherFields;
  request["widgetId"] = widgetId;
  request["action"] = action;
  request["api"] = "widget";

  window.opener.postMessage(request, "*"); // "*" posts to all origins
}
```

## Response format

For all requests, the request is returned with the response. As an example, if we made a request like this:
```
{
  "api": "widget",
  "action": "api_version",
  "widgetId": "dimension-my-cool-widget"
}
```
then we can expect a response object that looks like this:
```
{
  "api": "widget",
  "action": "api_version",
  "widgetId": "dimension-my-cool-widget"
  "response": {
    "version": "0.0.1"
  }
}
```

### Errors

An error response will always have the following structure under `response`:
```
{
  "error": {
    "message": "Something went wrong",
    "_error": <original Error object>
  }
}
```

### Versions / Changelog

All versions use a semantic versioning scheme. The actions recorded in this document include which version they were implemented in. The changelog here is for convience. 

**v0.0.1**
* Initial release
* Added `api_version` action
* Added `supported_api_versions` action
* Added `content_loaded` action

## Actions

The examples in this section assume the helper function in "Setting up communication" is present.

### Getting the current API version

**Action**: `"api_version"`
**Introduced in version**: 0.0.1
**Required params**:
* `widgetId` - the widget performing the request

**Sample call**:
```
sendMessage("api_version", "dimension-my-cool-widget");
```

**Success Response**:
```
{
  "api": "widget",
  "action": "api_version",
  "widgetId": "dimension-my-cool-widget",
  "response": {
    "version": "0.0.1"
  }
}
```

### Getting the supported API versions

**Action**: `"supported_api_versions"`
**Introduced in version**: 0.0.1
**Required params**:
* `widgetId` - the widget performing the request

**Sample call**:
```
sendMessage("supported_api_versions", "dimension-my-cool-widget");
```

**Success Response**:
```
{
  "api": "widget",
  "action": "supported_api_versions",
  "widgetId": "dimension-my-cool-widget",
  "response": {
    "supported_versions": ["0.0.1"]
  }
}
```

### Indicating that the widget content has been loaded

**Action**: `"content_loaded"`
**Introduced in version**: 0.0.1
**Required params**:
* `widgetId` - the widget performing the request

**Sample call**:
```
sendMessage("content_loaded", "dimension-my-cool-widget");
```

**Success Response**:
```
{
  "api": "widget",
  "action": "content_loaded",
  "widgetId": "dimension-my-cool-widget",
  "response": {
    "success": true
  }
}
```
