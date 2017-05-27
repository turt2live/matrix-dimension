# Scalar API (matrix.org)

Scalar has a server-side component to assist in managing integrations. The known endpoints are documented below. All of them require a `scalar_token` provided from the vector.im scalar (`https://scalar.vector.im`).

None of these are officially documented, and are subject to change.

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
  "bot_user_id":"@neb_giphy:matrix.org"
}
```

## POST `/api/removeIntegration?scalar_token=...`

**Body**:
```
{
  "type":"giphy",
  "room_id":"!RtMvcvtjkfHeFbjzWM:t2l.io"
}
```