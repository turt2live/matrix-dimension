# Scalar API (matrix.org)

Scalar has a server-side component to assist in managing integrations. The known endpoints are documented below. All of them require a `scalar_token` provided from the vector.im scalar (`https://scalar.vector.im`).

None of these are officially documented, and are subject to change.

## POST `/api/integrations?scalar_token=...`

**Body**:
```
{
  "RoomID": "!JmvocvDuPTYUfuvKgs:t2l.io"
}
```
*Note*: Case difference appears to be intentional.

**Response**:
```
{
  "integrations": [{
    "type": "rssbot",
    "user_id": "@travis:t2l.io",
    "config": {
      "feeds": {
        "https://ci.t2l.io/view/all/rssAll": {
          "poll_interval_mins": 0,
          "is_failing": false,
          "last_updated_ts_secs": 1495995601,
          "rooms": ["!JmvocvDuPTYUfuvKgs:t2l.io"]
        }
      }
    },
    "self": false
  },{
    "type": "rssbot",
    "user_id": "@travis:tang.ents.ca",
    "config": {
      "feeds": {
        "https://ci.t2l.io/job/java-simple-eventemitter/rssAll": {
          "poll_interval_mins": 0,
          "is_failing": false,
          "last_updated_ts_secs": 1495995618,
          "rooms": ["!JmvocvDuPTYUfuvKgs:t2l.io"]
        }
      }
    },
    "self": true
  },{
    "type": "travis-ci",
    "user_id": "@travis:t2l.io",
    "config": {
      "webhook_url": "https://scalar.vector.im/api/neb/services/hooks/some_long_string",
      "rooms": {
        "!JmvocvDuPTYUfuvKgs:t2l.io": {
          "repos": {
            "turt2live/matrix-dimension": {
              "template": "%{repository}#%{build_number} (%{branch} - %{commit} : %{author}): %{message}\n    Change view : %{compare_url}\n    Build details : %{build_url}\n"
            }
          }
        }
      }
    },
    "self": false
  }]
}
```

## POST `/api/integrations/{type}?scalar_token=...`

**Params**:
`type` appears to be one of the following:
* github
* giphy
* google
* wikipedia
* guggy
* imgur
* rssbot
* travis-ci

**Body**:
```
{
  "room_id": "!RtMvcvtjkfHeFbjzWM:t2l.io"
}
```

**Response**:
```
{
  "bot_user_id": "@neb_giphy:matrix.org",
  "integrations": []
}
```
*Note*: `integrations` appears to only be present when there are settings needed for the integration.

**RSS Bot Response**:
```
{
  "bot_user_id": "@_neb_rssbot_=40travis=3at2l.io:matrix.org",
  "integrations": [{
    "type": "rssbot",
    "user_id": "@travis:t2l.io",
    "config": {
      "feeds": {
        "https://ci.t2l.io/view/all/rssAll": {
          "poll_interval_mins": 0,
          "is_failing": false,
          "last_updated_ts_secs": 1495957242,
          "rooms": ["!JmvocvDuPTYUfuvKgs:t2l.io"]
        }
      }
    },
    "self": false
  }]
}
```

**Travis-CI Bot Response**:
```
{
  "bot_user_id": "@_neb_travisci_=40travis=3at2l.io:matrix.org",
  "integrations": [{
    "type": "travis-ci",
    "user_id": "@travis:t2l.io",
    "config": {
      "webhook_url": "https://scalar.vector.im/api/neb/services/hooks/some_long_string",
      "rooms": {
        "!JmvocvDuPTYUfuvKgs:t2l.io": {
          "repos": {
            "turt2live/matrix-dimension": {
              "template": "%{repository}#%{build_number} (%{branch} - %{commit} : %{author}): %{message}\n    Change view : %{compare_url}\n    Build details : %{build_url}\n"
            }
          }
        }
      }
    },
    "self": true
  }]
}
```


## POST `/api/removeIntegration?scalar_token=...`

**Body**:
```
{
  "type": "giphy",
  "room_id": "!RtMvcvtjkfHeFbjzWM:t2l.io"
}
```

## POST `/api/integrations/rssbot/configureService?scalar_token=...`

**Body**:
```
{
  "room_id": "!JmvocvDuPTYUfuvKgs:t2l.io",
  "feeds": {
    "https://ci.t2l.io/view/all/rssAll": {}
  }
}
```

## POST `/api/integrations/travis-ci/configureService?scalar_token=...`

**Body**:
```
{
  "rooms": {
    "!JmvocvDuPTYUfuvKgs:t2l.io": {
      "repos": {
        "turt2live/matrix-dimension": {
          "template": "%{repository}#%{build_number} (%{branch} - %{commit} : %{author}): %{message}\n    Change view : %{compare_url}\n    Build details : %{build_url}\n"
        }
      }
    }
  }
}
```