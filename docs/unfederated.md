## Running Dimension in a private/non-federated environment

Using the Synapse documentation, start building your homeserver's configuration. Where the default
configuration enables a `federation` listener, use `openid` instead. For example, your `listeners`
may look something like this:
```yaml
listeners:
  - port: 8008
    bind_addresses: ['::1', '127.0.0.1']
    type: http
    x_forwarded: true
    resources:
      - names: [client, openid]
        compress: false
```

Afterwards, either configure your homeserver as though federation was enabled (create SRV records, for
example) or make use of Dimension's `federationUrl` configuration option to point directly at the
listener configured in Synapse.
