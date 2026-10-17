# The Staff Dashboard

The **Dashboard** is the first page of the staff area. It holds the reports that used to be on the classic admin overview, which now shows only a link here, the setup checklist and the quick links. The cards cover the setup checklist, campaigns waiting for approval, sender domain health, scheduled and past sending, and the accounts that stand out.

| Screen | Path on a default install | Permission |
|---|---|---|
| Dashboard | `/user/staff/dashboard` | Dashboard |

Administrators with the "Dashboard" permission land on it after signing in and after they stop switching to a user. Administrators without it land where they did before: the Users list, or AI assistants when they may not browse users.

::: info
The dashboard acts as the administrator who is signed in. A sub-administrator limited to some user groups sees only the accounts and campaigns in those groups on every card, and can preview, approve or reject only those campaigns.
:::

## How the cards work

The page is a column of cards. Each card loads on its own after the page opens, so a slow card never holds up the others. Each card shows the time its figures were read ("Updated 14:03") and a refresh button that reads them again. Figures are kept for under a minute between reads, and nothing refreshes by itself.

When a card cannot be loaded it says so and shows no figures, rather than a zero that might be wrong. Use its refresh button to try again.

Each card needs its own permission. A card you may not use is not shown:

| Card | Permission |
|---|---|
| Setup checklist | Settings, and no user group limit |
| Pending approval (with Preview, Approve and Reject) | Reports |
| Sender domain health | User.Edit |
| Delivery | Dashboard |
| Users: Active, Top bounces, Top complaints | Dashboard |
| Users: Online | Dashboard and User.Browse |
| Quick links | Admin.Dashboard.Links |

## Setup checklist

The same readiness report as the classic admin overview: one row per check (license, delivery server, sending DNS, reverse DNS, workers, cron and the rest) with what was found and what to do next. A green mark is done, an amber mark needs attention, a grey mark is optional or unknown.

When every required check passes, the card shows a single **Ready to send** line. Click it to see the checks.

## Pending approval

The ten campaigns that have waited longest for approval. Each row shows the campaign, its subject and sender, its owner (click to open the account) and, when content screening held it, the reason.

- **Preview** (eye icon) opens the campaign's email in a side panel, with a Desktop, Mobile or Plain text view and, for an A/B campaign, one tab per version. The email is shown as stored: merge tags are not filled in and remote content is not fetched. Scripts in the email never run.
- **Approve** (check icon) asks for confirmation, then lets the campaign send as its owner scheduled it.
- **Reject** (cross icon) sends the campaign back to its owner's drafts. You can add a message, which is emailed to the owner. Writing a message needs the "User.Edit" permission.

You can also approve or reject from the preview panel.

::: tip
Approve and Reject act on the version you were shown. If the owner changed the campaign after you opened the page, nothing happens: a message says the campaign changed and its row is read again, so you can review it before you try again.
:::

Every approval and rejection is recorded in the staff audit log with the administrator, the time, the campaign and the outcome.

## Sender domain health

How many sender domains are healthy, failing, demoted by DNS drift, awaiting approval, never checked or in another state. Click a class to open the classic Sender Domain Health report filtered to it, in a new tab.

## Delivery

- **Forecast**: estimated recipients per day for today and the next seven days, with a table of the campaigns and recipients per day. It counts campaigns scheduled for a date in the future only, so campaigns set to send immediately or on a recurring schedule are not included.
- **History**: emails sent by campaigns per day over the last 1, 3 or 6 months, up to yesterday.

## Users

Ten accounts per list. Click a row to open the account.

- **Active**: most campaigns created.
- **Top bounces**: most bounces recorded.
- **Top complaints**: most spam complaints received.
- **Online**: accounts active in the last 10 minutes. **View all online users** opens the Users list filtered to them.

Active, Top bounces and Top complaints count the last 7, 30 or 90 days (30 by default).

## Quick links

Shortcuts to **Live sending** and **Delivery metrics** in the classic admin area (they open in a new tab), and to **Create user** and **Create user group** in the staff area. Each create link appears only with the permission that screen needs.
