# BigBlueButton

[BigBlueButton](https://bigbluebutton.org/) is open-source video calling software aimed primarily at educators and has
useful features such as screen and PDF sharing, collaborative document editing, polls and more.

Dimension supports embedding BigBlueButton meetings into a Matrix room via widgets, and can do so in two ways:

* [Greenlight](https://docs.bigbluebutton.org/greenlight/gl-overview.html) is a frontend for BigBlueButton meeting
  administration that allows for creating/ending meetings, inviting people via link or email etc. Dimension supports
  taking a Greenlight URL and turning it into a widget in a Matrix room that room occupants can use to join the meeting.
  In this instance, Greenlight is acting as a client of BigBlueButton's server-side API, and Dimension is relying on a
  Greenlight URL to allow Matrix users to join a meeting.
* Alternatively, Dimension can be configured to connect directly to BigBlueButton and create meetings itself. This does
  require running your own BigBlueButton server which Dimension will have authorization to control. This configuration is
  useful as meetings can be created without needing to leave your Matrix client, as well as sidesteps the need to set up
  Greenlight on your deployment. This method can also be used to allow the 'Video Call' button in Element to start a
  meeting.

Note that with the first method, Dimension can be given a Greenlight URL pointing to any public instance of
Greenlight/BigBlueButton. With the second, Dimension will only talk to, and create meetings on, the BigBlueButton server
it has been configured to talk to.

## Usage Guide

### Using a Greenlight URL

Dimension does not require any extra configuration to allow creating meetings using a Greenlight URL.

* Open the integration manager window and add a BigBlueButton widget.
* Enter the URL you received from Greenlight. It should be in the form: `https://bbb.example.com/abc-def-ghi`.
* Click the 'Add Widget' button.

Members in the room will see a BigBlueButton widget appear. They can click "Join Conference" inside the widget to join.

### Have Dimension Create Meetings (with Element's Video Call button)

Fill out the `bigbluebutton` section of Dimension's config file. Both the `apiBaseUrl` and `sharedSecret` fields must be
set to the values corresponding to your own BigBlueButton server.

Note: Matrix clients can create widgets by sending a widget state event in the room with the appropriate fields. To retrieve
the necessary content of the state event, clients can
call `/api/v1/dimension/bigbluebutton/widget_state?roomId=!room:domain`
on Dimension to retrieve the necessary state. The contents of the `widget` field from the response is what should be
placed in the `content` of the widget state event. Note that while servicing this call, Dimension will create the
BigBlueButton meeting. The contents of the state event will then contain all necessary information for clients to join
the meeting.

Element can be configured to do the above automatically without any client-side changes. Simply add the following
information to the [Client well-known](https://matrix.org/docs/spec/client_server/r0.6.1#get-well-known-matrix-client)
file of your homeserver:

```json
"io.element.call_behaviour": {
    "widget_build_url": "https://dimension.example.com/api/v1/dimension/bigbluebutton/widget_state",
}
```

then close and reopen Element so that it picks up the new behaviour.

Now pressing the Video Call button in a room with more than two users in it should spawn a BigBlueButton meeting! Note
that BigBlueButton will automatically end meetings that all users have left (after a minute or two). Thus if all users
have left a meeting, you will need to recreate the widget in order to spawn a new meeting.

Created meetings are protected by a generated password that is included in the widget room state event. Thus one will
only be able to gain access to the meeting if they are in the room, or if someone in the room shares that information
with them. All users that join will have moderator permissions in the meeting, though this may change in the future to
allow meeting permissions based of room power level.

### Troubleshooting

This code was last tested with the [BigBlueButton v2.3 docker image](https://github.com/bigbluebutton/docker/).

#### When using a Greenlight URL

Let us know if you run into any problems!

#### When having Dimension create meetings

*My users are seeing 401 Unknown Session errors when trying to join a meeting!*

BigBlueButton (or at least the [docker image](https://github.com/bigbluebutton/docker)) has a strange bug where
calling the [`/join`](https://docs.bigbluebutton.org/dev/api.html#join) API ends up failing to verify the session ID
*which it just passed to you*. There's discussion on the
issue [here](https://github.com/bigbluebutton/bigbluebutton/issues/6343)
and [here](https://groups.google.com/forum/#!topic/bigbluebutton-dev/TkjyUZP_gO8), but **TL;DR if you're getting
invalid session ID errors**, a workaround is to set `allowRequestsWithoutSession=true`
in `/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties` (located in the `bbb-docker_bbb-web` container for
docker deployments).

*I'm using the BigBlueButton docker image and it's taking about 20-30 seconds for a user to join a meeting. Why is it so slow?*

This appears to be due to the BigBlueButton nginx container attempting to contact multiple html5-frontend instances, of
which you may only have configured one or two to start. nginx will wait for every request to timeout before returning
the result to yours though, hence the long wait. It's possible to edit the nginx configuration inside the containers to
remove the extra upstream directives and eliminate the timeout. But this is something that really needs to be fixed
upstream.

*It sometimes says that my meeting does not exist! Where'd it go?*

As mentioned above, BigBlueButton server will automatically remove meetings that everyone has left. Unfortunately we don't
currently have a way to remove the widget when this happens. Someone will permissions in the room will need to recreate
the widget and thus create a new meeting.