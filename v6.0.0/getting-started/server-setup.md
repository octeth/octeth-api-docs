---
layout: doc
---

# Server Setup

After initializing your Ubuntu 24.04 server, you need to prepare it for Octeth installation. This involves updating system packages and installing required dependencies.

## Connect to Your Server

SSH login to the server using your server's IP address:

```bash
ssh-keygen -R '[203.0.113.10]:22'
ssh-keyscan -H -p 22 203.0.113.10 >> ~/.ssh/known_hosts
ssh root@203.0.113.10 -p 22
```

::: tip
Replace `203.0.113.10` with your actual server IP address throughout this guide.
:::

## Update System Packages

Update the package manager cache and upgrade all installed packages to their latest versions:

```bash
apt update
apt upgrade

# Reboot the server if needed
shutdown -r now
```

The system update ensures you have the latest security patches and package versions before installing Octeth.

## Install Required Packages

Install all necessary system packages that Octeth depends on:

```bash
apt install -y software-properties-common sharutils apt-utils iputils-ping telnet git unzip zip openssl vim wget debconf-utils mysql-client ufw npm nodejs htop iotop netdata jq
```

::: warning Do not install the `docker.io` package
Ubuntu's own `docker.io` package must **not** be installed here. The next section installs Docker from Docker's official repository, and `docker-ce` replacing `docker.io` leaves the `docker.socket` unit in a failed state. Because the Docker service is socket-activated, it can then never start, and `install:start` refuses to run with `✗ Docker daemon is not running`.

If you have already run an older version of this guide that included `docker.io`, see [Docker installed but the daemon will not start](#docker-installed-but-the-daemon-will-not-start) below.
:::

**Key packages explained:**
- **git**: Version control for addon installations
- **mysql-client**: MySQL database client tools
- **unzip/zip**: Archive utilities for Octeth package
- **vim/wget**: Text editor and download utility
- **htop/iotop**: System monitoring tools
- **netdata**: Real-time performance monitoring
- **jq**: JSON processing tool for CLI operations

## Install Docker and Docker Compose

Octeth runs entirely in Docker containers. Install the official Docker packages:

```bash
# Install prerequisites
apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository to Apt sources
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update

# Install Docker packages
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker service
systemctl start docker

# Verify the daemon is actually running
systemctl is-active docker
docker info --format 'ServerVersion={{.ServerVersion}}'
```

Both commands must succeed. `systemctl is-active docker` prints `active`, and `docker info` prints a server version such as `ServerVersion=29.8.0`.

::: warning Check the daemon, not just the client
Do not verify with `docker --version` alone. That command, and `docker compose version`, only report the **client** and answer perfectly happily while the daemon is dead. `docker info` is the check that proves the daemon is reachable, because it has to talk to it.
:::

## Docker installed but the daemon will not start

If `systemctl is-active docker` prints `failed`, check the logs:

```bash
journalctl -u docker --no-pager -n 20
```

A message like this means the socket unit is not running:

```
dockerd: failed to load listeners: no sockets found via socket activation:
         make sure the service was started by systemd
```

This is what happens when `docker.io` was installed before `docker-ce`, as older versions of this guide instructed. The replacement completes, but leaves `docker.socket` failed, and the socket-activated service can never start. Start the socket first, then the service:

```bash
systemctl start docker.socket
systemctl start docker
docker info --format 'ServerVersion={{.ServerVersion}}'
```

The fix persists; there is no need to reinstall anything.

## Next Steps

Your server is now prepared for Octeth installation. Continue to the [Upload Octeth to Server](./upload-octeth-to-server) guide.
