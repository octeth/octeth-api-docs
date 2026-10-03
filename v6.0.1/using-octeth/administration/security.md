---
layout: doc
---

# Security Settings

The **Settings > Security** page in the admin area controls who may use the admin and user areas, and which browsers can sign an administrator in without a password. This article covers the Authorized IP Addresses list, the option that applies it to the user area, and the list of remembered browsers.

## Authorized IP Addresses

### What it does

Authorized IP Addresses restricts who may use the admin area. Leave it empty and there is no restriction. Fill it in and only the addresses listed may sign in to the admin area or use it.

One entry per line. Each entry is either a single IPv4 address (`203.0.113.10`) or an IPv4 CIDR range (`203.0.113.0/24`). IPv6 addresses are matched exactly, and IPv6 ranges are not supported.

### When it is checked

On every authenticated admin request. That includes the login page, every admin screen, every plugin admin screen, and the "remember me" cookie.

Before v6.0.0 the list was consulted only while the admin login page rendered, so a session that was already open, or a "remember me" cookie, kept working from any address. An admin whose address is not on the list and who is currently signed in is signed out on their next request.

When a request is refused, the admin session is destroyed, not merely rejected, and the browser is sent to the admin login page, which explains that the address is not allowed. Removing the restriction afterwards does not revive the old session: the admin signs in again.

Refusals are written to the application log at ERROR level with the address that was refused, so a lockout can be diagnosed from `data/logs/`.

### Requests from the server itself are exempt

A request whose resolved client address is `127.0.0.1` or `::1` is always allowed through. These are the server talking to itself: the internal health check, the cron probes and similar. Without the exemption, turning the allow-list on would make `system.health.check` report a failure.

This is not a bypass for an outside visitor. Octeth resolves one trustworthy client address into `REMOTE_ADDR` at bootstrap, and a request that arrived over the network never resolves to loopback.

### Check TRUSTED_PROXIES first, or the list will match the wrong address

The address compared against this list is the one Octeth resolved for the visitor. If you have put your own load balancer, reverse proxy or CDN in front of Octeth at an address that is not loopback, and you have not listed it in `TRUSTED_PROXIES` in `.oempro_env`, then Octeth records **that proxy's** address for every visitor. The allow-list then compares the proxy, which either admits everybody or locks everybody out, and in both cases it is not doing what you asked.

Confirm the address Octeth sees before you enable the restriction. It is shown in the admin footer and in the login and audit logs. If it is the same for every visitor, set `TRUSTED_PROXIES` (and `TRUST_CLOUDFLARE_CONNECTING_IP=true` if you are behind Cloudflare), restart the app containers, and confirm the footer shows a real visitor address. Only then fill in Authorized IP Addresses. See [Octeth Configuration](/v6.0.1/getting-started/octeth-configuration).

### A proxy rule on the /app/admin/ path does not restrict the admin area

It is tempting to add an IP restriction at the reverse proxy on the `/app/admin/` path prefix instead. That does not work. Octeth's front controller takes the route from the path or from the query string, so the admin area answers at several URL shapes, all of which reach the same controllers:

- `/app/admin/`
- `/app/index.php?/admin/`
- `/app/index.php?/admin`
- `/app/index.php/admin/`
- `/app/?/admin/`
- `/app/index.php?//admin/`

A rule matching `/app/admin/` covers the first one only. Authorized IP Addresses is enforced in the authentication check, after the route has been resolved, so it covers every shape. Treat the in-app allow-list as the authoritative control and any proxy rule as an extra layer on top of it.

### If you lock yourself out

Any one of these gets you back in.

1. **Sign in from the server itself.** Loopback is exempt, so an admin session opened on the server (for example through an SSH tunnel to the app's own port) still works. Clear Authorized IP Addresses from **Settings > Security**.
2. **Clear the setting in the database.** The value lives in the `ADMIN_ALLOWED_IP` column of the single `oempro_config` row. An empty value means no restriction.

   ```sql
   UPDATE oempro_config SET ADMIN_ALLOWED_IP = '' WHERE ConfigID = 1;
   ```

   That row is cached, so drop the cache entry afterwards or the application keeps serving the old value:

   ```bash
   docker exec oempro_redis redis-cli DEL system_config_1
   ```

3. **Check the log first.** The refusal is logged with the address that was refused, which is often the whole answer: it shows you either the address to add, or that `TRUSTED_PROXIES` is the real problem.

### Related setting

`ADMIN_API_ENFORCE_ALLOWED_IP` in `.oempro_env` applies the same list to admin-authenticated API calls through `api.php`. It is a separate switch and it has **no loopback exemption**, so an integration that calls `api.php` with an admin credential from inside the Docker network needs its address added to the list. The admin-area enforcement described above is not behind a switch: it applies whenever the list is not empty.

## Prevent user login from IP addresses not in the list

### What it does

When this option is ticked, the Authorized IP Addresses list applies to the user area as well as the admin area. A user can sign in to the user area, and keep using it, only from an address on the list.

The option has no effect while Authorized IP Addresses is empty.

### When it is checked

On every user-area page, not only on the login page. Before v6.0.1 the list was checked only while the user login page loaded, so a user who was already signed in, or who had a "remember me" cookie, kept working from any address.

When a signed-in user opens a page from an address that is not on the list, Octeth signs them out of the user area (every account in the browser's account switcher) and the login page answers with a "not allowed to access the user area" refusal. Each refusal is written to the application log at ERROR level with the address, which is how to confirm why a user was signed out.

Requests from the server itself (`127.0.0.1` and `::1`) are always allowed, so health checks and scheduled tasks keep working.

### What it does not cover

The check applies to the user-area pages. API calls made with a session or an API key are not checked against this list.

### Before you enable it

Octeth compares the address it sees for the request. Behind a reverse proxy or load balancer, that is the proxy's address unless the proxy is listed in `TRUSTED_PROXIES` (see [Octeth Configuration](/v6.0.1/getting-started/octeth-configuration)). Check the address Octeth sees before you enable the option, or every user may be signed out.

## Remembered browsers

### What it shows

Each row is a browser where an administrator ticked **Remember me** at sign-in. The table shows the administrator, when the browser was first remembered, when it last signed in with the cookie, and when the cookie expires. Dates are UTC.

A remembered browser signs in without a password for up to 14 days from the moment it was first remembered. Using it does not extend that period.

### Revoking

- **Revoke** on a row signs that browser out of "remember me". The next time it opens the admin area it shows the login form.
- **Revoke all** does the same for every remembered browser of every administrator, including yours. Use it after a suspected compromise.

Revoking does not end a session that is already open in that browser. To end open sessions as well, change the administrator's password, which also revokes every remembered browser of that administrator.

### When a remembered browser stops working on its own

- After 14 days.
- When the administrator signs out.
- When the administrator's password changes.
- When the administrator enables two-factor authentication. The **Remember me** checkbox still appears on the login form, but after a two-factor sign-in no remembered browser is created, because the cookie would skip the second factor.
- When the administrator account is deleted.
- It does not sign in from an address outside Authorized IP Addresses (the row is kept).
