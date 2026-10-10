---
layout: doc
---

# SSL Certificates

SSL certificates encrypt the connection between your users' browsers and your Octeth server, protecting login credentials, API keys, and subscriber data in transit. This guide explains how SSL works in Octeth's current architecture and walks you through configuring certificates for your installation.

::: tip Good news: most installations need almost no configuration
Octeth provisions and renews SSL certificates **automatically** for both your app domain and your tracking domains, as long as those domains resolve **directly** to your Octeth server. You only need the manual steps in this guide if your app domain sits **behind Cloudflare, a CDN, or another reverse proxy**. Jump to [Choosing your app-domain TLS strategy](#choosing-your-app-domain-tls-strategy).
:::

## How SSL Works in Octeth

All inbound traffic enters through **HAProxy** on port 443. HAProxy inspects the TLS SNI (Server Name Indication) and decides where the connection is terminated. By default, TLS for **every** domain — your app domain and your tracking domains — is terminated by the **Caddy Link Proxy** using **on-demand TLS**, which issues and renews certificates automatically via ACME (Let's Encrypt / ZeroSSL).

| Domain Type | Default SSL Handler | Certificate Management |
|-------------|--------------------|------------------------|
| **App domain** (your main Octeth URL) | Caddy on-demand TLS | Automatic — issued & renewed on demand |
| **App domain behind a CDN** (Cloudflare, etc.) | HAProxy, with an operator-supplied static cert | Manual cert (e.g. Cloudflare Origin CA, 15-year) |
| **Tracking domains** (link/open tracking) | Caddy on-demand TLS | Automatic — issued & renewed on demand |

- **App domain** is the URL where you and your users log in to Octeth (e.g., `console.example.com`), set in `APP_URL`.
- **Tracking domains** are the domains used in email links for click tracking, open tracking, and unsubscribe links (e.g., `track.example.com`). These are always managed automatically by Caddy. See the [Link Proxy Installation and Configuration](./link-proxy-addon-setup) guide.

::: info No more certbot
Earlier Octeth versions used `certbot` inside the HAProxy container to manually obtain and renew the app domain's certificate. That workflow has been **retired** — Caddy on-demand TLS now handles issuance and renewal automatically, and the monthly certbot renewal cron is disabled. If you are upgrading from an older release, see [Migrating from the old certbot setup](#migrating-from-the-old-certbot-setup).
:::

### Traffic Flow

When a user visits your Octeth installation over HTTPS:

1. The browser connects to port 443 on your server.
2. HAProxy inspects the TLS SNI to determine which domain was requested.
3. **If a static app-domain certificate is configured** (see [Scenario B](#scenario-b-app-domain-behind-cloudflare-cdn)), HAProxy terminates SSL for the app domain itself using that certificate and forwards the request to the application.
4. **Otherwise**, HAProxy passes the connection to Caddy, which terminates SSL using an on-demand certificate (issuing one automatically the first time the domain is seen) and forwards the decrypted request back through HAProxy to the application.

```
Internet ──▶ HAProxy :443 (TCP, SNI inspect)
              │
              ├─[static app cert set]─▶ HAProxy terminates TLS ──▶ app
              │
              └─[default]────────────▶ Caddy :443 (on-demand TLS) ──▶ HAProxy :80 ──▶ app
```

## Choosing your app-domain TLS strategy

How you configure the app domain depends entirely on **how its DNS resolves**:

| Your situation | What to do | Section |
|----------------|-----------|---------|
| App domain's DNS **A/AAAA record points directly at your Octeth server's public IP** | Nothing — Caddy on-demand TLS issues and renews the certificate automatically | [Scenario A](#scenario-a-app-domain-directly-reachable-default) |
| App domain is **proxied through Cloudflare (orange cloud), a CDN, or another reverse proxy** | Provide a static certificate and let HAProxy terminate TLS | [Scenario B](#scenario-b-app-domain-behind-cloudflare-cdn) |

::: warning Why this matters
On-demand TLS works by answering an ACME challenge that the certificate authority sends **to your origin server** over ports 80/443. When your app domain is proxied through Cloudflare or a CDN, that challenge terminates at the edge and never reaches your origin, so a certificate can **never** be issued. The origin then presents nothing on port 443 and the edge returns an **SSL handshake error (Cloudflare HTTP 525)** for the entire app. In that topology you must supply a static certificate (Scenario B).
:::

## Prerequisites

Before configuring SSL for your app domain, ensure:

- Octeth is installed and running (see [Octeth Installation](./octeth-installation)).
- Your app domain's DNS record is in place (pointing either at your server, or at your CDN).
- Ports **80 and 443** are open on your server's firewall.
- `APP_URL` in `.oempro_env` is set to your HTTPS app URL **with a trailing slash**, e.g. `https://console.example.com/`.
- You have SSH access to your Octeth server.

::: warning DNS first (Scenario A)
For automatic issuance, the certificate authority must reach your origin to verify domain ownership. Your app domain must resolve to your server's IP before a certificate can be issued. DNS propagation can take up to 48 hours.
:::

## Scenario A: App domain directly reachable (default)

If your app domain's DNS points straight at your Octeth server, **there is nothing to install** — Caddy issues the certificate automatically the first time the domain is requested over HTTPS, and renews it before expiry.

### Step 1: Set APP_URL

In `.oempro_env`, make sure `APP_URL` uses HTTPS and ends with a slash:

```
APP_URL=https://console.example.com/
```

### Step 2: Set the ACME contact email (recommended)

In `.oempro_env`, set the email Caddy registers with the certificate authority:

```
CADDY_ACME_EMAIL=admin@example.com
```

### Step 3: Confirm DNS and firewall

```bash
# Should print your Octeth server's public IP
dig +short console.example.com

# Should return an HTTP response (any status) from the internet
curl -I http://console.example.com/
```

Ports 80 and 443 must be reachable from the public internet so the ACME challenge can complete.

### Step 4: Apply and visit

Restart the proxies so any `APP_URL` change takes effect, then load your app over HTTPS:

```bash
docker compose restart haproxy link_proxy
```

The first HTTPS request for your app domain triggers automatic certificate issuance (this can take a few seconds). After that the page loads with a valid certificate. Proceed to [Verify SSL Is Working](#verify-ssl-is-working).

::: info How the app domain is trusted for issuance
Caddy only issues on-demand certificates for domains Octeth recognizes. Your app domain (the host in `APP_URL`) is trusted automatically, so no per-domain allow-listing is required.
:::

## Scenario B: App domain behind Cloudflare / CDN

When the app domain is proxied (Cloudflare orange-cloud, a CDN, or another reverse proxy), origin ACME is impossible, so you provide a **static certificate** and HAProxy terminates the app domain's TLS directly. Caddy on-demand is bypassed for the app domain; tracking domains continue to use Caddy automatically.

A **[Cloudflare Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)** certificate is the recommended choice — it is valid for up to **15 years** (no renewal) and is trusted by Cloudflare's edge. Any certificate/key pair your CDN trusts will work.

### Step 1: Obtain a certificate and private key

Create an Origin CA certificate in the Cloudflare dashboard (**SSL/TLS → Origin Server → Create Certificate**) for your app domain, or use any certificate/key your CDN trusts. You will have two pieces: the **certificate (chain)** and the **private key**.

### Step 2: Build a combined PEM

HAProxy expects a single PEM file containing the **full certificate chain followed by the unencrypted private key**:

```bash
cat app.crt app.key > app.pem
```

### Step 3: Place the PEM in the certs directory

Copy the combined PEM into `_dockerfiles/certs/` on your Octeth server. This directory is bind-mounted read-only into the HAProxy container at `/etc/ssl/app`, so `app.pem` becomes `/etc/ssl/app/app.pem` inside the container.

```bash
cp app.pem /opt/octeth/oempro/_dockerfiles/certs/app.pem
```

::: danger Never commit real certificates
`_dockerfiles/certs/.gitignore` is configured to ignore everything except its README, so a real certificate or key can never be committed to the repository. Keep your private key secret and back it up safely.
:::

### Step 4: Point APP_DOMAIN_TLS_CERT at the PEM

In `.oempro_env`, set the path **inside the HAProxy container**:

```
APP_DOMAIN_TLS_CERT=/etc/ssl/app/app.pem
```

Leave this empty to use Caddy on-demand TLS (Scenario A). See also the `APP_DOMAIN_TLS_CERT` entry in [Octeth Configuration](./octeth-configuration).

### Step 5: Configure your CDN

For Cloudflare:

- Set the app domain's record to **Proxied** (orange cloud).
- Set **SSL/TLS → Overview → encryption mode** to **Full (strict)** so the edge connects to your origin over HTTPS and validates the Origin CA certificate.

::: danger Do not use Cloudflare "Flexible"
"Flexible" mode makes Cloudflare talk to your origin over plain **HTTP**, leaving edge-to-origin traffic unencrypted zone-wide. Never use it as a workaround. Use **Full (strict)** with a static origin certificate.
:::

### Step 6: Restart and confirm

```bash
docker compose restart haproxy
```

On startup HAProxy logs which strategy is active. Confirm the static-cert path is in effect:

```bash
docker logs oempro_haproxy 2>&1 | grep -i "app domain"
# Expected:
# HAProxy: app domain 'console.example.com' TLS terminated with static cert '/etc/ssl/app/app.pem' (Caddy on-demand bypassed)
```

If instead you see a warning that the file was not found, re-check the path and that the PEM exists in `_dockerfiles/certs/`. Then proceed to [Verify SSL Is Working](#verify-ssl-is-working).

## Tracking Domains

Tracking domains are **always** handled automatically by Caddy on-demand TLS — no manual certificate steps are ever required for them. Customers point their tracking domains directly at your link-proxy origin, the ACME challenge reaches Caddy, and a certificate is issued and renewed automatically. See [Link Proxy Installation and Configuration](./link-proxy-addon-setup).

## HTTP to HTTPS Redirect

Octeth redirects HTTP to HTTPS **automatically**. Caddy's port-80 listener upgrades plain-HTTP requests to HTTPS for every environment except local development (`APP_ENV=local`), where tracking links intentionally stay on HTTP. You do not need to add a redirect rule yourself.

::: info Behind a CDN
When the app domain is behind Cloudflare/a CDN, configure the HTTP→HTTPS behavior at the edge as well (for Cloudflare, enable **Always Use HTTPS**). The edge handles the public redirect; the origin still upgrades any direct HTTP it receives.
:::

## Certificate Renewal

Renewal is automatic in every supported configuration:

- **Caddy on-demand (Scenarios A and tracking domains):** Caddy renews certificates well before expiry with no action required. Let's Encrypt certificates are valid for 90 days; Caddy renews them automatically.
- **Static app-domain certificate (Scenario B):** a Cloudflare Origin CA certificate is valid for up to 15 years, so renewal is effectively a non-issue. If you use a shorter-lived static certificate, replace `_dockerfiles/certs/app.pem` before it expires and run `docker compose restart haproxy`.

::: tip No certbot, no monthly cron
There is no longer a certbot renewal cron job to monitor. The old `renew_certs.sh` cron is disabled in `_dockerfiles/oempro-haproxy-crons.txt`.
:::

## Verify SSL Is Working

### Browser check

Visit `https://console.example.com` in your browser. You should see a padlock icon, no certificate warnings, and the Octeth login page.

### Command-line check

```bash
curl -vI https://console.example.com 2>&1 | grep -E "subject:|expire|SSL connection|HTTP/"
```

### Certificate details

```bash
echo | openssl s_client -servername console.example.com -connect console.example.com:443 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

- **Scenario A:** the issuer is a public CA (e.g., Let's Encrypt / ZeroSSL).
- **Scenario B behind Cloudflare:** the certificate you see from the public internet is Cloudflare's edge certificate; the **origin** certificate is your Origin CA cert. To inspect the origin directly, run the `openssl` command against the server's real IP from a host that bypasses the CDN.

## Troubleshooting

### Cloudflare HTTP 525 (SSL handshake failed)

**Problem:** The app domain is behind Cloudflare and every page returns **525**.

**Cause:** The origin has no certificate for the app domain because on-demand ACME cannot complete behind the proxy.

**Fix:** Configure a static certificate — follow [Scenario B](#scenario-b-app-domain-behind-cloudflare-cdn). Confirm `APP_DOMAIN_TLS_CERT` is set, the PEM exists in `_dockerfiles/certs/`, Cloudflare is on **Full (strict)**, and the HAProxy startup log shows `... TLS terminated with static cert ... (Caddy on-demand bypassed)`.

### On-demand certificate is never issued (direct DNS)

**Problem:** The app domain points straight at the server but HTTPS fails or shows an invalid certificate.

1. Verify DNS resolves to your server: `dig +short console.example.com`.
2. Verify ports 80 **and** 443 are reachable from the public internet (both are needed for the HTTP-01 / TLS-ALPN-01 challenges).
3. Confirm `APP_URL` in `.oempro_env` is your real domain (not `localhost`) and uses `https://` with a trailing slash.
4. Check the link-proxy logs for issuance activity or errors:
   ```bash
   docker logs oempro_link_proxy 2>&1 | tail -50
   ```

::: warning Let's Encrypt rate limits
Repeated failed issuance attempts (for example, retrying against a proxied domain) can trip Let's Encrypt's "too many failed authorizations" rate limit. Fix the underlying reachability problem (or switch to Scenario B) before retrying, then wait for the limit window to clear.
:::

### HAProxy fails to start after setting a static certificate

**Problem:** HAProxy reports a configuration error and does not start.

1. Validate the active configuration:
   ```bash
   docker exec oempro_haproxy haproxy -c -f /usr/local/etc/haproxy/haproxy.active.cfg
   ```
2. Common causes:
   - **PEM not found** — `APP_DOMAIN_TLS_CERT` must point to a file that exists inside the container (default mount: `/etc/ssl/app/<file>.pem`).
   - **Bad PEM contents** — the file must contain the full certificate chain **and** the unencrypted private key.
   - **Path with spaces** — keep the certificate path space-free (e.g., `/etc/ssl/app/app.pem`).
3. To fall back to on-demand TLS, clear `APP_DOMAIN_TLS_CERT` and restart: `docker compose restart haproxy`.

### Mixed-content warnings

**Problem:** The page loads over HTTPS but the browser reports mixed content.

This usually means `APP_URL` still uses `http://`. Update it to `https://console.example.com/` and restart:

```bash
docker compose restart oempro haproxy
```

### Tracking domains work but the app domain doesn't (or vice-versa)

This almost always comes down to reachability: tracking domains point directly at the origin (on-demand works), while the app domain is proxied (needs Scenario B). Confirm how each domain resolves with `dig +short <domain>` and apply the matching strategy.

## Migrating from the old certbot setup

If you are upgrading from a release that used manual certbot + HAProxy SSL termination:

- You no longer need to run `certbot certonly`, build PEMs under `/etc/letsencrypt/...`, or uncomment SSL blocks in `_dockerfiles/haproxy.cfg`. Those blocks are now injected automatically at container startup only when `APP_DOMAIN_TLS_CERT` is set.
- The monthly certbot renewal cron is disabled; do not re-enable it.
- **If your app domain resolves directly to the origin:** simply ensure `APP_URL` is `https://...` and let Caddy on-demand take over (Scenario A). Old Let's Encrypt files under `_dockerfiles/letsencrypt/` are harmless and can be left in place or removed.
- **If your app domain is behind a CDN:** move to a static certificate via `APP_DOMAIN_TLS_CERT` (Scenario B). You can reuse an existing PEM by copying it into `_dockerfiles/certs/`.

## Best Practices

**Keep APP_URL accurate** — it drives link generation, on-demand certificate trust, and session security. Always match your real domain and protocol, with a trailing slash.

**Behind a CDN, always encrypt the origin hop** — use **Full (strict)** with a static origin certificate; never "Flexible".

**Use separate domains for app and tracking** — a distinct admin domain (e.g., `console.example.com`) and separate tracking domains (e.g., `track.yourbrand.com`) keep concerns isolated.

**Back up your private key** — for Scenario B, store the certificate/key pair securely; the private key cannot be recovered from the server alone.

**Validate and test after every change** — run `haproxy -c` and load the app over HTTPS before considering a change complete.

## Summary of Configuration Files

| File / Setting | Purpose |
|----------------|---------|
| `.oempro_env` → `APP_URL` | Your HTTPS app URL; drives on-demand trust, link generation, session security |
| `.oempro_env` → `APP_DOMAIN_TLS_CERT` | Empty = Caddy on-demand TLS (default); set = static-cert termination at HAProxy (CDN case) |
| `.oempro_env` → `CADDY_ACME_EMAIL` | Contact email used for ACME registration |
| `_dockerfiles/certs/` | Where you drop the app domain's static PEM (mounted read-only at `/etc/ssl/app`) |
| `_dockerfiles/caddy/Caddyfile` | Caddy on-demand TLS configuration for app + tracking domains |
| `_dockerfiles/haproxy.cfg` | HAProxy routing; static-cert SNI route is injected here at startup when configured |
| `_dockerfiles/entrypoint_haproxy.sh` | Injects the app-domain static-cert termination when `APP_DOMAIN_TLS_CERT` is set |
| `docker-compose.yml` | Volume mounts (including `_dockerfiles/certs` → `/etc/ssl/app`) |

## Next Steps

Once SSL is configured for your app domain:

1. Verify all users can access the admin interface over HTTPS.
2. Configure tracking domain SSL via the [Link Proxy](./link-proxy-addon-setup) if you haven't already.
3. Set up [Monitoring](./monitoring) to keep an eye on your installation.
4. Review [Sender Domain DNS Settings](./sender-domain-dns-settings) to ensure email authentication is properly configured.
