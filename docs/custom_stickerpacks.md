## Custom Stickerpacks

Share stickers and customize your experience with custom sticker packs, supported by Dimension.

### Creating a sticker pack

1. Start a conversation with [@stickers:t2bot.io](https://matrix.to/#/@stickers:t2bot.io)
2. Say `!stickers newpack` and follow the instructions.
3. Share the URL with your friends.

### Adding custom sticker packs to your sticker picker

1. Make sure you're using Dimension as an integration manager.
2. Open the sticker picker (smiley icon next to where you type messages).
3. Click the Edit button in the top right.
4. Paste the URL to the sticker pack you want to add into the box and click "Add Stickerpack".
5. Close Dimension and start using the stickers.

### Admin/Operator guide: Enabling custom sticker packs / using your own sticker manager

In Dimension's configuration, make sure the following section exists:

```yaml
# Custom sticker pack options.
# Largely based on https://github.com/turt2live/matrix-sticker-manager
stickers:
  # Whether or not to allow people to add custom sticker packs
  enabled: true

  # The sticker manager bot to promote
  stickerBot: "@stickers:t2bot.io"

  # The sticker manager URL to promote
  managerUrl: "https://stickers.t2bot.io"
```

Provided the `enabled` flag is `true`, users will be able to add custom sticker packs to their pickers. Custom 
stickers may require federation to work, and so it suggested that non-federated or closed environments use a
dedicated instance of [turt2live/matrix-sticker-manager](https://github.com/turt2live/matrix-sticker-manager) -
the project which makes `@stickers:t2bot.io` work. The `stickerBot` should be whichever user account is used by
the sticker manager, and the `managerUrl` should be the base URL of the manager.
