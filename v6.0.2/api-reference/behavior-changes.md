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

### Sub-admin accounts (escalation guard)

#### A sub-admin can no longer grant access it does not hold

Until this release a sub-administrator holding `SubAdmins` could create an account with every privilege, add privileges to their own account, or set a new password on a more privileged sub-admin and sign in as them (octeth/oempro#3525). The `admin.subadmin.*` commands now refuse that for any caller whose account has `Options.AccessLimited`:

| Code | Refused when | Commands |
|---|---|---|
| `5101` | The target is the caller's own account. Its name, email and password are changed with `admin.update` (Your profile) | `.update`, `.delete`, `.apikey.regenerate`, `.apikey.revoke`, `.2fa.reset`, `.signins.revoke` |
| `5102` | The target holds a privilege the caller lacks, or reaches a user group the caller cannot reach (every group included) | the same six |
| `5103` | `Permissions.AccessOptions` names a privilege the caller does not hold | `.create`, `.update` |
| `5104` | The caller is limited to some user groups and `Permissions.AccessAllowedUserGroupIDs` is empty (every group) or names a group outside its own | `.create`, `.update` |

`admin.subadmin.delete` checks every listed id first and deletes nothing when one is refused; the refusal names it in `RefusedAdminID`. Before, a restricted caller's own id was skipped and reported in `SkippedAdminIDs`.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, and every administrator without `Options.AccessLimited`. Their responses are unchanged. `admin.subadmins.get` and `admin.subadmin.get` stay readable to any `SubAdmins` holder.

**Who needs to act:** an integration that uses a sub-admin's own API key holding `SubAdmins` to create or edit accounts with wider access. Use the master key for that, or give the integration's account the privileges and user groups it hands out.

#### `SubAdmins` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

The `admin.subadmin.*` commands relied on the registry's privilege tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session could call them. Each handler now checks `SubAdmins` itself and answers `99999` without it, as the newer staff commands do (#3521, #3522). The legacy Sub Admin Accounts screen always required `SubAdmins`, so the API now matches what the screen allowed.

### Campaign report commands (privilege check)

#### `Reports` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`admin.campaigns.search`, `admin.campaigns.statuscounts`, `admin.campaigns.timeseries`, `admin.campaigns.export`, `admin.campaign.unstuck`, `admin.campaign.markfailed` and `admin.campaign.retryfailed` relied on the registry's `Reports` tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session could call them (octeth/oempro#3528). Each handler now checks `Reports` itself and answers `ErrorCode 99999` ("Not enough privileges") without it, as the newer staff commands do (#3521, #3522, #3525). The legacy Campaign Report screen always required `Reports`, so the API now matches what the screen allowed.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, and every administrator without `Options.AccessLimited`. Their responses are unchanged, and so are the responses of a sub-admin who holds `Reports`.

**Who needs to act:** an integration that calls these commands with the session or API key of a sub-admin without `Reports`. Give that account `Reports`, or use the master key.

### List freshness (privilege check)

#### `Reports` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`admin.lists.freshness` and `admin.lists.freshness.detail` relied on the registry's privilege tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session or API key could read the report. Each handler now checks `Reports` itself and answers `99999` without it, as the other staff commands do (#3521, #3522, #3525). The legacy List Freshness screen always required `Reports`, so the API now matches what the screen allowed (octeth/oempro#3529).

**Not affected:** the master admin, the master `ADMIN_API_KEY`, every administrator without `Options.AccessLimited`, and every sub-admin holding `Reports`. Their responses are unchanged.

**Who needs to act:** an integration that reads the report with a sub-admin's key or session lacking `Reports`. Grant that account `Reports`, or use the master key.

### Sender domain health (privilege check)

#### `User.Edit` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`admin.senderdomains.health.get` and `admin.senderdomain.recheck` relied on the registry's `User.Edit` tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session could read every account's sender domains and owners and queue DNS checks. Each handler now checks `User.Edit` itself and answers `99999` (`Not enough privileges`) without it, as the newer staff commands do (#3521, #3522, #3525) (octeth/oempro#3527). The classic Sender Domain Health page always required `User.Edit`, so the API now matches what the page allowed.

The check runs first, so it also applies to `admin.senderdomains.health.get` with `SummaryOnly=true`. The staff dashboard already hides its **Sender domains** section from administrators without `User.Edit`, so it is unaffected.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, and every administrator without `Options.AccessLimited`, or holding `User.Edit`.

**Who needs to act:** an integration that calls either command with the key or session of a sub-admin who does not hold `User.Edit`. Grant that account `User.Edit`, or use a key that has it.

### SSO sources (privilege check)

#### `Settings.SSO` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`ssosources.get`, `sso.get`, `sso.create`, `sso.update`, `sso.delete`, `sso.stats.get` and `sso.keys.regenerate` relied on the registry's `Settings.SSO` tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session could read the keys of every SSO source and sign anyone in. Each handler now checks `Settings.SSO` itself and answers `99999` (`Not enough privileges`) without it, as the newer staff commands do (#3521, #3522, #3525) (octeth/oempro#3540). The classic Single Sign On screen always required `Settings.SSO`, so the API now matches what the screen allowed. In `sso.keys.regenerate` the check runs before the demo-mode refusal.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, and every administrator without `Options.AccessLimited`, or holding `Settings.SSO`.

**Who needs to act:** an integration that calls an SSO command with the key or session of a sub-admin who does not hold `Settings.SSO`. Grant that account `Settings.SSO`, or use a key that has it.

### Delivery servers (privilege check)

#### `DeliveryServers` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`deliveryserver.create`, `deliveryserver.update`, `deliveryserver.clone`, `deliveryservers.delete`, `deliveryserver.get` and `deliveryserver.verify` relied on the registry's `DeliveryServers` tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session could add, repoint or delete the servers every user group sends through. Each handler now checks `DeliveryServers` itself and answers `99999` (`Not enough privileges`) without it, as the newer staff commands do (#3521, #3525, #3540) (octeth/oempro#3550). The classic Delivery servers screen always required `DeliveryServers`, so the API now matches what the screen allowed. In `deliveryserver.verify` the check runs before the demo-mode refusal.

`deliveryservers.get` is unchanged: the classic Email delivery and Segments screens list the servers for admins who hold `Settings` or `Settings.Segments` but not `DeliveryServers`.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, and every administrator without `Options.AccessLimited`, or holding `DeliveryServers`.

**Who needs to act:** an integration that calls one of these commands with the key or session of a sub-admin who does not hold `DeliveryServers`. Grant that account `DeliveryServers`, or use a key that has it.

### SMS gateways (privilege check)

#### `DeliveryServers` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`smsgateway.connectors.get`, `smsgateways.get`, `smsgateway.get`, `smsgateway.create`, `smsgateway.update`, `smsgateways.delete`, `smsgateway.testconnection`, `smsgateway.users.get` and `smsgateway.users.assign` relied on the registry's `DeliveryServers` tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session could create, change or delete SMS gateways and replace their provider keys. Each handler now checks `DeliveryServers` itself and answers `99999` (`Not enough privileges`) without it, as the newer staff commands do (octeth/oempro#3551). The classic SMS Gateways screen always required `DeliveryServers`, so the API now matches what the screen allowed. In the four commands that refuse in demo mode the check runs before the demo-mode refusal.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, and every administrator without `Options.AccessLimited`, or holding `DeliveryServers`.

**Who needs to act:** an integration that calls an SMS gateway command with the key or session of a sub-admin who does not hold `DeliveryServers`. Grant that account `DeliveryServers`, or use a key that has it.

### Plugins (privilege check)

#### `Settings` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`admin.plugins.get`, `admin.plugin.enable` and `admin.plugin.disable` relied on the registry's `Settings` tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session could disable a plugin, which for most plugins deletes its tables and settings. Each handler now checks `Settings` itself and answers `99999` (`Not enough privileges`) without it, as the newer staff commands do (#3521, #3522, #3525) (octeth/oempro#3553). The classic Plugins page always required `Settings`, so the API now matches what the page allowed. In `admin.plugin.enable` and `admin.plugin.disable` the check runs before the demo-mode refusal.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, and every administrator without `Options.AccessLimited`, or holding `Settings`.

**Who needs to act:** an integration that calls a plugin command with the key or session of a sub-admin who does not hold `Settings`. Grant that account `Settings`, or use a key that has it.

### Email suppression (privilege check)

#### `Suppression` is checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off

`global.suppression.browse`, `global.suppression.search`, `global.suppression.stats`, `global.suppression.delete`, `suppression.patterns.get`, `suppression.pattern.add` and `suppression.pattern.delete` relied on the registry's `Suppression` tag, which is enforced only when `ADMIN_API_ENFORCE_PRIVILEGES` is on, so with it off any sub-admin session could unblock an address for every account or add a pattern that blocks thousands. Each handler now checks `Suppression` itself and answers `99999` (`Not enough privileges`) without it, as the newer staff commands do (#3521, #3522, #3525) (octeth/oempro#3559). `suppression.import` does the same under admin authentication only, where it writes system-wide rows. The classic Email Suppression List screen always required `Suppression`, so the API now matches what the screen allowed. In `global.suppression.delete`, `suppression.pattern.add` and `suppression.pattern.delete` the check runs before the demo-mode refusal.

**Not affected:** the master admin, the master `ADMIN_API_KEY`, every administrator without `Options.AccessLimited`, or holding `Suppression`, and every `suppression.import` call made with a user key or session.

**Who needs to act:** an integration that calls one of these commands with the key or session of a sub-admin who does not hold `Suppression`. Grant that account `Suppression`, or use a key that has it.

### Global segments (rule values)

`global.segment.create` and `global.segment.update` refuse a rule value that contains a sequence the stored rule string uses as a delimiter (`,,,`, `]||[`, `,::,`, `,#,`, `!))`, `((!`, `[[` or `]]`) with the new error code `9`, "A rule value contains a reserved character sequence". Before, such a value was stored and then read back as a different rule, so the segment silently matched other subscribers than intended. In the stored-string form of `SegmentRules`, an information rule that does not come apart into exactly a field, an operator and a filter is refused the same way. A request without such a value behaves as before (octeth/oempro#3571).

`global.segment.update` now keeps a legacy `ListID` rule that is already stored on the segment when the request sends it back unchanged. Before, such a request was refused with error `5`, so a segment holding one could not be saved with rules at all. A new or changed `ListID` rule is still refused.

### Global segments (send-time routing of grouped rules)

A global segment whose rules hold groups now routes the same subscribers at send time as its subscriber count shows. Before, the send-time check evaluated groups wrongly for segments without Opens, Clicks, Browser views or Forwards rules: with "Match any" a group never matched, so a subscriber who matched only through a group was sent through the default delivery server instead of the segment's server, and with "Match all" a group that matched made every later group match too, so subscribers outside the segment were routed through its server. Each group is now evaluated on its own, with the inverse of the segment operator inside the group, as the subscriber count already did. A segment with a rule whose operator the send-time check did not evaluate, such as `In the last X days`, is now decided by the same query as the subscriber count. Before, such a rule was ignored at send time. The same check decides which subscribers an autoresponder limited to a list segment sends to, so those segments change the same way there. Segments without groups and with only the simple operators are unchanged. Installs with such segments can see some recipients move to or from a segment's delivery server after the upgrade. There is no opt-in flag, because the old result disagreed with the segment's own rules (octeth/oempro#3573).

### Global segments (which segment routes a recipient)

When a recipient matches more than one global segment, campaigns, autoresponders and transactional email now use the segment with the lowest ID among those that route the account's user group to an existing delivery server. Before, the segment with the highest matching ID won, and a matching segment that had no delivery server for the account's user group stopped an earlier segment from routing the recipient, so the recipient went through the user group's own server. A segment without a delivery server for the user group is now skipped. The staff **Segment routing** list shows the segments in this order, oldest first, instead of by name. Installs with overlapping segment routing rules can see recipients move to a different delivery server after the upgrade. There is no opt-in flag, because the old order was not the documented rule and staff could not see it (octeth/oempro#3572).

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

- **Your own two-factor authentication** is the **Two-factor authentication** section of [Your profile](/v6.0.2/new-user-interface/staff-profile) (`/<UI_STAFF_PREFIX>/staff/profile?section=two-factor`). It is shown to every administrator, whatever their privileges, and the 2FA commands need no privilege (octeth/oempro#3566).
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

There is no opt-in flag: the page is removed, and its URLs answer as above. `settings.update` and `settings.get` are unchanged, the `admin.2fa.*` commands no longer need `Security` (see "Admin two-factor authentication (self-service)" under Tier 2), and the five new commands are listed under "Additions" below.

#### The legacy admin Log Observer is removed

The legacy admin **Log Observer** (`/app/admin/logobserver/`), an item of the classic **Settings** sidebar, is removed. Listing, reading, downloading and emptying log files is on the **Logs** screen of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/logs`) (octeth/oempro#3522). The screen needs the `Settings` privilege, as the page did.

**The old URL keeps working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/logobserver/`, anything under it | 302 to `/<staff>/staff/logs` |

A POST to it, including the old `x_tail` and `x_truncate` calls, is refused: nothing is read or emptied, and the answer is a short page that links to the new screen. The old `x_list_files` and `x_download` GET actions redirect to the screen and no longer return a file list or a file.

The classic **Settings** sidebar's **Logs** item (formerly **Log Observer**) opens the new screen. The top-right **Settings** link no longer considers the Log Observer as a landing page, which changes nothing in practice, because every section before it needs `Settings` too.

There is no opt-in flag: the page is removed, and its URL answers as above. The four new commands are listed under "Additions" below.

#### The legacy admin Sub Admin Accounts section is removed

The legacy admin **Sub Admin Accounts** section (`/app/admin/subadmins/`), an item of the classic **Settings** sidebar, is removed. Sub-admin accounts are managed on the new [Sub-admins screen](/v6.0.2/new-user-interface/staff-sub-admins) of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/sub-admins`), which needs the `SubAdmins` privilege, as the section did (octeth/oempro#3525).

**The old URLs keep working.** The section is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/subadmins/`, anything under it not listed below | 302 to `/<staff>/staff/sub-admins` |
| `/app/admin/subadmins/create/` | 302 to `/<staff>/staff/sub-admins/new` |
| `/app/admin/subadmins/edit/<id>` | 302 to `/<staff>/staff/sub-admins/<id>/edit` |

A POST to any of these URLs, including the old create, edit, bulk delete and API key forms, is refused: nothing is saved, and the answer is a short page that links to the new screen.

**What changed on the way:**

- **No JSON editor.** Privileges are checkboxes grouped by area, each with a one-line description, and user groups are a list of checkboxes where none ticked means every group.
- **The API key is shown once.** The legacy edit page printed the stored key on every visit. The new screen shows a key only right after it is issued or rotated, and "Issued" afterwards.
- **New per-account actions.** Reset two-factor authentication for a sub-admin who lost their authenticator, and sign a sub-admin out of every remembered browser without revoking every administrator's.
- **A deleted user group stays visible.** A stored group id that no longer exists is listed as "Deleted group #N" and kept on save unless you untick it, so saving never widens an account to every group.

#### The legacy admin Campaign Report is removed

The legacy admin **Campaign Report** (`/app/admin/campaignreport/`), an item of the classic **Reports** menu, is removed. The report is the **Campaigns** screen in the **Reports** group of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/reports/campaigns`), see [The Staff Campaign Report](/v6.0.2/new-user-interface/staff-campaign-report) (octeth/oempro#3528). It needs the `Reports` privilege, as the page did, and a sub-admin limited to some user groups sees only those groups' campaigns.

**The old URLs keep working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/campaignreport/` | 302 to `/<staff>/staff/reports/campaigns` |
| `/app/admin/campaignreport/browse/<page>/<rows>/ByStatus/<bucket>/<sort>/<direction>` | 302 to the screen with the bucket, page, page size (10, 25, 50 or 100) and sort (Started, Recipients or Failed) carried over |
| `/app/admin/campaignreport/chartdata/...`, `/app/admin/campaignreport/exportcsv/` | 410 Gone, with a link to the screen |

A POST to any of these URLs, including the old `unstuck`, `markfailed` and `retryfailed` AJAX calls and the CSV export form, is refused: nothing runs, and the answer is a short page that links to the new screen.

The classic admin header's **Reports > Campaign Report** item opens the new screen.

**What changed on the way:**

- **A search the server cannot read is an error.** The legacy page listed every campaign when the advanced search could not be translated. The new screen shows the error under the search box and lists nothing until the search is fixed.
- **The account filter searches.** The legacy page loaded up to 10,000 accounts into a drop-down. The new filter searches accounts by name, company or email address.
- **The CSV export is capped.** The legacy download had no row limit. The new one is built by `admin.campaigns.export` and holds at most `CAMPAIGN_EXPORT_MAX_ROWS` rows (default 10000).
- **Recovery actions are confirmed and audited.** Unstuck, Mark failed and Retry failed recipients each ask first, and each one is recorded in the staff audit log.

There is no opt-in flag: the page is removed, and its URLs answer as above.

#### The legacy admin List Freshness report is removed

The legacy admin **List Freshness** report (`/app/admin/listfreshness/`), an item of the classic **Reports** menu, is removed. The report is the [List freshness](/v6.0.2/new-user-interface/staff-list-freshness) screen of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/reports/list-freshness`), under the new **Reports** group of the staff sidebar (octeth/oempro#3529). The screen needs the `Reports` privilege, as the report did, and a sub-administrator limited to some user groups still sees only the users of those groups.

**The old URLs keep working.** The report is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/listfreshness/`, anything under it not listed below | 302 to `/<staff>/staff/reports/list-freshness` |
| `/app/admin/listfreshness/browse/<field>/<direction>` | 302 to the same screen with the sort kept: `WorstFreshness`, `User`, `TotalLists` and `LastActivity` become `?sort=status`, `user`, `lists` and `activity`, and `ASC` or `DESC` becomes `&dir=asc` or `desc`. An unknown field opens the default sort |
| `/app/admin/listfreshness/detail/<userId>` | 302 to `/<staff>/staff/reports/list-freshness/<userId>` |

A POST to any of these URLs is refused with a short page that links to the new screen. The classic admin **Reports > List Freshness** menu item opens the new screen.

**What changed on the way:**

- **Status tiles filter the table.** Click a tile to show only the users in that status, and click it again to show everyone. The user's page filters its lists the same way.
- **No "Login as" link.** The user's name opens their freshness page, and the person icon opens the staff user page, where switching to the user already lives. The icon shows only to administrators with the `Users` and `User.Browse` permissions.
- **The thresholds are edited in the new interface.** The screen states the thresholds in use and, for administrators with the `Settings` privilege, links to the List freshness section of [Preferences](/v6.0.2/new-user-interface/staff-preferences#list-freshness) (octeth/oempro#3537).
- **Opening a user's page is recorded in the staff audit log** (`reports.list_freshness.view`), as a subscriber search is.

#### The legacy admin Sender Domain Health report is removed

The legacy admin **Sender Domain Health** report (`/app/admin/senderdomainhealth/`), an item of the classic **Reports** menu, is removed. The report is the [Sender domain health](/v6.0.2/new-user-interface/staff-sender-domain-health) screen of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/reports/sender-domains`), under the new **Reports** group of the staff sidebar (octeth/oempro#3527). It needs the `User.Edit` privilege, as the page did, and a sub-admin limited to some user groups still sees and re-checks only the domains of accounts in those groups.

**The old URLs keep working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/senderdomainhealth/?<filters>` | 302 to `/<staff>/staff/reports/sender-domains?<filters>` |
| `/app/admin/senderdomainhealth/index/<page>?<filters>` | 302 to the same screen with `page=<page>` added |
| `/app/admin/senderdomainhealth/recheck/` and anything else under it | 302 to `/<staff>/staff/reports/sender-domains` |

The filters `health`, `status`, `userid` and `domain` keep their names and are carried over when their value is valid; an invalid value is dropped. A POST to any of these URLs, including the old **Re-check now** form, is refused: no DNS check is queued, and the answer is a short page that links to the new screen.

The classic **Reports > Sender Domain Health** menu item opens the new screen, and the staff dashboard's **Sender domains** section links each health class to it in place instead of to the classic report in a new tab.

**What changed on the way:**

- **Filters apply as you choose them** and stay in the address, so a filtered view can be bookmarked.
- **Re-check now reports in place.** Success, the rate limit (60 re-checks a minute per administrator) and "not checked in this status" are shown as a message on the screen, the button is disabled while a re-check runs, and the same domain is not queued twice within a minute. Every re-check writes a staff audit row.
- **Refresh** reads the list again, instead of reloading the page.

There is no opt-in flag: the page is removed, and its URL answers as above.

#### The legacy admin SMS Campaigns page is removed

The legacy admin **SMS Campaigns** page (`/app/admin/smscampaigns/`), an item of the classic **Reports** menu, is removed. It is the **Campaigns** screen of the new **SMS** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/sms/campaigns`) (octeth/oempro#3533). It needs the `SMS` and `Settings` privileges, as the page did.

**The old URLs keep working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/smscampaigns/?<filters>` | 302 to `/<staff>/staff/sms/campaigns?<filters>` |
| `/app/admin/smscampaigns/index/<page>?<filters>` | 302 to the same screen with `page=<page>` added |
| `/app/admin/smscampaigns/pause/`, `/cancel/` and anything else under it | 302 to `/<staff>/staff/sms/campaigns` |

The filters `FilterUser`, `FilterStatus` and `FilterGateway` keep their names and are carried over. A POST to any of these URLs, including the old **Pause** and **Cancel** forms, is refused: no campaign changes, and the answer is a short page that links to the new screen.

The classic **Reports > SMS Campaigns** menu item opens the new screen.

**What changed on the way:**

- **A sub-administrator limited to some user groups now sees, pauses and cancels only the campaigns of accounts in those groups.** The classic page listed and changed every account's campaigns whatever the limit.
- **Pause and Cancel ask for confirmation** in a dialog that names the campaign and the account, and every change writes a staff audit row.
- **Pressing Pause on a paused campaign, or Cancel on one that is already cancelling, changes nothing and says so,** instead of reporting that the campaign changed status.
- **Cancelling a draft records when it was cancelled** (`CompletedAt`), as the account owner's own cancel does.
- **Filters apply as you choose them** and stay in the address, so a filtered view can be bookmarked.

There is no opt-in flag: the page is removed, and its URL answers as above.

#### The legacy admin Inbound SMS page is removed

The legacy admin **Inbound SMS** page (`/app/admin/smsinbound/`), an item of the classic **Reports** menu, is removed. It is the [Inbound](/v6.0.2/new-user-interface/staff-sms-inbound) screen of the **SMS** group of the staff sidebar, next to **Campaigns** (`/<UI_STAFF_PREFIX>/staff/sms/inbound`) (octeth/oempro#3534). It needs the `SMS` and `Settings` privileges, as the page did.

**The old URLs keep working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/smsinbound/?<filters>` | 302 to `/<staff>/staff/sms/inbound?<filters>` |
| `/app/admin/smsinbound/index/<page>?<filters>` | 302 to the same screen with `page=<page>` added |

The filters are carried over under the screen's names when their value is valid, and an invalid value is dropped: `FilterStatus` becomes `status`, `FilterNumber` becomes `number` (digits only), `FilterOptOut` becomes `optout`, `FilterGateway` becomes `gateway`, and `FilterDateFrom` and `FilterDateTo` become `range=custom` with `from` and `to` (a date and time keeps its date). A POST to any of these URLs is refused: nothing runs, and the answer is a short page that links to the new screen.

The classic admin header's **Reports > Inbound SMS** item opens the new screen.

**What changed on the way:**

- **User group limits apply.** The legacy page showed every message to any administrator with `SMS` and `Settings`. A sub-admin limited to some user groups now sees only the messages attributed to accounts in those groups, and no unattributed message, because an unattributed message belongs to no account. The screen says so above the list.
- **Filters apply as you choose them** and stay in the address, so a filtered view can be bookmarked. The opt-out filter gained **Not opt-outs**, and the date filter offers presets (last 7, 30 or 90 days, last 12 months) next to a custom range, which may set only one end as the legacy page allowed.
- **Long messages are clamped, not cut.** The legacy page cut a message at 120 characters. The new screen shows two lines and expands the whole message on click.
- **The account links to the staff account page**, and the campaign column shows the campaign's name next to its ID.
- **Fewer, denser columns.** The sender and recipient share a **From / To** column, and the unsubscribe result sits under the opt-out in one **Opt-out** column, so the table fits a desktop window.

There is no opt-in flag: the page is removed, and its URLs answer as above.

#### The legacy admin SMS Suppression page is removed

The legacy admin **SMS Suppression List** page (`/app/admin/sms_suppression/`), an item of the classic **Settings** menu, is removed. The list is the [SMS suppression](/v6.0.2/new-user-interface/staff-sms-suppression) screen, the **SMS** item of the **Suppression** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/sms/suppression`) (octeth/oempro#3560). It needs the `SMS` and `Settings` privileges, as the page did.

**The old URLs keep working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/sms_suppression/` and anything under it | 302 to `/<staff>/staff/sms/suppression` |
| A POST to any of these URLs | Refused: nothing runs, and the answer is a short page that links to the new screen |
| `/app/admin/sms_suppression/get_lists`, by any method | Refused the same way. It returned the lists of any account |

The classic admin header's **Settings > SMS Suppression List** item opens the new screen, and is shown only to administrators with both `SMS` and `Settings` (it was shown on `Settings` alone, and then refused).

**What changed on the way:**

- **The list can be browsed.** The legacy page could only check one number at a time, through the send path's cached answer, and could not show gateway rows. The new screen lists every suppressed number and pattern of every account, read from the table, and filters by digits of the number, scope, account, list, reason, source, gateway and the date added.
- **User group limits apply.** The legacy page listed every account in its account picker and removed any ID. A sub-admin limited to some user groups now sees and changes the system rows and the rows of accounts in those groups, and no gateway row, because a gateway row belongs to no account. The screen says so above the list.
- **Removing an opt-out needs a reason.** Removing a recipient's own opt-out (a STOP reply, an opt-out link, or any gateway row) asks for confirmation that says so and a typed reason, which is kept in the staff audit log.
- **Every change is audited.** Adding, removing, adding or removing a pattern and clearing the cache each write a staff audit row with the counts and scopes, never a number, pattern or note.
- **A pattern that would match every number is refused.** A pattern needs at least one digit before its first `*`.
- **A list row needs only the list ID.** The row is written for the list's owner.
- **There is no gateway scope for adding**, as on the legacy page. Gateway rows come only from STOP replies.

There is no opt-in flag: the page is removed, and its URLs answer as above.

#### The legacy admin Preferences page is trimmed

Most of the legacy admin **Preferences** page (`/app/admin/preferences/`), an item of the classic **Settings** sidebar, moved to the [Preferences](/v6.0.2/new-user-interface/staff-preferences) screen of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/settings/preferences`), under the new **Settings** group of the staff sidebar (octeth/oempro#3537). The screen needs the `Settings` privilege, as the page did.

| Setting | Where it is now |
|---|---|
| Default language, user password reset | Preferences, **General** section |
| Send rate Slack webhook and notification interval, limit utilization webhook | Preferences, **Notifications** section (`?section=notifications`) |
| Failed webhook handler | Preferences, **Customer webhooks** section (`?section=customer-webhooks`) |
| List freshness thresholds | Preferences, **List freshness** section (`?section=list-freshness`) |
| Forbidden From addresses, user area footer, default custom fields of a new list | Still on the classic page, now titled **User area preferences** |
| Run the send engine cron from the user area, show the trigger send engine link | Removed. Nothing read either setting |

**The page is not redirected.** `/app/admin/preferences/` still opens, shows only the three settings the classic user area uses, and links to the new screen. The classic **Settings** sidebar lists both: **Preferences** opens the new screen and **User area preferences** opens the classic page. The classic header's **Preferences** drop-menu gains a **Preferences** item that opens the new screen.

**What changed on the way:**

- **Each section saves on its own.** A save sends only that section's settings to `settings.update`. The classic page wrote several settings directly and then called `settings.update` for the rest, so a refused call could leave a partial save. The trimmed classic page now saves its three settings with one `settings.update` call, so a refused call saves none of them.
- **Viewing the classic page no longer writes anything.** It used to create default rows for the failed-webhook handler, the limit utilization webhook and the list freshness thresholds the first time it was opened. Every reader of those settings already falls back to the same defaults.
- **Two changes ask first.** Changing the default language, or turning password reset off, asks for a confirmation before saving.
- **The notification fields are checked.** The Slack webhook URL must be a full `http` or `https` URL or empty, and the interval a whole number of seconds, 0 or more. `settings.update` itself still accepts any value for these two settings.
- **The list freshness thresholds must increase.** The screen refuses Slowing down or Stale values that are not above the one before. The classic page raised such values silently.
- **Webhook URLs are masked** on the screen, with a toggle to show them, because a webhook URL often carries its own access key.
- **Every save is recorded in the staff audit log** with the section and the names of the settings it changed, never their values.

There is no opt-in flag. `settings.get`, `settings.update` and `system.languages.get` are unchanged.

#### The legacy admin Integrations page is trimmed

Google Analytics and Stripo moved from the legacy admin **Integrations** page (`/app/admin/integration/`), an item of the classic **Settings** sidebar, to the [Integrations](/v6.0.2/new-user-interface/staff-integrations) screen of the new interface's staff area (`/<UI_STAFF_PREFIX>/staff/settings/integrations`), under the **Settings** group of the staff sidebar (octeth/oempro#3552). The screen needs the `Settings` privilege, as the page did.

| Setting | Where it is now |
|---|---|
| Google Analytics source and medium | Integrations, **Google Analytics** section |
| Stripo plugin ID, secret key and the per-user project API keys | Integrations, **Stripo** section (`?section=stripo`) |
| Unlayer project ID and API key | Still on the classic page |
| Settings plugins add as tabs (TCPAProtect, IP Monitor, Cleanify) | Still on the classic page |

**The page is not redirected.** `/app/admin/integration/` still opens, shows the Unlayer tab and the plugin tabs, and links to the new screen. The classic **Settings** sidebar lists both: **Integrations** opens the new screen and **Integrations (legacy builders and plugins)** opens the classic page. Plugin links to `/app/admin/integration#form-tabs/tab-<plugin>` keep working.

**What changed on the way:**

- **A save on the classic page no longer touches the moved settings.** It used to post all five Google Analytics and Stripo values with every save, so an empty field wiped a stored value. It now saves only the Unlayer pair, through one `settings.update` call, and then lets the plugins save their tabs as before.
- **The Stripo secrets are write-only.** The classic page printed the secret key and every project API key into the page. The new screen shows only that a secret key is stored and how many users have a project key, with their user IDs. A blank field keeps the stored value, and a filled key list replaces the whole list.
- **Turning Stripo off is its own action.** **Disconnect Stripo** asks first, then clears the plugin ID and the secret key. The project key list stays.
- **Check connection.** The new screen checks the entered or stored plugin ID and secret key with Stripo without saving them, through the new `admin.integrations.stripo.test`.
- **Two new admin commands, privilege checked in the handler.** `admin.integrations.stripo.get` and `admin.integrations.stripo.test` need `Settings` and answer `99999` (`Not enough privileges`) without it, even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the newer staff commands do. See [the Admin API](/v6.0.2/api-reference/admin#get-the-stripo-integration-state). No existing command changes.
- **`settings.update` with only option keys no longer runs an empty `oempro_config` update.** A call that named only option keys (for example only the Stripo settings) made MySQL reject an `UPDATE` with nothing to set and log the error. The options were written either way and the response is unchanged.

**Who needs to act:** nobody. An administrator who used the classic page for Google Analytics or Stripo finds those settings in the staff area.

There is no opt-in flag: the moved fields are gone from the classic page.

#### The legacy admin Default Opt-in Email page is removed

The legacy admin **Default Opt-in Email** page (`/app/admin/defaultoptinemail/`), an item of the classic **Settings** sidebar, is removed. The default opt-in email is edited on the [Default opt-in email](/v6.0.2/new-user-interface/staff-optin-email) screen of the **Settings** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/settings/optin-email`) (octeth/oempro#3538).

**The old URL keeps working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/defaultoptinemail/`, anything under it | 302 to `/<staff>/staff/settings/optin-email` |

A POST to it, including the old form submit, is refused: nothing is saved, and the answer is a short page that links to the new screen.

The classic **Settings** sidebar's **Default Opt-in Email** item opens the new screen. The top-right **Settings** link no longer lands on this page: an unrestricted administrator now lands on **Delivery Servers**.

**What changed on the way:**

- **The screen needs `Settings`, not `Settings.General`.** The legacy page opened for an administrator holding `Settings.General`, but it saved through `settings.update`, which needs `Settings`, so such an administrator could open the page and never save. The new screen asks for `Settings` up front. A sub-administrator who only holds `Settings.General` no longer sees the page anywhere.
- **The confirmation link is checked before saving.** The text must contain `%Link:Confirm%`, spelled exactly so, because that is the spelling the sender replaces. The screen refuses a text without it with a message under the field, and every save sends the subject and the text together, so Octeth's own check (error `7`) always runs as well.
- **The merge tag menu offers only tags this email replaces:** the opt-in links, the subscriber's email address and IDs, and the date. The legacy menu also offered the account owner's `%User:...%` tags, which this email never replaced, so a subscriber received them as typed.
- **Restore the default text** fills the form with the text a new install starts with. Nothing is saved until **Save**.

There is no opt-in flag: the page is removed, and its URL answers as above. `settings.get` and `settings.update` are unchanged.

#### The legacy admin S2S postback page is removed

The legacy admin **S2S Postback** page (`/app/admin/s2spostback/`), an item of the classic **Settings** sidebar, is removed. It is the [S2S postback](/v6.0.2/new-user-interface/staff-s2s-postback) screen of the new **Settings** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/settings/s2s-postback`) (octeth/oempro#3539). It needs the `Settings` privilege, as the page did.

**The old URL keeps working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/s2spostback/`, anything under it | 302 to `/<staff>/staff/settings/s2s-postback` |

A POST to it, including the old save form, is refused: nothing is written, and the answer is a short page that links to the new screen.

The classic **Settings** sidebar's **S2S Postback** item opens the new screen. The top-right **Settings** link no longer considers the S2S postback page as a landing page, which changes nothing in practice, because **Email Delivery**, which comes before it, needs the same `Settings` privilege.

**What changed on the way:**

- **Only changed names are saved.** The legacy page wrote all four parameter names on every save. The new screen sends only the names that changed, so a save never rewrites a name nobody touched. A name stored empty (the conversion address then uses the default) is written with that default on the next save.
- **Renaming the Track parameter asks first.** Click links carry the identifier as `ocrid` whatever this name is (octeth/oempro#3542), and campaigns already sent keep the old name in their links in any case, so a rename can stop conversions from matching. The field carries a warning, and a save that renames it asks for confirmation.
- **Copy buttons.** The conversion address and the ClickBank address are shown read-only with a copy button, built from the interface's public base URL.
- **Audited.** Every save writes a staff audit row naming the parameters changed, with their old and new names.

There is no opt-in flag: the page is removed, and its URL answers as above.

#### The legacy admin Single Sign On section is removed

The legacy admin **Single Sign On** section (`/app/admin/sso/`), an item of the classic **Settings** sidebar, is removed. SSO sources are managed on the [SSO](/v6.0.2/new-user-interface/staff-sso) screen of the new **Settings** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/settings/sso`), which needs the `Settings.SSO` privilege, as the section did (octeth/oempro#3540). The public sign-in address `/app/sso?code=&token=` is a different page and is unchanged.

**The old URLs keep working.** The section is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/sso/`, anything under it not listed below | 302 to `/<staff>/staff/settings/sso` |
| `/app/admin/sso/create/` | 302 to `/<staff>/staff/settings/sso/new` |
| `/app/admin/sso/edit/<id>` | 302 to `/<staff>/staff/settings/sso/<id>/edit` |
| `/app/admin/sso/x_statistics/<id>` | 302 to `/<staff>/staff/settings/sso/<id>/edit?tab=statistics` |

A POST to any of these URLs, including the old create, edit and bulk delete forms, is refused: nothing is saved, and the answer is a short page that links to the new screen. The classic **Settings > Single Sign On** sidebar link opens the new screen.

**What changed on the way:**

- **The keys are masked.** The legacy edit page printed Key 1 and Key 2, and a PHP sample with both, on every visit. The new screen masks them. **Reveal** reads them for that page view only, and **Rotate keys** replaces both after a confirmation and shows the new ones once. Every reveal and rotation is recorded in the staff audit log, and the PHP sample shows placeholders until the keys are revealed.
- **Keys can be rotated.** The legacy page offered no way to replace a source's keys short of deleting it.
- **A code change asks first**, because the connected application sends the code in every sign-in link.
- **The statistics chart labels sign-ins and sign-ups correctly.** The legacy chart showed each one under the other's label. The new chart covers the last 7, 30 or 90 days, 30 by default.
- **Expiry is shown in server time (UTC)**, and an empty expiry reads **Never**.

#### The legacy admin Delivery servers pages are removed

The legacy admin **Delivery Servers** list, create and edit pages (`/app/admin/deliveryservers/`), an item of the classic **Settings** sidebar, are removed. Delivery servers are managed on the [Delivery servers](/v6.0.2/new-user-interface/staff-delivery-servers) screen of the **Delivery** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/settings/delivery-servers`), which needs the `DeliveryServers` privilege, as the pages did (octeth/oempro#3550). The delivery server reports at `/app/admin/deliveryservers/report` are unchanged and stay in the classic admin.

**The old URLs keep working.** The pages are now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/deliveryservers/`, anything under it not listed below | 302 to `/<staff>/staff/settings/delivery-servers` |
| `/app/admin/deliveryservers/create/` | 302 to `/<staff>/staff/settings/delivery-servers/new` |
| `/app/admin/deliveryservers/edit/<id>` | 302 to `/<staff>/staff/settings/delivery-servers/<id>/edit` |
| `/app/admin/deliveryservers/x_load_verification/<id>`, `/app/admin/deliveryservers/x_dns_test/<id>` | 302 to `/<staff>/staff/settings/delivery-servers/<id>/edit?tab=verification`, without running a test |
| `/app/admin/deliveryservers/report` and everything under it | unchanged |

A POST to any of these URLs except the reports, including the old create, edit, clone and bulk delete forms, is refused: nothing is saved, and the answer is a short page that links to the new screen. The classic **Settings > Delivery Servers** sidebar link, and the server links on the delivery server reports and the Email delivery headers page, open the new screen.

**What changed on the way:**

- **A delete lists what still uses the server.** The legacy page deleted without a word. The new confirmation names the user groups (with their channels), the users with their own server, the global segments, the recipient domain routes and the IP pools that send through it, and says that only the user groups switch to the system default: the others keep pointing at the deleted server and fall back to the system default without a warning. You can still confirm.
- **A connection change of a server in use asks first.** Saving a new host, port, encryption, authentication, username or password of a server that something sends through opens a confirmation that names how many user groups and users it affects.
- **The password stays write-only.** The edit form says when a password is stored and replaces it only when you enter a new one. A changed host clears the stored password unless you enter the password for the new host, as the classic page did.
- **Testing is a separate action.** The **Verification** section of the edit page (the legacy **Test** tab) shows the stored results and runs **Send test and check DNS** on request. Saving never tests. Octeth allows 10 tests in 5 minutes and says how long to wait.
- **Clone is a row action** of the list, and opens the copy. User groups, delivery routes and email headers are not copied, as before.
- **The sender rotation rules are checked as JSON** before they are saved.
- **Any port from 1 to 65535** is accepted, as before.
- **Connection and Domains save on their own.** The edit page has a menu of sections on the left, each section saves only its own fields, and leaving a section with unsaved changes asks first. Saving Domains keeps the stored connection, so it never asks about a server in use.

#### The legacy admin SMS Gateways section is removed

The legacy admin **SMS Gateways** section (`/app/admin/smsgateways/`), an item of the classic **Settings** sidebar, is removed. SMS gateways are managed on the [SMS gateways](/v6.0.2/new-user-interface/staff-sms-gateways) screen of the **Delivery** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/settings/sms-gateways`), which needs the `DeliveryServers` privilege, as the section did (octeth/oempro#3551). The callback URLs providers post delivery reports and replies to are unchanged.

**The old URLs keep working.** The section is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/smsgateways/`, anything under it not listed below | 302 to `/<staff>/staff/settings/sms-gateways` |
| `/app/admin/smsgateways/create/` | 302 to `/<staff>/staff/settings/sms-gateways/new` |
| `/app/admin/smsgateways/edit/<id>` | 302 to `/<staff>/staff/settings/sms-gateways/<id>/edit` |

A POST to any of these URLs, including the old create, edit and bulk delete forms and the Test Connection request (`/app/admin/smsgateways/testConnection/`), is refused: nothing is saved or tested, and the answer is a short page that links to the new screen. The classic **Settings > SMS Gateways** sidebar link opens the new screen.

**What changed on the way:**

- **Provider keys stay out of the page.** The legacy edit page wrote the stored provider API key and the webhook secret into its page source. The new screen shows a stored key as **A key is stored** with a field that replaces it only when filled.
- **The webhook secret and the two callback URLs are masked.** **Reveal** reads them for that page view only, and **Rotate secret** replaces the secret after a confirmation that both URLs change at once, then shows the new URLs once. Every reveal and rotation is recorded in the staff audit log. Rotation used to be a "Rotate the secret on save" checkbox on the edit form.
- **Delete and deactivate list what uses the gateway first:** the SMS campaigns scheduled or sending through it, the journeys with a Send SMS step on it, its assigned accounts, and the account its inbound replies are credited to. Staff can still confirm.
- **Accounts are assigned with a search** instead of one checkbox per enabled user. A sub-administrator limited to some user groups finds only the accounts in those groups, and assignments outside them are kept.
- **Each section of the edit page saves on its own.** The sections are a menu on the left, and leaving a section with unsaved changes asks first. The provider is still locked after create, and message parts still default to 3 on the create form.

#### The legacy admin Plugins page is removed

The legacy admin **Plugins** page (`/app/admin/plugins/`), an item of the classic **Settings** sidebar and of the admin drop-menu, is removed. Plugins are enabled and disabled on the [Plugins](/v6.0.2/new-user-interface/staff-plugins) screen of the **Settings** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/settings/plugins`), which needs the `Settings` privilege, as the page did (octeth/oempro#3553). A plugin's own admin pages stay in the classic admin and are unchanged.

**The old URLs keep working, but no longer change anything.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/plugins/`, anything under it not listed below | 302 to `/<staff>/staff/settings/plugins` |
| `/app/admin/plugins/enable/<code>`, `/app/admin/plugins/disable/<code>` | Refused: nothing changes, and the answer is a short page that links to the new screen |

The old enable and disable links changed a plugin's state on a plain GET, so a bookmark, a prefetching browser or a crafted link could disable a plugin and delete its data. They are refused whatever the HTTP method. A POST to any of these URLs is refused too. The classic **Settings > Plugins** sidebar item and the **Plugins** drop-menu item open the new screen, and the top-right **Settings** link no longer considers the Plugins page as a landing page, which changes nothing in practice, because **Email Delivery**, which comes before it, needs the same `Settings` privilege.

**What changed on the way:**

- **Set, not toggle.** The legacy enable and disable links both toggled the plugin's state, so a stale page could do the opposite of what it showed. The new screen sets the state it shows and says so when the plugin was already in that state.
- **Disabling asks for the plugin's name.** The dialog says that the plugin's tables and settings are deleted and not restored when it is enabled again, and that a plugin worker keeps running until it is restarted. The legacy page asked a yes or no question in a browser dialog.
- **A plugin that needs a newer Octeth** shows **Needs vX** and no Enable action, as before.
- **Audited.** Every enable and disable writes a staff audit row naming the plugin.
- **No browse link.** The legacy page linked to the plugin catalogue on octeth.com. The new screen has no install, upload or update check.

#### The legacy admin Bounce Processing page is removed

The legacy admin **Bounce Processing** page (`/app/admin/bounce/`), an item of the classic **Preferences** drop-menu, is removed. Its metrics, bounce patterns, webhook settings, spooled messages and manual processing are on the [Bounce processing](/v6.0.2/new-user-interface/staff-bounces) screen of the **Delivery** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/deliverability/bounces`), which needs the `Bounce` privilege, as the page did (octeth/oempro#3558). The bounce and complaint mailbox settings (POP3/IMAP) stay on the classic **Email Delivery** settings.

**The old URLs keep working, but no longer change anything.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/bounce/`, `/app/admin/bounce/message_download/<id>` and anything else under it not listed below | 302 to `/<staff>/staff/deliverability/bounces` |
| `/app/admin/bounce/message_delete/<id>`, `x_clear_emails`, `x_start_manual_process`, `x_save_bounce_patterns` | Refused: nothing changes, and the answer is a short page that links to the new screen |

The old delete link removed a spooled message on a plain GET, so a bookmark, a prefetching browser or a crafted link could delete one. It is refused whatever the HTTP method, and so is a POST to any of these URLs. The old download link no longer serves the message. The **Bounce Processing** item of the classic **Preferences** drop-menu opens the new screen. It now also needs the `Bounce` privilege, which the page always checked, so it no longer shows to an administrator the screen would refuse.

**What changed on the way:**

- **The webhook signature secret is masked.** The legacy page printed it in the page and in the Logstash sample. The new screen shows it only after **Reveal**, reads it through the new `admin.bounce.webhook.get` with `Reveal`, and records every reveal in the staff audit log and the application log. The samples carry a placeholder until then. The secret is derived from `ADMIN_API_KEY`, so changing it means rotating that key.
- **Destructive actions ask first and are audited.** **Process all**, deleting a message and manual processing each ask for a confirmation and write a staff audit row with counts and message IDs, never an address, a line or a message body. Manual processing shows how many bounces, complaints and opt-outs it will apply, and which lines it will skip, before it runs. A download is audited by its message ID.
- **No more 3-second polling.** The receiver counters are read when the screen opens and on its refresh button.
- **Patterns are checked before saving**, with the same rules as `bounce.patterns.update`, and the screen says whether the saved patterns or the shipped defaults are in use. Saving an empty list asks first and restores the shipped defaults.
- **Privilege checked in every handler.** All eight `bounce.*` commands and the two new ones (`admin.bounce.feedback.get`, `admin.bounce.webhook.get`) answer `99999` (`Not enough privileges`) to a sub-admin without `Bounce`, even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the newer staff commands do. See [the Bounce Processing API](/v6.0.2/api-reference/bounce). No request or response field changes.
- **Manual lines and raw messages stay out of the logs.** The new interface's API call log and debug console redact the manual processing lines and the raw messages and envelope addresses of the spool.
- **Processing runs in batches the screen can stop.** **Process all** sends the spool 25 messages per request and manual processing 500 lines per request, with a progress line and a **Stop** button, so no request runs into the proxy's timeout while Octeth keeps changing subscribers, and no batch is sent twice. Stopping manual processing leaves the lines not yet sent in the box. Each batch writes its own audit row. Processing itself still runs synchronously inside Octeth, as before.
- **`bounce.messages.process` takes opt-in batches.** The new `MaxMessages` and `After` parameters process at most that many messages after a cursor and answer with `Remaining` and `Cursor`. Without them the command processes the whole spool and answers exactly as before.

**Who needs to act:** a script that called `bounce.*` with the key of a sub-admin who lacks `Bounce`, on an install with `ADMIN_API_ENFORCE_PRIVILEGES` off, now gets `99999`: grant that sub-admin `Bounce`. Nobody else.

There is no opt-in flag: the page is gone, and the privilege check is the one the page always applied.

#### The legacy admin Email Suppression List is removed

The legacy admin **Email Suppression List** page (`/app/admin/suppression/`), an item of the classic **Preferences** menu, is removed. System-wide suppressions, the search across every account and the suppression patterns are managed on the [Email suppression](/v6.0.2/new-user-interface/staff-email-suppression) screen, the **Email** item of the **Suppression** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/deliverability/suppression`), which needs the `Suppression` privilege, as the page did (octeth/oempro#3559). The classic menu item now shows only to administrators holding `Suppression`; before, it showed to those holding `Settings` and then refused the ones without `Suppression`.

**The old URL keeps working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/suppression/`, anything under it | 302 to `/<staff>/staff/deliverability/suppression` |
| `/app/admin/suppression/?EmailAddress=<term>` | 302 to the same screen searching for `<term>`, with a `%` in it turned into `*` |

A POST to these URLs, including the old search, add, delete and pattern forms, is refused: nothing is added or deleted, and the answer is a short page that links to the new screen.

**What changed on the way:**

- **The list is paged.** The legacy page showed only search results, at most 1,000 and no paging. The new screen lists the system-wide suppressions page by page, filtered by source, and a search pages through every match.
- **Search is exact by default.** The legacy search box was a raw `LIKE` pattern, so `%` and `_` in it matched anything. The new search matches the exact address, case-insensitive, and takes `*` as the only wildcard, for example `*@example.com`. A search covers every account and scope within the administrator's user groups, as before, and shows the scope and the account of each row.
- **Delete works on selected rows** as well as one at a time, asks first, says that removing a system-wide row unblocks the address for every account, and reports the rows it could not remove.
- **Adding reports what happened:** how many addresses were added, how many were already suppressed system-wide and how many were not valid. The legacy page counted only the added ones and logged rejected addresses.
- **The counts show all five sources** over every account and scope: Administrator, User, Hard Bounced, SPAM complaint and Unsubscribe.
- **Pattern changes reach running workers after a restart.** Sending workers read the patterns when they start, which was already true; the Patterns tab now says so.
- **Audited.** Every add and delete, of addresses or patterns, writes a staff audit row with counts and the pattern type, never an address or a pattern.
- **No addresses in the interface's logs.** Search terms, addresses and patterns are masked in the new interface's API call log and debug console.

#### The legacy admin Global Custom Fields page is removed

The legacy admin **Global Custom Fields** page (`/app/admin/customfields/`), an item of the classic **Preferences** menu, is removed. System-global custom fields are managed on the [Custom fields](/v6.0.2/new-user-interface/staff-custom-fields) screen of the **Settings** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/settings/custom-fields`), which needs the `CustomFields` privilege, as the page did (octeth/oempro#3568). The classic menu item now shows only to administrators holding `CustomFields`; before, it showed to those holding `Settings` and then refused the ones without `CustomFields`.

**The old URLs keep working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/customfields/`, anything under it not listed below | 302 to `/<staff>/staff/settings/custom-fields` |
| `/app/admin/customfields/create/` | 302 to `/<staff>/staff/settings/custom-fields/new` |
| `/app/admin/customfields/edit/<id>` | 302 to `/<staff>/staff/settings/custom-fields/<id>/edit` |

A POST to these URLs, including the old create, edit and bulk delete forms, is refused: nothing is saved or deleted, and the answer is a short page that links to the new screen. The user area's own list custom fields (`/app/user/customfields/`) are not affected.

**What changed on the way:**

- **Delete asks first and says what breaks.** The legacy page deleted the ticked fields without a confirmation. The new screen lists, for each field, how many values it stores across every account, the segments, journeys and SMS lists that use it, then deletes on confirmation. Nothing that uses a field is changed by the delete, as before.
- **Type and validation are locked once values are stored.** Changing them moved or blanked every account's values. The edit page shows them read-only once any value is stored, and the save is refused if values were stored meanwhile.
- **The merge tag is required**, and is suggested from the name. An empty one was always refused by the API; the legacy form did not say so.
- **Paged and searchable.** The list pages through the fields 25 at a time and searches name and merge tag.
- **Audited.** Every create, edit and delete writes a staff audit row.

#### The legacy admin Global Segments page is removed

The legacy admin **Global Segments** page (`/app/admin/segments/`), an item of the classic **Preferences** menu, is removed. Global segments, the delivery routing rules that send the subscribers matching their rules through a chosen delivery server per user group, are managed on the [Segment routing](/v6.0.2/new-user-interface/staff-segment-routing) screen of the **Delivery** group of the staff sidebar (`/<UI_STAFF_PREFIX>/staff/settings/global-segments`), which needs the `Settings.Segments` privilege, as the page did (octeth/oempro#3571). The classic menu item now shows only to administrators holding `Settings.Segments`; before, it showed to those holding `Settings` and then refused the ones without `Settings.Segments`.

**The old URLs keep working.** The page is now a redirect shim:

| Old URL | Answer |
|---|---|
| `/app/admin/segments/`, anything under it not listed below | 302 to `/<staff>/staff/settings/global-segments` |
| `/app/admin/segments/edit/<id>` | 302 to `/<staff>/staff/settings/global-segments/<id>/edit` |

A POST to these URLs, including the old create, edit and bulk delete forms, is refused: nothing is saved or deleted, and the answer is a short page that links to the new screen. The user area's list segments are not affected.

**What changed on the way:**

- **One form.** Create and edit are one page with three cards: the segment, its rules and its delivery routing per user group. There are no tabs.
- **No "Subscriber list ID" rule.** The legacy builder offered it, but the rule check added for octeth/oempro#2720 refused it, so it could not be saved. A `ListID` rule stored before then is shown locked and kept when the segment is saved.
- **Stored rules are kept as they are.** A rule value is saved exactly as entered, spaces before or after it included. A stored rule the new form would refuse, such as one with an empty value, is shown locked and kept unchanged, and a save that leaves the rules as they were does not check them again.
- **At least one rule.** A segment without rules matches every subscriber at send time, so the form requires one.
- **Delete asks first and says what stops.** The confirmation lists the routing that ends (user group and delivery server) before anything is deleted.
- **A restricted sub-administrator keeps other groups' routing.** The form lists only the user groups the account may act on, and a save keeps the stored routing of the other groups.
- **Audited.** Every create, edit and delete writes a staff audit row with the settings that changed; rule values are not recorded.
- **Running send processes pick up a routing change after they restart**, as before. The form says so.

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

### Admin two-factor authentication (self-service)

- `admin.2fa.provision`, `admin.2fa.enable` and `admin.2fa.disable` no longer require the `Security` privilege. Every administrator and sub-administrator manages their own two-factor authentication, whatever their privileges, as users already do. Each command acts only on the calling administrator's own account, `admin.2fa.provision` still refuses while two-factor authentication is on (`ErrorCode 2`), and `admin.2fa.disable` still needs the current password. Requests and responses are unchanged, and a caller that held `Security` sees no difference. Before, a sub-administrator without `Security` was refused with `ErrorCode 99999` when `ADMIN_API_ENFORCE_PRIVILEGES` is on. `admin.subadmin.2fa.reset` still needs `SubAdmins`. There is no opt-in flag, because the change only lets an administrator secure their own sign-in (octeth/oempro#3566).
- The staff **Your profile** screen (`/<UI_STAFF_PREFIX>/staff/profile`) and its **Your profile** user-menu item are now shown to every administrator. Without the `Account` privilege it offers only the Two-factor authentication section, and reads the administrator's own row with `admin.self.get` instead of `admin.get`. Its Profile, Password and API access sections still need `Account`, and System emails still needs `Account` and `Settings`.

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

### Sender domain health

#### `admin.senderdomains.health.get` can return the tracking fallback host

A new optional parameter `IncludeTrackingFallback=true` adds `TrackingFallbackHost` to every row of `Domains`: the host that Email Gateway and journey mail from that domain uses for tracking and unsubscribe links because the domain's own tracking host is not set up (octeth/oempro#3308), or `null`. It costs one extra query per page and one per user group on the page. Without the parameter the response is byte-identical to before (octeth/oempro#3527).

### SSO sources

#### `sso.create` and `sso.update` honour the `Options` flags over HTTP

`api.php` lowercases every request key, nested ones included, so `Options.CreateNewUserIfNotExists`, `Options.PerformLogin` and `Options.ReturnUserData` reached the two handlers as lowercase names they did not read, and a source created or updated through the API stored all three as `Disabled` whatever was sent. The handlers now read the three flags whatever the case of their names (octeth/oempro#3540). A flag is still `Enabled` only when its value is exactly `Enabled`.

**Who needs to act:** nobody, unless you created or updated an SSO source through the API and worked around the stored options by hand. Check them with `sso.get`.

### Delivery servers

#### `deliveryserver.update` can clear the stored password when the host changes

`deliveryserver.update` takes an optional `ClearPasswordOnHostChange` flag (octeth/oempro#3550). With it on, an omitted `SendMethodSMTPPassword` keeps the stored password only while `SendMethodSMTPHost` matches the stored host; a different host stores an empty password, so a password is never carried over to another server. Without the flag the command behaves exactly as before and always keeps the stored password. The staff Delivery servers screen sends it on every save.

#### New command `admin.deliveryserver.references.get`

A read-only command that lists what still sends through a delivery server: user groups per channel, users with their own server, global segments, recipient domain routes and IP pools (octeth/oempro#3550). See [Get What Uses a Delivery Server](./deliveryservers#get-what-uses-a-delivery-server).

**Who needs to act:** nobody.

### Global custom fields

#### `global.customfield.update` can refuse a type change while values are stored

`global.customfield.update` takes an optional `RefuseTypeChangeWithValues` flag (octeth/oempro#3568). With it on, a change of `FieldType` or `ValidationMethod` answers error `12` while any value is stored in the field, and `13` when that cannot be checked, and nothing is saved. Without the flag the command behaves as before. The staff Custom fields screen sends it on every save. See [Update a Global Custom Field](./customfields#update-a-global-custom-field).

#### `global.customfield.update` finds only system-global fields

`global.customfield.update` now looks the field up with `RelOwnerUserID = 0`, `RelListID = 0` and `IsGlobal = Yes`, as `global.customfield.get` and `global.customfields.delete` do. It used to check the owner and the id only, so an id of a list field with owner 0 reached the update. That id now answers error `6` (`Invalid custom field id`). No call made for a system-global field changes (octeth/oempro#3568).

#### `global.customfield.update` keeps the years of a field changed to a Date field

`Years` was stored only when the field already was a Date field, so a request that changed a field to a Date field kept the default year range whatever it sent. It is now stored whenever the field is saved as a Date field (octeth/oempro#3568).

#### Segment listings see a changed global field at once

The segment engine kept the list of system-global custom fields in its cache for up to an hour, and nothing cleared it. A field created, changed or deleted could take that long to reach subscriber listings built from segments, and a deleted field could still be selected. The list is now read on every listing query (octeth/oempro#3568). Nothing to do.

#### New command `admin.customfield.references.get`

A read-only command that lists, for up to 100 system-global custom fields, the segments, journeys and SMS lists that use each one and how many values it stores (octeth/oempro#3568). See [Get What Uses a Global Custom Field](./customfields#get-what-uses-a-global-custom-field). Global segments are matched on their `SegmentRules` string, the rules the send path reads, and appear with `UserID` `0`, so a global field used only by a global segment is not reported as unused (octeth/oempro#3571).

**Who needs to act:** nobody, unless an integration updates global custom fields with ids of list fields: those calls now answer `6` and change nothing.

### Plugins

#### `admin.plugins.get` can report compatibility

A new optional parameter `IncludeCompatibility=true` adds `Compatible` to every plugin: whether this install's version meets the plugin's `MinOemproVersion`, by the comparison the classic Plugins page used. Without the parameter the response is byte-identical to before (octeth/oempro#3553). `admin.plugin.enable` still does not check the version.

### Email suppression import

#### `suppression.import` can return explicit duplicate and failed-write counts

A new opt-in `ReturnDetailedCounts=true` parameter adds `TotalAlreadySuppressed`, `TotalWhitelisted` and `TotalWriteFailed` to the `suppression.import` response, so an integration no longer has to treat "submitted minus imported minus malformed" as already suppressed, which counted an address whose insert failed as suppressed although it can still be sent to (octeth/oempro#3559). Without the parameter the response is unchanged. The staff Email suppression screen sends it and shows unsaved addresses as a warning.

`SuppressionList::Add()`, which every suppression writer calls, now returns `0` when its insert fails instead of whatever the connection's last insert id was, so a failed write can no longer be counted in `TotalImported`.

**Who needs to act:** nobody. Send `ReturnDetailedCounts=true` if you reconcile the counters against what you submitted.

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

### Sub-admins screen commands

Two new admin commands, both needing the `SubAdmins` privilege, which each one checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, and both applying the escalation guard above (`5101`, `5102`) (octeth/oempro#3525):

- `admin.subadmin.2fa.reset` takes `AdminID` and turns that sub-admin's two-factor authentication off (secret, recovery key and enabled flag cleared). Error codes: `1` missing or invalid id, `2` not found, `3` not an access-limited sub-admin, `4` not saved. Refused in demo mode.
- `admin.subadmin.signins.revoke` takes `AdminID` and revokes that sub-admin's remembered sign-ins of the classic admin area, returning `Revoked`. Open sessions stay open until they end. Error codes as above, `4` meaning the tokens could not be revoked. Refused in demo mode.

### Campaign report command

One new admin command, additive and needing the `Reports` privilege, which it checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off (octeth/oempro#3528):

- `admin.campaigns.report` lists one page of a Campaign Report bucket (`Status`, default `Sent`) under the report's shared filters, sorted by `OrderField` and `OrderType` (Draft and Scheduled keep their own order), 10 to 100 rows per page (`RecordsPerRequest`, default 25). Each row carries the campaign, its owner, its rates, its average throughput, its health verdicts and, for stuck campaigns, the stuck reason. It returns an allow-listed projection, never campaign content or options. Error codes are the report's shared ones. Rate limit 100 requests per 60 seconds.

### SMS campaign administrator commands

Three new admin commands, additive, each needing both the `SMS` and the `Settings` privilege, which it checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, and each scoped to the user groups of a limited sub-admin (octeth/oempro#3533):

- `admin.sms.campaigns.get` lists every account's bulk SMS campaigns, newest first, 1 to 100 rows per page (`RecordsPerPage`, default 50), filtered by `FilterUser` (a user ID or the start of a username), `FilterStatus` and `FilterGateway`. Each row carries the counts, the cost, the start time, the account rate-limit hold of a sending campaign (`RateLimitHold`) and whether pause and cancel apply (`CanPause`, `CanCancel`). It never returns the message text. Error `1` means the campaigns could not be read. Rate limit 100 requests per 60 seconds.
- `admin.sms.campaign.pause` takes `SMSCampaignID` and pauses a queueing or sending campaign. `admin.sms.campaign.cancel` takes `SMSCampaignID` and cancels an unfinished one (a draft at once, anything else through `Cancelling`). Both return `PreviousStatus`, `Status` and `Changed`, change the campaign only while it is still in the status they read, and are refused in demo mode. Error codes: `1` missing or invalid id, `2` not found or outside the administrator's user groups, `3` not pausable or already finished, `4` the status changed first. Rate limit 30 requests per 60 seconds each.

### Inbound SMS command

One new admin command, additive and needing the `SMS` and `Settings` privileges, which it checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Inbound SMS page did (octeth/oempro#3534). No existing command changes.

- `admin.sms.inbound.get` lists one page of the received SMS messages, newest first, 10 to 100 per page (`RecordsPerPage`, default 50, with `Page`), filtered by `Status`, `Number`, `OptOut` (`yes`, `no` or `failed`), `GatewayID`, `DateFrom` and `DateTo`. It returns `TotalMessages`, the rows and the gateway list. A sub-admin limited to some user groups gets only the messages of accounts in those groups and no unattributed message (`UserGroupScoped` is `true`). It returns phone numbers and message bodies, which are personal data, so grant `SMS` and `Settings` with that in mind. Error codes: `1` to `6` an invalid filter, `7` the messages could not be read. Rate limit 100 requests per 60 seconds.

### SMS suppression administrator commands

Eight new admin commands, additive, each needing both the `SMS` and the `Settings` privilege, which it checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off (answering `99999` without them), as the legacy SMS Suppression page did, and each scoped to the user groups of a limited sub-admin: such a sub-admin reaches the system rows and the rows of accounts in those groups, and no gateway row (octeth/oempro#3560). No existing command changes: the `smssuppression.*` commands keep their privileges and answers.

- `admin.sms.suppression.get` lists one page of the suppressed numbers of every account, newest first, 10 to 100 per page, filtered by `Number` (digits anywhere in the number), `Scope`, `Account` (a user ID or the start of a username), `ListID`, `GatewayID`, `Reason`, `Source`, `DateFrom` and `DateTo`. `admin.sms.suppression.patterns.get` does the same for patterns. `admin.sms.suppression.stats` returns the numbers by scope and by reason, the opt-outs among them, and the patterns with their own count by scope. Rate limit 100 requests per 60 seconds each. They return phone numbers and notes, which are personal data, so grant `SMS` and `Settings` with that in mind.
- `admin.sms.suppression.add` suppresses up to 1,000 numbers at `system`, `user` or `list` scope and returns `Added`, `Existing`, `Invalid` and `Failed`. `admin.sms.suppression.patterns.add` adds one pattern and refuses one with no digit before its first `*` (error `3`).
- `admin.sms.suppression.delete` removes up to 500 numbers by ID, and **removes a recipient's own opt-out (`Reason` `optout`, or a gateway row) only with `ConfirmOptOuts=1`**: without it, it removes nothing and answers error `3`. `admin.sms.suppression.patterns.delete` removes up to 500 patterns. An ID outside the caller's reach is counted in `NotFound`.
- `admin.sms.suppression.cache.clear` drops every cached suppression answer, as `smssuppression.cache.clear` does, with `SMS` and `Settings`.

The writes are refused in demo mode and limited to 30 requests per 60 seconds (the cache clear to 10).

### Segment routing command

One new admin command, additive and needing the `Settings.Segments` privilege, which it checks even when `ADMIN_API_ENFORCE_PRIVILEGES` is off (octeth/oempro#3571):

- `global.segment.options.get` returns the user groups (in the caller's scope), delivery servers and system-global custom fields a global segment form needs. Rate limit 100 requests per 60 seconds. See [Get the Global Segment Form Options](./segments#get-the-global-segment-form-options).

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

### Staff Branding screen

#### The staff area can override the `UI_BRAND_*` settings (octeth/oempro#3576)

Administrators with full access get a new **Settings > Branding** screen in the staff area of the new interface. It changes the interface's name, legal name, tagline, trust stats, logos, favicon, colours, support and legal links and the sender name and footer of the emails the interface sends, and applies on the next page load with no restart. See [Branding the New User Interface from the Staff Area](/v6.0.2/new-user-interface/staff-branding).

A value saved there is stored in the new `brand_overrides` table of the interface database and wins over `.oempro_env`. After an administrator saves a field, editing its `UI_BRAND_*` key in `.oempro_env` changes nothing visible until the field is reset on the screen (or its row deleted from `brand_overrides`). Saving one field never stores the others, and nothing changes on an install where no one saves on the screen. The URL slugs (`UI_BRAND_SLUG_*`), the feature switches (`BRAND_FEATURE_*`), `UI_MAIL_FROM_ADDRESS` and `UI_MODE` stay `.oempro_env` only.

Uploaded logos are stored in `ui/storage/app/public/branding/` and served at `/ui/brand-assets/`. Upgrades keep `ui/storage/`, so include it in your backups. Sub-admins cannot open the screen, whatever their permissions.

The emails the interface sends now set their From name explicitly from the brand (the saved sender name, else the brand name). On an install with no saved value the From name is the same as before.

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
- If a sub-admin limited to some user groups used the classic Inbound SMS page to watch unattributed replies, give that work to an administrator without a user group limit: the staff Inbound screen shows a limited sub-admin only the messages of its groups' accounts.
- If a sub-admin limited to some user groups used the classic SMS Suppression page to manage gateway-wide STOP replies, give that work to an administrator without a user group limit: the staff Suppression screen shows a limited sub-admin no gateway row.
- If an administrator uses the new staff **Settings > Branding** screen, a value saved there wins over the matching `UI_BRAND_*` key in `.oempro_env` until it is reset on that screen. Back up `ui/storage/` with the rest of the install, because uploaded logos live in `ui/storage/app/public/branding/`.

---

Previous releases: [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
- On an install with tens of millions of bounce records, allow several extra minutes for the upgrade while it builds the new `idx_bouncedate_owner` index on `oempro_stats_bounce` online. Sending and reporting keep running during the build.
