## Installing Dimension

**Note**: Dimension is currently only capable of running with Element Web or Desktop. The iOS and Android
apps are not directly supported without compiling your own versions. In future, this should be handled
by [an integration manager specification](https://github.com/turt2live/matrix-dimension/issues/262).

There are several options for installing Dimension. The easiest is dependent on how you have Element
and your homeserver set up. If you're using [matrix-docker-ansible-deploy](https://github.com/spantaleev/matrix-docker-ansible-deploy),
there are already options for configuring Dimension.

### Step 0: Requirements

You will need a functioning homeserver (such as [Synapse](https://github.com/matrix-org/synapse)) and
a client to access Dimension with. Currently, that means using [Element Web or Desktop](https://element.io).

Additionally, you will need to be able to host Dimension on a dedicated domain. If your homeserver
is set up for example.org, we recommend using dimension.example.org for Dimension.

Finally, this guide assumes you are running nginx as a webserver for Element, your homeserver, and
Dimension. A basic configuration before setting up Dimension would be:

```conf
server {
    # Simple configuration for Synapse. Consult the Synapse documentation for however you would
    # like to run your homeserver.
    server_name example.org;
    listen 443 ssl;
    listen [::]:443 ssl;

    location /_matrix {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://localhost:8008;
    }
}

server {
    # Simple configuration for serving Element
    server_name chat.example.org;
    listen 443 ssl;
    listen [::]:443 ssl;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404.html;
    }
}
```

The SSL options are not shown. Using [Let's Encrypt with nginx](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04)
is fairly straightforward, however.

**Note**: If you're running Dimension in an unfederated environment, you'll have some additional setup
to do. See [unfederated.md](./unfederated.md) for more information.

### Step 1: Picking between Docker and building Dimension yourself

Docker images are provided as `turt2live/matrix-dimension` and require fewer resources than building
it yourself.

If you're using Docker, create a directory at `/etc/dimension` (or wherever you'd like - just remember
where it is!).

To build Dimension yourself, you'll need Node 10+, npm 6+, and 2-4gb of RAM. The following steps are enough
to get you started:
```bash
# Download dimension
git clone https://github.com/turt2live/matrix-dimension.git
cd matrix-dimension

# Install dependencies
npm install

# Build it
npm run build
```

### Step 2: Configuring Dimension

**Docker**: Using [the default config](https://github.com/turt2live/matrix-dimension/blob/master/config/default.yaml)
as an example, create a file at `/etc/dimension/config.yaml`.

**Building**: Copy `config/default.yaml` to `config/production.yaml`


After creating the file, open it in an editor like `nano` and start filling in the details. Don't forget
to add your user ID as an admin in the configuration - this is important later!

If you're using Docker, leave the `web` `port` and `address` as-is. Additionally, make sure to configure
the `database` section to look like this:
```yaml
database:
    file: "/data/dimension.db"
    botData: "/data/bot.json"
```

### Step 3: Running Dimension

**Docker**:
```bash
docker run -d --name dimension -p 127.0.0.1:8184:8184 -v /etc/dimension:/data turt2live/matrix-dimension
```

**Building**:
```bash
NODE_ENV=production npm run start:app
```

If all went well, Dimension should now be running - there's still a bit more configuration to
go though.

### Step 4: Configuring nginx

Create a new server definition for your nginx server:
```conf
server {
    server_name dimension.example.org;
    listen 443 ssl;
    listen [::]:443 ssl;

    root /var/www/html;
    index index.html;

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://localhost:8184;
    }
}
```

Reload or restart nginx after creating the configuration.

### Step 5: Final steps

If everything went according to plan, you should be able to visit `https://dimension.example.org`
and see instructions for configuring Element. If you don't, your configuration isn't working as
intended - double check that all the configuration is set up and visit [#dimension:t2bot.io](https://matrix.to/#/#dimension:t2bot.io)
for further help.

After configuring Element, click the integrations button (4 squares in the top right of any room) and
then click the gear icon. If you don't see a gear icon, you're not an admin in the config. This is
where you'll configure different integrations as Dimension doesn't ship with anything enabled by
default - click around and start enabling things.

### Step 6: Updating and restarting Dimension

**Docker**:
```bash
docker pull turt2live/matrix-dimension
docker restart dimension
```

**Building**:
```bash
# Kill the running Dimension process, then...

git pull
npm run build
NODE_ENV=production npm run start:app
```
