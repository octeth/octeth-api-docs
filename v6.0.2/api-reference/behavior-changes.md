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

### User Groups (theme cleanup)

- `UserGroup.Delete` now also deletes the deleted group's own theme when no other group references it and it is not the system default theme (octeth/oempro#3391). The response is unchanged.

### Users

- `Users.Delete` now deletes what the deleted user owned: their lists with each list's subscriber tables, their segments, user API keys (AI agent keys included), email gateway API keys and SMTP credentials, and their risk snapshots. Their email gateway sender domains are soft-deleted, and unfinished SMS campaigns are cancelled. Before, all of these were left behind, and a deleted user's email gateway SMTP login kept working (octeth/oempro#3389). Statistics, logs and other history rows are kept. The response is unchanged. To find what earlier deletions left behind, run `./cli/octeth.sh users:orphans`, which reports orphaned lists, segments, subscriber tables and themes and deletes them only with `--delete --yes`.

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

### User Groups

#### A subscription plan has exactly one default user group

The database now enforces one default user group per subscription plan with a unique index. The commands that write a default answer a conflict with the `ErrorCode 34` refusal that `usergroup.create` and `usergroup.patch` already used, carrying `ConflictingUserGroupID` and an `ErrorText` naming the group (issue #3181):

- `usergroup.create` and `usergroup.patch` also return `ErrorCode 34` when a concurrent request made another group the plan's default first. Before v6.0.2 both requests could succeed and leave two defaults.
- `usergroup.update` returns `ErrorCode 34` when it would move a plan's default group onto a plan that already has one. It used to succeed.
- `usergroup.duplicate` creates the copy with `SubscriptionPlanIsDefault` set to `No`. It used to copy the original's default status.
- `usergroup.update` refuses a parameter sent as an array or object, where a single value is expected, with `ErrorCode 36` and `ErrorField` naming it.

The upgrade migration resolves any plan that already has more than one default: it keeps the group with the lowest `UserGroupID` as the default, sets the others to `No`, and writes each demoted group to the application log. The group it keeps is the one new signups on that plan were most likely already reaching.

## Additions that need operator attention

### AI assistant connector

#### New root-level paths `/mcp`, `/oauth/` and `/.well-known/oauth-*` are served by the new user interface

v6.0.2 adds a built-in connector so customers can connect Claude, ChatGPT and other AI assistants that support remote MCP connectors to their account with one URL, `https://<app domain>/mcp`, and their normal sign-in (issue #3369). The assistant gets read-only access. See [Connect Claude or ChatGPT](/v6.0.2/new-user-interface/ai-assistants).

The connector requires `UI_ENABLED=true` and an app domain reachable from the internet over `https://`. When `UI_ENABLED` is `true`, the bundled HAProxy now sends `/mcp`, `/oauth/`, `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` to the interface container instead of the classic application. These paths sit at the root of the app domain, not under `/user/`. Installs with `UI_ENABLED=false` route them as before.

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
- The assistant can assign a delivery server only to a user group with no users that receives users only by your hand. The signup group, the groups a signup picks from and, with `UI_ENABLED=true`, every billing plan, signup, suspension, cancellation and default group of the new user interface stay manual. While the interface is on, an assignment that does not come through its built-in connector is refused.
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
- Remove any calls to the `postmaster.*` commands. They answer `ErrorCode: 99` in v6.0.2 and will be deleted later.
- The upgrade leaves `GOOGLE_POSTMASTER_CLIENT_ID`, `GOOGLE_POSTMASTER_CLIENT_SECRET` and `GOOGLE_POSTMASTER_REDIRECT_URI` in your `.oempro_env`. Nothing reads them any more, so you can delete them.
- Octeth does not revoke the OAuth grant you gave it in your Google account. Revoke it there, under your Google account's third-party access settings, and delete the OAuth client in Google Cloud if nothing else uses it.

---

Previous releases: [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
