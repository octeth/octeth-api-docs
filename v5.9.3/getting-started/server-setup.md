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
apt install -y software-properties-common sharutils apt-utils iputils-ping telnet git unzip zip openssl vim wget debconf-utils mysql-client docker.io ufw npm nodejs htop iotop netdata jq
```

**Key packages explained:**
- **docker.io**: Container runtime for Octeth services
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

# Verify Docker is running
systemctl status docker
```

You should see output indicating Docker is **active (running)**.

::: tip Verify Installation
Run `docker --version` to confirm Docker is installed correctly. You should see a version number like `Docker version 24.0.x`.
:::

## Next Steps

Your server is now prepared for Octeth installation. Continue to the [Upload Octeth to Server](./upload-octeth-to-server) guide.
