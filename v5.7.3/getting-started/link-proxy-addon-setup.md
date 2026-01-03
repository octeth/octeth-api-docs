---
layout: doc
---

# Link Proxy Installation and Configuration

Octeth's Link Proxy add-on provides an extra layer of security and performance for your email campaigns. It routes all link tracking and click events through a separate proxy server, keeping your main Octeth server private and unexposed to direct public access.

## Benefits

- **Enhanced Security**: Main Octeth server remains unexposed to public internet
- **Better Performance**: Dedicated server handles link redirects and tracking
- **Scalability**: Separate infrastructure for high-volume click tracking
- **SSL Management**: Automatic SSL certificate provisioning for tracking domains

## Server Requirements

The Link Proxy requires a minimal Ubuntu 24.04 server:

- **CPU**: 2 vCPUs
- **RAM**: 4 GB
- **Storage**: 40 GB SSD
- **OS**: Ubuntu 24.04
- **Network**: Public IPv4 address
- **Name**: octeth-link-proxy

For this example, assume your hosting provider assigned `203.0.113.20` to the server.

## Server Setup

### Connect to the Server

SSH login to your link proxy server:

```bash
ssh-keygen -R '[203.0.113.20]:22'
ssh-keyscan -H -p 22 203.0.113.20 >> ~/.ssh/known_hosts
ssh root@203.0.113.20 -p 22
```

### Update System Packages

Update the server to the latest packages:

```bash
apt update
apt upgrade

# Reboot if kernel updates were installed
shutdown -r now
```

### Install Required Packages

Install system dependencies:

```bash
apt install -y software-properties-common sharutils apt-utils iputils-ping telnet git unzip zip openssl vim wget debconf-utils cron supervisor mysql-client docker.io ufw make
```

### Install Docker and Docker Compose

The Link Proxy runs in Docker containers. Install Docker:

```bash
# Install prerequisites
apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update

# Install Docker packages
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
systemctl start docker

# Verify Docker is running
systemctl status docker
```

## Install Link Proxy Add-On

### Clone the Repository

Download the Link Proxy add-on from GitHub:

```bash
mkdir -p /opt/oempro-link-proxy
cd /opt/oempro-link-proxy
git clone https://github.com/octeth/oempro-link-proxy.git .
cp Caddyfile.example Caddyfile
```

### Configure Caddyfile

Edit the Caddyfile to configure the reverse proxy and SSL settings:

```bash
vi Caddyfile
```

Update the configuration with your settings:

```
# Reference:
# https://ohdear.app/blog/how-we-used-caddy-and-laravels-subdomain-routing-to-serve-our-status-pages

# IMPORTANT: The on_demand_tls configuration is critical for security.
# Without it, the proxy could issue SSL certificates for any domain pointed to your server!

{
  on_demand_tls {
        # Visit Octeth admin section > Settings > Email Delivery
        # Copy the "On-Demand SSL Domain URL" value and paste it here
        ask http://203.0.113.10/app/domain_verify/run/your-verification-token-here
  }
}

http:// {
    redir https://{host}{uri}
}

https:// {
  tls admin@example.com {
    on_demand
  }

  # https://caddyserver.com/docs/caddyfile/directives/reverse_proxy
  reverse_proxy {
    # Replace with your Octeth server IP
    # Ensure the A record points directly to the Octeth server (not proxied through CloudFlare)
    to http://203.0.113.10

    header_down X-Test2 {system.hostname}

    header_up Host {upstream_hostport}
    header_up X-Forwarded-Host {host}
    header_up X-Test1 {system.hostname}
    header_up Host {host}
    header_up StatusPageHost {host}
    header_up X-Real-IP {remote}
    header_up X-Forwarded-For {remote}
    header_up X-Forwarded-Port {server_port}
    header_up X-Forwarded-Proto {scheme}
  }
}
```

::: warning Configuration Notes
1. Replace `203.0.113.10` with your actual Octeth server IP
2. Replace `admin@example.com` with your email for SSL certificate notifications
3. Get the verification token from Octeth Admin > Settings > Email Delivery
4. The verification URL ensures only authorized domains get SSL certificates
:::

### Build and Run

Build the Docker image and start the container:

```bash
make build
make run
```

### Verify Container Status

Confirm the Docker container is running:

```bash
docker ps
```

You should see the `oempro-link-proxy` container in the running state.

## DNS Configuration

### Setup Base Domain

Create an A record pointing to your Link Proxy server:

```
link.example.com A 203.0.113.20
```

### Setup Tracking Domains

For each link tracking domain you want to use, create a CNAME record pointing to your base domain:

```
track.yourdomain.com CNAME link.example.com
links.yourbrand.com  CNAME link.example.com
```

::: tip Multiple Tracking Domains
You can configure unlimited tracking domains as CNAME records. Each will automatically get an SSL certificate when first accessed.
:::

## Configure Octeth

In the Octeth Admin Dashboard:

1. Go to **Settings** > **Email Delivery**
2. Find **Link Proxy Settings** section
3. Enable **Use Link Proxy**
4. Enter your Link Proxy server details
5. Configure allowed tracking domains
6. Save changes

## Testing

### Test Link Redirection

Send a test campaign and click a tracked link. The link should:
1. Redirect through your Link Proxy domain
2. Use HTTPS with a valid SSL certificate
3. Track the click in Octeth analytics
4. Redirect to the final destination URL

### Monitor Logs

View Link Proxy logs to troubleshoot issues:

```bash
docker logs -f oempro-link-proxy
```

## Troubleshooting

### SSL Certificate Issues

If SSL certificates aren't being issued:
1. Verify the verification URL in Caddyfile is correct
2. Check that DNS records are properly configured
3. Ensure the domain is allowed in Octeth settings
4. Review Caddy logs: `docker logs oempro-link-proxy`

### Connection Issues

If links aren't redirecting:
1. Verify the reverse proxy `to` address points to your Octeth server
2. Check that the Octeth server is accessible from the Link Proxy
3. Ensure port 80 and 443 are open on the Link Proxy server
4. Test connectivity: `curl http://203.0.113.10` from the Link Proxy server

## Next Steps

Your Link Proxy is now operational. Consider:
- Adding multiple tracking domains for different brands or campaigns
- Setting up monitoring and alerts for the Link Proxy server
- Configuring a firewall to restrict access to ports 80/443 only
- Implementing log rotation for Docker container logs
