# The Staff Dashboard

The **Dashboard** is the first page of the staff area. It brings together what the classic admin overview shows: the setup checklist, campaigns waiting for approval, sender domain health, scheduled and past sending, and the accounts that stand out.

| Screen | Path on a default install | Permission |
|---|---|---|
| Dashboard | `/user/staff/dashboard` | Dashboard |

Administrators with the "Dashboard" permission land on it after signing in and after they stop switching to a user. Administrators without it land where they did before: the Users list, or AI assistants when they may not browse users.

::: info
The dashboard acts as the administrator who is signed in. A sub-administrator limited to some user groups sees only the accounts and campaigns in those groups in every section, and can preview, approve or reject only those campaigns.
:::

## Sections

The menu on the left lists the dashboard's sections. One section is shown at a time, and its name is part of the page address (for example `/user/staff/dashboard?section=pending`), so you can bookmark a section or share a link to it. An address with a section you may not open shows the Overview.

| Section | What it shows | Permission |
|---|---|---|
| Overview | A summary tile per section, and quick links | Dashboard |
| Pending approval | Campaigns waiting for approval, with Preview, Approve and Reject | Reports |
| Delivery | Scheduled sending for the next 8 days, and past sending | Dashboard |
| Users | Accounts that stand out, and accounts online now | Dashboard (Online also needs User.Browse) |
| Sender domains | Sender domains per health class | User.Edit |
| Setup | The setup checklist | Settings, and no user group limit |

A section you may not use is not in the menu. **Pending approval** and **Sender domains** show a count in the menu: the campaigns waiting for approval and the failing sender domains.

Each section loads on its own after the page opens. It shows the time its figures were read ("Updated 14:03") and a refresh button that reads them again. Figures are kept for under a minute between reads, and nothing refreshes by itself. When a section cannot be loaded it says so and shows no figures, rather than a zero that might be wrong.

## Overview

A row of tiles, one figure each. Click a tile to open its section.

| Tile | Figure | Opens |
|---|---|---|
| Pending approval | Campaigns waiting for approval, and how many content screening held | Pending approval |
| Failing domains | Failing sender domains, with the demoted ones and the total | Sender domains |
| Scheduled | Campaigns scheduled for the next 8 days, with their estimated recipients | Delivery |
| Emails sent | Emails sent by campaigns in the last 30 days, with a trend line | Delivery |
| Online now | Accounts active in the last 10 minutes | Users |
| Setup | **Ready** when every required check passes, otherwise how many checks need attention | Setup |

A tile follows the permission of its section (Online now also needs User.Browse), so you see only the tiles you may use. A tile that could not be loaded says "Unavailable".

Under the tiles, **Quick links** (with the "Admin.Dashboard.Links" permission) go to **Live sending** and **Delivery metrics** in the classic admin area (they open in a new tab), and to **Create user** and **Create user group** in the staff area. Each create link appears only with the permission that screen needs.

## Pending approval

The ten campaigns that have waited longest for approval. Each row shows the campaign, its subject and sender, and its owner (click to open the account). A **Screening hold** label marks a campaign that content screening held: point at it to read the reason.

- **Preview** (eye icon) opens the campaign's email in a side panel, with a Desktop, Mobile or Plain text view and, for an A/B campaign, one tab per version. A held campaign shows the screening reason at the top. The email is shown as stored: merge tags are not filled in and remote content is not fetched. Scripts in the email never run.
- **Approve** (check icon) asks for confirmation, then lets the campaign send as its owner scheduled it.
- **Reject** (cross icon) sends the campaign back to its owner's drafts. You can add a message, which is emailed to the owner. Writing a message needs the "User.Edit" permission.

You can also approve or reject from the preview panel.

::: tip
Approve and Reject act on the version you were shown. If the owner changed the campaign after you opened the page, nothing happens: a message says the campaign changed and its row is read again, so you can review it before you try again.
:::

Every approval and rejection is recorded in the staff audit log with the administrator, the time, the campaign and the outcome.

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

## Sender domains

A coloured bar shows how the sender domains split across health classes: healthy, failing, demoted by DNS drift, awaiting approval, never checked and other. Under it, each class with its count and share. Click a class to open the [Sender domain health report](./staff-sender-domain-health) filtered to it.

## Setup

The same readiness report as the classic admin overview: one row per check (license, delivery server, sending DNS, reverse DNS, workers, cron and the rest) with what was found and what to do next. A green mark is done, an amber mark needs attention, a grey mark is optional or unknown.

While the install is not ready, the checks that need something are listed first and the passing checks fold into one row. Click it to see them. When every required check passes, the section shows a single **Ready to send** line. Click it to see the checks.
