# Configuration Reference

Every setting for the new user interface lives in `.oempro_env`, the same file you already
use for the rest of Octeth. This page lists all of them.

::: danger
Never edit `ui/.env` or any file inside the `ui/` folder. `ui/.env` is rewritten from
`.oempro_env` every time the container starts, so changes there are lost on the next restart.
The rest of the `ui/` folder is replaced when you upgrade Octeth, so changes there are lost at
upgrade time. Only `.oempro_env` survives both.
:::

## Applying a change

```bash
./cli/octeth.sh docker:up
```

::: warning
Use `docker:up`, not a plain restart, whenever you change `MCP_ENABLED` or
`MCP_DISCOVERY_ENABLED`. Those two settings are read by the reverse proxy as well as by the
interface, and a plain restart updates only one of them. For every other setting on this page,
restarting just the interface container is enough.
:::

## General

The interface is always on. From v6.0.2 there is no `UI_ENABLED` setting, and an upgrade deletes a leftover `UI_ENABLED` line from `.oempro_env`.

| Setting | Default | What it does |
|---|---|---|
| `UI_LOG_LEVEL` | `error` | How much the interface writes to its log. One of `debug`, `info`, `notice`, `warning`, `error`, `critical`, `alert`, `emergency`. |
| `UI_DEBUG_CONSOLE_ENABLED` | `false` | Lets staff open the API debug console on a production install. The console writes backend responses into the page, so turn it on only while investigating a problem, and turn it off afterwards. See the [configuration page](/v6.0.3/getting-started/octeth-configuration) for details. |

## Application key

| Setting | Default | What it does |
|---|---|---|
| `UI_APP_KEY` | Generated on first start | The encryption key for sessions and stored secrets. |

Leave this empty on a fresh install. The container generates one on its first boot and writes
it back into `.oempro_env` for you.

::: danger
Once it is set, do not change it. Changing it signs every user out, makes anything the
interface has encrypted unreadable, and moves some internal paths the reverse proxy relies
on. Include `.oempro_env` in your backups so the key is preserved.
:::

## Database

| Setting | Default | What it does |
|---|---|---|
| `UI_MYSQL_DATABASE` | `oempro_ui` | The name of the interface's own MySQL database, on Octeth's existing MySQL server. |

The interface uses the same MySQL host, username and password as Octeth, taken from
`MYSQL_HOST`, `MYSQL_USERNAME` and `MYSQL_PASSWORD`. Only the database name is separate.

Create the database with:

```bash
./cli/octeth.sh ui:db-setup
```

::: danger
This must never be the same as `MYSQL_DATABASE`. The container refuses to start if it is, and
that refusal is protecting you: the interface's automated tests rebuild whatever database
they are pointed at from scratch, so a shared database can be destroyed completely.
:::

::: info
The interface also uses Redis databases 2, 3 and 4 on Octeth's existing Redis server. Octeth
itself uses 0 and 1. There is nothing to configure here, but it is worth knowing before you
run a Redis command that clears a database.
:::

## Paths

| Setting | Default | What it does |
|---|---|---|
| `UI_CUSTOMER_PREFIX` | `user` | The path the customer area is served under. |
| `UI_STAFF_PREFIX` | `user` | The path the staff area is served under. |
| `UI_SHARED_PREFIX` | `ui` | The path images, stylesheets, the health check and payment webhooks are served under. |

The staff and customer prefixes are the same by default, on purpose. One sign-in form serves
both, so the staff screens sit at `/user/staff/...` and the whole interface is reachable
under one path. That leaves `/admin/` free to keep redirecting to the classic admin area,
which is still the more complete of the two.

::: danger
Changing any of these means changing a matching line in the reverse proxy configuration at
`_dockerfiles/haproxy.cfg`. Change one without the other and the interface becomes
unreachable, with a confusing "not found" page from the classic application rather than an
error that points at the cause. Leave these alone unless a path genuinely collides with
something else on your install.
:::

## Branding

Covered in full in [Branding the new user interface](./branding). The settings are:

| Setting | Default |
|---|---|
| `UI_BRAND_NAME` | `Octeth` |
| `UI_BRAND_LEGAL_NAME` | Empty, falls back to the brand name |
| `UI_BRAND_SUPPORT_EMAIL` | Empty |
| `UI_BRAND_SUPPORT_URL` | Empty |
| `UI_BRAND_TERMS_URL` | Empty |
| `UI_BRAND_PRIVACY_URL` | Empty |
| `UI_BRAND_AUP_URL` | Empty |
| `UI_BRAND_STATUS_URL` | Empty |
| `UI_BRAND_TAGLINE` | Empty, hidden |
| `UI_BRAND_TRUST_STATS` | Empty, hidden |
| `UI_BRAND_MAIL_FOOTER` | Empty |
| `UI_BRAND_LOGO_MARK` | `/ui/images/brand/brand-logo-mark-white.svg` |
| `UI_BRAND_LOGO_HORIZONTAL` | `/ui/images/brand/brand-logo-horizontal-black.svg` |
| `UI_BRAND_FAVICON` | `/ui/favicon.ico` |
| `UI_BRAND_PRIMARY` | `"#0A0A0A"` |
| `UI_BRAND_PRIMARY_900` | `"#000000"` |
| `UI_BRAND_PRIMARY_700` | `"#262626"` |
| `UI_BRAND_PRIMARY_ON` | `"#FFFFFF"` |
| `UI_BRAND_ACCENT` | `"#0A0A0A"` |
| `UI_BRAND_ACCENT_HOVER` | `"#262626"` |
| `UI_BRAND_ACCENT_LIGHT` | `"#F4F4F5"` |
| `UI_BRAND_ACCENT_600` | `"#000000"` |
| `UI_BRAND_ACCENT_700` | `"#000000"` |
| `UI_BRAND_ACCENT_100` | `"#E4E4E7"` |
| `UI_BRAND_ACCENT_050` | `"#FAFAFA"` |
| `UI_BRAND_ACCENT_ON` | `"#FFFFFF"` |

`UI_BRAND_TRUST_STATS` takes `value|label` pairs separated by semicolons, for example `UI_BRAND_TRUST_STATS="10M+|Emails sent per month;99.9%|Uptime"`. An entry missing its value or its label is skipped. Show only figures you can back.

::: danger
Always quote the colour values. An unquoted `#` is read as the start of a comment, which
leaves the colour empty on one side of the system and set on the other, with nothing on
screen to explain the result.
:::

## Product mode and sections

| Setting | Default | What it does |
|---|---|---|
| `UI_MODE` | `full` | `full` is the complete marketing product. `gateway` turns the interface into an email relay service: the marketing sections are hidden, the sidebar lists the transactional sections for a sending domain you pick, and users land on the transactional overview after signing in. Any other value is read as `full`. |

Each setting below shows or hides one section. Set it to `true` or `false`. Leave it out of `.oempro_env` to use the default for your mode. A hidden section disappears from the sidebar and its pages answer "not found".

| Setting | Section | Default in `full` | Default in `gateway` |
|---|---|---|---|
| `BRAND_FEATURE_DASHBOARD` | **Dashboard** | `true` | `false` |
| `BRAND_FEATURE_CAMPAIGNS` | **Campaigns** | `true` | `false` |
| `BRAND_FEATURE_JOURNEYS` | **Journeys** | `true` | `false` |
| `BRAND_FEATURE_SMS` | **SMS** (**Campaigns** and **Replies**) and **Suppressions** > **SMS** | `true` | `false` |
| `BRAND_FEATURE_LISTS` | **Lists** | `true` | `false` |
| `BRAND_FEATURE_TEMPLATES` | **Templates** | `true` | `false` |
| `BRAND_FEATURE_EMAIL_HEADER_FOOTER` | **Header & footer** | `true` | `false` |
| `BRAND_FEATURE_ANALYTICS` | **Analytics** | `true` | `false` |
| `BRAND_FEATURE_DELIVERABILITY` | **Deliverability** | `true` | `false` |
| `BRAND_FEATURE_USER_WEBHOOKS` | The **Webhooks** tab on the **API & webhooks** page | `true` | `false` |
| `BRAND_FEATURE_TRANSACTIONAL` | **Transactional** (overview, event log and the sections of each sending domain) | `true` | `true` |
| `BRAND_FEATURE_SUPPRESSIONS` | **Suppressions** > **Email** | `true` | `true` |
| `BRAND_FEATURE_SENDERS` | **Senders & domains** | `true` | `true` |
| `BRAND_FEATURE_API` | **API & webhooks** and the connected assistants (MCP) connector | `true` | `true` |

For example, to run in gateway mode but keep SMS:

```ini
UI_MODE=gateway
BRAND_FEATURE_SMS=true
```

::: warning
Campaigns and journeys need lists. If you turn on `BRAND_FEATURE_CAMPAIGNS` or `BRAND_FEATURE_JOURNEYS`, turn on `BRAND_FEATURE_LISTS` too. The interface checks this every time it starts and writes a warning to its container log when a section is on while one it needs is off.
:::

Restart the interface container after a change to `.oempro_env`. An administrator with full access can also switch each of these sections on or off from the staff area, under **Settings** > **Branding** > **Features**, with no restart. A switch saved there wins over `.oempro_env` until it is reset, see [Branding the New User Interface from the Staff Area](./staff-branding#features).

If you hide **Senders & domains**, customers can no longer set up their own sending domains, so set them up from the staff area instead. The `BRAND_FEATURE_*` settings for the four sections above were added in v6.0.2 (issue #3300). Before that, those sections were always shown.

## Billing

| Setting | Default | What it does |
|---|---|---|
| `BRAND_FEATURE_BILLING` | `false` | Turns the whole subscription billing system on or off. Set in `.oempro_env` only, because the interface reads it when the container starts. |

::: warning
Like the other `BRAND_FEATURE_*` settings, this one does not start with `UI_`. Writing
`UI_BRAND_FEATURE_BILLING` has no effect.
:::

Everything else about billing is configured inside the interface, under **Billing**, then
**Settings** in the staff sidebar. See [Setting up the billing system](./billing-setup).

The three Stripe settings below are a starting point only. Once you save Stripe credentials
on the **Payment gateways** screen, those saved values are used and these are ignored. Most
installs should leave them empty and use the screen.

| Setting | Default |
|---|---|
| `UI_STRIPE_SECRET_KEY` | Empty |
| `UI_STRIPE_PUBLISHABLE_KEY` | Empty |
| `UI_STRIPE_WEBHOOK_SECRET` | Empty |

::: info
There is no equivalent for accept.blue. Those credentials are entered on the **Payment
gateways** screen only.
:::

| Setting | Default | What it does |
|---|---|---|
| `UI_BILLING_TAX_CALCULATOR` | Empty | Leave empty. Every invoice is calculated with zero tax. This is an extension point for a developer, not a way to turn tax on. See the tax note in [Setting up the billing system](./billing-setup#tax). |

## Outbound email from the interface

These control the interface's own transactional messages, such as password resets and
billing notices. They have nothing to do with your customers' campaigns, which continue to go
through Octeth's sending engine.

| Setting | Default | What it does |
|---|---|---|
| `UI_MAIL_MAILER` | `log` | `log` writes messages to the interface's log instead of sending them. `smtp` sends them for real, and is the setting that lets customers sign up themselves. |
| `UI_MAIL_HOST` | Empty | The mail server to send through, when the mailer is `smtp`. |
| `UI_MAIL_PORT` | `587` | The port on that server. |
| `UI_MAIL_FROM_ADDRESS` | `no-reply@localhost` | The address these messages come from. |
| `UI_MAIL_USERNAME` | Empty | The username for signing in to the mail server. Empty means no sign-in is attempted. |
| `UI_MAIL_PASSWORD` | Empty | The password for that username. Put it in double quotes if it contains a space, a `#` or a quote. |
| `UI_MAIL_SCHEME` | Empty | Leave empty: port 465 then uses a direct encrypted connection and any other port a plain one upgraded to encryption. Set `smtps` only for a mail server that expects a direct encrypted connection on a port other than 465. |
| `UI_MAIL_AUTO_TLS` | `true` | Upgrades a plain connection to an encrypted one when the server offers it. Leave it on. |

::: warning
The default of `log` means no message is ever delivered. That is the safe default for an install with no mail server configured, but it means password resets do not arrive, and it switches self-signup off: the "Create an account" link is hidden and the signup page says signup is not available, because a new account could never receive the email that activates it. Set this to `smtp`, fill in the host, and for any hosted mail service (Amazon SES, Postmark, SendGrid, Mailgun, Microsoft 365, Gmail) the username and password, before you let real customers sign up or sign in.
:::

::: danger
Turn `UI_MAIL_AUTO_TLS` off only for a mail server whose encryption is broken, and only for as long as it takes to fix it. With it off, the password is sent unencrypted.
:::

If the mail server rejects a message, the interface logs the error. A customer signing up is told the verification email could not be sent and to contact support. A customer asking for a password reset sees the usual "sent" screen.

The sender name is your `UI_BRAND_NAME`, so there is no separate setting for it.

## Drag-and-drop email builder

The drag-and-drop builder has no setting of its own. It uses the Stripo Plugin ID and Secret
Key saved in the staff **Settings > Integrations** screen, the same credentials the legacy interface
uses. See [Stripo.email](/v6.0.3/getting-started/octeth-configuration#stripo-email). A change to
those settings reaches the interface within a minute, with no restart. The Secret Key never
leaves Octeth: the interface asks Octeth for an editor token instead.

With those settings empty, the drag-and-drop option is not offered and customers design emails
with custom HTML or plain text. That is the correct setting for an install with no outbound
internet access, because the builder loads its code and stores its images on Stripo's
servers.

Changed in v6.0.1: `UI_STRIPO_PLUGIN_ID` and `UI_STRIPO_SECRET_KEY` were removed. An upgraded
`.oempro_env` that still carries them is ignored. If you set them in v6.0.0, enter the same
values in the staff **Settings > Integrations** screen.

[[SCREENSHOT: The campaign content screen showing the design options, with the drag-and-drop option greyed out because Stripo is not connected in Settings > Integrations]]

## Demonstration mode

| Setting | Default | What it does |
|---|---|---|
| `UI_DEMO_MODE` | `false` | Replaces the live Octeth connection with a fictional dataset. |
| `UI_DEMO_EMAIL` | `demo@meridiancoffee.test` | The address to sign in with while demo mode is on. |
| `UI_DEMO_PASSWORD` | `demo` | The matching password. |

Demo mode exists so that screenshots and demonstrations can show realistic figures. A brand
new account has no delivery or engagement statistics, because those are written by the
sending pipeline, so every chart in a fresh install is empty.

Everything is read-only in demo mode: every screen renders, and nothing can be saved. The
fictional data uses reserved `.test` addresses, so no address or link in a screenshot can
resolve to anything real.

::: danger
Demo mode is ignored unless `APP_ENV` is `local` or `testing`, so it does nothing at all on a
production install. On a development install it does take effect, and then the interface
shows fictional numbers to whoever uses it next, with nothing on screen saying so. Turn it
off when you are done.
:::

## Visitor IP addresses

The interface records the visitor's IP address in its sign-in activity, in the staff audit log and when a contact unsubscribes. It finds that address with the same three settings Octeth uses, so set them once for both:

| Setting | Default | What it does |
|---|---|---|
| `INTERNAL_PROXY_NETWORKS` | `192.168.99.0/24` | The network of Octeth's own reverse proxy. Change it only if you changed the subnet in `docker-compose.yml`. |
| `TRUSTED_PROXIES` | Empty | A load balancer, reverse proxy or CDN that you put in front of Octeth, as comma-separated IPv4 addresses or ranges. Leave it empty on a standard install. |
| `TRUST_CLOUDFLARE_CONNECTING_IP` | `false` | Set `true` only when your domain is served through Cloudflare and your server accepts traffic from Cloudflare alone. |

The interface always trusts the server itself, then the networks in these two lists. The same list also decides whether the interface believes that the visitor connected over HTTPS.

::: danger
If you changed the compose subnet, set `INTERNAL_PROXY_NETWORKS` to match. Otherwise the interface stops trusting Octeth's own reverse proxy and can fall into a redirect loop.
:::

Restart the interface container after a change. For the full rules, including the Cloudflare setup, see **Trusted Proxies / Client IP Resolution** on the [configuration page](/v6.0.3/getting-started/octeth-configuration).

## AI assistant connector

The interface includes a connector that lets your customers connect Claude, ChatGPT and other AI assistants to their account, see [Connect Claude or ChatGPT](./ai-assistants). It works when:

- `MCP_ENABLED` is not `false`. It is `true` by default, and an absent setting means on.
- The app domain is reachable from the internet over `https://` with a valid certificate. Claude and ChatGPT connect from their own servers, so a domain that resolves only on a private network, or serves plain `http://`, fails with an error such as "Couldn't discover OAuth settings".
- The customer's plan includes API access, and `BRAND_FEATURE_API` is not set to `false`. The connector follows the same rules as the **API & webhooks** page.

The connector URL is `https://<app domain>/mcp`. Its paths sit at the root of the app domain, not under `/user/`, because assistants look for the sign-in details there. The bundled HAProxy sends these paths to the interface container:

| Path | What it serves |
|---|---|
| `/mcp` | The connector itself |
| `/oauth/` | Sign-in, consent, client registration and tokens |
| `/.well-known/oauth-protected-resource` | Discovery document read by the assistant |
| `/.well-known/oauth-authorization-server` | Discovery document read by the assistant |

::: warning
If you run your own reverse proxy, load balancer or CDN in front of Octeth with path-based rules, forward all four paths to Octeth unchanged. A proxy that drops or rewrites any of them breaks the connector. Path rules for `/.well-known/acme-challenge/` are unaffected.
:::

### Turning the connector off

| Setting | Default | What it does |
|---|---|---|
| `MCP_ENABLED` | `true` | The AI assistant connector. Set to `false` (or `0`, `no`, `off`, in any case) to turn it off: HAProxy answers 404 for `/mcp`, `/oauth/` and `/.well-known/oauth-`, the interface answers 404 for the same routes, and `/llms.txt` leaves out its connector section. The rest of the interface keeps working, and agent keys keep working against the HTTP API. |

Recreate the containers after changing it, `./cli/octeth.sh docker:up`, because the reverse proxy reads it too. Connected assistants stop working while it is off and work again when it is turned back on, without connecting again.

### Signing keys

The connector signs its access tokens with a key pair stored at `ui/storage/oauth-private.key` and `ui/storage/oauth-public.key` in the Octeth directory. The interface container creates them the first time it starts and never replaces them while both files exist. Upgrades leave `ui/storage/` alone, so the keys survive an upgrade.

Include both files in your backups and keep them when you move Octeth to another server. If either file is missing, the container creates a new pair, every connected assistant stops working, and each customer has to connect their assistants again.

## Settings inherited from Octeth

The interface reads a few of Octeth's own settings rather than having its own copy:

| Setting | Effect on the interface |
|---|---|
| `APP_URL` | Its public address, and the base for the payment webhook addresses. |
| `APP_ENV` | Whether demo mode is permitted at all. |
| `OEMPRO_DEBUG` | Whether it shows detailed error pages. Leave this off in production. |
| `SESSION_LIFETIME_DAYS` | How long a sign-in lasts. |
| `MYSQL_HOST`, `MYSQL_USERNAME`, `MYSQL_PASSWORD` | The MySQL server it connects to. |
| `ADMIN_API_KEY` | How it authenticates to Octeth for sign-up, password reset and profile changes. |
| `OEMPRO_UI_CPU_LIMIT`, `OEMPRO_UI_MEM_LIMIT`, `OEMPRO_UI_MEM_RESERVATION` | Its container resource caps. `0` means unlimited. |

## Command line tools

| Command | What it does |
|---|---|
| `./cli/octeth.sh ui:db-setup` | Creates the interface's database and grants access. |
| `./cli/octeth.sh ui:build` | Builds its stylesheets and scripts. |
| `./cli/octeth.sh ui:dev` | Runs the development asset server. For development only. |
| `./cli/octeth.sh ui:test` | Runs its test suite. For development only. |

## Renaming URL segments

| Setting | Default path segment |
|---|---|
| `UI_BRAND_SLUG_DASHBOARD` | `dashboard` |
| `UI_BRAND_SLUG_CAMPAIGNS` | `campaigns` |
| `UI_BRAND_SLUG_JOURNEYS` | `journeys` |
| `UI_BRAND_SLUG_TRANSACTIONAL` | `transactional` |
| `UI_BRAND_SLUG_LISTS` | `lists` |
| `UI_BRAND_SLUG_TEMPLATES` | `templates` |
| `UI_BRAND_SLUG_SENDERS` | `senders` |
| `UI_BRAND_SLUG_API` | `api` |

Set one to change the visible path of that section. `UI_BRAND_SLUG_CAMPAIGNS=broadcasts` serves the campaigns pages at `/user/broadcasts`. The section's name on screen does not change. Leave it empty to keep the default.

Use lowercase letters, digits and hyphens only, one word with no slashes. A value that breaks this rule is ignored and the default stays, and so is a slug that another page already uses, such as `account`, `billing`, `login` or `staff`. Do not reuse a slug for two sections. The interface checks for duplicates every time it starts and writes a warning to its container log. Restart the interface after a change, and update any bookmark or link that used the old path.

## What is not configurable

Some settings exist inside the interface's own files but are not exposed in `.oempro_env`, so
they cannot be changed on an Octeth install. Knowing which is which saves an afternoon.

- **The sign-in page testimonial quotes.** These are empty and the block is hidden. The tagline and the trust figures can be set with `UI_BRAND_TAGLINE` and `UI_BRAND_TRUST_STATS`, see [Branding](#branding).
- **Hiding transactional email, suppressions, senders or the API page.** Only the sections in [Product mode and sections](#product-mode-and-sections) can be hidden.
- **Renaming things in the interface**, for example calling campaigns "broadcasts".
- **Tax calculation.** Every invoice is calculated with zero tax, and no tax calculation ships with Octeth. `UI_BILLING_TAX_CALCULATOR` exists only as an extension point for a developer. See the tax note in [Setting up the billing system](./billing-setup#tax).
- **Extra payment gateway addresses.** Only the card processors' own published addresses are
  accepted.

::: warning
The interface's own configuration files do contain settings for several of the items above.
Editing them appears to work and then stops working at your next Octeth upgrade, because the
whole folder is replaced. If you need one of these, ask for it rather than editing a file
that will be overwritten.
:::
