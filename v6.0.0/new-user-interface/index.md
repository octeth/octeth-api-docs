# The New User Interface

Octeth ships a second, modern user interface alongside the classic one. It gives your
customers a redesigned dashboard, campaign builder, list workspace, journey views and
transactional email screens, and it gives your team a staff area with customer search,
impersonation and an optional subscription billing system.

This section explains how to turn it on, how to brand it as your own, how to configure
the billing system, and where every setting lives.

::: info
The new interface is on for a fresh install, and an upgrade from a version older than v5.9.6
switches it on too, because the upgrade adds `UI_ENABLED=true` to `.oempro_env`. To keep it
off, add `UI_ENABLED=false` before upgrading, or set it afterwards and recreate the containers.
Turning it on changes nothing
about how your emails are sent, stored or tracked. It is a different way to look at the
same Octeth account.
:::

## What it is, in one paragraph

The new interface is a separate application that talks to Octeth through the same public
API your own integrations use. It stores no subscribers, no campaigns and no statistics of
its own. When someone opens a campaign report in the new interface, that report is fetched
from Octeth live. This is why it can run next to the classic interface without the two
disagreeing.

## What changes when you turn it on

| | Before | After |
|---|---|---|
| Customer area | `/app/user/` | `/user/` (classic still at `/app/user/`) |
| Staff area | `/app/admin/` | `/app/admin/`, plus new staff screens at `/user/staff/...` |
| Admin shortcut `/admin/` | Redirects to `/app/admin/` | Unchanged, still redirects to `/app/admin/` |

The classic areas are untouched and stay fully usable. Your customers can keep using them.

::: warning
There is no single sign-on between the two interfaces yet. Someone who wants to use both
signs in twice, once in each. This is a known gap, not a misconfiguration.
:::

## Prerequisites

- Octeth v5.9.6 or later, installed and running.
- Shell access to the server, so you can edit `.oempro_env` and run `./cli/octeth.sh`.
- A few minutes of downtime is not required. Turning the interface on does not restart the
  sending engine.

## Turning it on

### Step 1: Create its database

The new interface keeps its own MySQL database on the same server. Create it once:

```bash
./cli/octeth.sh ui:db-setup
```

::: danger
The interface must never share Octeth's own database. Its automated tests rebuild whatever
database they are pointed at from scratch, so a shared database can be wiped completely.
The container refuses to start if `UI_MYSQL_DATABASE` is set to the same value as
`MYSQL_DATABASE`, and you should leave that safeguard alone.
:::

### Step 2: Build its assets

The stylesheets and scripts are built at release time and shipped inside the release
package. If you installed from a source checkout instead, build them yourself:

```bash
./cli/octeth.sh ui:build
```

::: tip
If every page of the new interface returns a blank error page, this is almost always the
reason. Run the build command and reload.
:::

### Step 3: Switch it on

Open `.oempro_env` and set:

```ini
UI_ENABLED=true
```

### Step 4: Recreate the containers and restart the interface

```bash
./cli/octeth.sh docker:up
docker restart oempro_ui
```

::: warning
Run both commands. The `UI_ENABLED` flag is read by two different containers. The reverse
proxy picks up a change only when it is recreated, which `docker:up` does. The interface
decides once, when it starts, whether to serve pages, and in this version `docker:up` does
not recreate it, so it keeps answering "not found" for every page until it is restarted.

The first start with the interface on installs its dependencies, which takes a few
minutes. Wait for this line before signing in:

```bash
docker logs -f oempro_ui 2>&1 | grep -m1 "Running migrations"
```
:::

[[SCREENSHOT: A terminal showing ./cli/octeth.sh docker:up completing, with the oempro_ui container listed as healthy]]

### Step 5: Sign in

Open `https://your-octeth-domain/user/` in a browser. You should see the new sign-in page.

[[SCREENSHOT: The new interface sign-in page showing the logo, the email and password fields, and the Sign in button]]

One sign-in form serves everyone. Enter a customer's credentials and you land in the
customer area. Enter an Octeth administrator's credentials and you land in the staff area
as well.

## Where things live

| Path | What it serves |
|---|---|
| `/user/` | The whole interface: sign-in, sign-up, dashboard, campaigns, lists, journeys, billing |
| `/user/staff/customers` | The staff customer list, visible to Octeth administrators only |
| `/user/staff/billing/...` | The staff billing screens, when billing is enabled |
| `/ui/` | Images, stylesheets, the health check, and inbound payment webhooks |
| `/app/user/`, `/app/admin/` | The classic interface, unchanged |

::: info
These path names are settings, not fixed values. See the
[Configuration reference](./configuration-reference) if you need to move them, and read the
warning there first: changing a path also means changing a matching line in the reverse
proxy configuration.
:::

## What to do next

1. **[Branding](./branding)** puts your own name, logo, colours and legal links on the
   interface. Do this before you show it to a customer.
2. **[Setting up billing](./billing-setup)** turns on plans, subscriptions and invoicing.
   Skip this if you already bill your customers elsewhere.
3. **[Configuration reference](./configuration-reference)** lists every setting, including
   outbound email, the drag-and-drop email builder and the demonstration mode.
4. **[Troubleshooting](./troubleshooting)** covers the handful of problems that come up
   most often.

## Turning it off again

Set `UI_ENABLED=false` in `.oempro_env`, run `./cli/octeth.sh docker:up`, then run
`docker restart oempro_ui`. The `/user/`
and `/ui/` paths go back to the classic application, and nothing is lost. Your customers'
data was never stored in the new interface in the first place.

::: tip
Turning the interface off does not delete its database. If you turn it back on later, any
billing configuration you set up is still there.
:::
