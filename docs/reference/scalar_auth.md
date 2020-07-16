# Scalar Authentication / Registration

When the "Manage Integrations" button is first clicked by a user, Element will try and register with the Integrations Manager
to get a `scalar_token` that it then uses to authenticate all future requests with the manager.

## `$restUrl/register`

This ends up mapping to `/api/v1/scalar/register` when Dimension is correctly set up for a Element instance.

Element will POST to this endpoint an OpenID object that looks similar to the following:
```
{
    "access_token": "ABCDEFGH",
    "token_type": "Bearer",
    "matrix_server_name": "matrix.org",
    "expires_in": 3600
}
```

`expires_in` is given in seconds.

With this information, we can hit the federation API on the `matrix_server_name` to get ourselves the Matrix User ID (MXID)
of the user. This is a GET request to `http://matrix.org/_matrix/federation/v1/openid/userinfo?access_token=ABCDEFGH`.
Be sure to replace the domain name and access token value.

The federation API responds with the following:
```
{
    "sub": "@turt2live:matrix.org"
}
```

At this point we can store whatever information we want. We do have to reply to the original web request, however. The
following JSON is more than enough:

```
{
    "scalar_token": "some_generated_string"
}
```

Element will now use this token in future requests by hitting the `"integrations_ui_url"` with `?access_token=some_generated_string`.
