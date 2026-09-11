# Troubleshooting the New User Interface

The problems below account for almost everything that goes wrong when setting the interface
up for the first time. Work through the checks in order, they are ordered by how often each
turns out to be the cause.

## The interface is not reachable at all

`/user/` shows the classic application's "not found" page, or the classic sign-in page.

1. **Check the setting is actually `true`.**

   ```bash
   grep '^UI_ENABLED' .oempro_env
   ```

2. **Recreate the containers, do not restart them.**

   ```bash
   ./cli/octeth.sh docker:up
   ```

   ::: warning
   This is the single most common cause. `UI_ENABLED` is read by two containers: the
   interface, which reads the file from disk on every start, and the reverse proxy, which
   reads it from its own environment and only picks up a change when it is recreated. A plain
   restart updates one and not the other, and the symptom is exactly this: the proxy sends
   people to a container that answers "not found" for every page.
   :::

3. **Check the container is running.**

   ```bash
   docker ps --filter name=oempro_ui
   ```

## Every page shows a server error

Usually a blank page or a plain "server error" message, on every page including sign-in.

**Build the assets.**

```bash
./cli/octeth.sh ui:build
```

The stylesheets and scripts are built at release time and shipped inside the release package.
An install made from a source checkout has none, and every page fails to render without them.

::: tip
If the build succeeds and pages still fail, check the container's log for the first error
rather than the last:

```bash
docker logs oempro_ui 2>&1 | head -50
```
:::

## The container starts but says the database is missing

The log shows a message naming the database and pointing at a command.

**Create it.**

```bash
./cli/octeth.sh ui:db-setup
```

The interface has its own database and no permission to create one, because it is
deliberately never given administrator credentials for MySQL. The installer and the upgrade
script normally create it for you, so seeing this means neither has run.

## The container refuses to start and names Octeth's database

The log says the interface's database is Octeth's own database and it is refusing to start.

**This is a safety measure doing its job.** Set `UI_MYSQL_DATABASE` in `.oempro_env` to a
separate name, `oempro_ui` by convention, then create it with `./cli/octeth.sh ui:db-setup`.

::: danger
Do not work around this by making the two match. The interface's test suite rebuilds whatever
database it is pointed at from scratch. Pointed at Octeth's own database, that destroys the
entire install.
:::

## The logo or the tab icon is broken

**Check the path starts with `/ui/`.**

```ini
UI_BRAND_LOGO_MARK=/ui/images/brand/acme-mark.svg
```

The reverse proxy only forwards a fixed set of paths to the interface, and `/ui/` is the one
carrying its files. An image at `/images/acme-mark.svg` is handed to the classic application
instead, which does not have it.

::: tip
Confirm by opening the image address directly in a browser. If it displays or downloads, the
path is right.
:::

The same applies to the tab icon. A file at `/favicon.ico` is answered by the classic
application, so the icon must also sit under `/ui/`.

## A colour change did nothing

1. **Check the value is quoted.**

   ```ini
   UI_BRAND_ACCENT="#2563EB"
   ```

   An unquoted `#` is read as the start of a comment. The result is a value that looks correct
   in the file and is empty when read.

2. **Check the value is a valid hex colour** of 3, 6 or 8 digits including the `#`. Anything
   else is ignored and the built-in colour is used, so a typo shows up as a colour that did
   not change rather than as an error.

3. **If the sidebar or the signed-out panel did not change**, that is expected. Those two have
   dark backgrounds and render their highlights in white regardless of your accent, because a
   dark accent would be invisible against them.

## Charts still use the old colours

Expected. Charts use several colours to tell one data series from another, so they keep their
own palette. Collapsing them to a single brand colour would make the series impossible to
tell apart. The same applies to the interface's own emails and the invoice PDF, which carry
fixed colours because email clients cannot read the mechanism that applies your palette to a
web page.

## The staff billing screens return "not found"

**Billing is turned off.** Set it on and recreate the containers:

```ini
BRAND_FEATURE_BILLING=true
```

::: warning
The setting does not start with `UI_`. `UI_BRAND_FEATURE_BILLING` has no effect.
:::

## A billing command runs and produces no output

Same cause. Every billing command deliberately does nothing when billing is off.

## A customer cannot be placed in a user group

The reconcile job reports an error for that account, or a plan change fails.

1. **Check the plan has a Default group link** on the **Catalog** screen. Every plan needs
   one.
2. **Check the account-wide groups** under **Staff**, **Billing settings**, **User groups**.
3. **Open the Billing health screen**, which lists exactly which links are missing.

## Nobody is ever suspended for not paying

The suspended user group is not set. Set it under **Staff**, **Billing settings**, **User
groups**, or give the plan its own suspended link on the **Catalog** screen. Payments keep
working without it, which is why this can go unnoticed for a long time.

## Payments succeed but Octeth does not update

The webhook is not arriving.

1. **Check the address in your processor's dashboard includes `/ui/`**, for example
   `https://your-domain/ui/webhooks/stripe`.
2. **Check the signing secret** saved on the **Payment gateways** screen matches the one your
   processor shows.
3. **Open the Billing health screen** and look at the webhook section for recent deliveries.

## Password reset emails never arrive

**The interface writes its emails to a log by default rather than sending them.** Set a real
mail server:

```ini
UI_MAIL_MAILER=smtp
UI_MAIL_HOST=smtp.example.com
UI_MAIL_PORT=587
UI_MAIL_FROM_ADDRESS=no-reply@acmemail.com
```

## The interface shows numbers that are clearly fictional

**Demo mode is on.** Set `UI_DEMO_MODE=false` in `.oempro_env` and restart the interface
container. Demo mode replaces the live connection with a fictional dataset for screenshots,
and it looks entirely normal while it is on.

::: info
Demo mode only takes effect when `APP_ENV` is `local` or `testing`, so this cannot happen on
a production install.
:::

## Everyone was signed out and nothing decrypts

**`UI_APP_KEY` changed.** If you still have the old value, put it back and restart. If it is
gone, everyone signs in again and any secrets the interface had encrypted, such as saved
payment gateway credentials, have to be entered again.

::: tip
Include `.oempro_env` in your backups. It holds this key.
:::

## Some numbers on a list screen look wrong

A small number of screens in the list area are not yet connected to live data and show
placeholder figures. If a figure looks implausible on a list screen and everything else on
the account is consistent, this is the likely explanation rather than a data problem. This is
known and is being worked on.

## Getting more detail

Turn the log level up temporarily:

```ini
UI_LOG_LEVEL=debug
```

Restart the interface container, reproduce the problem, then read the log:

```bash
docker logs oempro_ui 2>&1 | tail -100
```

::: warning
Set it back to `error` afterwards. Debug logging is verbose and can fill a disk on a busy
install.
:::
