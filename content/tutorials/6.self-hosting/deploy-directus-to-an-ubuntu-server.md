---
id: 5a48edd1-f8d2-499d-8f1a-6a6b378c65d9
slug: deploy-directus-to-an-ubuntu-server
title: Deploy Directus to an Ubuntu Server
authors:
  - name: Yusuf Akorede
    title: Guest Author
description: Learn how to deploy Directus on a Docker container on an Ubuntu server.
---
In this tutorial, you will learn how to deploy a Directus application within a Docker container on an Ubuntu server and connect it to a custom domain. [Ubuntu](https://ubuntu.com/download/server) is a popular open source Linux distribution which is commonly available from hosting providers.

This guide covers setting up Docker, configuring Docker Compose, using Nginx as a reverse proxy, and securing your application with SSL. Additionally, you will discover how to run the application as a background service, ensuring seamless operation and easy management.

## Prerequisites

1. **A Directus Project:** Prepare a local Directus project for deployment. Follow the [Directus quickstart guide](/getting-started/create-a-project) if you need to create a new project.
2. **Ubuntu Server:** Access an Ubuntu server via SSH. You can obtain one from cloud providers like Azure, DigitalOcean, Linode, or AWS. Configure SSH access from your local machine. This tutorial has been tested with version 20.04 or 22.04.
3. **Domain Name:** Register a custom domain name and have access to its DNS settings.
4. **Command Line Familiarity:** Basic knowledge of Linux command-line operations, including file uploads using `scp` and editing files with `nano`.

## Upload Your Local Directus Application Folder to the Server

If you have successfully followed the [Self-Hosted Quickstart](/getting-started/overview), you should have a directory with a `docker-compose.yml` file, `database/` directory with a `data.db` file, `uploads/` directory, and `extensions/` directory.

Use `scp` (Secure Copy Protocol) to upload the local folder to your server.

From your local machine's terminal, run:

```bash
scp -r /path/to/your/local/directus/folder username@server_ip:/path/to/your/remote/folder
```

Replace `/path/to/your/local/directus/folder` with the actual local path of your Directus application directory, and `/path/to/your/remote/folder` with the respective path on your server.

Also, replace `username` with your server's username and `server_ip` with your server's public IP address.

In the example below, I am copying the whole Directus folder to the home directory (`~`) of my server.

![Copying files to the server with scp](/img/09e1807d-271e-4d52-91f6-951d3436ce34.webp)

::callout{icon="material-symbols:info-outline"}

Note that the database used in this tutorial is SQLite. For other types of databases like MySQL and PostgreSQL, you might have to create a database dump and export the dump to your remote server.

::

## Preparing Your Ubuntu Server

Access your Ubuntu server from your local machine terminal via SSH:

```bash
ssh username@server_ip
```

In your server terminal, run the following commands to update packages and dependencies on the system:

```bash
sudo apt update
sudo apt upgrade -y
```

## Installing Docker

Remove conflicting packages to ensure a clean Docker installation:

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

Ensure you have the latest package information, update the package manager, and install dependencies needed for docker installation:

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
```

Add Docker's GPG key for package authenticity:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

Add Docker repository to package manager sources, and update the package manager to recognize the new repository:

```bash
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

Install Docker packages, including Docker Engine and CLI, containerd, Docker Buildx, and Docker Compose plugins.

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Confirm the successful installation of Docker Engine by executing the following command:

```bash
sudo docker run hello-world
```

This command downloads a test image and executes it within a container. Upon running, the container displays a confirmation message before exiting.

## Start your Directus Application

Run these commands to allow incoming traffic on ports 22 (SSH), 80 (HTTP), 443 (HTTPS), and 8055:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8055/tcp
sudo ufw enable
```

Start your Directus application using Docker Compose:

```bash
cd /path/to/your/directus/folder
sudo docker compose up
```

On the initial run, Docker will fetch the necessary image from the registry before launching your Directus application.

Your application should now be accessible at `http://your_server_ip:8055`.

:::info `SQLITE_CANTOPEN` Error

If you encounter any error e.g `SQLITE_CANTOPEN: unable to open database file`, it is probably due to permission issues. You can learn more about [this issue here](https://github.com/directus/directus/discussions/17823#discussioncomment-5395649).

:::

## Running the Docker Container as a Background Service

Running your application using `sudo docker compose up` will stop it running when you close the terminal.

To ensure your application runs in the background and restarts automatically, you can create a systemd service.

:::info What is Systemd?

Systemd is a system and service manager for Linux operating systems. It provides a standard process for controlling the startup, management, and monitoring of services and applications. It is usually defined by a configuration file usually ending with the _.service_ extension.

:::

### Create a Systemd Service File

Create a file named _directus.service_ in the _/etc/systemd/system/_ directory:

```bash
sudo nano /etc/systemd/system/directus.service
```

Add the following content, updating the `WorkingDirectory` to your Directus project directory containing the `docker-compose.yml` file:

```txt
[Unit]
Description=Directus Docker Service
Requires=docker.service
After=docker.service
[Service]
Restart=always
WorkingDirectory=/path/to/your/directory-containing-docker-compose.yml
ExecStart=/usr/bin/docker compose up
ExecStop=/usr/bin/docker compose down
[Install]
WantedBy=multi-user.target
```

:::info

You can get the full path to your directory by running the command `pwd` in the project directory on your server and copying the output.

:::

Save the file and exit the editor.

Lets step through the service file:

- [Unit] Section:
  - Description: Description of the systemd service.
  - Requires: Dependency on the Docker service.
  - After: Starts after the Docker service.
- [Service] Section:
  - Restart=always: The service restarts automatically on exit.
  - WorkingDirectory: Path to the directory containing the docker-compose.yml file.
  - ExecStart: Command to start Docker containers.
  - ExecStop: Command to stop Docker containers.
- [Install] Section:
  - WantedBy=multi-user.target: Service enabled on reaching the multi-user state.

### Enable and Start the Service

Enable the service to start on boot, and then start the service:

```bash
sudo systemctl enable directus.service
sudo systemctl start directus.service
```

By executing this command, your Dockerized Directus application will run as a background service. One of the advantages of this setup is that the service will automatically restart in case of failures or system reboots, ensuring continuous availability.

Run the following command to check the status of the service:

```bash
sudo systemctl status directus.service
```

![Terminal showing the Directus service status](/img/d3700c60-97c5-4595-ace6-2d2a88c798c3.webp)

You can also confirm if your application is still running at `http://your_server_ip:8055`.

## Configuring DNS Settings for Your Domain

Configuring DNS settings for your domain is a crucial step in making your Directus application accessible to users over the internet. Here is how to do it:

1. **Access Your Domain Registrar's Website**: Log in to the website of your domain registrar, where you initially purchased or registered your domain name. This is where you manage your domain settings.
2. **Locate DNS Management or Domain Settings**: Inside your domain registrar's dashboard, look for options like "DNS Management," "Domain Settings," or "Domain Management." These names might vary based on the registrar's interface.
3. **Add a DNS Record for Your Subdomain**: Create a new DNS record to point your subdomain (e.g., directus.exampledomain.com) to your server's public IP address. Depending on the registrar, you may need to choose the record type, which is usually an "A" record for IPv4 addresses. Enter your server's public IP address in the designated field.
4. **Save the changes**: After adding the DNS record, save the changes. DNS propagation might take some time, ranging from a few minutes to a few hours. During this period, the DNS changes will propagate across the internet, making your subdomain accessible.

You can confirm your changes by visiting the application by visiting `http://directus.exampledomain.com:8055`.

![Directus application accessed by the domain at port 8055. The browser marks the page as Not Secure.](/img/5025c36f-e7e2-4232-9d4e-184a3c8c2039.webp)

## Setting Up Nginx as a Reverse Proxy

Nginx is a powerful reverse proxy server widely used in web hosting. As a reverse proxy, Nginx sits between clients and backend servers, forwarding client requests to the appropriate server.

Nginx is preferred due to its high performance, low resource usage and ease of configuration.

Install Nginx on your server:

```bash
sudo apt install nginx -y
```

Create an Nginx configuration file named _directus_ for your domain:

```bash
sudo nano /etc/nginx/sites-available/directus
```

Add the following configurations, replacing `directus.exampledomain.com` with your domain name:

```nginx
server {
  listen 80;
  server_name directus.exampledomain.com;
  location / {
    proxy_pass http://localhost:8055;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

This forwards the request to the domain to the Directus application running at `localhost` port `8055`.

Let's step through the config file:

- listen 80: Listens for incoming connections on port 80, the default for HTTP traffic.
- server_name directus.exampledomain.com: Matches requests to this domain.
- location / { ... }: Handles all requests for directus.exampledomain.com.
  - proxy_pass `http://localhost:8055`: Forwards requests to the Directus application.
  - proxy_http_version 1.1: Uses the HTTP/1.1 protocol for Nginx-proxy communication.
  - proxy_set_header Upgrade $http_upgrade: Essential for WebSocket connections.
  - proxy_set_header Connection 'upgrade': Indicates connection upgrade.
  - proxy_set_header Host $host: Sends original host information to the server.
  - proxy_cache_bypass $http_upgrade: Bypasses caching for WebSockets.

To test the Nginx configuration files for syntax errors, you can use the `sudo nginx -t` command.

Next, create a symbolic link to enable the site. Symbolic links helps streamline user directory mapping for web hosting management:

```bash
sudo ln -s /etc/nginx/sites-available/directus /etc/nginx/sites-enabled
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

Now you should be able to access your Directus application without adding the port at `http://directus.exampledomain.com`.

## Securing Your Application with SSL (Recommended)

Implementing SSL (Secure Sockets Layer) encryption is crucial for safeguarding data transmitted between your users and the server. Once enabled, your application will be accessible using `https`. [Let's Encrypt](https://letsencrypt.org) offers free SSL certificates, and here's how to set it up for your Directus application:

On your server, run the following commands to install Certbot and the Certbot Nginx plugin:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Obtain an SSL Certificate by running Certbot with the `--nginx` option, specifying your domain (directus.exampledomain.com in this case):

```bash
sudo certbot --nginx -d directus.exampledomain.com
```

Certbot will interactively guide you through the setup process.

Ensure you select the option to redirect HTTP traffic to HTTPS when prompted. Certbot will automatically configure Nginx to use the SSL certificate. Also make sure to renew the certificate before it expires to maintain a secure connection.

![HTTP to HTTPS redirect with certbot. The terminal shows an interactive prompt providing options to either redirect or not redirect.](/img/4b3aeef8-f1a0-4fdc-9704-3988f4026cd6.webp)

After the setup is complete, visit your Directus application using `https://directus.exampledomain.com` in a web browser to verify the SSL Certificate. You should see a padlock icon indicating a secure SSL connection. You should also be automatically redirected from `http` to `https`.

![URL in the browser uses http and is marked as secure.](/img/480c9f17-8819-48e4-9d01-ed0e8afc2322.webp)

## Summary

This tutorial guided you through hosting a Directus application on an Ubuntu server, covering essential steps such as Docker setup, firewall configuration, and SSL encryption. By following these instructions, you have ensured a secure, accessible, and continuously running environment for your Directus project.

If you have any questions or encounter difficulties, don't hesitate to revisit this guide or seek support from the [Directus community Discord server](https://directus.chat). Happy hosting!
