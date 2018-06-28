# Systemd Integration

Run dimension as a systemd service and configure to start at boot.

* Create service unit file. Save [systemd.matrix-dimension.service](https://github.com/turt2live/matrix-dimension/tree/master/config/systemd.matrix-dimension.service) to a systemd system path (e.g., `/etc/systemd/system/matrix-dimension.service`)

* Enable and start the newly created service

```
$ systemctl enable matrix-dimension.service
Created symlink /etc/systemd/system/default.target.wants/matrix-dimension.service → /etc/systemd/system/matrix-dimension.service.
```

* Try starting it up and checking the status for errors
```
$ systemctl start matrix-dimension.service
$ systemctl status matrix-dimension.service
```

* Reload systemd if any changes to the service file are necessary
```
$ systemctl daemon-reload
$ systemctl restart matrix-dimension.service
```

* View logs
```
$ tail -f /var/log/syslog | grep matrix-dimension
Jun 28 21:07:04 server1 matrix-dimension[913]: Jun-28-2018 21:07:04.582 +00:00 error [BridgeStore] connect ECONNREFUSED <uri snip>
Jun 28 21:07:04 server1 matrix-dimension[913]: Error: connect ECONNREFUSED <uri snip>
Jun 28 21:07:04 server1 matrix-dimension[913]:     at Object._errnoException (util.js:1022:11)
Jun 28 21:07:04 server1 matrix-dimension[913]:     at _exceptionWithHostPort (util.js:1044:20)
Jun 28 21:07:04 server1 matrix-dimension[913]:     at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1198:14)
```

## References
* [freedesktop.org](https://www.freedesktop.org/software/systemd/man/systemd.exec.html#Options)
* [axllent.org](https://www.axllent.org/docs/view/nodejs-service-with-systemd/)
* [digitalocean.com](https://www.digitalocean.com/community/tutorials/how-to-use-systemctl-to-manage-systemd-services-and-units)
