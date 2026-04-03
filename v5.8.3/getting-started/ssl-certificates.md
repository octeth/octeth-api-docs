---
layout: doc
---

# SSL Certificates

SSL certificates encrypt the connection between your users' browsers and your Octeth server, protecting login credentials, API keys, and subscriber data in transit. This guide explains how SSL works in Octeth's architecture and walks you through setting up certificates for your installation.

## How SSL Works in Octeth

Octeth uses a multi-layer architecture for handling SSL, with different components responsible for different types of domains.

### Architecture Overview

All incoming traffic flows through HAProxy, which acts as the entry point for your Octeth installation. SSL is handled differently depending on the type of domain:

| Domain Type | SSL Handler | Certificate Management |
|-------------|-------------|----------------------|
| **App domain** (your main Octeth URL) | HAProxy | Manual via certbot |
| **Tracking domains** (link tracking, open tracking) | Caddy Link Proxy | Automatic via on-demand TLS |

- **App domain** is the URL where you and your users log in to Octeth (e.g., `console.example.com`). HAProxy terminates SSL for this domain and forwards decrypted traffic to the application backend.
- **Tracking domains** are the domains used in email links for click tracking, open tracking, and unsubscribe links (e.g., `track.example.com`, `links.yourbrand.com`). Caddy automatically provisions and renews SSL certificates for these domains using on-demand TLS.

::: info Tracking Domain SSL
If you use the Link Proxy add-on, tracking domain SSL certificates are managed automatically by Caddy. You do not need to manually configure certificates for tracking domains. See the [Link Proxy Installation and Configuration](./link-proxy-addon-setup) guide for details.
:::

### Traffic Flow

When a user visits your Octeth installation over HTTPS:

1. The browser connects to port 443 on your server
2. HAProxy inspects the SNI (Server Name Indication) header to determine which domain was requested
3. If the domain matches your app domain, HAProxy terminates SSL and forwards the request to the application backend
4. If the domain is any other domain (tracking domains), HAProxy passes the connection directly to Caddy, which handles SSL termination

## Prerequisites

Before setting up SSL for your app domain, ensure the following:

- Octeth is installed and running (see [Octeth Installation](./octeth-installation))
- Your app domain's DNS A record points to your Octeth server's public IP address
- Port 80 and port 443 are open on your server's firewall
- You have SSH access to your Octeth server

::: warning DNS Must Be Configured First
SSL certificate issuance requires Let's Encrypt to verify domain ownership via HTTP. Your domain must resolve to your server's IP address before you can obtain a certificate. DNS propagation can take up to 48 hours.
:::

## Obtain an SSL Certificate

Octeth includes certbot inside the HAProxy container for obtaining and renewing Let's Encrypt certificates.

### Step 1: Access the HAProxy Container

SSH into your Octeth server and open a shell inside the HAProxy container:

```bash
docker exec -it oempro_haproxy bash
```

### Step 2: Request a Certificate

Run certbot to obtain a certificate for your app domain. Replace `console.example.com` with your actual domain:

```bash
certbot certonly --preferred-challenges http --webroot -w /var/www/html -d console.example.com
```

Certbot will:

1. Place a challenge file in `/var/www/html/.well-known/acme-challenge/`
2. Ask Let's Encrypt to verify the file is accessible at `http://console.example.com/.well-known/acme-challenge/...`
3. Store the certificate files in `/etc/letsencrypt/live/console.example.com/`

::: tip Multiple Domains
You can include multiple domains in a single certificate by adding additional `-d` flags:
```bash
certbot certonly --preferred-challenges http --webroot -w /var/www/html -d console.example.com -d www.console.example.com
```
:::

### Step 3: Create a Combined PEM File

HAProxy requires the certificate and private key in a single PEM file. Combine them:

```bash
cat /etc/letsencrypt/live/console.example.com/fullchain.pem \
    /etc/letsencrypt/live/console.example.com/privkey.pem \
    > /etc/letsencrypt/live/console.example.com/console.example.com.pem
```

### Step 4: Exit the Container

```bash
exit
```

The certificate files are stored in `_dockerfiles/letsencrypt/` on the host (mapped to `/etc/letsencrypt/` inside the container), so they persist across container restarts.

## Configure HAProxy for SSL

With the certificate in place, you need to enable SSL termination in HAProxy's configuration.

### Step 1: Edit the HAProxy Configuration

Open the HAProxy configuration file on your Octeth server:

```bash
vi /opt/octeth/oempro/_dockerfiles/haproxy.cfg
```

### Step 2: Enable the App Domain SSL ACL

Find the `frontend frontend_https` section (near the top of the file). Locate these commented-out lines:

```
# acl is_app_domain req.ssl_sni -i mydomain.com
# use_backend backend_app_ssl if is_app_domain
```

Uncomment them and replace `mydomain.com` with your domain:

```
acl is_app_domain req.ssl_sni -i console.example.com
use_backend backend_app_ssl if is_app_domain
```

### Step 3: Enable the SSL Termination Frontend

Find the commented-out `frontend frontend_app_ssl` section. Uncomment it and update the certificate path:

```
frontend frontend_app_ssl
    bind 127.0.0.1:8443 ssl crt /etc/letsencrypt/live/console.example.com/console.example.com.pem
    mode http
    http-request set-header X-Forwarded-Proto https
    http-request set-header X-Caddy-Proxy "1"
    default_backend backend_app_loopback
```

### Step 4: Enable the SSL Backends

Find the commented-out backend sections near the bottom of the file. Uncomment both:

```
backend backend_app_ssl
    mode tcp
    server loopback 127.0.0.1:8443

backend backend_app_loopback
    mode http
    server loopback 127.0.0.1:80
```

### Step 5: Mount the Certificate in Docker Compose

Open `docker-compose.yml` and add a volume mount for your certificate under the `haproxy` service's `volumes` section:

```yaml
volumes:
  - ./data:/opt/oempro
  - ./_dockerfiles/letsencrypt:/etc/letsencrypt
  - ./_dockerfiles/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg
  - ./_dockerfiles/whitelisted_ips.haproxy:/etc/haproxy/whitelist.lst
  - .:/var/www/html/
```

::: info Volume Already Exists
The `_dockerfiles/letsencrypt:/etc/letsencrypt` volume is already included in the default `docker-compose.yml`. No changes are needed unless you moved your certificate files to a different location.
:::

### Step 6: Update APP_URL

Open `.oempro_env` and update `APP_URL` to use HTTPS:

```
APP_URL=https://console.example.com/
```

::: warning Always Include the Trailing Slash
The `APP_URL` value must end with a forward slash (`/`). For example: `https://console.example.com/`
:::

### Step 7: Validate and Restart

Verify the HAProxy configuration is valid and restart the containers:

```bash
# Validate configuration
docker exec oempro_haproxy haproxy -c -f /usr/local/etc/haproxy/haproxy.active.cfg

# Restart HAProxy to apply changes
docker compose restart haproxy
```

If validation reports errors, review the changes you made and correct any syntax issues before restarting.

## Verify SSL Is Working

After restarting, verify that SSL is properly configured.

### Browser Check

Visit `https://console.example.com` in your browser. You should see:

- A padlock icon in the address bar
- No certificate warnings
- The Octeth login page loads normally

### Command Line Check

Test the SSL connection from the command line:

```bash
curl -vI https://console.example.com 2>&1 | grep -E "subject:|expire|SSL connection"
```

You should see your domain name in the subject line and a valid expiration date.

### Certificate Details

View the full certificate details:

```bash
echo | openssl s_client -servername console.example.com -connect console.example.com:443 2>/dev/null | openssl x509 -noout -text | head -20
```

## Automatic Certificate Renewal

Octeth includes a built-in cron job inside the HAProxy container that automatically renews certificates before they expire.

### How It Works

A cron job runs on the 1st of every month at midnight:

```
0 0 1 * * /usr/local/bin/renew_certs.sh >> /var/log/renew_certs.log 2>&1
```

The renewal script performs three steps:

1. Runs `certbot renew` to renew any certificates nearing expiration (within 30 days)
2. Combines the renewed certificate and private key into a single PEM file for HAProxy
3. Gracefully reloads HAProxy to pick up the new certificate without downtime

::: tip No Action Required
Let's Encrypt certificates are valid for 90 days. The monthly cron job ensures certificates are renewed well before expiration. You do not need to manually renew certificates.
:::

### Verify Renewal Is Configured

Confirm the cron job is active inside the HAProxy container:

```bash
docker exec oempro_haproxy crontab -l
```

You should see the `renew_certs.sh` entry in the output.

### Check Renewal Logs

Review renewal logs to confirm renewals are completing successfully:

```bash
docker exec oempro_haproxy cat /var/log/renew_certs.log
```

::: warning Renewal Failures
If a certificate renewal fails, certbot will report the failure in the log. Common causes include:

- DNS no longer pointing to your server
- Port 80 blocked by a firewall
- The domain is no longer registered

Check the log file and resolve any issues promptly. If a certificate expires, your users will see SSL warnings in their browsers.
:::

### ACME Challenge Routing

When certbot renews a certificate, it uses the HTTP-01 challenge method. Let's Encrypt sends a request to `http://yourdomain.com/.well-known/acme-challenge/` to verify domain ownership.

Octeth's HAProxy automatically routes these ACME challenge requests to the correct backend:

- **App domain challenges** are routed to the application backend, which serves the challenge files from the shared webroot (`/var/www/html`)
- **Tracking domain challenges** are routed to Caddy, which handles its own certificate provisioning

This routing is configured automatically at container startup based on the `APP_URL` value in your `.oempro_env` file. No manual configuration is needed.

## HTTP to HTTPS Redirect

After enabling SSL, you may want to redirect all HTTP traffic to HTTPS. Octeth does not include an automatic HTTP-to-HTTPS redirect for the app domain by default, as some installations run behind additional reverse proxies or load balancers.

### Option 1: HAProxy Redirect

Add a redirect rule in the `frontend_app` section of `_dockerfiles/haproxy.cfg`. Place this line after the existing ACL definitions and before the `use_backend` rules:

```
http-request redirect scheme https code 301 if !letsencrypt-acl !{ ssl_fc }
```

This redirects all HTTP requests to HTTPS, except for Let's Encrypt ACME challenge requests (which must remain on HTTP for certificate validation).

::: danger Do Not Redirect ACME Challenges
Never redirect `/.well-known/acme-challenge/` requests to HTTPS. Certbot uses HTTP to complete domain validation. Redirecting these requests will break certificate renewal.
:::

### Option 2: External Load Balancer

If your Octeth server sits behind a cloud load balancer (e.g., AWS ALB, Cloudflare), configure the HTTP-to-HTTPS redirect at the load balancer level instead.

## Troubleshooting

### Certificate Not Trusted by Browsers

**Problem:** Browsers show a security warning when visiting your Octeth URL.

**Possible causes and solutions:**

1. **Self-signed certificate** -- Ensure you used `certbot` to obtain a certificate from Let's Encrypt, not a self-signed certificate.
2. **Incomplete certificate chain** -- Verify you used `fullchain.pem` (not `cert.pem`) when creating the combined PEM file. The fullchain file includes intermediate certificates.
3. **Wrong domain** -- The certificate must match the exact domain in the browser's address bar. A certificate for `example.com` does not cover `www.example.com` unless both were included.

### Certbot Fails to Obtain Certificate

**Problem:** `certbot certonly` returns an error during certificate issuance.

1. Verify DNS is pointing to your server:
   ```bash
   dig +short console.example.com
   ```
   The output should show your server's public IP address.

2. Verify port 80 is accessible from the internet:
   ```bash
   curl -I http://console.example.com/.well-known/acme-challenge/test
   ```
   You should receive an HTTP response (even if 404). If the connection times out, check your firewall rules.

3. Verify HAProxy is running:
   ```bash
   docker ps | grep oempro_haproxy
   ```

### HAProxy Fails to Start After Enabling SSL

**Problem:** HAProxy reports a configuration error and does not start.

1. Validate the configuration:
   ```bash
   docker exec oempro_haproxy haproxy -c -f /usr/local/etc/haproxy/haproxy.active.cfg
   ```

2. Common causes:
   - **PEM file not found** -- Verify the certificate path in `frontend_app_ssl` matches the actual file location
   - **Missing sections** -- Ensure you uncommented all three sections: the ACL in `frontend_https`, the `frontend_app_ssl` frontend, and both `backend_app_ssl` and `backend_app_loopback` backends
   - **Syntax error** -- Check for extra or missing whitespace, especially in the `bind` directive

3. If you need to revert, comment out the sections you uncommented and restart:
   ```bash
   docker compose restart haproxy
   ```

### Certificate Renewed But App Domain Dropped

**Problem:** After a renewal cycle, the app domain no longer has a valid certificate, but tracking domains work fine.

This happens when the ACME challenge for the app domain is routed to the wrong backend. Verify that your `APP_URL` in `.oempro_env` is set to your actual domain (not `localhost`) and restart the HAProxy container:

```bash
docker compose restart haproxy
```

The HAProxy entrypoint automatically configures ACME challenge routing for your app domain based on the `APP_URL` value.

### Mixed Content Warnings

**Problem:** The page loads over HTTPS but the browser shows mixed content warnings.

This typically happens when `APP_URL` in `.oempro_env` still uses `http://` instead of `https://`. Update it to use HTTPS:

```
APP_URL=https://console.example.com/
```

Then restart the application container:

```bash
docker compose restart oempro
```

## Best Practices

**Keep APP_URL Accurate**
Always ensure the `APP_URL` in `.oempro_env` matches your actual domain and protocol. This value is used for generating links, ACME challenge routing, and session security.

**Monitor Certificate Expiration**
Set a calendar reminder to check `/var/log/renew_certs.log` inside the HAProxy container at least once a quarter. While renewals are automatic, silent failures can lead to expired certificates.

**Use Separate Domains for App and Tracking**
Use a distinct domain for your Octeth admin interface (e.g., `console.example.com`) and separate domains for tracking links (e.g., `track.yourbrand.com`). This keeps your admin interface private and allows independent SSL management.

**Backup Your Certificates**
The `_dockerfiles/letsencrypt/` directory contains all your certificates and certbot configuration. Include this directory in your regular backup routine. See [Backup Add-On Setup](./backup-addon-setup) for automated backup options.

**Test After Every Change**
After modifying HAProxy configuration or renewing certificates, always validate the configuration and test HTTPS access before considering the change complete.

## Summary of Configuration Files

| File | Purpose |
|------|---------|
| `_dockerfiles/haproxy.cfg` | HAProxy routing rules and SSL termination configuration |
| `_dockerfiles/entrypoint_haproxy.sh` | Container startup script, configures ACME routing from `APP_URL` |
| `_dockerfiles/haproxy-renew_certs.sh` | Certificate renewal script, runs monthly via cron |
| `_dockerfiles/oempro-haproxy-crons.txt` | Cron schedule for automatic renewal |
| `_dockerfiles/letsencrypt/` | Certificate storage directory (persisted on host) |
| `.oempro_env` | Contains `APP_URL` used for ACME routing |
| `docker-compose.yml` | Volume mounts for certificates and configuration |

## Next Steps

Once SSL is configured for your app domain:

1. Verify all users can access the admin interface over HTTPS
2. Set up [Monitoring](./monitoring) to track certificate expiration
3. Configure tracking domain SSL via the [Link Proxy](./link-proxy-addon-setup) if you haven't already
4. Review [Sender Domain DNS Settings](./sender-domain-dns-settings) to ensure email authentication is properly configured
