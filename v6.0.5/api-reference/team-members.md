---
layout: doc
---

# Team Member API Documentation

Team members are people who sign in with their own email address, password and two-factor authentication and act inside an account they were invited to. One person can belong to several accounts and switch between them without signing in again.

A team member sign-in has two steps:

1. `member.login` checks the person's credentials and returns a **person session**: a `SessionID` that can call only the `member.*` commands on this page, for 30 minutes. It cannot act on any account.
2. `member.switch` picks one of the person's memberships and returns a **member session**: a new `SessionID` that acts as that account through the API, within what the member's role allows (see [Roles](#roles)). The `SessionID` sent to `member.switch` stops working.

A member session is checked on every request. It ends at once, with error `99998` and a `MemberSessionEnded` reason, when the membership is removed, suspended or changed, the person is disabled or changes password, the account is disabled or changes its credentials, team members are turned off for the account's user group, or the user group starts requiring two-factor authentication from members who have none.

Team members are available for an account only when its user group allows them (`LimitTeamMembers` above 0). The account's own sign-in with `user.login` is not affected and keeps working as before. Team members cannot sign in to the legacy user area.

## Roles

<Badge type="tip" text="New in v6.0.5" />

Every membership has a role. A member session can run a command only when **both** of these allow it:

1. The account's user group, exactly as for the account's own session (a command the group does not permit answers error `99999`).
2. The member's role, checked on every request, whichever way the command arrives: `/api.php`, the `/api/v1/` routes, plugin commands, the new user interface and MCP connections opened with the member's session.

The account's own sign-in (`user.login`), user API keys and AI agent keys the owner or an integration created, and administrator calls are not affected by roles.

A command the role does not allow is refused with HTTP status `403` and error `100021`, before anything runs:

```json
{
  "Success": false,
  "ErrorCode": 100021,
  "ErrorText": "Your team role (Viewer) does not allow this command.",
  "MemberRole": "Viewer",
  "RequiredMemberPermission": "Content.Edit"
}
```

`RequiredMemberPermission` names the role permission that is missing, `Owner` for a command only the account owner can run (such as `user.update`), and `Unclassified` for a command that is not available to team members. The session stays signed in.

### Role presets

| Role | What it can do | Role permissions |
|---|---|---|
| Admin | Everything except billing, including team, API keys, sender domains, webhooks and account settings | `Account.Read`, `Content.Edit`, `Content.Delete`, `Campaigns.Send`, `Automation.Manage`, `Audience.Manage`, `Data.Export`, `Plugins.Manage`, `Team.Manage`, `Account.Settings`, `ApiKeys.Manage`, `SenderDomains.Manage`, `Webhooks.Manage`, `AuditLog.View` |
| Manager | Create, edit, import, export, delete and send for lists, subscribers, campaigns, journeys, autoresponders, templates, segments and SMS. No team, keys, sender domains, webhooks, account settings or billing | `Account.Read`, `Content.Edit`, `Content.Delete`, `Campaigns.Send`, `Automation.Manage`, `Audience.Manage`, `Data.Export`, `Plugins.Manage` |
| Author | Create and edit content: campaign drafts, emails, templates, segments, SMS drafts, media. Cannot send, schedule, import, export or delete | `Account.Read`, `Content.Edit` |
| Viewer | Read-only, reports included | `Account.Read` |

An invitation can grant Admin, Manager, Author or Viewer. The account owner is always the account's own sign-in.

### Role permissions

| Permission | Covers |
|---|---|
| `Account.Read` | Every read of lists, subscribers, campaigns, journeys, autoresponders, segments, emails, templates, media, SMS, suppression lists, sender domains and reports |
| `Content.Edit` | Creating and editing campaign drafts, emails, templates, segments, SMS campaign drafts and templates, media uploads, campaign tags, test emails |
| `Content.Delete` | Deleting campaigns, emails, templates, segments, SMS campaigns and templates, media and tags |
| `Campaigns.Send` | Sending, scheduling, pausing, resuming and cancelling campaigns and SMS campaigns, turning journeys on, putting subscribers into journeys, SMS test numbers and test sends. Also needed to edit a campaign so that it is scheduled, to edit a scheduled or sending campaign, and to edit an email, template or segment that a scheduled or sending campaign, an autoresponder or a journey uses |
| `Automation.Manage` | Creating, editing, turning off and deleting journeys and autoresponders |
| `Audience.Manage` | Lists, custom fields, list integrations, subscribers (create, update, unsubscribe, delete, import, tags), suppression lists |
| `Data.Export` | Subscriber, campaign, journey, SMS and email gateway event exports |
| `Plugins.Manage` | Plugin commands that do not declare a role permission of their own |
| `Team.Manage` | Inviting, changing and removing team members |
| `Account.Settings` | Account settings, integrations, scheduled reports, and `user.logout` with `TargetSessionHashes` (signing out other sessions of the account) |
| `ApiKeys.Manage` | User API keys and AI agent keys, email gateway sender API keys and SMTP credentials |
| `SenderDomains.Manage` | Adding, changing, verifying and deleting sender domains, DNS provider setup |
| `Webhooks.Manage` | Account webhooks and email gateway webhooks |
| `AuditLog.View` | The account audit log |
| `Billing.Manage` | Billing. No role that can be granted holds it |

Every member can call `user.current` and end their own session with `user.logout`. For a member session `user.current` leaves out the account's two-factor enrolment values (`MFA_SecretKey`, `MFA_QRCode`), which belong to the account owner. Only the account owner can call `user.update`.

An API key or agent key created from a member session (including the agent key an MCP connection creates) records the member who created it and acts for that member: every call it makes is held to the creating member's current role, exactly like the member's own session, so it can never run owner-only commands such as `user.update` (error `100021`, `RequiredMemberPermission` `Owner`), and a role change applies to the key at once. Once the member no longer has an Active membership in the account (removed or suspended, sign-in disabled, or team members turned off for the account), every call with the key is refused with error `100021` and `RequiredMemberPermission` `ActiveMembership`. Such a key cannot be exchanged for a session with `User.Login`, and `user.current` leaves out `MFA_SecretKey` and `MFA_QRCode` for it as for a member session. For a member, `user.apikey.list` returns the value of a key only when that member created it: every other key value is masked (`********` and its last four characters).

### Commands by role permission

A command marked (read) changes nothing. Commands authorized only for administrators are not listed: a member session never runs them.

| Needs | Commands |
|---|---|
| Account.Read | `user.snapshot` (read), `user.stats` (read), `user.agentpolicy.get` (read), `user.emailcontent.get` (read), `user.integrations.browse` (read), `automated_reports.get` (read), `automated_reports.list` (read), `user.senderdomain.list` (read), `user.senderdomain.get` (read), `user.senderdomain.dns` (read), `user.senderdomain.dnshost` (read), `dns.provider` (read), `emailgateway.getdomains` (read), `emailgateway.getdomain` (read), `emailgateway.domainstats` (read), `emailgateway.recipientdomainstats` (read), `emailgateway.listrecipientdomains` (read), `emailgateway.accountstats` (read), `emailgateway.getevents` (read), `emailgateway.aggrevents` (read), `emailgateway.dailyseries` (read), `suppression.browse` (read), `suppression.check` (read), `suppression.stats` (read), `smssuppression.browse` (read), `smssuppression.stats` (read), `smssuppression.patterns.browse` (read), `lists.get` (read), `lists.overview` (read), `lists.stats` (read), `list.get` (read), `list.assets` (read), `list.getactivityseries` (read), `list.getsubscriberstatusbreakdown` (read), `list.getbouncetrend` (read), `list.getengagementtiers` (read), `list.getsendtimeheatmap` (read), `list.gettenuredistribution` (read), `list.getespbreakdown` (read), `list.getsourcebreakdown` (read), `list.getctrretentionmatrix` (read), `list.sms.settings.get` (read), `customfields.get` (read), `listintegration.geturls` (read), `listintegration.generatesubscriptionformhtmlcode` (read), `listintegration.generateunsubscriptionformhtmlcode` (read), `subscribers.get` (read), `subscribers.search` (read), `subscriber.get` (read), `subscriber.get.activity` (read), `subscriber.activity.timeline` (read), `subscriber.events` (read), `subscriber.exists` (read), `subscriber.sms.events.get` (read), `subscriber.tags.get` (read), `website_events.properties` (read), `subscribers.import.get` (read), `segments.get` (read), `segments.rulevocabulary.get` (read), `emails.get` (read), `email.get` (read), `email.personalizationtags` (read), `personalization.gettags` (read), `email.render` (read), `email.html2text` (read), `email.smtp.render` (read), `email.templates.get` (read), `email.template.get` (read), `useremailtemplates.get` (read), `useremailtemplate.get` (read), `useremailtemplate.preview` (read), `media.browse` (read), `media.retrieve` (read), `campaigns.get` (read), `campaigns.counts` (read), `campaign.get` (read), `campaign.recipients.get` (read), `campaign.linkclicks.get` (read), `campaign.recipients.activity.get` (read), `campaign.abtest.get` (read), `campaigns.archive.geturl` (read), `search.filters.get` (read), `tags.get` (read), `autoresponders.get` (read), `autoresponders.acrosslists.get` (read), `autoresponder.get` (read), `autoresponder.activity.get` (read), `autoresponder.stats.window.get` (read), `journey.list` (read), `journey.get` (read), `journey.action.subscribers` (read), `journey.sendemailactions` (read), `journey.stats.byisp` (read), `journey.stats.byaction` (read), `account.journey.benchmark` (read), `subscriber.journey.list` (read), `smscampaign.get` (read), `smscampaign.browse` (read), `smscampaign.summary.get` (read), `smscampaign.stats` (read), `smscampaign.stats.timeseries` (read), `smscampaign.stats.breakdown` (read), `smscampaign.recipients.browse` (read), `smscampaign.events.browse` (read), `smscampaign.replies.browse` (read), `smscampaign.linkclicks.get` (read), `smscampaign.audience.count` (read), `smscampaign.estimate` (read), `smscampaign.estimate.get` (read), `sms.stats.account` (read), `sms.replies.browse` (read), `sms.replies.summary.get` (read), `sms.gateways.get` (read), `sms.mergetags.get` (read), `sms.testnumbers.get` (read), `smstemplate.get` (read), `smstemplate.browse` (read) |
| Content.Edit | `segment.create`, `segment.update`, `segments.copy`, `email.spamtest` (read), `stripo.editor.get` (read), `stripo.auth` (read), `email.create`, `email.duplicate`, `email.update`, `attachment.delete`, `email.template.create`, `email.template.update`, `email.template.thumbnail.upload`, `useremailtemplate.create`, `useremailtemplate.update`, `useremailtemplate.copy`, `media.upload`, `media.foldercreate`, `campaign.create`, `campaign.copy`, `campaign.update`, `splittest.create`, `search.filters.create`, `search.filters.update`, `search.filters.delete`, `tag.create`, `tag.update`, `tag.assigntocampaigns`, `tag.unassignfromcampaigns`, `smscampaign.test.preview` (read), `smscampaign.create`, `smscampaign.update`, `smscampaign.rename`, `smscampaign.copy`, `smstemplate.create`, `smstemplate.update` |
| Content.Delete | `segments.delete`, `email.delete`, `email.template.delete`, `useremailtemplate.delete`, `media.delete`, `media.folderdelete`, `tags.delete`, `campaigns.delete`, `smscampaign.delete`, `smstemplate.delete` |
| Campaigns.Send | `email.emailpreview`, `campaign.pause`, `campaign.resume`, `campaign.cancel`, `journey.enable`, `journeys.enable`, `subscriber.journey.trigger`, `subscribers.journey.bulk`, `smscampaign.send`, `smscampaign.schedule`, `smscampaign.pause`, `smscampaign.resume`, `smscampaign.cancel`, `smscampaign.test`, `sms.send`, `sms.testnumber.add`, `sms.testnumber.verify`, `sms.testnumber.delete` |
| Automation.Manage | `autoresponder.create`, `autoresponder.update`, `autoresponder.duplicate`, `autoresponder.sendtest`, `autoresponders.copy`, `autoresponders.delete`, `journey.create`, `journey.clone`, `journey.update`, `journey.actions.update`, `journey.actions.published`, `journey.delete`, `journey.disable`, `journeys.delete`, `journeys.disable`, `journeys.clone`, `subscriber.journey.remove`, `subscriber.journey.exit` |
| Audience.Manage | `suppression.delete`, `suppression.import`, `smssuppression.add`, `smssuppression.delete`, `smssuppression.patterns.add`, `smssuppression.patterns.delete`, `list.create`, `list.clone`, `list.update`, `list.archive`, `list.unarchive`, `lists.delete`, `list.sms.settings.update`, `customfield.create`, `customfield.update`, `customfields.copy`, `customfields.delete`, `listintegration.addurl`, `listintegration.deleteurls`, `listintegration.testurl`, `subscriber.create`, `subscriber.update`, `subscriber.unsubscribe`, `subscribers.delete`, `subscribers.delete.all`, `subscribers.import`, `subscribers.import.post`, `subscribers.import.prepare`, `subscriber.tags.create`, `subscriber.tags.update`, `subscriber.tags.delete`, `subscriber.tag`, `subscriber.untag`, `event.track` |
| Data.Export | `emailgateway.exportevents`, `subscribers.export.post`, `subscribers.export.get` (read), `campaigns.export.post`, `campaigns.export.get` (read), `journey.export.submit`, `journey.export.get` (read), `smscampaign.events.export.post`, `smscampaign.events.export.get` (read) |
| Account.Settings | `user.emailcontent.update`, `user.integrations.keitaro.get` (read), `user.integrations.keitaro.update`, `user.integrations.keitaro.test`, `user.integrations.keitaro.disconnect`, `user.integrations.keitaro.token.regenerate`, `automated_reports.create`, `automated_reports.update`, `automated_reports.delete`, `automated_reports.toggle` |
| ApiKeys.Manage | `user.apikey.list` (read), `user.apikey.create`, `user.apikey.update`, `user.apikey.delete`, `emailgateway.getapis` (read), `emailgateway.getsmtps` (read), `emailgateway.addapi`, `emailgateway.deleteapi`, `emailgateway.replaceapi`, `emailgateway.addsmtp`, `emailgateway.deletesmtp`, `emailgateway.resetsmtppassword` |
| SenderDomains.Manage | `user.senderdomain.create`, `user.senderdomain.update`, `user.senderdomain.delete`, `user.senderdomain.verify`, `user.senderdomain.sendtest`, `dns.authorize`, `dns.set`, `emailgateway.adddomain`, `emailgateway.updatedomain`, `emailgateway.verifydomain`, `emailgateway.deletedomain`, `emailgateway.cleardomainqueue` |
| Webhooks.Manage | `user.webhook.list` (read), `user.webhook.get` (read), `user.webhook.stats` (read), `user.webhook.create`, `user.webhook.update`, `user.webhook.delete`, `emailgateway.getwebhooks` (read), `emailgateway.addwebhook`, `emailgateway.deletewebhook`, `emailgateway.regeneratesigningkey`, `emailgateway.testwebhook` |
| (session) | `user.current`, `user.logout` |
| (owner) | `user.update` |
| (public) | `user.login`, `admin.login`, `admin.passwordremind`, `admin.passwordreset`, `member.login`, `member.memberships`, `member.switch`, `member.logout`, `member.passwordremind`, `member.passwordreset`, `member.2fa.enrol`, `member.2fa.verify`, `member.2fa.disable`, `system.health.check`, `inbound.relay.domain.check`, `process_pmta_log_file`, `internal.bounce.register`, `internal.s2spostback.register`, `emailgateway.sendemail`, `emailgateway.getevents.public`, `emailgateway.addwebhook.public`, `emailgateway.getwebhooks.public`, `emailgateway.deletewebhook.public`, `subscriber.subscribe`, `subscriber.optin`, `subscriber.login`, `subscriber.getlists` |

## Member Sign In

<Badge type="info" text="POST" /> `/api/v1/member.login`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- No authentication required
- v1 REST alias: `POST /api/v1/member.login`. Legacy access via `/api.php` is also supported
- Repeated failures for one email address or one client address are refused with error `429` for a while, as for `user.login`
:::

Signs a team member in and opens a person session. The response lists the accounts the person can switch to.

When the person has two-factor authentication on, send the six-digit code from the authenticator as `TFACode`. A first request without it answers error `6`, which tells the client to ask for the code. `TFARecoveryCode` replaces the code with the recovery key from enrolment: it signs the person in and turns their two-factor authentication off, so they have to enrol again.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.login` |
| EmailAddress | String | Yes | The person's email address. Matched without regard to case |
| Password | String | Yes | The person's password |
| TFACode | String | Conditional | Six-digit code, required when the person has two-factor authentication on |
| TFARecoveryCode | String | No | Recovery key, instead of `TFACode` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.login",
    "EmailAddress": "alex@agency.example",
    "Password": "their-password",
    "TFACode": "123456"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SessionID": "a1b2c3d4e5f6g7h8i9j0k1l2m3",
  "PersonSessionExpiresAt": "2026-10-26 15:30:00",
  "Person": {
    "PersonID": "12",
    "EmailAddress": "alex@agency.example",
    "2FA_Enabled": "Yes",
    "Status": "Active",
    "CreatedAt": "2026-10-20 09:12:44",
    "LastLoginAt": "2026-10-26 15:00:00"
  },
  "Memberships": [
    {
      "MembershipID": 31,
      "AccountID": 1042,
      "AccountName": "Acme Coffee",
      "Role": "Admin",
      "TwoFactorRequired": false,
      "CanSwitch": true
    },
    {
      "MembershipID": 35,
      "AccountID": 2210,
      "AccountName": "Northwind Books",
      "Role": "Viewer",
      "TwoFactorRequired": true,
      "CanSwitch": true
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Invalid login information"
}
```

```txt [Error Codes]
0: Success
1: EmailAddress is missing
2: Password is missing
3: Invalid login information (the same answer for an unknown address, a wrong password and a disabled person)
6: Two-factor authentication code is required, or the code or recovery key is wrong
7: Team members are not available on this installation
429: Too many failed attempts. Try again later (RetryAfterSeconds says when)
```

:::

`PersonSessionExpiresAt` is in UTC. `Memberships` lists only active memberships in accounts that allow team members. `CanSwitch` is `false` when the account requires two-factor authentication and the person has none yet. Dates in `Person` are UTC.

## List Member Accounts

<Badge type="info" text="GET" /> `/api/v1/member.memberships`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- Authentication required: A person session from `member.login` or a member session from `member.switch`
- v1 REST alias: `GET /api/v1/member.memberships`. Legacy access via `/api.php` is also supported
:::

Returns the signed-in person and the accounts they can switch to, for an account switcher.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.memberships` |
| SessionID | String | Yes | Person or member session |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.memberships",
    "SessionID": "session-id-from-member-login"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Person": {
    "PersonID": "12",
    "EmailAddress": "alex@agency.example",
    "2FA_Enabled": "Yes",
    "Status": "Active",
    "CreatedAt": "2026-10-20 09:12:44",
    "LastLoginAt": "2026-10-26 15:00:00"
  },
  "Memberships": [
    {
      "MembershipID": 31,
      "AccountID": 1042,
      "AccountName": "Acme Coffee",
      "Role": "Admin",
      "TwoFactorRequired": false,
      "CanSwitch": true
    }
  ],
  "CurrentMembershipID": 31
}
```

```txt [Error Codes]
0: Success
7: Team members are not available on this installation
99998: No person or member session (sign in with member.login)
```

:::

`CurrentMembershipID` is the membership the session acts in, or `0` for a person session.

## Switch to an Account

<Badge type="info" text="POST" /> `/api/v1/member.switch`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- Authentication required: A person session from `member.login`, or a member session to move to another account
- v1 REST alias: `POST /api/v1/member.switch`. Legacy access via `/api.php` is also supported
:::

Opens a member session for one of the person's memberships. The response carries a **new** `SessionID`; use it for every following call. The `SessionID` sent with the request stops working.

When the account's user group requires two-factor authentication from members and the person has none, the call answers error `100020`. Enrol with `member.2fa.enrol` and `member.2fa.verify` using the same session, then call `member.switch` again.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.switch` |
| SessionID | String | Yes | Person or member session |
| MembershipID | Integer | Yes | One of the `MembershipID`s from `member.login` or `member.memberships` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.switch",
    "SessionID": "session-id-from-member-login",
    "MembershipID": 31
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SessionID": "n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "Membership": {
    "MembershipID": 31,
    "AccountID": 1042,
    "AccountName": "Acme Coffee",
    "Role": "Admin"
  },
  "Person": {
    "PersonID": "12",
    "EmailAddress": "alex@agency.example",
    "2FA_Enabled": "Yes",
    "Status": "Active",
    "CreatedAt": "2026-10-20 09:12:44",
    "LastLoginAt": "2026-10-26 15:00:00"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 100020,
  "ErrorText": "This account requires two-factor authentication. Enrol with member.2fa.enrol and member.2fa.verify, then switch again"
}
```

```txt [Error Codes]
0: Success
1: MembershipID is missing
2: No active membership with this MembershipID for the signed-in person
3: This account is not available to team members (disabled, or team members are turned off for its user group)
7: Team members are not available on this installation
99998: No person or member session (sign in with member.login)
100020: The account requires two-factor authentication and the person has none
```

:::

A member session ends with error `99998` on the first request after a change takes away its access. The response then carries `MemberSessionEnded` with one of these reasons, and `ErrorText` with a sentence to show:

| MemberSessionEnded | Cause |
|--------------------|-------|
| `membership_removed` | The membership was deleted |
| `membership_suspended` | The membership was suspended |
| `membership_changed` | The membership's role changed, or its sessions were ended |
| `person_disabled` | The person was disabled |
| `person_credentials_changed` | The person's password changed |
| `account_disabled` | The account is disabled or its trial expired |
| `account_credentials_changed` | The account's own username or password changed |
| `team_members_disabled` | Team members are turned off for the account's user group |
| `two_factor_required` | The user group requires two-factor authentication and the person has none |
| `invalid_session` | The session data is not valid |

```json
{
  "Success": false,
  "ErrorCode": 99998,
  "ErrorText": "Your access to this account is suspended",
  "MemberSessionEnded": "membership_suspended"
}
```

The person session, if it has not expired, stays usable after such an end, so the person can switch to another account.

## Member Sign Out

<Badge type="info" text="POST" /> `/api/v1/member.logout`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- Authentication required: A person session or a member session
- v1 REST alias: `POST /api/v1/member.logout`. Legacy access via `/api.php` is also supported
:::

Ends the calling session entirely: the account access and the person sign-in. The `SessionID` stops working at once.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.logout` |
| SessionID | String | Yes | Person or member session |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.logout",
    "SessionID": "session-id-from-member-switch"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```txt [Error Codes]
0: Success
99998: No person or member session
```

:::

## Send Member Password Reminder

<Badge type="info" text="POST" /> `/api/v1/member.passwordremind`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- No authentication required
- v1 REST alias: `POST /api/v1/member.passwordremind`. Legacy access via `/api.php` is also supported
- Every request counts toward a limit per email address and client address (error `429`)
:::

Emails the team member a link to choose a new password. The link is valid for one hour and works once. A team member's password belongs to the person, not to any account, so this never changes an account's password.

The answer is the same whether or not the address belongs to a team member, and nothing is sent for an unknown address.

With `ReturnParams` and the master `AdminAPIKey`, no email is sent and the token is returned as `PasswordResetToken`, so an interface can send its own link. It is empty for an unknown address.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.passwordremind` |
| EmailAddress | String | Yes | The person's email address |
| ReturnParams | Boolean | No | Return the token instead of emailing it. Honoured only with the master `AdminAPIKey` |
| AdminAPIKey | String | No | The master admin API key, with `ReturnParams` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.passwordremind",
    "EmailAddress": "alex@agency.example"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```txt [Error Codes]
0: Success
1: EmailAddress is missing
2: EmailAddress is not valid
7: Team members are not available on this installation
429: Too many requests. Try again later
```

:::

## Reset Member Password

<Badge type="info" text="POST" /> `/api/v1/member.passwordreset`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- No authentication required. The reset token is the credential
- v1 REST alias: `POST /api/v1/member.passwordreset`. Legacy access via `/api.php` is also supported
:::

Sets a new password with the token from `member.passwordremind`. Every open session of the person ends on its next request, and the token stops working.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.passwordreset` |
| ResetToken | String | Yes | The token from the reset link |
| NewPassword | String | Yes | At least 8 characters and at most 72 bytes |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.passwordreset",
    "ResetToken": "MTItMTc2MTQ5MzQwMC1hYmNk...",
    "NewPassword": "a-new-long-password"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": "The reset link is invalid or has expired"
}
```

```txt [Error Codes]
0: Success
1: ResetToken or NewPassword is missing
2: The token is invalid, expired or already used
3: NewPassword is shorter than 8 characters or longer than 72 bytes
4: NewPassword is the current password
5: The password could not be changed
7: Team members are not available on this installation
```

:::

## Enrol Member Two-Factor Authentication

<Badge type="info" text="POST" /> `/api/v1/member.2fa.enrol`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- Authentication required: A person session or a member session
- v1 REST alias: `POST /api/v1/member.2fa.enrol`. Legacy access via `/api.php` is also supported
:::

Issues the secret for an authenticator app, and a recovery key. Nothing is turned on yet: call `member.2fa.verify` with a code from the authenticator to turn two-factor authentication on. Calling it again before verifying returns the same secret, unless `Regenerate` is set. Once two-factor authentication is on, the secret is never returned again.

Works from a person session, so a member can enrol before switching into an account that requires it.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.2fa.enrol` |
| SessionID | String | Yes | Person or member session |
| Regenerate | Boolean | No | Issue a new secret instead of the pending one |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.2fa.enrol",
    "SessionID": "session-id-from-member-login"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SecretKey": "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ",
  "RecoveryKey": "1a2b-3c4d-5e6f-7a8b-9c0d-1e2f-3a4b-5c6d",
  "Issuer": "Octeth",
  "OTPAuthURL": "otpauth://totp/Octeth%3Aalex%40agency.example?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ&issuer=Octeth",
  "QRCodeURL": "https://example.com/system/qr?data=otpauth://totp/..."
}
```

```txt [Error Codes]
0: Success
2: Two-factor authentication is already on
3: Two-factor authentication could not be set up
7: Team members are not available on this installation
99998: No person or member session
```

:::

Store the recovery key somewhere safe: `member.login` accepts it as `TFARecoveryCode` when the authenticator is lost.

## Verify Member Two-Factor Authentication

<Badge type="info" text="POST" /> `/api/v1/member.2fa.verify`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- Authentication required: A person session or a member session
- v1 REST alias: `POST /api/v1/member.2fa.verify`. Legacy access via `/api.php` is also supported
:::

Turns two-factor authentication on once a code from the enrolled authenticator checks out. From then on `member.login` asks for a code. Each code is accepted once.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.2fa.verify` |
| SessionID | String | Yes | Person or member session |
| Code | String | Yes | Six-digit code from the authenticator |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.2fa.verify",
    "SessionID": "session-id-from-member-login",
    "Code": "123456"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "2FA_Enabled": "Yes"
}
```

```txt [Error Codes]
0: Success
1: Code is missing
2: Two-factor authentication is already on
3: No authenticator is enrolled (call member.2fa.enrol first)
4: The code could not be verified
7: Team members are not available on this installation
99998: No person or member session
```

:::

## Disable Member Two-Factor Authentication

<Badge type="info" text="POST" /> `/api/v1/member.2fa.disable`

<Badge type="tip" text="New in v6.0.5" />

::: tip API Usage Notes
- Authentication required: A person session or a member session
- v1 REST alias: `POST /api/v1/member.2fa.disable`. Legacy access via `/api.php` is also supported
- Wrong passwords count toward the same limit as `member.login` (error `429`)
:::

Turns the person's two-factor authentication off after confirming their password, and clears the secret and recovery key. A member session in an account that requires two-factor authentication ends on its next request.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `member.2fa.disable` |
| SessionID | String | Yes | Person or member session |
| CurrentPassword | String | Yes | The person's password |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "member.2fa.disable",
    "SessionID": "session-id-from-member-login",
    "CurrentPassword": "their-password"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "2FA_Enabled": "No"
}
```

```txt [Error Codes]
0: Success
1: CurrentPassword is missing
3: CurrentPassword is incorrect
7: Team members are not available on this installation
99998: No person or member session
429: Too many failed attempts. Try again later
```

:::
