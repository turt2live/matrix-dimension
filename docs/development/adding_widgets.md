# Adding new widgets to Dimension

Widgets are small/simple applications that can be loaded via iframes in a Riot.im room. Dimension supports "wrapped widgets" where each widget URL is held in some kind of wrapper to ensure it can make everything work for that widget. For example, Jitsi widgets are wrapped so that the Jitsi elements can be set up.

To add a new widget to Dimension:

1. Copy and existing widget's configuration file from `config/integrations` and update it accordingly. The bare minimum is:
    ```yaml
    # These two options should never change
    type: "widget"
    enabled: true

    integrationType: "mywidget" # This is the widget type
    name: "My Widget" # The human-readable name for the widget
    about: "This is a very brief description of the widget"
    avatar: "img/avatars/mywidget.png" # Should be a 120x120 PNG image. 
                                       # Located at `web/public/img/avatars/mywidget.png`
    ```
2. In `web/app/shared/models/widget.ts` add a constant for your widget. In this example, it would be:
    ```typescript
    export const WIDGET_MY_WIDGET = ["mywidget"];
    ```
3. Add a new component to configure your widget under `web/app/configs/widget` (this is best done by copy/pasting another similar widget's component and renaming the files and class name).
4. Register the component in `web/app/shared/integration.service.ts` under the `supportedIntegrationsMap` like so:
    ```typescript
    private static supportedIntegrationsMap = {
      "widget": {
        "mywidget": {
          component: MyWidgetConfigComponent,
          types: WIDGET_MY_WIDGET,
        },
      },
    };
    ```
5. Start building out the widget configuration component.


## Widget configuration component methods

Most widgets should be able to specify their entire behaviour through use of the constructor, however some do require some additional hooks to operate correctly. For example, widgets being imported from older versions of Dimension or other integration managers may have to be massaged into compatible widgets.

All widgets rely on the `data` property bag to store state information, such as a channel name or conference name. This information is automatically persisted as part of the widget. Whenever you are interacting with a widget in the context of editing or creating it be sure to use the properties under `dimension` on the widget, otherwise your changes may be overwritten.

Here's a few examples of how to use the hooks supplied by the widget configuration component. For more information on all of the hooks available, please see the bottom of `web/app/configs/widget/widget.component.ts`.

#### Expanding the widget's data prior to creation

This is common for when a widget wants to create a new widget based on a channel name (for example). 

```typescript
protected onNewWidgetPrepared() {
  this.newWidget.dimension.newData.channelName = "";
}
```

#### Modifying the widget URL (or other properties) before adding/saving

```typescript
// Make sure to call these methods instead of addWidget and saveWidget in the view!

public validateAndAddWidget() {
  this.newWidget.dimension.newUrl = "https://somewhere.com";
  this.addWidget();
}

public validateAndSaveWidget(widget: EditableWidget) {
  widget.dimension.newUrl = "https://somewhere.com";
  this.saveWidget(widget);
}
```

#### Converting widgets from other data sources (Scalar, older versions, etc)

```typescript
protected onWidgetsDiscovered() {
  for (const widget of this.widgets) {
    // Note the use of .data instead of .dimension here.
    // This is because we're not editing or creating a widget - just preparing it.

    if (widget.data.oldDataKey) {
      widget.data.newDataKey = widget.data.oldDataKey;
    }
  }
}
```

