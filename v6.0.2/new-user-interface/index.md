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
| Classic admin **Users** section | `/app/admin/users/` | Forwards to the matching page under `/user/staff/customers` |

The classic areas stay fully usable, with one exception: the classic admin **Users** section
(`/app/admin/users/`) forwards to the staff Users screens of the new interface. The user list,
the create form, each user's page and its tabs open their new counterparts, and links to users
from other classic admin pages, plugins and Slack alerts point there too. A form posted to the
old section is refused and nothing is changed. The classic payment history tab and invoice
editor have no new counterpart and are not carried over. Your customers are not affected.

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

If you run `ui:db-setup` after setting `UI_ENABLED=true` while the interface's dependencies
are not installed yet (for example because it last started with the flag off), the command
restarts the interface's container first and waits for it to install them. It exits with an
error, and names the fix, whenever the interface's migrations did not run.

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

### Step 4: Recreate the containers

```bash
./cli/octeth.sh docker:up
```

`docker:up` recreates both containers that read `UI_ENABLED`: the reverse proxy, and the
interface itself, which decides when it starts whether to serve pages. You do not need to
restart anything by hand.

The first start with the interface on installs its dependencies, which takes a few
minutes. The `oempro_ui` container reports `healthy` once the interface is serving. If it
reports `unhealthy` instead, see
[The interface container is unhealthy](./troubleshooting#the-interface-container-is-unhealthy).

[[SCREENSHOT: A terminal showing ./cli/octeth.sh docker:up completing, with the oempro_ui container listed as healthy]]

### Step 5: Sign in

Open `https://your-octeth-domain/user/` in a browser. You should see the new sign-in page.

[[SCREENSHOT: The new interface sign-in page showing the logo, the email and password fields, and the Sign in button]]

One sign-in form serves everyone. Enter a customer's credentials and you land in the
customer area. Enter an Octeth administrator's credentials and you land in the staff area
as well.

The staff area follows the same administrator permissions as the classic admin area. A
sub-administrator sees only the users in the user groups their account may access, and
only the actions their permissions allow: for example, without the "User.Impersonate"
permission there is no "Switch user" button. A sub-administrator who may not browse users
lands on the AI assistants page instead of the user list. Changes to a sub-administrator's
permissions reach the staff area within about a minute, and switching to a user always
checks the current permissions. A switch to a user that is already running is not ended by
a permission change.

The staff billing screens and Webhooks follow the administrator permissions too:

| Staff screen | Permission it needs |
|---|---|
| Billing: Revenue, Worklists, Transactions | Reports |
| Billing: Discounts, Catalog, Health, Settings | Settings |
| Webhooks | Settings |
| AI assistants | None. The keys it creates carry the administrator's own permissions |

A screen the sub-administrator may not use is hidden from the menu and refuses a direct
link. On Worklists, Transactions and a discount's redemptions, a sub-administrator limited
to some user groups sees only the customers in those groups, and the counts and totals
cover only those customers. This needs the "User.Browse" permission, so a group-limited
sub-administrator without it sees no customer records on those screens. Revenue shows
install-wide figures and names no customer.

::: info
After upgrading to this version, everyone signed in to the staff area is signed out once
and signs in again. This loads their permissions into the new interface.
:::

## Where things live

| Path | What it serves |
|---|---|
| `/user/` | The whole interface: sign-in, sign-up, dashboard, campaigns, lists, journeys, billing |
| `/user/staff/customers` | The staff Users list, create and edit screens, visible to Octeth administrators only, see [Managing Users in the Staff Area](./staff-users) |
| `/user/staff/billing/...` | The staff billing screens, when billing is enabled |
| `/ui/` | Images, stylesheets, the health check, and inbound payment webhooks |
| `/mcp`, `/oauth/`, `/.well-known/oauth-...` | The built-in AI assistant connector and its sign-in, see [Connect Claude or ChatGPT](./ai-assistants) |
| `/app/user/`, `/app/admin/` | The classic interface, unchanged except the admin **Users** section, which forwards to `/user/staff/customers` while `UI_ENABLED=true` |

::: info
These path names are settings, not fixed values. See the
[Configuration reference](./configuration-reference) if you need to move them, and read the
warning there first: changing a path also means changing a matching line in the reverse
proxy configuration.
:::

## Managing one user from the staff area

In the staff sidebar, open **Users** and pick a user. The page shows who the user is and
lets you act on the account. The Users list, **Create user** and the **Edit** page are described
in [Managing Users in the Staff Area](./staff-users). The tabs and buttons follow the administrator permissions
described above, and the server checks the same permission again when you use one.

| Tab | What it shows | Permission |
|---|---|---|
| **Overview** | A chart of unsubscriptions, hard bounces, spam complaints or subscriptions over the last 1, 3 or 6 months, the ten newest campaigns with their unique open rate, and the user's lists with their active subscriber counts, 25 per page | User.Edit |
| **Limits** | How much of each user group limit the account has used, in four groups: send rate, assets, time-based and thresholds. A limit turns amber at 80% and red at 100% | User.Edit |
| **Sender domains & keys** | The user's sender domains and email gateway API keys, with the containment actions described in [Containing an account](#containing-an-account) | User.Edit |
| **Plugins** | What enabled plug-ins add for this user: read-only information (for example PhishGuard's detection counter), plug-in settings with a link to **Edit**, and plug-in actions (for example Peak Monitor's stats reset or SendLayer's suspend and activate), see [Plug-in information and actions](#plug-in-information-and-actions). Shown only when a plug-in offers a field or an action you may see | User.Edit |
| **Billing** | The subscription, invoices, payments and credits. Shown only when billing is enabled, see [Running billing day to day](./billing-operations#one-customer) | None |

The tab is part of the address (`?tab=limits`), so you can bookmark or share it.

[[SCREENSHOT: The staff user page showing the user's email in the header, the Send message, Switch to user, Switch with full permissions and Delete buttons, and the Overview tab with the activity chart]]

The buttons at the top of the page:

- **Send message** (User.Edit) emails the user a subject and message using the system
  notification template.
- **Switch to user** (User.Impersonate) opens the customer area as this user, with the
  permissions their account has.
- **Switch with full permissions** (User.Impersonate) does the same with every permission of
  the user's group, including the ones the account itself restricts. It asks you to confirm
  first, and the banner at the top of the page says "with full permissions" while it lasts.
- **Disable account** (User.Update) stops the account, see
  [Containing an account](#containing-an-account). On a disabled account the button reads
  **Enable account**.
- **Delete** (User.Delete) deletes the account with all of its lists, subscribers, campaigns
  and reports. Type the username to confirm. It cannot be undone.

If a section of the Overview cannot be loaded, it says so instead of showing a zero. Refresh
the page to try again. Every action is written to the staff audit log.

### Plug-in information and actions

The **Plugins** tab collects what enabled plug-ins add to a user's page. It appears only when at
least one plug-in offers a field or an action that your permissions let you see for this user.

**Plug-in information.** Read-only values, such as PhishGuard's detection counter and
history or the date Peak Monitor's stats were last reset. They cannot be changed here.

**Plug-in settings.** The plug-in options you can change for the user, shown with their current
value. Change them with **Edit**, see
[Managing Users in the Staff Area](./staff-users#plug-in-fields).

**Plug-in actions.** Each action is a button, for example Peak Monitor's stats reset or
SendLayer's **Suspend account** and **Activate account**. An action asks you to confirm first
when its plug-in supplies a confirmation text. An action that does not apply to the account
right now is greyed out with the reason. The plug-in's own message is shown when the action
finishes, including when it fails. Running an action needs User.Update, and every run is
written to the staff audit log. SendLayer's own impersonation link is not carried over: use
**Switch to user**.

Scripts use the same commands: `admin.user.pluginactions.get` and
`admin.user.pluginactions.run`, see the
[Users](../api-reference/users#get-a-user-s-plug-in-actions-admin) API reference.

### Containing an account

When an account is sending abuse, you can take it out of service from its staff page,
without SQL and without the legacy admin area. Every action asks you to confirm first and is
written to the staff audit log.

**Disable the account.** Use **Disable account** at the top of the page and type the
username to confirm. A disabled account cannot sign in or call the API, and the email
gateway refuses its mail, including gateway mail already queued. **Enable account** reverses
it. Needs User.Update.

**Suspend or block a sender domain.** The **Sender domains & keys** tab lists the account's
sending domains with **Suspend**, **Block** and **Enable**. The email gateway refuses mail
from a Suspended or Blocked domain, and gateway mail already queued from it fails. A domain
the user turned off themselves (Disabled) is shown but cannot be changed here. Needs
User.Edit.

**Disable an email gateway API key.** The same tab lists the account's gateway API keys by
their first eight characters. **Disable** makes the email gateway refuse the key from the
user's next send and fails mail already queued with it. **Enable** puts it back, unless
another key of the same domain is enabled. Disabling a second key of the same domain moves
the key disabled before it to Deleted, which cannot be enabled again. The user can still
create a new key, so disable the account or suspend the domain to stop sending altogether.
Needs User.Edit.

[[SCREENSHOT: The Sender domains & keys tab of the staff user page, with the Sender domains table showing Suspend and Block buttons and the email gateway API keys table showing key prefixes with Disable buttons]]

**Stopping a switch ends the user's session.** When you use **Stop impersonating** in the
banner, or sign out while acting as the user, the session that **Switch to user** or
**Switch with full permissions** opened for the user is ended at once and can no longer be
used. If it cannot be ended, the interface says so: on the staff page after you stop, or on
the sign-in page after you sign out. That session then stays valid
until it expires, so report it to an administrator.

The same API commands are available to scripts: `admin.user.emailgateway.apikeys.get`,
`admin.user.emailgateway.apikey.status.update` and `admin.user.session.end`, see the
[Email Gateway](../api-reference/emailgateway#list-a-user-s-email-gateway-api-keys-admin) and
[Admin](../api-reference/admin#end-a-user-session-admin) API reference.

### Coming from the classic Users section

With `UI_ENABLED=true`, every page of the classic admin **Users** section opens its counterpart
here: the list (with its group, status, reputation, category, online, sender domain and limit
filters carried over), **Create user**, a user's page, its **Edit** form, and its **Limits** and
**Sender domains & keys** tabs. Switching to a user, sending a message, and enabling, disabling
and deleting an account now happen on the user's page here.

The two interfaces have separate sign-ins, so the first time you follow one of these links you
may be asked to sign in to the new interface.

With `UI_ENABLED=false` the classic Users section works as before. It will be removed in a later
release, which will need the new interface turned on.

## What to do next

1. **[Branding](./branding)** puts your own name, logo, colours and legal links on the
   interface. Do this before you show it to a customer.
2. **[Setting up billing](./billing-setup)** turns on plans, subscriptions and invoicing.
   Skip this if you already bill your customers elsewhere.
3. **[Webhooks](./webhooks)** sends sign-ups and subscription changes to another system,
   such as an n8n workflow or your CRM.
4. **[Configuration reference](./configuration-reference)** lists every setting, including
   outbound email, the drag-and-drop email builder and the demonstration mode.
5. **[Troubleshooting](./troubleshooting)** covers the handful of problems that come up
   most often.

## Turning it off again

Set `UI_ENABLED=false` in `.oempro_env` and run `./cli/octeth.sh docker:up`. The `/user/`
and `/ui/` paths go back to the classic application, and nothing is lost. Your customers'
data was never stored in the new interface in the first place. The classic admin **Users**
section also stops forwarding and works as before.

::: tip
Turning the interface off does not delete its database. If you turn it back on later, any
billing configuration you set up is still there.
:::
