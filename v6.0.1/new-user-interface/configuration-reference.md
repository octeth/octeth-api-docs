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
Use `docker:up`, not a plain restart, whenever you change `UI_ENABLED`. That one setting is
read by the reverse proxy as well as by the interface, and a plain restart updates only one
of them. For every other setting on this page, restarting just the interface container is
enough.
:::

## Turning it on

| Setting | Default | What it does |
|---|---|---|
| `UI_ENABLED` | `false` on upgrade, `true` on a fresh install | The master switch. When off, the container still runs and reports healthy but serves nothing, and `/user/` and `/ui/` fall through to the classic application. |
| `UI_LOG_LEVEL` | `error` | How much the interface writes to its log. One of `debug`, `info`, `notice`, `warning`, `error`, `critical`, `alert`, `emergency`. |

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
| `UI_BRAND_TERMS_URL` | Empty |
| `UI_BRAND_PRIVACY_URL` | Empty |
| `UI_BRAND_MAIL_FOOTER` | Empty |
| `UI_BRAND_LOGO_MARK` | `/ui/images/brand/brand-logo-mark-white.svg` |
| `UI_BRAND_LOGO_HORIZONTAL` | `/ui/images/brand/brand-logo-horizontal-black.svg` |
| `UI_BRAND_FAVICON` | `/ui/favicon.ico` |
| `UI_BRAND_PRIMARY` | `"#0A0A0A"` |
| `UI_BRAND_PRIMARY_900` | `"#000000"` |
| `UI_BRAND_PRIMARY_700` | `"#262626"` |
| `UI_BRAND_ACCENT` | `"#0A0A0A"` |
| `UI_BRAND_ACCENT_HOVER` | `"#262626"` |
| `UI_BRAND_ACCENT_LIGHT` | `"#F4F4F5"` |
| `UI_BRAND_ACCENT_600` | `"#000000"` |
| `UI_BRAND_ACCENT_700` | `"#000000"` |
| `UI_BRAND_ACCENT_100` | `"#E4E4E7"` |
| `UI_BRAND_ACCENT_050` | `"#FAFAFA"` |

::: danger
Always quote the colour values. An unquoted `#` is read as the start of a comment, which
leaves the colour empty on one side of the system and set on the other, with nothing on
screen to explain the result.
:::

## Billing

| Setting | Default | What it does |
|---|---|---|
| `BRAND_FEATURE_BILLING` | `false` | Turns the whole subscription billing system on or off. |

::: warning
This is the only setting for the interface that does not start with `UI_`. Writing
`UI_BRAND_FEATURE_BILLING` has no effect.
:::

Everything else about billing is configured inside the interface, under **Staff**, then
**Billing settings**. See [Setting up the billing system](./billing-setup).

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

## Outbound email from the interface

These control the interface's own transactional messages, such as password resets and
billing notices. They have nothing to do with your customers' campaigns, which continue to go
through Octeth's sending engine.

| Setting | Default | What it does |
|---|---|---|
| `UI_MAIL_MAILER` | `log` | `log` writes messages to the interface's log instead of sending them. `smtp` sends them for real. |
| `UI_MAIL_HOST` | Empty | The mail server to send through, when the mailer is `smtp`. |
| `UI_MAIL_PORT` | `587` | The port on that server. |
| `UI_MAIL_FROM_ADDRESS` | `no-reply@localhost` | The address these messages come from. |

::: warning
The default of `log` means no message is ever delivered. That is the safe default for an
install with no mail relay configured, but it also means password resets do not arrive. Set
this to `smtp` and fill in the host before you let real customers sign in.
:::

The sender name is your `UI_BRAND_NAME`, so there is no separate setting for it.

## Drag-and-drop email builder

| Setting | Default | What it does |
|---|---|---|
| `UI_STRIPO_PLUGIN_ID` | Empty | Your Stripo plugin identifier. Leave empty to disable the drag-and-drop builder. |
| `UI_STRIPO_SECRET_KEY` | Empty | The matching secret key. |

With these empty, the drag-and-drop option is not offered and customers design emails with
custom HTML or plain text. That is the correct setting for an install with no outbound
internet access, because the builder loads its code and stores its images on Stripo's
servers.

[[SCREENSHOT: The campaign content screen showing the design options, with the drag-and-drop option greyed out because no Stripo plugin id is configured]]

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

## What is not configurable

Some settings exist inside the interface's own files but are not exposed in `.oempro_env`, so
they cannot be changed on an Octeth install. Knowing which is which saves an afternoon.

- **Renaming URL segments.** Paths such as `/user/campaigns` cannot be changed to your own
  wording.
- **Hiding individual product areas.** You can turn billing on and off, but not journeys,
  transactional email, SMS or the other areas one by one. What a customer sees is decided by
  their Octeth user group.
- **The sign-in page tagline and testimonial quotes.** These are empty and the block is
  hidden.
- **Renaming things in the interface**, for example calling campaigns "broadcasts".
- **Tax calculation.** Every invoice is calculated with zero tax. See the tax note in
  [Setting up the billing system](./billing-setup#tax).
- **Extra payment gateway addresses.** Only the card processors' own published addresses are
  accepted.

::: warning
The interface's own configuration files do contain settings for several of the items above.
Editing them appears to work and then stops working at your next Octeth upgrade, because the
whole folder is replaced. If you need one of these, ask for it rather than editing a file
that will be overwritten.
:::
