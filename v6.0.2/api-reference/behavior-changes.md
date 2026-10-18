---
layout: doc
title: API Behavior Changes in v6.0.2
description: Deliberate API behavior changes in Octeth v6.0.2 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.2

This page lists every deliberate change in v6.0.2 that an existing integration can observe, so you can check your code against it before upgrading.

## Tier 1: changes that can break an integration

### Google Postmaster

#### The Google Postmaster integration is removed and the `postmaster.*` commands return a fixed error

Google retired the Postmaster Tools API, so the integration could no longer fetch data. v6.0.2 removes it: the **Reports > Google Postmaster** screens, the OAuth connection, the three nightly crons (collector, cleanup and sending-statistics aggregation) and the stored metrics. An upgrade migration drops the `oempro_google_postmaster_oauth_tokens`, `oempro_google_postmaster_domain_metrics`, `oempro_google_postmaster_ip_metrics`, `oempro_google_postmaster_sending_stats` and `oempro_sender_ip_addresses` tables, which also deletes the stored Google refresh token and the sender IP list entered for Postmaster collection.

The 11 `postmaster.*` admin commands stay registered for this release. Each one, whatever parameters are sent, answers `{"Success": false, "ErrorCode": 99, "ErrorText": "Google Postmaster integration has been removed: the Google Postmaster Tools API is no longer available"}` and still requires the `Settings` privilege. They will be deleted in a later release. See [Google Postmaster Tools](/v6.0.2/api-reference/postmaster) for the list.

There is no opt-in flag, because the commands had no working data source left.

### Campaigns

- `Campaign.Update` now refuses a `RulesJsonBundle` that names a list or segment the caller does not own, or one that no longer exists (`ErrorCode 28`), or that holds a list or segment reference that is not a positive integer (`ErrorCode 29`). Before, such a bundle was stored and later drove queue generation. Requests that name the caller's own existing lists and segments are unchanged. Queue generation also fails a campaign whose stored `RulesJsonBundle` names a list its owner does not own, instead of queueing that list (octeth/oempro#3383).
- `Campaign.Update` refuses to move a campaign out of `Pending Approval` to any status other than `Draft` (`ErrorCode 30`). Only `Campaign.Approve` releases it. For an `Untrusted` account, every update that arms a campaign to send (`Sending`, or `Ready` with a schedule other than `Not Scheduled`) from a state that was not armed is stored as `Pending Approval`, not only `Draft` to `Ready`: scheduling a new campaign, `Campaign.Resume` of a `Paused` campaign, and moving `Sent` or `Failed` to `Ready` are now held for approval. `Campaign.Cancel` withdraws a `Pending Approval` campaign to `Draft` instead of `Ready`, and `Campaign.Resume` and `Campaign.Cancel` return the failure of their internal update instead of `Success: true`. There is no opt-in flag, because the old behavior let an account skip the operator's approval.
- An administrator's approval covers one version of an `Untrusted` account's campaign: its emails (A/B variations and split test emails included), sender, subject and content, attachments, audience and auto-resend settings. `Campaign.Update` and `Email.Update` move an armed, `Paused` or `Pending Approval` campaign back to `Pending Approval` when they change that version, and a campaign whose content changed since approval is held again instead of sent. Turning an approved campaign `Recursive` or changing its recurrence settings also needs a new approval, while a new send date for a one-time campaign does not. `Campaign.Approve` accepts an optional `ExpectedFingerprint` and refuses (`ErrorCode 4`) a campaign that changed since that version was reviewed. Campaigns of `Untrusted` accounts approved before this version have no recorded version, so they return to `Pending Approval` once when they next come up to send, and the administrators get one summary email for them instead of one per campaign. Auto-resend copies of an `Untrusted` account's campaigns are created as `Pending Approval` instead of `Ready`. Administrators get at most one approval email per campaign per hour. There is no opt-in flag, for the same reason.
- `Campaign.Approve` only approves a campaign that is `Pending Approval`. Any other status (`Draft`, `Ready`, `Sending`, `Paused`, `Sent`, `Failed`) is refused with `{"Success": false, "ErrorCode": 5, "ErrorText": "Only a campaign that is pending approval can be approved. This campaign is <status>."}` and the campaign is left unchanged. Before, any status was set to `Ready`, which armed a `Draft` its owner had not scheduled and handed a `Sent` campaign back to the campaign picker. The status is checked again in the write itself, so a campaign that is paused, cancelled or moved back to `Draft` while it is being approved is also refused with `ErrorCode 5`, and a campaign whose content the owner changed during the approval is put back in `Pending Approval` and refused with `ErrorCode 4`. A sub-admin limited to some user groups (`AccessLimited` with `AccessAllowedUserGroupIDs`) can only approve campaigns of accounts in those groups: any other campaign, and a campaign id that does not exist, answers `{"Success": false, "ErrorCode": 5003, "ErrorText": "Campaign not found or outside the user groups this admin account may access"}`. `CampaignID` must now be a plain positive integer (digits only, no sign, spaces, leading zero, decimal point or exponent). Any other value, such as `1.234e3` or `5.0`, is answered `{"Success": false, "ErrorCode": 2}` like a campaign that does not exist. Before, MySQL coerced such a string to a number (`1.234e3` named campaign 1234), and the user group check read it differently. The shared sub-admin reach checks now use the same plain-id rule. The only other visible effect is in the `usergroup.*` by-id commands: a restricted sub-admin naming a group as `3.0` or `+3` is refused with `ErrorCode 5003`, where before it was accepted as group 3. The master admin API key and admins without user group limits approving a `Pending Approval` campaign get the same response as before. There is no opt-in flag, because the old behavior let a restricted sub-admin release campaigns outside its reach and let any admin re-arm finished campaigns (octeth/oempro#3499).

### User Groups (theme cleanup)

- `UserGroup.Delete` now also deletes the deleted group's own theme when no other group references it and it is not the system default theme (octeth/oempro#3391). The response is unchanged.

### User Groups (sub-admin limits)

- A sub-admin limited to some user groups (`AccessLimited` with `AccessAllowedUserGroupIDs`) is now held to those groups by the `usergroup.*` commands. `usergroup.get`, `usergroup.update`, `usergroup.patch` and `usergroup.options.patch` answer `{"Success": false, "ErrorCode": 5003, "ErrorText": "User group is outside the user groups this admin account may access"}` for a group outside the list, including an id that does not exist, and write nothing. `usergroup.create` and `usergroup.duplicate` answer `ErrorCode 5003` with `An admin limited to some user groups cannot create user groups`, and `usergroup.delete` answers `ErrorCode 5003` with `An admin limited to some user groups cannot delete user groups`, whatever groups are named. Before, such a sub-admin holding the `UserGroups` privilege could read, change, create, duplicate and delete any group. The master admin API key and admins without user group limits get the same responses as before. There is no opt-in flag, because the old behavior let a restricted sub-admin change the limits of accounts outside its reach (octeth/oempro#3480).

### User Groups (delete)

- `usergroup.delete` no longer moves users to a user group that does not exist. When `USER_SIGNUP_GROUPID` is `-1` (new signups choose from `USER_SIGNUP_GROUPIDS`) or names a group that was deleted, a listed group that still has users is now skipped and kept, with the same `{"Success": true, "ErrorCode": 0}` answer the call already gives for the skipped signup group. Before, its users were written to user group `-1` (or the missing id), which left them without limits, permissions or send settings. Empty groups are still deleted. To delete a group with users in that configuration, send `TargetUserGroupID` (octeth/oempro#3482).
- The `Delete.UserGroup` and `UserGroup.Delete.Post` plugin hooks fired by `usergroup.delete` now run after the group's users have moved to their new group. Before, they ran while the users still pointed at the deleted group. A listener that read the group's users at that point now finds none (octeth/oempro#3482).
- New opt-in parameter `TargetUserGroupID` on `usergroup.delete`: the users of the deleted groups move to that group, refused groups are reported (`ErrorCode 7` with `RefusedUserGroups`) instead of skipped, and every group new signups use (`USER_SIGNUP_GROUPID` and `USER_SIGNUP_GROUPIDS`) is protected. Requests without it are unchanged apart from the two bullets above (octeth/oempro#3482).

### User Groups (plugin hooks)

- The `UserGroup.Create.Post` and `UserGroup.Update.Post` plugin actions now fire from the API: `UserGroup.Create.Post` after a successful `usergroup.create` and `usergroup.duplicate`, `UserGroup.Update.Post` after a `usergroup.patch` or `usergroup.options.patch` that writes at least one column. Before, only the legacy admin User Groups screens fired them, so they stop depending on that section, which the new interface replaces (octeth/oempro#3481, epic #3486). The first argument is unchanged in kind: the new group for `Create.Post`, the group as stored before the write for `Update.Post`. **The second argument is now the API request parameters, whose keys are lowercased and from which credentials (`adminapikey`, `apikey`, `sessionid`, `username`, `password`, `disable2fa`, `disable2fatoken`, `sendmethodsmtppassword`) are removed** (`groupname`, `sendmethodsmtphost`, `addpermissions`), not the legacy form's posted fields (`GroupName`, `SendMethodSMTPHost`, `Permissions`). A plugin that reads the CamelCase posted keys from the second argument gets nothing and must read the lowercase keys instead. The legacy admin User Groups screens are removed (octeth/oempro#3485), so the API is now the only place these actions fire, and their second argument is always the API parameters. No bundled plugin listens to either action.
- The `UserGroup.Update.FieldValidator` filter and the `FormItem.AddTo.Admin.UserGroupLimitsForm` form hook are removed with the legacy admin User Groups screens, the only places that called them (octeth/oempro#3485). A plugin that registers them no longer has them called. It does not error. Neither has a replacement, and no bundled plugin used either. `UI.User.Group.SubscriptionPlans` is unchanged: `admin.usergroup.editor.get` calls it.

### Subscriber search (sub-admin limits)

- `admin.subscriber.search` now limits an administrator by the same rule as every other staff screen and admin command: only when `AccessLimited` is on is the search held to `AccessAllowedUserGroupIDs`. Before, it read `AccessAllowedUserGroupIDs` alone, so an administrator with `AccessLimited` off but group ids left over from an earlier limit was still restricted to those groups. That administrator now sees every list. An administrator with `AccessLimited` on, the master Admin API Key and administrators without group ids get the same lists as before. There is no opt-in flag, because the old rule disagreed with what the administrator's settings say (octeth/oempro#3496).

### Admin area

#### The legacy Users section is removed

The legacy admin Users section (`/app/admin/users/...`: the user list, the create form, the user edit pages with their Account Activity, Limit Utilization, Payment History, Sender Domains, Send Message and account action tabs, and the invoice editor) is removed. User accounts are managed in the new interface's staff screens (`/<UI_STAFF_PREFIX>/staff/customers`), which cover the same work. The payment history tab and the invoice editor are dropped, not moved (octeth/oempro#3450).

**The old URLs keep working.** `/app/admin/users/...` is now a redirect shim, so bookmarks, emails, Slack alerts and plugin links still land on the right page:

| Old URL | Answer |
|---|---|
| `/app/admin/users/`, `/browse/...` with any filter | 302 to `/<staff>/staff/customers`, with the filter mapped to the list's query parameters |
| `/create/` | 302 to `/<staff>/staff/customers/new` |
| `/edit/<id>/`, `/edit/<id>/AccountActivity` | 302 to `/<staff>/staff/customers/<id>` |
| `/edit/<id>/Edit` | 302 to `/<staff>/staff/customers/<id>/edit` |
| `/edit/<id>/LimitUtilization` | 302 to `/<staff>/staff/customers/<id>?tab=limits` |
| `/edit/<id>/PendingDomains` | 302 to `/<staff>/staff/customers/<id>?tab=sender-domains` |
| any other `/edit/<id>/...` sub-page, `/invoice/...` | 302 to `/<staff>/staff/customers/<id>` |
| anything else under `/app/admin/users/` | 302 to `/<staff>/staff/customers` |

A POST to any of these URLs is refused: it changes nothing and answers a short page that links to the new screen.

**User management lives only in the new interface**, which is always on from v6.0.2 (see [The new user interface is always on](#the-new-user-interface-is-always-on)). There is no legacy fallback. The user API commands (`user.*`, `users.*`, `admin.user.*`) are unchanged.

**Plugin hooks removed.** These hooks were fired only by the removed section and are gone. A plugin that registers them no longer has them called. It does not error.

| Removed hook | Replacement |
|---|---|
| `FormItem.AddTo.User.Edit`, `FormItem.AddTo.User.Edit.Settings`, `User.Update.Post.Successful` | `Admin.User.PluginFields` and `Admin.User.PluginFields.Save` (octeth/oempro#3445) |
| `UI.User.Edit.LeftSide`, `UI.User.Edit.Form`, `UI.User.Edit.UserOptionsMenu`, `UI.User.Edit.UserOptionsMenu.ShowResetAccountStatsItem`, `UI.User.Edit.Form.ResetAccountStats`, `Admin.UserController.Edit.Events` | `Admin.User.PluginActions` and `Admin.User.PluginActions.Run` (octeth/oempro#3449), plus `Admin.User.PluginFields` for read-only panels |
| `UI.User.Browse.ImpersonateLink` | none: the new interface's own impersonation replaces custom links |

`User.Create`, `User.Update.Post`, `User.Delete.Post` and `Delete.User` are unchanged. The bundled plugins (amazonses, spamassassincontentvalidator, upsender, sendlayer, phishguard, peakmonitor) already use the replacements. The SendLayer custom impersonation page (`/app/sendlayer/impersonate/<id>`) still exists but nothing links to it.

There is no opt-in flag: the section is removed, and its URLs answer as above.

#### The legacy User Groups section is removed

The legacy admin User Groups section (`/app/admin/usergroups/...`: the group list, the create form and the edit form) is removed. User groups are managed in the new interface's staff screens (`/<UI_STAFF_PREFIX>/staff/user-groups`), which cover the same work through the `usergroup.*` commands. The theme and payment fields of the old form are not carried over (epic octeth/oempro#3486, D2 and D3) (octeth/oempro#3485).

**The old URLs keep working.** `/app/admin/usergroups/...` is now a redirect shim, and every classic admin link into the section (the Users menu, the overview button, the delivery server settings page and the admin help page) points at the new screens:

| Old URL | Answer |
|---|---|
| `/app/admin/usergroups/`, `/browse/` | 302 to `/<staff>/staff/user-groups` |
| `/create/` | 302 to `/<staff>/staff/user-groups/new` |
| `/edit/<id>` | 302 to `/<staff>/staff/user-groups/<id>/edit` |
| `/edit/` with a missing or non-numeric id, anything else under `/app/admin/usergroups/` | 302 to `/<staff>/staff/user-groups` |

A POST to any of these URLs is refused: it changes nothing and answers a short page that links to the new screen. The new screens apply the `UserGroups` privilege and a sub-admin's user group limits themselves.

**User group management lives only in the new interface**, which is always on from v6.0.2. There is no legacy fallback. The `usergroup.*` and `usergroups.get` API commands are unchanged.

There is no opt-in flag: the section is removed, and its URLs answer as above.

#### The legacy Subscriber Email Search is removed

The legacy admin **Subscriber Email Search** (`/app/admin/subscribersearch/`, in the classic **Users** menu) is removed. Subscriber search is in the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/subscriber-search`), which also searches a whole domain, marks archived lists, and records every search in the staff audit log (octeth/oempro#3496).

**The old URLs keep working.** `/app/admin/subscribersearch/...` is now a redirect shim, and the classic **Users** menu entry points at the new screen. It is shown only to administrators with the `Search` privilege:

| Old URL | Answer |
|---|---|
| `/app/admin/subscribersearch/`, anything under it | 302 to `/<staff>/staff/subscriber-search` |
| the same with `?email=<address>` (or `?EmailAddress=`) | 302 to `/<staff>/staff/subscriber-search?email=<address>`, which runs that search |

A POST to any of these URLs, including the old results endpoint `/app/admin/subscribersearch/search`, is refused: nothing is searched, and the answer is a short page that links to the new screen. The new screen applies the `Search` privilege and a sub-admin's user group limits itself.

There is no opt-in flag: the section is removed, and its URLs answer as above. `admin.subscriber.search` stays available.

#### The legacy admin Account page is removed

The legacy admin **Account** page (`/app/admin/account/`, the first item of the classic **Settings** sidebar) is removed. An administrator's own name, email address, username and password, and the system sender and alert recipient, are edited on **Your profile** in the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/profile`), opened from the user menu at the bottom of the left menu (octeth/oempro#3514).

**The old URL keeps working.** `/app/admin/account/` is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/account/`, anything under it | 302 to `/<staff>/staff/profile` |

A POST to it, including the old profile form, is refused: nothing is saved, and the answer is a short page that links to the new screen. The new screen needs the `Account` privilege, and its System emails section the `Settings` privilege, as before.

The classic **Settings** sidebar's **Account** item now opens the new screen. The **System Settings** item of the classic **Preferences** menu now opens the first settings section the administrator's privileges allow (Sub Admin Accounts, Security, and so on, in sidebar order), and About when none of them is allowed. It used to open the Account page.

**A username or password change signs you out of the new interface.** Saving either on Your profile ends the administrator's session, and the sign-in page asks for a sign-in with the new details. A name or email address change keeps the session.

**The master Admin API Key is shown only to the main administrator.** The legacy page's API tab showed `ADMIN_API_KEY` to every administrator with the `Account` privilege, restricted sub-administrators included, and that key acts as the unrestricted master administrator. The API access section of Your profile shows it only to the main administrator account (AdminID 1, the account the key signs in as), masked until they click **Reveal**, and each reveal is recorded in the staff audit log without the key. Every other administrator sees no key. An unrestricted administrator is told that the key is `ADMIN_API_KEY` in `.oempro_env`, which only the server operator can read, and so is the main administrator when the new interface holds no key. A restricted sub-administrator sees whether a key of their own is issued, and those keys are issued under Sub Admin Accounts, carrying only that sub-administrator's privileges and user groups. An integration that copied the master key from the Account page keeps working: the key itself is unchanged.

There is no opt-in flag: the page is removed, and its URL answers as above. `admin.get`, `admin.update`, `settings.get` and `settings.update` are unchanged.

#### The legacy admin About and License pages are removed

The legacy admin **About** (`/app/admin/about/`) and **License** (`/app/admin/license/`) pages, the last two items of the classic **Settings** sidebar, are removed. The installed version, the PHP and MySQL versions, a license summary, the license state, the license key paste box and the system health check are on the **System** screen of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/system`), with the sections About, License and System health (octeth/oempro#3517). The screen needs the `System` privilege, as the two pages did.

**The old URLs keep working.** Both pages are now redirect shims:

| Old URL | Answer |
|---|---|
| `/app/admin/about/`, anything under it | 302 to `/<staff>/staff/system` |
| `/app/admin/about/x_health_check/` | 302 to `/<staff>/staff/system?section=health` |
| `/app/admin/license/`, anything under it | 302 to `/<staff>/staff/system?section=license` |

A POST to any of these URLs, including the old license save and remove forms, is refused: nothing is saved or run, and the answer is a short page that links to the new screen.

**The hidden tools of the About page are removed, not moved.** The page carried actions that its tabs no longer showed but that still answered any administrator with `System`. They are gone:

- `POST /app/admin/about/` with `Command=DatabaseExport` (a schema dump of every Octeth table) and `Command=DatabaseRepair`. Use `admin.database.check` and `admin.database.repair` for checks and repairs, and your own database tools for a dump.
- `/app/admin/about/databaseHealthTestResults/` (the per-table check). Use `admin.database.check`.
- `/app/admin/about/phpsettings/` (`phpinfo()`). `admin.system.info` returns the PHP version and the ini values the page listed.
- `/app/admin/about/download/<path>` (a file under `data/`). Exports and logs have their own downloads.

The "Sponsors and Supporters" block is not carried over. The PHP and MySQL versions are now shown to every administrator with `System`, without the old `?show=true`.

The classic **Settings** sidebar's **License** and **About** items, and the link in the license notice above every classic admin page, now open the new screen. The top-right **Settings** link and the **System Settings** item of the classic **Preferences** menu open the first settings section the administrator's privileges allow, and the System screen when none of them is allowed. They used to fall back to the About page.

There is no opt-in flag: the pages are removed, and their URLs answer as above. `admin.system.info` and `system.health.check` are unchanged, and the four new commands are listed under "Additions" below.

The classic admin license notice and the user and subscriber limit notices now say "in the License section of the System screen" instead of "on the Settings > License page", and so do the installer and upgrade messages.

#### The legacy admin Security page is removed

The legacy admin **Security** page (`/app/admin/security/`), an item of the classic **Settings** sidebar, is removed and its settings are split across two screens of the new interface's staff area (octeth/oempro#3521):

- **Your own two-factor authentication** is the **Two-factor authentication** section of [Your profile](/v6.0.2/new-user-interface/staff-profile) (`/<UI_STAFF_PREFIX>/staff/profile?section=two-factor`). It is shown to administrators with the `Security` privilege, which the 2FA commands require.
- **The admin area IP allow-list, the rule that applies it to user sign-ins and the remembered sign-ins** of the classic admin area are the new [Security screen](/v6.0.2/new-user-interface/staff-security) (`/<UI_STAFF_PREFIX>/staff/security`), with the sections Access and Remembered sign-ins. It needs the `Security` privilege, as the page did.

**The old URLs keep working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/security/`, anything under it | 302 to `/<staff>/staff/security` |
| `/app/admin/security/cancel2fa/` | 302 to `/<staff>/staff/profile?section=two-factor` |
| `/app/admin/security/revoketoken/`, `/app/admin/security/revokealltokens/` | 302 to `/<staff>/staff/security?section=remembered` |

A POST to any of these URLs, including the old save, disable and revoke forms, is refused: nothing is saved, and the answer is a short page that links to the new screen. After a recovery-key reset at `/app/admin/reset2fa/` the browser now lands on the two-factor section of Your profile.

**What changed on the way:**

- **The QR code is drawn by the install.** The legacy page loaded the QR code image from an outside chart service, so the two-factor secret left the install in an image URL. Your profile draws it on the server, and the secret is never sent anywhere else.
- **The recovery key is shown once,** during setup. The legacy page showed it again whenever 2FA was on. A lost recovery key is replaced by turning 2FA off with your password and setting it up again.
- **The allow-list is validated.** Each line must be an IP address or an IPv4 CIDR range. The legacy page stored any text, so a typo could lock every administrator out without saying so.
- **A list that would lock you out asks first.** When the new list does not include your own address, measured the way the admin sign-in measures it, the screen names the address and saves only after you confirm.
- **The Security privilege is enough.** The legacy page saved the allow-list through `settings.update`, which needs `Settings`, so a sub-administrator holding only `Security` was refused over the API when `ADMIN_API_ENFORCE_PRIVILEGES` is on. The new screen uses `admin.security.settings.update`, which needs `Security`.
- **A list of only blank lines is reported.** The admin sign-in treats a stored value of only blank lines as a list with no address on it and refuses everyone except the server itself. The Access section says so, and saving the empty list clears it.
- **Remembered sign-ins show the browser.** Each remembered sign-in now records the browser it was issued to. Ones issued before the upgrade show "Not recorded".

There is no opt-in flag: the page is removed, and its URLs answer as above. `settings.update`, `settings.get` and the `admin.2fa.*` commands are unchanged, and the five new commands are listed under "Additions" below.

#### The legacy admin Log Observer is removed

The legacy admin **Log Observer** (`/app/admin/logobserver/`), an item of the classic **Settings** sidebar, is removed. Listing, reading, downloading and emptying log files is on the **Logs** screen of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/logs`) (octeth/oempro#3522). The screen needs the `Settings` privilege, as the page did.

**The old URL keeps working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/logobserver/`, anything under it | 302 to `/<staff>/staff/logs` |

A POST to it, including the old `x_tail` and `x_truncate` calls, is refused: nothing is read or emptied, and the answer is a short page that links to the new screen. The old `x_list_files` and `x_download` GET actions redirect to the screen and no longer return a file list or a file.

The classic **Settings** sidebar's **Logs** item (formerly **Log Observer**) opens the new screen. The top-right **Settings** link no longer considers the Log Observer as a landing page, which changes nothing in practice, because every section before it needs `Settings` too.

There is no opt-in flag: the page is removed, and its URL answers as above. The four new commands are listed under "Additions" below.

#### The legacy admin overview points to the new dashboard

The legacy admin overview (`/app/admin/overview/`) is still where the legacy admin login lands, but it no longer shows the reports. It shows a "The dashboard moved" card with a link to the [staff dashboard](/v6.0.2/new-user-interface/staff-dashboard) of the new interface (`/<UI_STAFF_PREFIX>/staff/dashboard`), the setup checklist (admins with the Settings privilege and no user group limit) and the quick links (admins with `Admin.Dashboard.Links`).

The delivery forecast and history charts, the Active users, Online users, Top bounces and Top spam complaints lists, the campaigns pending approval list with its Approve link, and the sender domain health counts are on the staff dashboard, which applies the same privileges and sub-admin user group limits. Loading the legacy overview no longer runs any of their queries.

The legacy chart endpoint `/app/admin/overview/chartDataHistory/<days>/true` is removed. Use `admin.delivery.history` for the same series.

The "campaign pending approval" notification email to administrators now says to review the campaign in the Pending approval section of the staff dashboard, instead of on the Admin Overview page.

#### The new user interface is always on

The `UI_ENABLED` setting is removed, and the new user interface runs on every install (octeth/oempro#3494). An install could not manage user accounts or user groups with it off, since those screens exist only there. What an integration or operator can observe:

- `/user/`, `/ui/` and `/livewire-` are always served by the new interface, and `/mcp`, `/oauth/` and `/.well-known/oauth-` by its AI assistant connector unless `MCP_ENABLED` is `false` (see below). On an install that had `UI_ENABLED=false`, these paths went to the classic application before the upgrade and are now internet-facing.
- `system.health.check` always includes the `NewUserInterface` check in `Checks` and `Timings`. Before, it appeared only while `UI_ENABLED` was `true`, so an install that had the interface off sees a new key, and the whole call answers HTTP 503 when the interface does not answer. Its failure text no longer mentions `UI_ENABLED`.
- The `/app/admin/users/...` and `/app/admin/usergroups/...` URLs always redirect as described above. The page saying the section needs the new interface is gone.
- The admin API IP allow-list (`ADMIN_API_ENFORCE_ALLOWED_IP`) always exempts calls received from the interface's own container, matched on the connection's address. Before, the exemption applied only while `UI_ENABLED` was `true`.
- An AI assistant's `usergroup.options.patch` always checks the user groups the new interface places accounts in, so a call that does not come through the built-in connector is refused for that check on every install (`ErrorCode` and text unchanged). Before, an install with `UI_ENABLED=false` skipped the check.
- The upgrade deletes a leftover `UI_ENABLED` line from `.oempro_env`, `true` or `false`, with a one-line notice, and recreates the `oempro_ui` and `haproxy` containers. A failed interface asset build, interface migration or interface Composer install now fails the upgrade and rolls it back instead of warning.

There is no opt-in flag: the interface is part of every install. The only part that can be switched off is the AI assistant connector, with `MCP_ENABLED=false`.

### Users

- `Users.Delete` now deletes what the deleted user owned: their lists with each list's subscriber tables, their segments, user API keys (AI agent keys included), email gateway API keys and SMTP credentials, and their risk snapshots. Their email gateway sender domains are soft-deleted, and unfinished SMS campaigns are cancelled. Before, all of these were left behind, and a deleted user's email gateway SMTP login kept working (octeth/oempro#3389). Statistics, logs and other history rows are kept. The response is unchanged. To find what earlier deletions left behind, run `./cli/octeth.sh users:orphans`, which reports orphaned lists, segments, subscriber tables and themes and deletes them only with `--delete --yes`.
- `users.get` accepts only `UserID`, `EmailAddress`, `Username`, `FirstName`, `LastName`, `CompanyName` and `SSOID` in `SearchField`, matched without regard to case. Any other column answers `{"Success": false, "ErrorCode": 4}`. Before, any column was accepted, so an admin with the `User.Browse` privilege could search credential columns such as `Password`, `APIKey` or `AuthToken` with repeated partial matches and recover their values. There is no opt-in flag, because the old behavior exposed credentials (octeth/oempro#3444).
- `users.get` accepts only the listed sortable columns in `OrderField`: `UserID`, `Username`, `EmailAddress`, `FirstName`, `LastName`, `CompanyName`, `UserSince`, `LastActivityDateTime`, `AccountStatus`, `ReputationLevel`, `RelUserGroupID`, `RelUserCategoryID` and `SSOID`. Any other column now falls back to `UserID ASC`, the same as a malformed value. Before, an identifier-shaped name of another column was passed to the query and either sorted by that column or answered a database error (octeth/oempro#3444).

### SMTP delivery

#### A refused or failed STARTTLS now fails the SMTP connection instead of continuing in plaintext

When an SMTP relay is configured with **Secure = TLS** (the admin SMTP send method, a user group's SMTP settings or a delivery server), Octeth sends `STARTTLS` after connecting. Before this release, if the relay refused `STARTTLS` (for example `454 TLS not available` or `502`) or the TLS handshake failed, Octeth carried on over the unencrypted connection: it sent SMTP AUTH with the username and password, then the sender, recipients and the full message, all in plaintext. A send could therefore succeed while exposing the relay credentials and the message to anyone on the network path (octeth/oempro#3228).

From this release a STARTTLS failure on a TLS-configured relay is a failed connection to that host. Octeth closes the socket without writing AUTH, MAIL FROM, RCPT TO or the message, tries the next host when `Host` lists several, and reports the send as a connection failure when none succeeds. The error text names the failure and the server's reply, for example `SMTP Error: Could not connect to SMTP host. SMTP Error: STARTTLS failed on smtp.example.com:587, the connection was closed without sending credentials or mail. STARTTLS not accepted from server. Server reply: 454 4.7.0 TLS not available`. Because the failure is now at the connection stage, a transactional email gateway send that fails this way returns its reserved credit, and the email gateway treats it as a retryable connection failure, whatever the reply code.

There is no opt-in flag and no setting to restore the old fallback, because the old behavior sent credentials in plaintext against an explicit TLS setting. Relays that accept STARTTLS, and relays configured with Secure = SSL (port 465) or Secure = none, are unaffected.

**Upgrade note.** If your relay does not support STARTTLS on the configured port but Secure is set to TLS, your sends have been going out unencrypted and will start failing after the upgrade. Before upgrading, run **Settings > Email Delivery > Send test email** (and the same test for each user group or delivery server with its own SMTP settings). If a test fails with `STARTTLS failed`, either enable STARTTLS on the relay, switch to Secure = SSL on port 465 if the relay offers it, or, only for a relay on a trusted private network, set Secure to none deliberately.

### Login and password reminders

#### Repeated failed sign-ins and password reminders are refused with `ErrorCode 429`, even for a correct password

`User.Login`, `Admin.Login`, `Subscriber.Login`, `Admin.PasswordRemind` and `User.PasswordRemind` now refuse repeated attempts. The user, administrator and subscriber login screens and the forgot-password screens are covered too, because they call these commands. Failures are counted per name being signed in as (the username or email address, or the list and email address for a subscriber) and per client address, separately for each command. Names are matched the way the login matches them, ignoring case and accents, so `Admin`, `admin` and `ádmin` share one count. After 10 failures for one name, or 50 from one address, within 15 minutes, further attempts are refused for 15 minutes.

A refused attempt answers `{"Success": false, "ErrorCode": 429, "ErrorText": "Too many failed attempts. Try again later.", "RetryAfterSeconds": 840}`, and over `api.php` the HTTP status is 429 with a `Retry-After` header. The refusal happens before the credentials are looked up, so it is identical for an existing and an unknown account, and it refuses a correct password until the lock expires. An integration that treats every non-success login as a wrong password, or that retries a login in a loop, must handle `ErrorCode 429` and wait `RetryAfterSeconds`.

A successful sign-in clears the count for that name, and a successful `Admin.Login` also clears the `User.Login` count for the same name. A wrong `TFACode` or `TFARecoveryCode` counts as a failure. A login with a user API key or a valid `AdminAPIKey` is not counted or refused. Password reminders count every request, not only failures, because each one sends an email: per email address, and also per client address for `Admin.PasswordRemind` and the forgot-password screens. `User.PasswordRemind` called through `api.php` is counted per email address only. If Redis is unreachable, attempts are allowed.

This is on by default, including on upgrade. Set `LOGIN_THROTTLE_ENABLED=false` in `.oempro_env` to switch it off, and tune the limits with `LOGIN_THROTTLE_MAX_FAILURES_PER_IDENTITY`, `LOGIN_THROTTLE_MAX_FAILURES_PER_IP`, `LOGIN_THROTTLE_WINDOW_SECONDS` and `LOGIN_THROTTLE_LOCKOUT_SECONDS`. An integration that signs many people in from one server address may need a higher `LOGIN_THROTTLE_MAX_FAILURES_PER_IP` (octeth/oempro#2986).

## Tier 2: shape and value changes

### Remote content and URL imports

#### Every redirect is checked before Octeth follows it

Octeth already refused a remote content, import or integration URL that resolves to a private, loopback or link-local address. It now checks every redirect the same way, and connects only to the address it checked. This covers <code v-pre>%RemoteContent=...%</code> and <code v-pre>%RemoteContentBeforeSend=...%</code> tags, the email editor's remote fetch, images embedded from email HTML, the public archive, `Subscribers.Import.Post` with a CSV URL, and list web service integrations. A redirect to an internal address now fails the fetch the same way an unreachable URL does, where before its content was returned (octeth/oempro#3385). Public redirect chains of up to five hops work as before.

### Client IP

#### Installs without Cloudflare record the visitor's address instead of `192.168.99.100`

On an install whose app domain is served by the bundled Caddy proxy (no Cloudflare in front and `APP_DOMAIN_TLS_CERT` empty), and on every tracking domain not fronted by Cloudflare, Octeth recorded the bundled HAProxy's container address `192.168.99.100` as the visitor IP. Caddy ignored the PROXY protocol header HAProxy sends because no source was allowed to send one. v6.0.2 allows exactly HAProxy's address, so the visitor's public address is recorded again (issue #3353).

This changes the values in `SubscriptionIP`, `OptInIP` and `UnsubscriptionIP`, in open and click records, in login records, and the address compared against the admin and user IP allow-lists and per-IP rate limits. Addresses recorded before the upgrade on affected installs stay `192.168.99.100` and cannot be recovered. `./cli/octeth.sh health:check` reports `ClientIPResolution` as OK once the fix is active. The upgrade recreates the containers, so no manual restart is needed.

Installs behind Cloudflare with `TRUST_CLOUDFLARE_CONNECTING_IP=true`, and app domains served with a static certificate (`APP_DOMAIN_TLS_CERT`), were not affected.

### Email Gateway

#### `emailgateway.getsmtps` and `emailgateway.addsmtp` return `smtp.example.com` as `SMTPHost` until `EMAILGATEWAY_SMTP_HOST` is set

`SMTPHost` comes from `EMAILGATEWAY_SMTP_HOST`. An install that never set the key used a built-in default. The v6.0.2 upgrade adds the key with the placeholder `smtp.example.com`, so these commands return that value until an administrator sets the real SMTP host in `.oempro_env`. The response shape is unchanged.

### Journeys and Email Gateway

#### Links in journey and Email Gateway mail return to a sender domain's own verified tracking host

Since v5.9.6, journey and Email Gateway mail used a sender domain's own tracking host only when its stored DNS records listed the host composed from the `EMAILGATEWAY_DNS_*` settings. A domain added on the Sender Domains page stores its tracking record in the campaign form, composed from the `EMAILCAMPAIGN_DNS_*` settings. On an install where the two differ, for example `EMAILCAMPAIGN_DNS_TRACK_PREFIX=upl` and `EMAILGATEWAY_DNS_TRACK_PREFIX=track`, every such domain failed the check and its tracking, opt-out, web-version and forward links moved to the delivery-server tracking domain or the `APP_URL` host.

v6.0.2 accepts the tracking host in either form. The gateway form is checked first, so a domain whose records are in the gateway form keeps its current host. The other conditions are unchanged: Sender Domain Management on for the owner's group, the domain `Enabled`, and the host listed in its stored DNS records. The admin sender domain health report and the domain edit page now name the same host the mail carries (issue #3307).

Links already sent keep their fallback host and keep working.

### SMS

#### The v6.0.0 single-brace SMS merge tags render again

v6.0.1 replaced the SMS merge tag syntax with the email one, <code v-pre>{{ Subscriber:CustomField7 }}</code>, and stopped replacing the single-brace form v6.0.0 shipped, so content written for v6.0.0 reached the handset with the tag typed out. v6.0.2 renders both. `{CustomField7}` and `{CustomField7|"there"}` are read as <code v-pre>{{ Subscriber:CustomField7 }}</code> and <code v-pre>{{ Subscriber:CustomField7 | "there" }}</code> wherever SMS content is rendered: campaign sends, estimates, `smscampaign.test`, journey SMS and the SMS gateway (issue #3294).

A single-brace tag follows the same rules as the email syntax. `smscampaign.create` and `smscampaign.update` refuse one that names a field the list does not have (errors `14` and `17`), and a campaign whose field was deleted after it was saved skips its recipients. In v6.0.0 such a tag was dropped from the message instead. A fallback that holds a closing brace cannot be read: it is refused (errors `16` and `19`) and never sent.

The fallback now follows the email rules too: a field value of `0` shows the fallback, and spaces around the fallback text are trimmed.

The single-brace form is deprecated. `sms.mergetags.get` returns only the email syntax, and new content should use it.

#### Xeebi delivery reports name the reason a number was rejected

A Xeebi delivery report or status poll that marked a message as a generic failure while also naming the reason (an invalid number, a number Xeebi has no route for, or a number on the Xeebi stop list) was recorded as the generic failure, "Xeebi could not submit the message to the network". From v6.0.2 the specific reason wins. The recipient's `GatewayErrorCode` is `INVALID_NUMBER`, `UNROUTABLE` or `STOP_LIST`, `ErrorMessage` carries the matching description, and the recipient's status is Rejected instead of Failed, so `smscampaign.recipients.browse` and the recipient list show it under `Rejected`, not `Failed`. It is still one undelivered message in the SMS event history. A report that names no reason is still recorded as `FAILED`. Messages already recorded are not changed (octeth/oempro#3380).

#### SMS campaigns use every short domain of their gateway

Before v6.0.2, SMS campaigns sent every tracked link on the first domain in the gateway's **URL Shortening Domains** list and ignored the rest. Now each recipient is assigned one of the gateway's domains, spread evenly across the list, and keeps it for the whole campaign. The estimate and the queued cost use the recipient's own domain, so the part count billed equals the part count sent. Messages queued before the upgrade keep sending on the first domain (octeth/oempro#3371).

On a gateway with several domains of different lengths, `smscampaign.create` and `smscampaign.update` now check the part limit against the longest domain, so a message that was exactly at the limit on the first domain can now be refused with error `9` if a longer domain pushes it over. Gateways with one or no short domain behave exactly as before.

The new `oempro_sms_campaign_queue.ShortDomain` column is added by an upgrade migration (instant, no table rebuild). Until it runs, campaigns keep using the first domain.

#### SMS gateway short domains must be ASCII hostnames

`smsgateway.create`, `smsgateway.update` and the admin SMS gateway form now reject a short domain that is not an ASCII hostname (a non-ASCII or internationalized domain, a URL with a scheme, port or path, or a single label) with error `18` and the rejected entries in `ErrorText`. Enter an internationalized domain in its punycode form. A non-ASCII domain switches an otherwise GSM-7 message to UCS-2, so it could pass the part-limit check on another domain and then be skipped as too long at send (octeth/oempro#3421). Gateways that already store such an entry keep working: SMS campaigns skip a stored non-ASCII domain and log it, and the other entries are only checked again when the list is saved.

- `user.switch` with `PrivilegeType=Full` now grants every user permission to the session it returns. Before, the flag was stored but never applied, so a Full switch had the user group's permissions, the same as `Default`. A bare user-group read (`usergroup.get` and the other admin user-group commands) made in a browser session that also held a Full switch used to see the group's `Permissions` as `*`. It now sees the stored permissions (octeth/oempro#3471).

### User Groups

#### A subscription plan has exactly one default user group

The database now enforces one default user group per subscription plan with a unique index. The commands that write a default answer a conflict with the `ErrorCode 34` refusal that `usergroup.create` and `usergroup.patch` already used, carrying `ConflictingUserGroupID` and an `ErrorText` naming the group (issue #3181):

- `usergroup.create` and `usergroup.patch` also return `ErrorCode 34` when a concurrent request made another group the plan's default first. Before v6.0.2 both requests could succeed and leave two defaults.
- `usergroup.update` returns `ErrorCode 34` when it would move a plan's default group onto a plan that already has one. It used to succeed.
- `usergroup.duplicate` creates the copy with `SubscriptionPlanIsDefault` set to `No`. It used to copy the original's default status.
- `usergroup.update` refuses a parameter sent as an array or object, where a single value is expected, with `ErrorCode 36` and `ErrorField` naming it.

The upgrade migration resolves any plan that already has more than one default: it keeps the group with the lowest `UserGroupID` as the default, sets the others to `No`, and writes each demoted group to the application log. The group it keeps is the one new signups on that plan were most likely already reaching.

#### `usergroups.get` is scoped for limited admin accounts

`usergroups.get` returns only the allowed groups for an admin account limited to specific user groups. Before, it returned every group on the install. The master Admin API key and admin accounts without a group limit are unaffected (octeth/oempro#3444).

#### New user group fields, opt-in parameters and editor command

- `usergroup.get` and `usergroups.get` return the AI agent policy (`AgentAccess`, `AgentMaxSendsPerDay`, `AgentMaxRecipientsPerSend`, `AgentConfirmAbove`) and the sender screening policy (`ScreeningSignupThreshold`, `ScreeningSignupMode`, `ScreeningImportThreshold`, `ScreeningImportMode`, `ScreeningContentThreshold`, `ScreeningContentMode`) of each group. They were written by `usergroup.create` and `usergroup.patch` but never returned. Every other field is unchanged (octeth/oempro#3481).
- New opt-in parameters, each inert when left out: `IncludeSMTPUsername` on `usergroup.get` returns the group's SMTP username (never the password, and not available to admin agent keys); `SMTPPasswordRetention` on `usergroup.patch` stops a stored SMTP password from following a changed host or send method; `TestSMTPConnection` on `usergroup.patch` sends a live test email before writing an SMTP configuration (`ErrorCode 25` on failure, nothing written), and never sends the stored password to a host other than the stored one; `AddPermissions` and `RemovePermissions` on `usergroup.patch` change only the named permissions (`ErrorCode 37` when combined with `Permissions`). A request without them behaves as in v6.0.1, apart from the new fields in the bullet above (octeth/oempro#3481).
- New command `admin.usergroup.editor.get` (privilege `UserGroups`) returns the choice lists of a user group editor: subscription plans, the core and plugin permission catalog, DNS template names, delivery server ids and names, default rate limits and the default theme id (octeth/oempro#3481).

### SMS rate limits

#### The upgrade repairs SMS rate limits that held every SMS send

- An upgrade rewrites a user group's SMS rate limits to unlimited (`-1` for all six intervals) when they are exactly `{"Minute": -1, "Hour": 0, "Day": 0, "Week": 0, "Month": 0, "Year": 0}`. Two earlier upgrade migrations wrote those values into every user group that existed when they ran, including the default group of a fresh install, and because `0` means "no sends" every SMS campaign and journey SMS of those groups stayed queued with nothing logged (octeth/oempro#3379). Groups with any other SMS limits, the email gateway limits of every group, and per-user `RateLimits` overrides are not changed. A group an operator deliberately set to Hour, Day, Week, Month and Year `0` with Minute left at `-1`, to block SMS for that group, carries the same values and is also rewritten to unlimited: set its limits again after upgrading (a block that also sets Minute to `0` is left alone). `UserGroup.Get` and `UserGroups.Get` return the rewritten values.
- Fresh installs seed the default user group with unlimited SMS and email gateway rate limits.
- When an account rate limit holds an SMS campaign, the release worker logs a WARNING naming the interval and the limit, once per campaign per interval, and the admin SMS campaign browser shows "Waiting: SMS rate limit for this account reached (Day = 0)" under the campaign status. A journey SMS held by the same limit is logged as "SMS rate limit for this account reached (Day = 0)" instead of "SMS rate limit exceeded for interval: Day". The `SMS.Send` and `SMSCampaign.Test` API error messages are unchanged.

#### An SMS rate limit of `0` now blocks every send

An SMS rate limit of `0` on any interval means "no SMS", and `-1` means unlimited. Before v6.0.2, `SMS.Send`, `SMSCampaign.Test` and the journey **Send SMS** action let the first message of each window through when a limit was `0`, because a counter that did not exist yet was skipped instead of counted as zero. An account limited to `0` per minute could send one SMS per minute. These paths now reject that first send too: `SMS.Send` returns HTTP `429` with `ErrorCode 11`, `SMSCampaign.Test` returns `429` with `ErrorCode 10`, and a journey Send SMS action fails with "SMS rate limit exceeded" (octeth/oempro#3416). SMS campaigns already treated `0` this way. Limits of `1` or more are unchanged and still allow exactly that many messages per window.

If an account or user group has a `0` SMS limit and is expected to send, set that interval to `-1` (unlimited) or to the intended number.

#### Journey Send SMS actions fall back to the user group's SMS limits

The journey **Send SMS** action now resolves its SMS rate limits the same way `SMS.Send` does: a user's own SMS limits replace the group's, and a user whose stored rate limits carry no SMS limits uses the user group's SMS limits. Before, such a user's journey SMS ran with no rate limit at all (octeth/oempro#3416). Accounts without per-user rate limits, and accounts with per-user SMS limits, are unchanged.

When Redis cannot be reached, SMS sends are still allowed without a rate limit check, but each one now logs an error line naming the user.

### Time zones

#### Time zone labels are stored with a plain `&`

The four "US & Canada" time zones are now stored as `(GMT-05:00) Eastern Time (US & Canada)` everywhere. Before this fix the admin user create and edit pages saved them as `(US &amp; Canada)`, and the edit page then showed "(GMT-10:00) Hawaii", so the next save replaced the user's time zone with Hawaii (octeth/oempro#3360).

- `user.create`, `user.update` and `campaign.update` convert `&amp;` to `&` in `TimeZone` and `SendTimeZone` before storing. Clients that send either form keep working, and `user.get` returns the plain form.
- The upgrade repairs existing `oempro_users.TimeZone` and `oempro_campaigns.SendTimeZone` values that still hold `&amp;`. Users whose time zone a later save already reset to Hawaii must set it again.

### Journeys

#### Journey names are stored and returned as typed

Journey names that contain `&`, `<`, `>`, `"` or `'` are now stored with the literal characters. Before this fix, `journey.create`, `journey.update`, `journey.copytouser` and `journeys.clone` stored them HTML-encoded, so a journey named "Tom's series" through the API or the new interface showed as "Tom&#039;s series" in the legacy journey pages and in the new interface's subscriber journey list (octeth/oempro#3417).

- `journey.create` and `journey.update` responses (`Journey.JourneyName`), `subscriber.get` and `subscriber.create` (`SubscriberJourneys[*].JourneyName`) and the subscriber activity timeline now return the name as typed, for example `A & B` instead of `A &amp; B`. They now match `journey.get` for the same journey.
- `journey.get`, `journey.list`, `journey.sendemailactions` and `journey.clone` return the same value as before. One exception: a name created in the legacy interface that literally contains entity text, such as `R&amp;D`, was returned as `R&D` and is now returned as typed.
- The upgrade decodes existing encoded names in `oempro_journeys.JourneyName` once. A legacy name that literally contains entity text, such as `R&amp;D`, is decoded to `R&D` by this step.
- Tags are still stripped from API-supplied names. Integrations that read `oempro_journeys.JourneyName` directly and decoded it themselves should stop decoding.
- Journey Builder steps that saved a copy of another journey's name (Start Journey, Journey Completed trigger) keep the encoded copy until that journey is selected again in the step.

### Send engine

#### The send engine waits for MySQL instead of crashing when it becomes unreachable

On PHP 8.1, the send engine (`cli/email_campaign_controller/run.php`) crashed with a `TypeError` when MySQL became unreachable after it had started, and supervisord restarted it. It now logs the failure and retries every second until MySQL is back, the same as the PHP 5.6 workers (octeth/oempro#3367).

A failed connection now reports the MySQL connect error on both PHP versions, for example `MySql Error: Couldn't connect to database - Connection refused`, where PHP 8.1 reported the `TypeError` instead. Startup behavior with MySQL down is unchanged.

### Users

- `user.update` leaves `OtherEmailAddresses` unchanged when the parameter is left out, like `RateLimits`, `CustomEmailHeaders` and `WhiteListedEmailAddresses`. Before, any call without it (an account status change, a user group change, enabling two-factor authentication, a profile edit) stored an empty value, so the account's other email addresses were silently erased. Sending the parameter, an empty string included, still writes it, so to clear the field send `"OtherEmailAddresses": ""`. The response is unchanged. There is no opt-in flag, because the old behavior destroyed data the caller never asked to change (octeth/oempro#3468).

### New user interface sessions

#### Revoked sessions are now signed out (octeth/oempro#3354)

Revoking a session from Account > Active sessions, "Sign out all other sessions", and changing the password now sign the other devices out on their next page load or click. Before this release these actions marked the sessions as signed out but the devices stayed signed in until their sessions expired on their own.

What to expect after upgrading:

- Any session that was revoked at any point since the new interface shipped, and is still open, is signed out on its next request and lands on the login page with "Your session was signed out from another device." This includes sessions signed out by an earlier password change. Users only need to sign in again.
- The "Last active" time in Account > Active sessions now updates while a session is in use (at most once a minute), instead of always showing the sign-in time.
- Sessions that were opened before sign-in tracking existed appear in the Active sessions list the first time they are used after the upgrade.
- When the revoked session belongs to one of several saved accounts in the same browser, only that account is removed from the account switcher, and the browser moves to the next saved account that is still signed in.
- Staff sessions, including staff impersonating a customer, are never listed in the customer's Active sessions and are not signed out by the customer's revoke.

No configuration change is needed.

### Subscriber search

- `admin.subscriber.search` adds two fields to its response: `Incomplete` (top level) and `Archived` (on each entry of `Lists`). Every other field and its order are unchanged. `Incomplete: true` means a list probe failed or ran past its time limit, or the search's time budget ran out, so the results may be missing lists. Before, such a probe was skipped silently. A failure to read the list of lists or the list tables also returns `Incomplete: true` with no lists, where it returned an empty result before (octeth/oempro#3496).
- Each list probe now runs with a MySQL `MAX_EXECUTION_TIME` limit (5 seconds for an address search, 10 seconds for a domain search), and the whole search stops after 25 seconds.
- New opt-in parameter `SearchDomain` finds every subscriber on a domain, capped at 500, with `TotalMatches`, a `Matches` array per list and `Truncated`. Requests without it are unchanged apart from the two fields above. Two new error codes: `3` for an invalid `SearchDomain` and `4` when both `EmailAddress` and `SearchDomain` are sent.

### Admin dashboard data

- `admin.overview.get` accepts an optional `Days` of 7, 30 or 90 that windows the three leaderboards and caches the result for 300 seconds. Without `Days` the response is unchanged. A request that already sent a `Days` parameter with any other value, which the command used to ignore, is now refused with error code 1. An empty `Days` is still treated as absent (octeth/oempro#3501).
- `admin.setup.status` accepts an optional `Cached=true` that returns the report cached for up to 60 seconds with `FromCache`. Without it the response is unchanged (octeth/oempro#3501).
- `admin.senderdomains.health.get` accepts an optional `SummaryOnly=true` that returns only the health counts. Without it the response is unchanged (octeth/oempro#3501).

## Additions that need operator attention

### System screen commands

Four new admin commands, all additive and all needing the `System` privilege, which each one checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off (octeth/oempro#3517). No existing command changes.

- `admin.license.get` returns the license state: status, source, edition, limits, the masked display key, the license facts, the host a key must name, and the state of a pasted key. It never returns the key or its token.
- `admin.license.save` takes `LicenseKey`, verifies it against the host `APP_URL` names and stores it, so it changes the limits of the whole install. Error codes: `1` no key, `2` refused (with `ReasonCode`), `3` verified but not saved. The key is never returned or logged. Refused in demo mode. Rate limit 10 requests per 300 seconds.
- `admin.license.remove` removes the pasted key, so `LICENSE_KEY` decides again. Error code `1` when it could not be removed. Refused in demo mode. Rate limit 10 requests per 300 seconds.
- `admin.system.health` runs the same checks as `system.health.check` on an admin session and answers HTTP 200 with `Healthy`, `Checks` and `Timings`, whatever the checks found. Rate limit 10 requests per 300 seconds.

`system.health.check` keeps its credentials (master key, per-sub-admin key or `SYSTEM_HEALTH_CHECK_TOKEN`), its HTTP 503 on a failed check, its failure log and its response, unchanged.

### Security screen commands

Five new admin commands, all additive and all needing the `Security` privilege, which each one checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off (octeth/oempro#3521). No existing command changes.

- `admin.security.settings.get` returns the admin area IP allow-list (`AdminAllowedIPs`, a list), `AdminAllowedIPsStoredBlank` (the stored value holds only blank lines, which the admin sign-in enforces as "nobody but the server itself"), `PreventUserLoginFromAlienIPs`, `AdminAPIEnforceAllowedIP`, the caller's address as the admin sign-in sees it (`CallerIP`) and whether the list admits it (`CallerAllowed`).
- `admin.security.settings.update` takes `AdminAllowedIPs` (one IP address or IPv4 CIDR range per line), `PreventUserLoginFromAlienIPs` or both. It writes the same column and option `settings.update` writes. A list that does not admit the caller is refused with error `4` unless `ConfirmLockout` is `true`. Error codes: `1` an invalid entry (`InvalidEntries`), `2` a non-boolean flag, `3` nothing sent, `4` lockout, `5` too many entries. Refused in demo mode. Rate limit 20 requests per 300 seconds.
- `admin.remembertokens.get` lists every administrator's remembered sign-ins of the classic admin area: the owner, created, last used and expiry dates (UTC) and the browser. Never the token or its hash.
- `admin.remembertoken.revoke` takes `TokenID` and revokes one. Error codes: `1` missing, `2` not a positive whole number, `3` gone already, `4` not revoked. Refused in demo mode. Rate limit 30 requests per 300 seconds.
- `admin.remembertokens.revokeall` revokes every remembered sign-in, the caller's included. Refused in demo mode. Rate limit 10 requests per 300 seconds.

The upgrade adds a `UserAgent` column to `oempro_admin_remember_tokens` (a small table, an instant change).

### Log file commands

Four new admin commands, all additive and all needing the `Settings` privilege, which each one checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off (octeth/oempro#3522). No existing command changes. They reach only the regular files directly inside `data/logs` and `system/storage/logs`: a path outside them, a `../` path or a symlink that leads outside them is refused with error `2` and logged with the administrator's ID. Log files can hold request parameters and personal data, so grant `Settings` with that in mind.

- `admin.logs.get` takes `Days` (1 to 3650, default 30) and lists the files that changed in that period, newest first, with name, path, source, type, size and modification time. Rate limit 100 requests per 60 seconds.
- `admin.log.tail` takes `File` and `Lines` (1 to 1000, default 100) and returns the last lines as text, reading at most 1 MB from the end of the file. Rate limit 100 requests per 60 seconds.
- `admin.log.read` takes `File`, `Offset` and `Length` (at most 1 MB) and returns that chunk base64-encoded with `Offset`, `Length`, `Size` and `EOF`, so a file of any size downloads chunk by chunk. Rate limit 2000 requests per 60 seconds.
- `admin.log.truncate` takes `File` and empties it. It is logged with the administrator's ID and refused in demo mode. Rate limit 10 requests per 300 seconds.

### AI assistant connector

#### New root-level paths `/mcp`, `/oauth/` and `/.well-known/oauth-*` are served by the new user interface

v6.0.2 adds a built-in connector so customers can connect Claude, ChatGPT and other AI assistants that support remote MCP connectors to their account with one URL, `https://<app domain>/mcp`, and their normal sign-in (issue #3369). The assistant gets read-only access. See [Connect Claude or ChatGPT](/v6.0.2/new-user-interface/ai-assistants).

The connector requires an app domain reachable from the internet over `https://`. The bundled HAProxy now sends `/mcp`, `/oauth/`, `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` to the interface container instead of the classic application. These paths sit at the root of the app domain, not under `/user/`.

**`MCP_ENABLED` turns the connector off.** It is a new `.oempro_env` setting, `true` by default and in the shipped example, so the connector is on after an upgrade. Set it to `false` (or `0`, `no`, `off`, in any case) and HAProxy answers 404 for `/mcp`, `/oauth/` and `/.well-known/oauth-`, the interface answers 404 for the same routes, and `/llms.txt` leaves out its connector section. The rest of the interface is unaffected, and agent keys keep working against the HTTP API. Recreate the HAProxy and interface containers after changing it (`./cli/octeth.sh docker:up`). See [the configuration page](/v6.0.2/getting-started/octeth-configuration) (octeth/oempro#3494).

Approving a connection creates a user API key with the note `AI connector: <assistant name>`. These keys appear in `user.apikey.list` responses and on the customer's API keys page, and deleting one disconnects that assistant. A customer can connect an assistant only when their plan includes API access. Staff connect operator assistants with their own login, two-factor authentication included (octeth/oempro#3406), but not while impersonating a customer.

The connector's token signing keys, `ui/storage/oauth-private.key` and `ui/storage/oauth-public.key`, are created once by the interface container and kept across upgrades. Losing either file disconnects every assistant. See [AI assistant connector](/v6.0.2/new-user-interface/configuration-reference#ai-assistant-connector) in the configuration reference.

#### AI agent keys: scopes, budgets, an operator policy and a confirm step

v6.0.2 also adds AI agent keys (issue #3373). A key created with `IsAgentKey` (every connector connection, and the headless agent keys customers create under Connected AI assistants) is limited to the scopes the customer granted (`read`, `write`, `send`) and to per-key budgets, capped by a new AI agent access section on each user group in the admin area. Refusals use the new error codes `100010` to `100016`. See [AI agent keys](/v6.0.2/api-reference/users#ai-agent-keys).

- Existing user groups get `AgentAccess = read`, so AI agents can read but not change data or send until you allow it on the user group.
- Keys created by the connector before the upgrade become read-only agent keys the first time the connector uses them after the upgrade, which is what their consent screen promised.
- An agent key can call only an explicit allow-list of commands (lists, subscribers, segments, templates, campaign content and delivery, journey on, off and trigger, and the reads that go with them). Every other command, including every admin, plug-in, credential and webhook command, is refused with `ErrorCode 100010`. Some parameters with side effects (list sync settings, remote content URLs and tags, auto-resend and recurring schedules, bulk unsubscribe, file and remote imports, and lists or segments of another account) are refused with `ErrorCode 100016`. See [AI agent keys](/v6.0.2/api-reference/users#ai-agent-keys) for the list.
- An agent key needs the `send` scope to add, change or unsubscribe subscribers, because those actions can send opt-in confirmations, autoresponders and journey emails.
- In `user.apikey.list`, rows of agent keys gain `IsAgentKey` and `Agent`. Rows of ordinary keys, and every response for ordinary keys, are unchanged.
- An agent key can delete an email it created in the last 15 minutes that nothing uses (`Email.Delete`), and can send `AgentDryRun=1` to check a request against the agent policy without running it (issue #3390). The built-in connector's `create_campaign` and `update_campaign` tools use both, so a refused call leaves no empty email behind.
- An agent can confirm its own sends, so treat the user group's daily send and recipient caps as the limit that matters.

#### Operator AI assistants can help set up delivery servers, user groups and mailboxes

v6.0.2 lets an operator AI assistant (an admin agent key with `admin:act`) take part in setting up an install (issue #3387): read the setup status, create and test delivery servers, create user groups, assign a delivery server to a group and turn on the bounce and FBL mailboxes. Every action waits for the operator's confirmation and is logged. See [Setup actions](/v6.0.2/api-reference/admin#setup-actions) and [Setup](/v6.0.2/api-reference/setup).

- The assistant can repoint or test only a delivery server it created itself and that nothing uses yet. A server you created, or one a user group, user, delivery route, segment or IP pool refers to, keeps its host, port, credentials and domains, and only its name and timeout can change. Testing pins the connection to the public address that was checked.
- The assistant can assign a delivery server only to a user group with no users that receives users only by your hand. The signup group, the groups a signup picks from and every billing plan, signup, suspension, cancellation and default group of the new user interface stay manual. An assignment that does not come through the interface's built-in connector is refused.
- The assistant can only make a user group's sender screening stricter: a mode moves from `off` to `flag` to `hold`, and a threshold only goes down and never to 0. Loosening screening, the screening lists and releasing a held item stay in the admin area.
- Nothing the assistant can call reads or writes `.oempro_env` or restarts a container.

### Sender screening

#### Signups, list imports and campaign sends are screened and fed to the risk digest

v6.0.2 screens three points with fixed rules (issue #3392): every new account, a finished list import, and every campaign send at the moment it starts. Each result is stored in the new `oempro_screening_results` table, shown in `admin.risk.user` under `Screening`, and adds the `signup_screening`, `import_screening` and `content_screening` rules to the risk score. See [Sender Screening](/v6.0.2/api-reference/admin#sender-screening).

- Signup and list import screening only flag by default, so no signup or import is held after the upgrade until you set a user group's screening mode to hold.
- Campaign content screening is off by default for every user group, existing and new, so the upgrade adds no SpamAssassin run to campaign sends. Turn it on per group with `ScreeningContentMode` `flag` or `hold` (`UserGroup.Update`, `UserGroup.Patch`, or the sender screening section of the user group page in the admin area). Every mode parameter also accepts `off`.
- Every new account (`User.Create`, the public sign-up page and SSO) is screened with local checks only: the disposable list, one DNS query for the email domain's mail servers (2 seconds at most), sign-ups from the same IP and suspended accounts on the same domain. No response changes and no outbound HTTP request runs during a sign-up.
- The registration date lookup at `rdap.org` and the fetch of the website given at sign-up are off by default. Turn them on with `admin.screening.settings.update` `SignupExternalLookups`. They then run a few minutes after the sign-up in the new `cli/signup_screening.php` cron (every five minutes), and read at most 256 KB of a page.
- Campaign content is screened by the campaign picker when a campaign starts sending (immediate, scheduled, resumed, recurring, auto-resend and A/B winner sends), on the emails and lists that send delivers, with one SpamAssassin run. `Campaign.Update` does not screen and its response is unchanged. In hold mode a flagged send moves to `Pending Approval` with the reason in `Options.ScreeningHold`, and the administrators are told in the same summary email as the approval holds. `Campaign.Approve` releases it and records the approved version (the same approval that covers `Untrusted` accounts' campaigns), so that version is not screened or held again, and removes `Options.ScreeningHold`. In hold mode, `email.update` refuses to change an email that a sending campaign uses (`ErrorCode` 22, the email is left unchanged), and a change to an email that a `Ready` or `Paused` campaign uses removes that campaign's approval, so it is screened again when it starts or resumes.
- `subscribers.import.get` adds `ImportJob.Screening` for a held import. Bounce and complaint history from other accounts, and links reused from suspended accounts, only flag for the operator: they never hold an import or a campaign and never appear in the reason the customer reads.
- New admin commands: `admin.screening.release`, `admin.screening.settings.get` and `admin.screening.settings.update`. User group commands accept six `Screening*` parameters.

### Email gateway for AI agents

#### AI agent keys can send through the email gateway and manage sending domains

- AI agent keys can use the email gateway (octeth/oempro#3320). `EmailGateway.SendEmail` accepts an agent key with the `send` scope whose user group has `EmailGateway.ManageDomain`, resolves the sender domain from the From address and runs the send checks first, so the agent never holds a sender key and no sender key is created for it. Agent keys can also list, add and verify sending domains, read events, list suppressions, and manage and test event webhooks. Removing a suppressed address needs the `send` scope and always asks for confirmation. `EmailGateway.GetWebhooks` leaves out `SigningKey` and masks webhook URLs for an agent key, and `IncludeDiagnostics` returns no resolved DNS values to one. Sender keys, SMTP credentials and signing key rotation stay unavailable to agent keys.
- New opt-in parameters: `IncludeSendingState` on `user.current`, `IncludeDiagnostics` on `emailgateway.verifydomain`, `ExactMessageID` on `emailgateway.getevents` and `IdempotencyKey` on `emailgateway.sendemail` (new error codes 41 to 44). Responses without them are unchanged. New command `emailgateway.testwebhook` posts a signed sample event to a webhook.

### Reviewing campaigns pending approval

- `admin.campaigns.search` accepts `ApprovalContext=true`, which adds `FromName`, `FromEmail`, `Subject`, `ApprovalFingerprint` and `ScreeningHold` to every row. With the flag the page is capped at 25 rows (`RecordsPerRequest` 0, absent or above 25 returns 25), because every row computes the campaign's approval fingerprint. Without the flag the response is unchanged.
- New `admin.campaign.reject` sends a `Pending Approval` campaign back to `Draft`, removes any recorded approval, clears its content screening hold and can email the owner. It needs the `Reports` privilege, and `User.Edit` as well when it sends a message, so a sub-admin who could not use `admin.user.message.send` cannot email a customer through it. It requires `ExpectedFingerprint`, is limited to the user groups of a restricted sub-admin, and is refused to AI assistant keys like `campaign.approve`. Each rejection is written to the application log at NOTICE level with the admin, campaign and owner ids and whether a message was sent.
- New `admin.campaign.preview` returns a campaign's email as stored, with its `ApprovalFingerprint`, only for campaigns the admin may reach. Use it instead of `admin.email.get`, which loads any email on the install by id. `HTMLContent` is the customer's HTML: render it only in a sandboxed iframe.

### New index on oempro_stats_bounce

The upgrade adds the index `idx_bouncedate_owner (BounceDate, RelOwnerUserID)` to `oempro_stats_bounce` for the windowed dashboard leaderboards. It is built online (`ALGORITHM=INPLACE, LOCK=NONE`), so sending and reporting keep running, but on an install with tens of millions of bounce records the build takes several minutes and the upgrade waits for it (octeth/oempro#3501).

## Upgrade checklist

- If you added `192.168.99.100` to an admin or user IP allow-list as a workaround for every visitor showing that address, replace it with your real public addresses after upgrading, because visitors now resolve to their own address.
- If a subscription plan had more than one default user group, the upgrade kept the one with the lowest `UserGroupID` and logged the others. Search the application log for `Migration #3181` to see which groups were demoted, and check each affected plan's default on the admin user group screens.
- If you set `EMAILGATEWAY_DNS_TRACK_PREFIX` to your campaign prefix as a workaround for journey and Email Gateway links leaving your sender domains, you can keep it or restore the previous value. Sender domains created on the Sender Domains page use their own verified tracking host again either way.
- SMS content that still uses the v6.0.0 `{CustomField7}` merge tags sends correctly again, so it no longer has to be rewritten before the upgrade. Move it to <code v-pre>{{ Subscriber:CustomField7 }}</code> when convenient, because the single-brace form is deprecated.
- Set `EMAILGATEWAY_SMTP_HOST` in `.oempro_env` to the SMTP host your customers use, then run `./cli/octeth.sh smtp:sync-config`.
- If you run your own reverse proxy, load balancer or CDN in front of Octeth with path-based rules, forward `/mcp`, `/oauth/`, `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` to Octeth, or the AI assistant connector cannot be reached.
- Review the new sender screening section on each user group, and choose hold for the points where you want items stopped for review. Campaign content screening is off until you choose flag or hold for it. Add protected brands and spam-trap patterns with `admin.screening.settings.update` if you use those rules.
- Review the new AI agent access section on each user group. Agents are read-only until you choose `write` or `send` and set the daily send and recipient caps you want.
- Run `./cli/octeth.sh users:orphans` once to see the lists, segments, subscriber tables and themes that earlier user and user group deletions left behind. It changes nothing unless you add `--delete --yes`.
- If you rely on administrators approving the campaigns of `Untrusted` accounts, expect one summary email after the upgrade listing the campaigns approved before it, which are held once more when they next come up to send.
- Add `ui/storage/oauth-private.key` and `ui/storage/oauth-public.key` to your backups, and keep them when moving Octeth to another server.
- If you blocked SMS for a user group by setting its SMS limits for Hour, Day, Week, Month and Year to `0` with Minute left at `-1`, the upgrade rewrites that group to unlimited. Set its limits again after upgrading, with Minute `0` as well.
- Users whose time zone was reset to "(GMT-10:00) Hawaii" by an admin save of a "US & Canada" time zone must have it set again. The upgrade repairs only values still stored as `&amp;`.
- The new user interface is always on after the upgrade, and the upgrade deletes any `UI_ENABLED` line from `.oempro_env`. If your install had it off, `/user/`, `/ui/`, `/livewire-` and the AI assistant connector paths become reachable from the internet: add `MCP_ENABLED=false` before upgrading to keep the connector off, check the server's memory against [Server Requirements](/v6.0.2/getting-started/server-requirements), and point any path-based rules in your own reverse proxy at Octeth for those paths. Move any plugin that used the removed user page hooks to `Admin.User.PluginFields` and `Admin.User.PluginActions`.
- Remove any calls to the `postmaster.*` commands. They answer `ErrorCode: 99` in v6.0.2 and will be deleted later.
- The upgrade leaves `GOOGLE_POSTMASTER_CLIENT_ID`, `GOOGLE_POSTMASTER_CLIENT_SECRET` and `GOOGLE_POSTMASTER_REDIRECT_URI` in your `.oempro_env`. Nothing reads them any more, so you can delete them.
- Octeth does not revoke the OAuth grant you gave it in your Google account. Revoke it there, under your Google account's third-party access settings, and delete the OAuth client in Google Cloud if nothing else uses it.
- If an administrator has `AccessLimited` off but still carries `AccessAllowedUserGroupIDs`, `admin.subscriber.search` now shows them every list. Turn `AccessLimited` on for that administrator if the limit was intended.
- Update bookmarks to the classic Subscriber Email Search: `/app/admin/subscribersearch/` redirects to the staff Subscriber search.

---

Previous releases: [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
- On an install with tens of millions of bounce records, allow several extra minutes for the upgrade while it builds the new `idx_bouncedate_owner` index on `oempro_stats_bounce` online. Sending and reporting keep running during the build.
