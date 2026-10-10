---
layout: doc
title: API Behavior Changes in v6.0.1
description: Deliberate API behavior changes in Octeth v6.0.1 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.1

This page lists every deliberate change in v6.0.1 that an existing integration can observe, so you can check your code against it before upgrading.

## Tier 1: changes that can break an integration

### Email gateway

#### A disabled account or an inactive sender domain stops gateway sending

`emailgateway.sendemail` now rejects a request when the sender domain owner's account is disabled. It answers HTTP `403` with `{"Errors":[{"Code":12,"Message":"Invalid or deactivated user account"}]}` and nothing is queued. Before v6.0.1, such a request was accepted and queued, so disabling an account did not stop it from sending through the gateway API. A sender domain that is not active still answers HTTP `403` with code `32`, as before. If the account is disabled and the domain is also inactive, the answer is code `12`.

The same check now runs when queued email is delivered, for the gateway API and the SMTP relay alike. Email already in the queue when the account is disabled, or when the sender domain becomes `Approval Pending`, `Suspended` or `Blocked`, is not sent and no credit is charged. Its status becomes `Failed` with the message `Sending blocked: account disabled` or `Sending blocked: sender domain <status>`. Re-enabling the account or the domain does not resend it. This includes email scheduled with `SendAt` that comes due while the account or domain is blocked.

Tracked links in gateway email return HTTP `404` once their sender domain is `Approval Pending`, `Suspended` or `Blocked`, in the same way they already did for a disabled account.

This is a deliberate exception to the rule that a contract change goes behind an opt-in flag. It is the control an operator uses to stop abuse, so there is no configuration under which a disabled account should keep sending.

#### User group send-rate limits apply to accounts on a billing plan

Before v6.0.1, the new interface's billing layer wrote a per-account rate limit override with every interval unlimited whenever a plan moved an account to a user group. A per-account override replaces the group's limits, so the email gateway and SMS send-rate limits configured on the group never applied to those accounts. Billing no longer writes the override, and an upgrade migration clears the copies already stored.

After the upgrade, the group's `DefaultRateLimits` apply to these accounts. An email gateway send over a limit is rejected with HTTP `429` and error code `429`. The migration clears only the exact document billing wrote: every interval of both channels set to `-1`. An administrator who typed that exact document on an account is cleared too, and that account falls back to its group's limits. Any other per-account override is left alone and still replaces the group's limits.

A queued message is no longer failed at delivery with "Email send rate limit has been exceeded." just because the account reached, but did not exceed, its limit when the message was accepted.

#### The daily email limit applies to the email gateway

The user group's daily email limit (`LimitEmailSendPerDay`) was enforced only for campaigns. It now also applies to `emailgateway.sendemail` (HTTP `429`, error code `17`) and to the SMTP relay (error code `13`). It counts the account's email gateway messages for the server's calendar day, including messages that are queued but not yet delivered. A group with no daily limit (`0`) is unaffected.

#### An Untrusted account cannot send through the gateway API

`emailgateway.sendemail` now requires the sender domain owner's account to be `Trusted`. A request from an `Untrusted` account answers HTTP `403` with `{"Errors":[{"Code":40,"Message":"Account pending approval"}]}` and nothing is queued. Before v6.0.1, only the SMTP relay checked the reputation level, so marking an account `Untrusted` did not stop it from sending through the HTTP API. A disabled account (code `12`) or an inactive sender domain (code `32`) is still reported first.

Journey "Send email" actions send through `emailgateway.sendemail`, so they stop for an `Untrusted` account too. Email already queued for an account that is moved to `Untrusted` is not sent: its status becomes `Failed` with the message `Sending blocked: account pending approval`, and marking the account `Trusted` does not resend it. Tracked links in email already delivered keep working.

Accounts created through the legacy signup and single sign-on have been `Untrusted` by default for many releases, so some installs have customers who send through the gateway API as `Untrusted`. **Their gateway and journey email stops after the upgrade** until an administrator marks them `Trusted`. To keep the previous behaviour instead, set `EMAILGATEWAY_REQUIRE_TRUSTED=false`. The upgrade adds the key as `true`.

### Emails

#### `email.update` refuses a campaign From address that has no domain

With `ValidateScope=Campaign`, `email.update` now answers `{"Success": false, "ErrorCode": 21, "ErrorText": "..."}` and leaves the email unchanged when `FromEmail` has no `@`, carries no merge tag such as `%MFROMDomain%`, and no sender domain applies. A sender domain applies only when the user group has `SenderDomainManagement=Enabled` and either the `SenderDomain` parameter is sent or the email already has a sender domain stored. The check runs whether sender domain management is enabled or not. It does not apply when the user group's marketing delivery server enforces a From address, because that address replaces the stored one for every recipient.

Before v6.0.1 such a value was stored with `{"Success": true}`, and every recipient of a campaign using it failed at send time with `Invalid From email address`. The check therefore changes no call that produced a sendable email. `OptIn` and `AutoResponder` scopes are not affected, and a call that does not send `FromEmail` is not affected either.

Emails already stored with a domainless From address are not repaired by the upgrade. To find them, list campaign emails whose `FromEmail` has no `@` and no `%` and whose `Options` has no `SenderDomain`, then send a full address, or a local part with `SenderDomain`, through `email.update`.

### Users

#### `user.create` without `ReputationLevel` creates an Untrusted account

`user.create` used to store `Trusted` when `ReputationLevel` was omitted or empty. It now stores the **New user reputation** setting from **Settings > ESP Settings** (`USER_SIGNUP_REPUTATION`), which is `Untrusted` on a default install. The response is unchanged. An explicit `ReputationLevel` is stored as given, as before, and the administration area's "Create user" form still creates `Trusted` accounts.

This closes the path by which every account created through the new user interface's registration page became `Trusted` and could send at once, whatever the operator had chosen. Like the gateway checks above, it is a deliberate exception to the opt-in flag rule: the old default granted trust that the operator's setting denied. Accounts created through the new interface since v6.0.0 are not changed by the upgrade. To review them, list users whose `ReputationLevel` is `Trusted` and whose `UserSince` is after your v6.0.0 upgrade.

#### `user.switch` refuses a disabled account

`user.switch` now answers `{"Success":false,"ErrorCode":4,"ErrorText":"Target account is disabled"}` when the target account's status is not `Enabled`, and creates no session. Before v6.0.1 it answered `Success: true` with a `SessionID`, but every user command made with that session then failed with error `99998` ("Authentication failure or session expired"), so the switch looked successful and the account looked like an expired session. Accounts created through the new interface's registration page stay disabled until the email address is verified, so they are refused too. Codes `1`, `2`, `3` and `5003` are still checked first.

There is no opt-in flag, because the old session could not authenticate any command. The administration area's "Login as user" links on a disabled account now return to the account's edit page with the error, instead of opening the user login page.

#### `user.current` no longer returns the two-factor recovery code

Once two-factor authentication is enabled, `user.current` no longer returns `UserInfo.MFA_RecoveryCode`, and it returns no other two-factor value in that state: no `MFA_SecretKey` and no `MFA_QRCode`. While two-factor authentication is off, it still returns `MFA_SecretKey` and `MFA_QRCode` for enrolment, as before.

The recovery code is now returned once, at enrolment. The `user.update` call that enables two-factor authentication (`Enable2FA=true` with a valid `2FACode`) returns it as a top-level `MFA_RecoveryCode` key next to `Success`. Every other `user.update` response is unchanged. Store the code when you receive it, because no API call returns it again. To get a new recovery code, disable two-factor authentication with `Cancel2FA=true` and enable it again.

The user area's Account page follows the same rule: it shows the recovery code on the page that confirms two-factor authentication was enabled, and afterwards shows a note in its place.

This is a hardening change. The recovery code switches two-factor authentication off when it is used at login, so it should not appear in a response that is read on every page load. It is a deliberate exception to the opt-in flag rule for the same reason. New two-factor secrets for users and administrators are also generated from a cryptographic random source now. Existing enrolments keep working unchanged.

#### User and subscriber limits come from the signed license key

`user.create` answers ErrorCode `16` once the license's user account limit is reached. Adding a new subscriber through `subscriber.create`, `subscriber.subscribe`, `subscriber.optin` or an import answers with that call's existing subscriber-limit error once the license's active subscriber limit is reached across the installation. An import stops once the remaining allowance is used, and the rows before that point stay imported. The limits come from the signed license key in `LICENSE_KEY`, or the one pasted on Settings > License. Without a valid key, including a short `OCT-...` key, the Community limits apply (one user account, 10,000 active subscribers): on an upgraded installation after a 30-day grace period, and at once on a fresh installation or with a `LICENSE_KEY` starting with `CE`. Updates to existing subscribers and all sending are not affected, and no response field changes. `emailgateway.getwebhooks` returns the same `SigningKey` before and after the license key changes.

### Credentials in admin and SSO responses

#### User group and delivery server responses no longer carry SMTP credentials

`usergroup.get` and `usergroups.get` no longer return `SendMethodSMTPUsername` or `SendMethodSMTPPassword`. Each group now carries `HasSendMethodSMTPPassword` (`true` when a password is stored). Every other group field is returned as before, with one exception: credential keys nested inside `Options` and `ThemeInformation` (for example `Password`, `APIKey`, `SendMethodSMTPPassword` or `smtp_password`) are removed at any depth. When `Options` holds such a key, the value is returned re-encoded without it, so its bytes can differ from the stored value. A value with no such key is returned byte for byte as stored. A column added to the user groups table in a later release is not returned until it is added to the response deliberately.

`deliveryservers.get` no longer returns `ConnectionParams.smtp_password`. Each server now carries `HasSMTPPassword`, and `DeliveryServerID` is an integer. Each server in the list is now exactly what `deliveryserver.get` returns for it, apart from the user group assignments both already computed. `ConnectionParams` carries `smtp_host`, `smtp_port`, `smtp_secure`, `smtp_timeout`, `smtp_auth` and `smtp_username`, and any other key is withheld.

`deliveryserver.get` returns the same projection. Before v6.0.1 it removed only `smtp_password` from `ConnectionParams` and returned every other stored key. It now returns only the six keys listed above, so any other key stored in `ConnectionParams` is no longer returned. Credential keys nested inside a returned value, and inside `Domains` and `VerificationResults` (for example `Password`, `APIKey` or `smtp_password`), are removed at any depth. `DeliveryServerID` is an integer and `HasSMTPPassword` is unchanged.

`usergroup.update` and `deliveryserver.update` replace the whole record. Because an integration can no longer read the password back, both commands now keep the stored SMTP password when `SendMethodSMTPPassword` is omitted, and `usergroup.update` also keeps the stored `SendMethodSMTPUsername` when it is omitted. Before, an omitted value was stored as empty, which broke the group's or server's sending. Sending a value, including an empty string, still replaces the stored one.

This is a hardening change and a deliberate exception to the rule that a contract change goes behind an opt-in flag. These are platform credentials shared by every account in the group, and anything that logs or renders an admin response could expose them.

#### `admin.users.search` returns only published user fields

`admin.users.search` now returns the same user fields as `users.get`. It used to remove credential columns by name, so any column added to the users table later would have been returned by default. Now a column added later is not returned until it is added to the response deliberately. The fields returned today are unchanged.

#### Single sign-on "Return user data" no longer includes credentials

When an SSO source has **Return user data** (`Options.ReturnUserData`) enabled, the JSON it returns is now the same user projection `user.login` returns, plus `_SessionID`, `_Impersonate` and `_ImpersonateLeaveURL` as before. It no longer includes the password hash, `AuthToken`, the two-factor secrets, `APIKey`, or the group's SMTP and delivery-server credentials inside `GroupInformation`.

### Merge tags in email and SMS content

#### User and List merge tags render only their documented fields

Handlebars-style merge tags in email content (subject, HTML and plain text, From and Reply-To) and in SMS content now read a fixed set of fields. This applies to every path that renders content: campaign sends, autoresponders, transactional email, journey "Send email" actions, the email gateway, test emails, previews, the web browser view, RSS and `email.render`.

- <code v-pre>{{ User:\* }}</code> renders only `FirstName`, `LastName`, `EmailAddress`, `CompanyName`, `Website`, `Street`, `City`, `State`, `Zip`, `Country`, `Phone`, `Fax` and `TimeZone`, the same 13 fields as the legacy `%User:*%` tags. Every other account column renders empty, including `Username` and `UserID`, and so does every nested path such as <code v-pre>{{ User:GroupInformation:... }}</code>. SMS content reads the same list.
- <code v-pre>{{ List:\* }}</code> renders only `ListID`, `Name`, `SenderName`, `SenderEmailAddress`, `SenderAddress` and `SenderCompany`, the documented list tags. Every other list column renders empty, and so does every nested path such as <code v-pre>{{ List:Options:... }}</code>. This applies to SMS content too.
- <code v-pre>{{ Campaign:\* }}</code>, <code v-pre>{{ AutoResponder:\* }}</code> and <code v-pre>{{ Queue:\* }}</code> still render every column of their row, but no longer reach nested values (for example <code v-pre>{{ Campaign:SplitTest:... }}</code>), which never rendered as readable text.

Before v6.0.1, <code v-pre>{{ User:\* }}</code> and <code v-pre>{{ List:\* }}</code> could name any column of the account or list row, and the account row carried the user group and its delivery servers. Anyone able to author email content could render the account's API key, password hash and two-factor secrets, the user group's SMTP password, the delivery servers' connection parameters, and a list's synchronization database password and ClickBank secret key. The legacy `%User:*%` and `%List:*%` tags were never affected.

This is a hardening change and a deliberate exception to the rule that a behavior change goes behind an opt-in flag: there is no configuration under which email content should be able to read platform credentials.

**Rotate credentials if untrusted accounts author email.** On an install where accounts you do not fully trust can create email content, treat the SMTP passwords stored on user groups and the credentials stored on delivery servers as possibly exposed, and rotate them. Account holders should consider regenerating their API keys, and resetting two-factor authentication where an untrusted sub-user or API client could author email on their account.

### Sender domains

#### `user.senderdomain.verify` honours manual approval and administrator blocks

When the account's user group has **New domains need manual approval** (`EmailGatewayNewDomainManualApproval`) enabled, a domain that passes DNS verification through `user.senderdomain.verify` now ends as `Blocked` (awaiting administrator approval) instead of `Enabled`, as `emailgateway.verifydomain` already did. The response's `Status` reports `Blocked`. A domain an administrator already approved stays `Enabled` when it is verified again.

A domain that is `Blocked`, `Suspended`, `Disabled` or `Deleted` now keeps that status after a verification, whether DNS passes or fails. Before v6.0.1, a user could move such a domain back to `Enabled` by verifying it, either directly or by first failing DNS (which set `Approval Pending`) and then passing it. Only an administrator can move a domain out of these statuses. This applies to `user.senderdomain.verify`, `emailgateway.verifydomain`, the DNS checker plugin and the scheduled sender-domain re-verification.

#### A suspended or blocked domain cannot be released by its owner

Other user actions could also undo an administrator's `Suspended` or `Blocked` decision, including the manual-approval hold. From v6.0.1:

- `user.senderdomain.update` with `Status` refuses a `Suspended` or `Blocked` domain with error `11`, and refuses to disable an `Approval Pending` domain with error `12` (disabling and then enabling it skipped DNS verification).
- A change to the subdomain or tracking prefix (`user.senderdomain.update`, `emailgateway.updatedomain`) no longer resets a `Suspended` or `Blocked` domain to `Approval Pending`.
- Creating a domain with the name of an existing `Suspended` or `Blocked` domain (`user.senderdomain.create`, `emailgateway.adddomain`) keeps that status instead of resetting it.
- `user.senderdomain.delete` (error `3`, HTTP `422`) and `emailgateway.deletedomain` (`ErrorCode` `3`) refuse to delete a `Suspended` or `Blocked` domain, because deleting and adding it again revived it.

### Monitoring

#### A MySQL outage returns HTTP 503 instead of 200

When Octeth cannot connect to MySQL (connection refused, unknown host, too many connections, authentication failure or a missing database), every web request ends before its handler runs with a plain-text body starting `MySQL Error:`. Before v6.0.1 that response carried HTTP `200`. It now carries HTTP `503` and a `Retry-After: 30` header. The body is unchanged.

This applies to `system.health.check`, which therefore reports a database outage to load balancers and uptime monitors that key on the status code, and to every other API command and page. A monitor that probes a regular page will start alerting during a MySQL outage where it stayed silent before. `system.health.check` also fails its `MySQL` check with `There is no registered admin user.` when the admins table is empty, a case it reported as `OK` before.

### Configuration

#### An unparseable `.oempro_env` now stops Octeth instead of running on defaults

Octeth now refuses to start when `.oempro_env` exists but cannot be parsed. Every web request answers HTTP `500` with a "Configuration error" page, and every CLI worker and cron script exits with status `1`. The message names the file, the line number, the key (when the line has one) and the reason, for example `Unable to parse /var/www/html/.oempro_env at line 1201 (key UI_BRAND_NAME): unexpected whitespace. The value is not shown.` It is written to stderr for CLI processes and to the PHP error log for all processes. The offending value is never shown or logged.

Before this release, a single malformed line anywhere in `.oempro_env` made Octeth discard the whole file without stopping. Every setting then fell back to its built-in default: `MYSQL_HOST` became `localhost`, `APP_URL` became `http://localhost/`, the password salts and `ADMIN_API_KEY` became empty, and `PRODUCT_VERSION` became `5.7.0`. The only record was one line in the PHP error log, and that line contained the offending value.

The other five environment files (`.oempro_clickhouse_env`, `.oempro_mysql_env`, `.oempro_redis_env`, `.oempro_rabbitmq_env`, `.oempro_supervisor_env`) do not stop Octeth. When one of them cannot be parsed, the same message is logged with the prefix `ERROR` instead of `FATAL`, and that file's settings are ignored until the line is fixed, as before. A missing environment file behaves exactly as before.

The `OEMPRO_USE_PHPDOTENV` setting has been removed and is ignored if present. The environment files are always parsed with phpdotenv. Setting it to `false` previously selected a parser that could not read a standard `.oempro_env` (it rejects the `=` padding at the end of `UI_APP_KEY`), so no working installation depended on it. The line can be deleted from `.oempro_env`.

`/opt/octeth/cli/octeth.sh env:validate` now checks a file with the same parser the application uses and reports a parse failure as an error. It names the line and key the same way and never prints the value. The parser check needs PHP on the host. Without it, the command checks only that every line is a comment, blank, or `KEY=VALUE`, and warns that the parser check did not run.

What to check before upgrading: a line that is not `KEY=VALUE`, or a value containing spaces that is not wrapped in quotes, will now stop the installation. If `.oempro_env` has been edited by hand, check it before upgrading, for example by looking for unquoted values with spaces. After upgrading, a "Configuration error" page or a worker exiting at start points to the line to fix. See [Upgrading Octeth](/v6.0.1/getting-started/upgrading-octeth#an-unparseable-oempro-env-now-stops-octeth).

#### Static-certificate installs record the real client address

Applies when `APP_DOMAIN_TLS_CERT` is set. Installs that leave it empty (Caddy on-demand TLS, the default) are unchanged.

HAProxy terminated the app domain's TLS on an internal loopback hop that discarded the connecting address, so Octeth and the new user interface took the visitor's address from the leftmost `X-Forwarded-For` entry, which a client that reaches the server directly can set to anything. That made the admin **Authorized IP Addresses** list, login and audit IPs and the subscription, opt-in and unsubscription IPs forgeable. HAProxy now passes the connecting address across that hop with the PROXY protocol, so the recorded address is the one that actually connected.

**Action required behind Cloudflare.** On an install that uses a static certificate behind Cloudflare, the connecting address is now a Cloudflare edge server. Either list Cloudflare's IPv4 ranges in `TRUSTED_PROXIES`, or set `TRUST_CLOUDFLARE_CONNECTING_IP=true` and firewall the origin to Cloudflare's IP ranges, then restart the containers (`./cli/octeth.sh docker:up`). Otherwise every visitor is recorded with an edge address and an admin allow-list that names your office IP stops matching. The new user interface now reads the same keys. See **Trusted Proxies / Client IP Resolution** in [Octeth Configuration](/v6.0.1/getting-started/octeth-configuration).

**No action required otherwise.** The change is in `entrypoint_haproxy.sh`, which runs from the release source since #3102, and the upgrade rebuilds the HAProxy image for installs whose image predates that, so `./cli/octeth.sh upgrade` applies it. A manual update applies it with `docker compose up -d --build haproxy oempro_ui`.

Login, audit and consent rows written before the upgrade keep whatever address was recorded at the time.

### Bounce webhook

#### The fluentd bounce webhook refuses oversized batches and reports queueing failures

`POST /system/bounce_webhook?type=fluentd` used to answer HTTP `200` with `StatusCode 250` for every request, even when RabbitMQ was unreachable, and a large batch could run past PHP's 30 second limit and fail with HTTP `500` after queueing part of it.

From v6.0.1:

- A request with more than `BOUNCE_WEBHOOK_FLUENTD_MAX_EVENTS` records (default `1000`) answers HTTP `413` with `StatusCode 413` and queues nothing. Senders using Vector's default `http` sink batching must set `batch.max_events` to `1000` or lower.
- When RabbitMQ is unreachable or does not confirm every record, the webhook answers HTTP `503` with `StatusCode 503`. The sender should retry.
- A successful request still answers HTTP `200` with the same `StatusCode 250` body.
- Each request now uses one RabbitMQ connection instead of one per record, so large batches finish in well under a second.

The queue message format consumed by the fluentd processor worker is unchanged. The `type=pmta` path is not affected. See [Bounce Processing](/v6.0.1/using-octeth/email-deliverability/bounce-processing#sending-batches-with-type-fluentd) for a sender sample.

### Suppression

#### Suppression reads apply the same scopes as a campaign send

Before v6.0.1, every suppression read except `suppression.check` matched a suppression entry only when it was scoped to that exact list. Account-wide entries (what "Add to suppression list" writes) and system-wide entries (hard bounces and complaints) were applied when sending but never reported. From v6.0.1 these reads use the list's [effective suppression view](/v6.0.1/api-reference/suppression#effective-suppression-view-of-a-list): list-scoped entries, plus account-wide and system-wide entries for addresses that are on the list, one entry per address. Counts, listings and segment membership change on upgrade, often by a lot for accounts with account-wide or bounce-generated entries.

- **`Suppressed` flag.** `subscriber.get`, `subscriber.create`, `subscribers.search` and `journey.action.subscribers` now report `Suppressed: true` for an address suppressed by a list-scoped, account-wide or system-wide entry, or by a global suppression pattern. It is always `false` for an account with Disable Suppression Check turned on. Phone-only contacts are not reported as suppressed because of their placeholder address.
- **`suppression.browse` and `suppression.stats` with a `ListID`** return the effective view, one entry per address. `Total` in `suppression.stats` equals `TotalRecords` in `suppression.browse` for the same filters. Every `suppression.browse` entry, with or without a `ListID`, carries a new `Scope` field (`PerList`, `AccountWide` or `SystemWide`). Without a `ListID` nothing else changes.
- **`subscribers.get` with `SubscriberSegment=Suppressed`** lists the effective view, with the additive `Scope` column, and `TotalSubscribers` counts the same set. With `SearchField=EmailAddress` and a `SearchKeyword`, it returns the entries of that view whose address contains the keyword, and `TotalSubscribers` counts them. Before v6.0.1 this search ended in a PHP fatal error and returned no valid response. Suppression entries carry no other searchable field, so any other `SearchField` returns no entries and a `TotalSubscribers` of `0`.
- **Segments.** The segment rule "suppression exist / not exist" now matches every address the send path drops. Saved segments that use it change membership and counts, and a "not exist" segment can shrink, which changes who receives a campaign sent to it.
- **Suppressed export.** An export with `Target=Suppressed` lists the effective view. A database failure now marks the export failed instead of producing an empty file.
- **Subscriber page.** The badge and the subscriber card in the user area no longer show a contact as suppressed because of another account's entry. A contact suppressed by this account, by a hard bounce or complaint, or by a pattern now shows as suppressed and Inactive on both.
- **"Remove suppressed subscribers".** The list action in the user area (remove subscribers, "Suppressed") now removes every subscriber of the list that the effective view covers: addresses with a list-scoped entry, an account-wide entry, or a system-wide entry (a hard bounce or complaint). Before v6.0.1 it removed only addresses with a list-scoped or account-wide entry, so subscribers suppressed by a hard bounce or complaint stayed on the list although every send skipped them. On an account with many bounce-generated entries the action removes more subscribers than before. Removed subscribers cannot be restored, so export the `Suppressed` segment first if you may need them.

A database failure while reading the effective view in `suppression.browse` or `suppression.stats` with a `ListID`, or in the `Suppressed` segment of `subscribers.get` with or without a search keyword, now answers the API hard-failure envelope (HTTP `500`, `ErrorCode` `100005`, `ErrorText` `API command failed`) instead of `Success: true` with an empty list or zero counts. If the per-page lookup behind the `Suppressed` flag fails, `subscribers.search` answers error code `7`, and `journey.action.subscribers` returns the rows with `Suppressed: false` and logs the failure.

The `Suppressed` segment total is cached for 300 seconds, so it can show the old count for up to five minutes after the upgrade. To refresh it at once, delete the cached totals:

```bash
docker exec oempro_redis redis-cli --scan --pattern 'subscriber_counts_*_suppressed_*' | xargs -r docker exec -i oempro_redis redis-cli del
```

`suppression.delete` is unchanged. It removes only entries in the requested scope, so an address can remain suppressed by an entry in another scope after a delete. There is no opt-in flag: the old answers disagreed with what a send actually drops.

#### Disable Suppression Check now applies to campaigns

An administrator can turn on **Disable suppression check in outgoing emails** for an account (the admin user edit page, or `user.update` with `DisableSuppressionCheck=true`). Before v6.0.1 it applied to journey, transactional and email gateway email only: campaigns still removed suppressed addresses from their recipients. From v6.0.1 campaigns honour it too. For such an account, a campaign is sent to addresses on the account's or the list's suppression list, to system-wide entries (hard bounces and spam complaints) and to addresses matching a global suppression pattern. The `Suppressed` flag and the campaign send now agree for every account.

Phone-only contacts are still never emailed, whatever the option says.

Accounts that already have the option on start mailing suppressed addresses from their next campaign after the upgrade. Mailing hard-bounced and complaining addresses can damage the sending reputation of shared IPs and domains. Before upgrading, list the accounts that have it on and turn it off where it is not needed.

### Subscribers

#### Required custom fields reject empty values

`subscriber.subscribe` and `subscriber.update` now reject an empty value for a required custom field in every shape below, whether or not the request sends `EnforceRequiredFields`. Before v6.0.1 they did this only with `EnforceRequiredFields=true`. Without it, an empty array or a whitespace-only value was accepted and the field was stored blank.

| Submitted value | Before v6.0.1 | From v6.0.1 |
|---|---|---|
| `[]` (a checkbox group with nothing ticked) | accepted | rejected |
| `['']`, `[' ']` or an unselected Date field (`['', '', '']`) | accepted | rejected |
| `' '`, a tab or a newline (whitespace only) | accepted | rejected |
| `'0'` | accepted | accepted |
| `''`, or a required field omitted from `subscriber.update` | rejected | rejected |

A rejected `subscriber.subscribe` call answers `ErrorCode` `6` with `ErrorCustomFieldID` and `ErrorCustomFieldTitle`, and creates no subscriber. A rejected `subscriber.update` call answers `ErrorCode` `8` with `ErrorCustomFieldIDs` and `ErrorCustomFieldTitles`, and changes nothing. No error code is new.

**Exception on `subscriber.update`.** When the request sends `IgnoreAllOtherCustomFieldsExceptGivenOnes=true` without `EnforceRequiredFields`, the historical field filter skips almost every custom field before any check runs, so an empty value for a required field sent that way is still accepted, as before v6.0.1. The new interface and the journey "Update custom field value" action call it this way and are unaffected. Send `EnforceRequiredFields=true` as well to have those fields checked.

`EnforceRequiredFields` is still accepted, and it no longer changes this test. It keeps its other effects: on `subscriber.subscribe` it also rejects a required field that the request omits, and on `subscriber.update` it applies the stricter validation, uniqueness and `IgnoreAllOtherCustomFieldsExceptGivenOnes` checks. A required field omitted from `subscriber.subscribe` without the flag is still not checked.

On `subscriber.update`, a malformed request that sends `Fields` as a plain string instead of an object is now rejected with `ErrorCode` `8` when the list has a required field, as it already was with `EnforceRequiredFields=true`.

**Signup forms.** The public signup form (`subscribe.php`) calls `subscriber.subscribe`, so this applies to on-site forms too. A visitor who leaves a required Date field unselected, or answers a required text field with spaces only, now sees the "required field" error instead of being subscribed. A checkbox group on a form generated by Octeth sends nothing when no box is ticked, so it is not checked and those signups still succeed. A hand-built form that posts an empty placeholder for a required checkbox group, such as `<input type="hidden" name="FormValue_Fields[CustomField5][]" value="">`, now rejects visitors who tick nothing. Check forms you built or edited by hand, and forms embedded on other sites, for required fields a visitor can leave empty.

The subscriber profile page reaches `subscriber.update`, so a subscriber who saves the page with a required Date field unselected now gets an error instead of a blank date.

### Segments

#### `segment.create` and `segment.update` refuse malformed `RulesJSON`

The segment engine implements three levels of rules: the top-level list, a group, and a sub-group that holds rules only. Before v6.0.1, a group nested deeper than that, a rule object carrying a key `0`, or a plain value where a rule or group belongs compiled to no condition, so the segment matched its whole list. Any segment that referenced it did the same.

`segment.create` and `segment.update` now refuse such a `RulesJSON` with HTTP `422`, `ErrorCode` `12` and the `ErrorText` "Segment rules must be a list of rules or groups, a group may hold rules or sub-groups, and a sub-group may hold rules only. A rule must not carry a key 0." Nothing is saved. The same refusal applies when `RulesJSON` is sent as a JSON object or array instead of a string, and when it decodes to a single value such as `"x"`, `5` or `null` instead of a list. A `RulesJSON` that is not valid JSON at all is still accepted as before. Error code `12` is not new: it is the code these commands already use for an invalid SMS activity rule.

**Segments already stored in one of these shapes now match no subscribers.** The malformed group or rule is applied as a condition that is always false, and the reason is written to the log, so the segment, and any segment or campaign that uses it, no longer reaches the whole list. Segments built in the Octeth interface never have this shape. Review segments created or updated through the API, and save them again with a well-formed `RulesJSON`. See [Create a Segment](./segments.md#create-a-segment).

### SMS campaigns

#### SMS merge tags use the email syntax

SMS content now uses the same merge tag syntax as email: <code v-pre>{{ Subscriber:FirstName }}</code>, or <code v-pre>{{ Subscriber:FirstName | "there" }}</code> with a fallback value. A tag names a standard subscriber column, a custom field by its merge tag alias or as `CustomField<ID>`, or a global custom field. Values are rendered as plain text, so a name such as `O'Brien` is never sent as an HTML entity. The single-brace syntax that v6.0.0 used, `{CustomField7}` and `{CustomField7|"there"}`, is no longer replaced: content that still uses it reaches the handset as typed. Rewrite SMS campaign content, SMS templates and journey SMS messages that use it before sending them again.

`sms.mergetags.get` returns the new syntax. Each entry in `MergeTags` carries `Tag` in the new form (for example <code v-pre>{{ Subscriber:FirstName }}</code>), plus new `Field` and `Group` (`Custom`, `Global` or `Standard`) keys, and the list now also includes the standard subscriber columns. `DefaultValueExample` shows the fallback form. See [Get Merge Tags for a List](./sms-campaigns.md#get-merge-tags-for-a-list).

The commands that store or send SMS content now refuse a tag that cannot be rendered, instead of sending it:

| Command | Error code | HTTP | Cause |
|---|---|---|---|
| `smscampaign.create` | `14` | `422` | A tag names a field the list does not have |
| `smscampaign.create` | `15` | `500` | The list's fields could not be read to check the tags |
| `smscampaign.create` | `16` | `422` | A tag cannot be read: a misspelt scope, a scope SMS does not render such as <code v-pre>{{ Campaign:... }}</code>, or a space after the colon |
| `smscampaign.update` | `17` | `422` | A tag names a field the list does not have |
| `smscampaign.update` | `18` | `500` | The list's fields could not be read to check the tags |
| `smscampaign.update` | `19` | `422` | A tag cannot be read |
| `smscampaign.test` | `13` | `422` | A tag cannot be read |

A campaign whose tags cannot be resolved when it is sent skips its recipients rather than sending a fallback or a raw tag.

#### `smscampaign.create` uses the account's timezone, and refuses an unknown one

When `Timezone` is omitted, `smscampaign.create` now stores the account's own timezone. Before v6.0.1 it stored `UTC`. The campaign's `Timezone` decides when quiet hours apply and how a schedule time is read, so a campaign created without `Timezone` on an account outside UTC now holds and schedules in the account's local time. Send `Timezone=UTC` to keep the old behavior.

A `Timezone` that is not a known IANA name, such as `Europe/Istanbul`, is now refused with HTTP `422`: error `17` from `smscampaign.create`, `20` from `smscampaign.update` and `13` from `smscampaign.schedule`, which now accepts `Timezone` too. Before v6.0.1 an unknown name was stored and then read as UTC. See [Create a Campaign](./sms-campaigns.md#create-a-campaign).

### Outbound URLs

#### URLs supplied by an account holder refuse internal destinations

Octeth now checks the destination before it fetches or posts to a URL that an account holder supplied, and refuses any address that is not publicly routable: loopback, private (RFC 1918), link-local (including the cloud metadata address), carrier-grade NAT, IPv6 unique-local and the other reserved ranges. A host name that does not resolve is refused too. The check runs after personalization, so a `%Subscriber:...%` or `%User:...%` value that turns a URL into an internal address is caught.

| Feature | Result for a refused URL |
|---|---|
| Email remote content ("Fetch URL" and "Fetch plain text URL") in campaign, auto responder, transactional and journey sends, previews and the browser view | The content comes back empty, the same as an unreachable URL |
| `%RemoteContent=...%` and `%RemoteContentBeforeSend=...%` tags in email content | Renders as empty, the same as an unreachable URL |
| The email editor's "fetch from URL" action | The same failure as an unreachable URL |
| List web service integrations (`listintegration.addurl` subscription and unsubscription URLs) | Not posted to. Subscription and unsubscription themselves are unaffected |
| `listintegration.testurl` | Reported the same way as an unreachable URL |
| The public campaign archive's custom template URL (`campaigns.archive.geturl` `templateurl`) | The existing "template could not be retrieved" error page |

No response shape changes. Refusals are logged at `WARNING` with the reason and host, so the default `OEMPRO_LOG_LEVEL` of `ERROR` does not record them.

Header and footer URLs set by the administrator (`USER_SIGNUP_HEADER/FOOTER`, `REPORT_ABUSE_FRIEND_HEADER/FOOTER`, `FORWARD_TO_FRIEND_HEADER/FOOTER`) are trusted and may still point at an internal host. Subscribe and unsubscribe by email keep posting to the install's own API.

Fixed at the same time: an `https://` value in the sign-up and report-abuse header and footer settings now takes the remote fetch. Before v6.0.1 the scheme test could never match `https://`, so such a value was read as a local file instead.

#### Webhook delivery refuses internal destinations

The webhook delivery worker now checks every destination immediately before it posts, including each redirect it follows. A webhook whose host is, or resolves to, a loopback, private (RFC 1918), link-local, carrier-grade NAT or other non-public address is no longer delivered. Neither is a destination that is not `http` or `https`, or that does not resolve. This covers journey Webhook actions, email gateway webhooks and the stuck-campaign alert. Before v6.0.1 only new destinations were checked, when they were saved, so a destination saved earlier, or a host name later repointed at an internal address, was still delivered.

A refused delivery is recorded as `Failed` with response code `000` and the message "Webhook URL is not an allowed outbound destination" (or "Webhook redirect target is not an allowed outbound destination"), and counts toward the existing failed-webhook handling like any other failure. The error log records each refusal at `ERROR` level as `[Webhooks] Webhook delivery refused`, with the destination reduced to scheme, host and port, because many webhook services carry a secret in the path. The webhook is not disabled and its owner is not notified.

No destination is exempt, including `STUCK_CAMPAIGN_WEBHOOK_URL`. If that value points at an internal host, such as a private chat relay, point it at a publicly reachable relay instead, or the alert is refused and logged.

A destination with non-ASCII characters in its path or query, such as an accented name, still delivers. A non-ASCII host is refused.

## Tier 2: shape and value changes

### Email gateway

#### New user group option: header and footer on gateway email

User groups have a new option, `EmailGatewayApplyHeaderFooter`, in the admin user group screen and in the `Options` object of `usergroup.create`, `usergroup.update`, `usergroup.patch` and `usergroup.options.patch`. When it is `"Enabled"`, the group's plain and HTML header and footer are added to email that the group's users send through `emailgateway.sendemail` and the SMTP relay, in the parts the email already has, before link and open tracking. Merge tags in the added header and footer are removed, because gateway email is not personalized against a subscriber, and the gateway unsubscribe link still comes from the sender domain's `UnsubscribeLink` option. Journey email is unchanged: the journey action already adds the header and footer and marks its request with a signed internal token, so the gateway does not add them twice. Passing `JourneyID` and `ActionID` to `emailgateway.sendemail` from your own integration does not skip the header and footer.

The option is off for every existing and new group, so gateway email is delivered exactly as before until an administrator turns it on. User group headers and footers have never applied to gateway email, and they still do not unless this option is on.

The recorded `MessageSizeBytes` of a gateway email is measured when it is accepted, before the header and footer are added, so it is slightly lower than the delivered size when the option is on.

### Subscribers

#### `subscribers.import.get` reports a failed import as `Failed`

`ImportStatus` in the `subscribers.import.get` response has a new value, `Failed`. An import that the worker stops before it finishes (the account reached its subscriber limit, the import file could not be read, the email address field was not mapped, or subscriber data could not be fetched from the import source) now ends as `Failed`. Before v6.0.1, such an import ended as `Completed`, the same as a successful one. Subscribers imported before the failure stay on the list, and `TotalImported` counts them.

Imports that failed before the upgrade keep the status `Completed`. There is no reliable way to tell them apart from successful imports afterwards, so the upgrade does not reclassify them.

`subscribers.import` with `ImportStep=2` refuses a `Failed` import with error code `6`, as it already did for a `Completed` one. The `import.failed` event that the Lindris plugin publishes now carries `importStatus: "Failed"` instead of `"Completed"`.

#### A failed import sends a final status webhook

An import started by `subscribers.import.post` with `ImportStatusUpdateWebhookURL` now receives a final POST when the import fails, not only when it completes. The payload has the same fields as the completion webhook, and `ImportStatus` is `Failed`. The failure reason is not included. Before v6.0.1, a failed import sent nothing after its last progress ping, whose `ImportStatus` was `Importing`, so a receiver never learned that the import had ended.

A receiver that treats any final POST as success, without reading `ImportStatus`, will now see a POST for a failed import.

Each import status webhook POST, including the progress pings, now gives up after 5 seconds if it cannot connect and after 10 seconds in total. The request is not retried. Before v6.0.1 there was no time limit, so a slow endpoint delayed the import itself.

#### A failed subscriber query is reported as an error

`subscribers.search` used to answer `Success: true` with an empty `Subscribers` array when its listing query failed in the database, while `TotalSubscribers` still carried the correct non-zero count from a separate query. It now answers `Success: false` with error code `7` and `ErrorText` `Subscriber query failed`, and writes the database error and the query to the application error log.

The bulk (`RulesJSON`) form of `subscribers.delete` and `subscriber.unsubscribe` had the same gap: a failed matching query answered `Success: true` having deleted or unsubscribed nobody. They now answer `Success: false` with their existing "Invalid query builder response" codes, `6` and `11`.

`subscribers.search` with `OrderField=CustomField<ID>` for an account-level global custom field (created with `IsGlobal=Yes` by a user, not by the administrator) now orders by `EmailAddress` and returns the page. It was the most common way to hit the empty-page answer above. A custom field on the searched list and a system-wide global field still sort as before.

#### `subscribers.delete` with `Suppressed=true` deletes only your own suppression entries

`subscribers.delete` with `Suppressed=true` removes suppression entries by `SuppressionID`. Before v6.0.1, with `SubscriberListID=0` (the account-level suppression list) it removed any account-level entry with that id, including another account's, and the system-wide entries that hard bounces and spam complaints create. From v6.0.1 it removes only entries that belong to the calling account, on its own lists or its account-level list. An id that belongs to another account, or to a system-wide entry, is skipped the same way as an id that does not exist, and the response is unchanged. The same applies to deleting entries from the suppression list pages in the user area. System-wide entries can be removed from the administrator area only.

#### `subscribers.import.post` counts every row of a headerless phone-only CSV

When the CSV has no header row and its first row carries a phone number but no email address, `subscribers.import.post` used to take that first row for a header. `TotalSubscribers` in the response was one lower than the number of rows imported. It now counts that row, the same way the import worker does, and reads the file with the import's own field terminator and encloser. Files whose first row is a header, or carries an email address, are counted as before.

The same count decides whether the import runs at once, inside the request, or in the background (`RUN_IMPORT_IN_SYNC_FOR_SUBSCRIBERS_LESS_THAN`). A headerless phone-only file with one row more than that limit now runs in the background instead of at once, so poll `subscribers.import.get` for it as for any background import.

### Suppression

#### Removing a suppression reports the scopes that still apply

`suppression.delete` now returns `StillSuppressed`, listing each requested address that is still suppressed after the call with the scopes that keep it suppressed (`PerList`, `AccountWide`, `SystemWide` or `Pattern`). `subscriber.update` returns the same field when its unsuppress step runs. Every existing field and the `Success` outcome are unchanged. Before v6.0.1 a delete could answer `Success` with `TotalDeleted: 0` while a wider row kept the address suppressed. See [Delete from Suppression List](./suppression.md#delete-from-suppression-list).

Neither command removes system-wide rows, list rows recorded without an owner, or patterns. `subscriber.update`'s unsuppress step therefore **no longer deletes a list row recorded without an owner**, which it did before v6.0.1. An administrator removes such rows.

On the subscriber page, "Remove from suppression list" is no longer offered when only a system-wide entry or a pattern applies, and a notice after a removal says when a wider scope still suppresses the address. The new interface's suppression pages report the same.

### Campaign reports

#### `campaign.recipients.activity.get` reports a failed query as an error, and gains an A/B variation filter

A database failure while reading recipient activity now returns `Success: false` with error code `8` (or `7` when the new `VariationEmailID` filter is used). Before v6.0.1 it returned `Success: true` with zero rows, which looked like a campaign with no activity. Every row also gains an additive `VariationEmailID` field (`0` when the campaign is not an A/B campaign or the variation is unknown). See [Get Campaign Recipients Activity](./campaigns.md#get-campaign-recipients-activity).

### Journeys

#### Journey action `OrderNo` is numbered across the whole journey

`journey.actions.update` now numbers `OrderNo` in one depth-first sequence across the whole journey: a Decision, then its Yes branch, then its No branch, then the actions after the Decision. Before v6.0.1 it restarted at 1 inside every Decision branch, so a branch action could have an `OrderNo` at or below its parent's. The `OrderNo` values of branch actions returned by `journey.actions.update` and `journey.get` change from per-branch to journey-wide. The response shape is unchanged and siblings keep their order. Journeys saved before the upgrade keep their per-branch numbers until they are saved again. See [Update Journey Actions](/v6.0.1/api-reference/journeys#update-journey-actions).

`journey.clone`, `journeys.clone` and `journey.copytouser` number their copies the same way. `journey.clone` now also points each copied branch action at the clone's own Decision. Before v6.0.1 the branch actions of a clone pointed at the source journey's Decision and never ran. Actions that cannot be reached from a root action are no longer copied, as the other two clone commands already did. Journeys cloned before the upgrade are not repaired, so clone them again from the source, or rebuild their branches.

#### `journey.actions.update` returns the error body for a refused From address

When `journey.actions.update` refused a Send Email action's From address (error `7` for an empty From email, `8` for an invalid From email username, `9` for an incomplete From email address), it answered HTTP `422` with an empty `null` body, so the caller could not tell why. It now answers HTTP `422` with `{"Errors":[{"Code":7,"Message":"From email is required"}]}` and the matching code and message for `8` and `9`. The status code and the refusal itself are unchanged.

### Custom fields

#### A TAB in a custom field name is stored as a space

Every path that creates or renames a custom field now stores each TAB character inside `FieldName` as a single space: the `customfield.create`, `customfield.update`, `global.customfield.create` and `global.customfield.update` commands, the user and admin interfaces, list copy, custom field copy (`customfields.copy`) and the Campaign Monitor migration plugin. The response shape is unchanged, and `customfield.get` and the other reads return the stored name with the space. A name without a TAB is stored exactly as before: the four commands still trim leading and trailing whitespace and remove line breaks, and the other paths store the name as given. Copying a list or a field whose name still holds a TAB from before the upgrade creates the copy with a space in its place.

Before v6.0.1 the TAB was stored. The TAB export writes field names into its header row as they are, so a field named `Shoe<TAB>Size` added an extra header cell and every later column was labelled with the wrong name.

Existing field names are not changed by the upgrade. To find fields that still contain a TAB, run the query below. The table name carries the default `oempro_` prefix; substitute your own `MYSQL_TABLE_PREFIX` from `.oempro_env` if you changed it, or the query reads the wrong table or errors:

```sql
SELECT CustomFieldID, RelOwnerUserID, RelListID, FieldName
FROM oempro_custom_fields
WHERE FieldName LIKE CONCAT('%', CHAR(9), '%');
```

Renaming such a field through the user or admin interface, or with `customfield.update` or `global.customfield.update`, stores the new name with spaces in place of any TAB.

### SMS campaigns

#### New fields and parameters on the SMS campaign commands

These additions are opt-in or additive. A call that does not send the new parameters gets the same answer as before, apart from the new keys.

- `smscampaign.create` and `smscampaign.update` accept `LinkExpiryHours`, how long the message's links work after each message is sent (`0`, the default, uses the install default). A value outside the allowed range is refused with error `21`. `smscampaign.get` and `smscampaign.browse` return the stored `LinkExpiryHours` on each campaign.
- `smscampaign.get` returns two new objects: `QuietHours`, which says whether quiet hours are holding the campaign right now and when it resumes, and `LinkExpiry`, with `EffectiveHours`, `DefaultHours` and `MaxHours`.
- `smscampaign.browse` accepts `CreatedAfter` and `CreatedBefore` (`YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS`), and refuses a value it cannot parse with error `3`.
- `smscampaign.recipients.browse` accepts `Engagement` (`clicked`, `replied` or `optedout`, refused with error `7` otherwise), `RecordsFrom` for offset paging, `IncludeTotal` for a `TotalRecipients` count, and `IncludeSkipped`, which also lists the recipients skipped before anything was queued for them, with `Status` `Skipped` and a `SkipReason`. The response echoes `Engagement` and `RecordsFrom`.
- `smscampaign.schedule` accepts `Timezone`, the timezone `ScheduledAt` and `SendDeadlineAt` are read in. It is stored as the campaign's timezone. See [SMS campaigns are created in the account's timezone](#smscampaign-create-uses-the-account-s-timezone-and-refuses-an-unknown-one).
- `smscampaign.stats.timeseries` accepts `Granularity=minute`, for a campaign that finished sending within an hour. `hour` stays the default.
- `smscampaign.events.export.get` returns a working `DownloadURL`. Before v6.0.1 the link pointed under the application path (`/app/`), where the download script does not run, so it did not download the export. It now points to `sms_export_download.php` at the root of `APP_URL`, and keeps its signature and expiry.
- The opt-out footer is now added on its own line. Before v6.0.1 it followed the message on the same line, separated by a space. The line break counts toward the message length, the same way in the measurement, the test send and the real send.

See [SMS Campaigns](./sms-campaigns.md) and [SMS Reporting](./sms-reporting.md).

### Monitoring

#### `system.health.check` adds a `TrackingDomainTLS` check and probes the login pages locally

`Checks` has a new key, `TrackingDomainTLS`. It reads the result of a background probe that connects to the tracking host of every enabled sender domain over TLS, hourly and shortly after a domain is verified. It is `OK` when every probed host completed a TLS handshake. Otherwise its value starts with `WARNING:` and names up to 20 domains and the probe result for each. A warning never changes `Success` or the HTTP status: the probe runs from the Octeth server, so a domain behind a CDN that blocks that server can probe as failing while recipients reach it. `Timings` gains a matching `TrackingDomainTLS` entry. A monitor that alerts on any value other than `OK` in `Checks` will now alert on this warning.

The `AdminFrontend` and `UserFrontend` checks now request the admin and user login pages from inside the application container, at `http://127.0.0.1/app/admin/` and `http://127.0.0.1/app/user/`, with the host from `APP_URL` as the `Host` header and without following redirects. Before v6.0.1 they went through the public `APP_URL`, so a CDN or firewall rule on `/app/admin`, or a short outage at the edge, turned the whole check into HTTP `503` while Octeth itself was healthy. The check names, failure messages and the `200` and `503` statuses are unchanged. Monitor the public address separately if you relied on these checks to watch it. See [Check System Health](./system.md#check-system-health).

### API responses

#### Case-insensitive `ResponseFormat` is available as an opt-in

`api.php` matches `ResponseFormat` against `JSON` and `XML` exactly, and answers any other spelling, including lowercase `xml`, with JSON. That is unchanged by default. A new setting, `API_RESPONSEFORMAT_CASE_INSENSITIVE`, makes the match case-insensitive when set to `true`, so `ResponseFormat=xml` returns XML with `Content-Type: text/xml`. The same format is used for the normal response and for a hard-failure error, so one request never answers in two formats. It is `false` in the code and in the shipped example file, so neither a fresh installation nor an upgrade changes behavior. Before turning it on, check every integration that sends a lowercase value, because those calls will start receiving XML. See [Error Handling](./error-handling.md#responseformat-xml-on-hard-failures).

### Credits

#### A transactional email that never reached a delivery server returns its credit

When the credit system is enabled, the transactional and auto-responder delivery worker takes one credit for each email just before sending it. Before v6.0.1, that credit stayed spent whatever happened next. From v6.0.1, the credit is returned to the account's `AvailableCredits` when the email fails before it reaches any delivery server: the SMTP connection or SMTP login fails, a dropped connection cannot be re-established before the email is offered, or the configured local MTA binary does not exist or is not executable.

The credit is still kept when a delivery server took the connection and refused the email (sender, recipient or message rejected), when the email is refused before sending (invalid From address, default sender domain monthly limit), and for any failure Octeth cannot place, such as a failed STARTTLS negotiation, a sender rejection followed by a failed reconnect, or a local MTA binary that ran and exited with an error. A credit is returned at most once per queued email, including across the automatic retry of an email stranded by a worker restart.

An integration that reconciles `AvailableCredits` from `user.get` against the number of failed emails will see the balance go back up by one for each email in the first group. The queue row's `Status` (`Failed`) and `StatusMessage` are unchanged. Campaign and email gateway credits are not affected.

### Emails

#### `email.update` reads JSON `true` tracking flags as on

`email.update` stored `OpenTracking` and `LinkTracking` as off when a JSON request sent the boolean `true`, while the call reported success. It now stores them as on for JSON `true`, the integer `1`, and the strings `"true"` and `"1"` in any case. Any other value, including `false`, `0`, `"false"` and `"0"`, still turns tracking off, and an omitted or `null` parameter still keeps the default (on). Form-encoded `"true"` and `"false"` behave as before.

An integration that sent JSON `true` and saw tracking off will now see it on. Check campaigns saved this way before v6.0.1 with `email.get`, because their stored flags are not changed by the upgrade.

#### `email.update` accepts <code v-pre>{{ Link:Unsubscribe }}</code> when Force Unsubscription Link is on

With the user group option **Force Unsubscription Link** enabled, `email.update` with `ValidateScope=Campaign` or `AutoResponder` rejected content that used the Handlebars form <code v-pre>{{ Link:Unsubscribe }}</code> with error code `11` (HTML) or `12` (plain), because only `%Link:Unsubscribe%` was recognised. Both forms are now accepted, in the content and in the user group header and footer. The legacy campaign wizard and the email template editor follow the same rule. A call that was accepted before is still accepted.

#### Unsubscribe fallback block in headers and footers

A header or footer (user group, user or list) can wrap its unsubscribe link in <code v-pre>{{#unless_unsubscribe}}...{{/unless_unsubscribe}}</code>. The block renders only when the email part has no other `%Link:Unsubscribe%` (in that exact case) or <code v-pre>{{ Link:Unsubscribe }}</code>, and only one block renders per part. This applies to campaigns, autoresponders, journey emails, transactional emails, `email.render` and previews. Email gateway sends are not covered. A header or footer without the block produces the same output as before, so nothing changes until an administrator adds one.

### Email headers and footers

#### HTML content without a `<body>` tag now carries headers and footers

Octeth wraps the HTML part of every email in up to two HTML headers and footers: the user group's, outermost, and inside it the list's, or the user account's when the list has none. A list header or footer replaces the account's rather than adding to it, and an empty HTML part gets neither. Before v6.0.1 a header was inserted only after a `<body>` tag and a footer only before `</body>`. HTML with no body tag, such as a fragment like `<p>Hello</p>` saved through `email.update` or pasted into the editor, went out with none of them and with no warning. The plain-text part did get its headers and footers.

From v6.0.1, when the HTML has no `<body>` tag, headers are inserted after `</head>`, or after `<html>` when there is no head, or at the start of the content. Footers are inserted before `</html>`, or at the end of the content. Content that has a single `<body>` and `</body>` produces exactly the same output as before. This applies to campaigns, autoresponders, transactional email, journey email actions, opt-in confirmation email, `email.render` and template previews.

Two smaller corrections come with it. When the content holds more than one `<body>` or `</body>` tag, a header is inserted once after the first `<body>` and a footer once before the last `</body>`, where before every copy received it. A `<body>` tag whose attributes span several lines is now recognised. An empty HTML part stays empty.

If you send HTML fragments and relied on them going out without your user group's footer, expect the footer, and its unsubscribe link, to appear from this release. This is what the `ForceUnsubscriptionLink` check already assumed when it accepted content whose only unsubscribe link was in the user group header or footer.

### Administrator sign-in

#### Existing "remember me" cookies are signed out once

The administrator "remember me" cookie is now a random token that Octeth stores (as a hash) and can revoke, instead of a value derived from the account. A cookie issued before the upgrade is not recognised: the browser shows the admin login form once, the old cookie is cleared, and ticking **Remember me** again issues a new one. Nothing errors.

Remembered browsers are listed under **Settings > Security**, where each one can be revoked, or all of them at once. See [Security Settings](/v6.0.1/using-octeth/administration/security#remembered-browsers). `admin.logout` now also revokes the remember-me cookie sent with the call. Its success response is unchanged. When that revoke fails, the session still ends and the call returns `Success` `false` with `ErrorCode` `1`.

A password change now revokes the administrator's remembered browsers in the same transaction. When the two cannot be committed together, nothing changes and the call fails with a new error code: `11` from `admin.update`, `3` from `admin.passwordreset` (no email is sent) and `24` from `admin.subadmin.update`. Their success responses are unchanged.

#### The user-area IP restriction applies to signed-in users

With **Prevent user login from IP addresses not in the list** ticked and Authorized IP Addresses filled in, a signed-in user who opens a user-area page from an address outside the list is signed out. Before v6.0.1 only the login page checked the address.

The same restriction now applies to the API and to the new user interface, which works through the API:

- `user.login` with `Username` and `Password` from an address outside the list answers `{"Success":false,"ErrorCode":[3],"ErrorText":["Access from this IP address is not allowed"]}` and creates no session. The address is checked before the password, so the answer is the same whether or not the password is right.
- Any command called with a user `SessionID` (or a user session cookie) from an address outside the list answers `{"Success":false,"ErrorCode":99998,"ErrorText":"Access from this IP address is not allowed"}`. The session is not ended, so the same `SessionID` keeps working from an allowed address.
- In the new user interface, signing in from an address outside the list shows "Access from your IP address is not allowed.", and a customer already signed in is signed out with the same message.

**User API keys are not affected.** A call authenticated with `APIKey`, and a `SessionID` obtained from `user.login` with `APIKey`, work from any address, as before. Administrator API access is governed separately by `ADMIN_API_ENFORCE_ALLOWED_IP`.

Loopback (`127.0.0.1`, `::1`) is always allowed, and so are the new interface's own background jobs. With the setting off or the list empty, every response is unchanged.

### New user interface emails

#### The email header follows the brand accent

The new user interface's own emails (welcome, password reset, billing notices) now draw their header in the brand accent (`UI_BRAND_ACCENT`, `#0A0A0A` by default) with `UI_BRAND_ACCENT_ON` (white by default) as its text colour, instead of a fixed `#1B2A4A`. On a default install the header moves from dark blue to near-black. No screen changes unless `UI_BRAND_PRIMARY_ON` or `UI_BRAND_ACCENT_ON` is set.

### New user interface

#### Self-signup is offered only while the interface's mailer delivers

From v6.0.1 the new interface hides its "Create an account" link and answers `/user/register` with a "Signup is not available" message, creating no account, unless `UI_MAIL_MAILER` names a mailer that sends for real: `smtp`, `sendmail`, `ses`, `postmark` or `resend`. Of those, `smtp` is the one the `.oempro_env` settings configure. `log`, the shipped default, and any other value such as `array` or `failover` count as not sending. Before v6.0.1 the form was offered and accepted, but the new account was created disabled and its verification email, the only way to enable it from the interface, was written to the interface's log instead of being sent. The account stayed disabled until an administrator enabled it in the legacy admin area.

Set `UI_MAIL_MAILER=smtp` with a working relay, including `UI_MAIL_USERNAME` and `UI_MAIL_PASSWORD` for any hosted relay, to offer signup again. Octeth's own switch in **Admin > Settings > ESP settings** still has to be on. Nothing changes for an install whose mailer already delivers, or for an install with signup switched off. See [Configuration](/v6.0.1/getting-started/octeth-configuration).

#### A mail server error at signup or password reset is handled

Before v6.0.1, a mail server that rejected the welcome or password-reset email produced an error page. At signup the account had already been created, so a second attempt was refused with "An account with that email already exists". Now the failure is logged at `error` level in the interface's log. At signup the visitor sees "We could not send your verification email" and is told to contact support, and the account can be enabled by an administrator. At password reset the visitor sees the same "sent" screen as for any other address, so the screen does not reveal which addresses have accounts.

#### The billing Policy screen no longer has a safety ceiling field

**Staff > Billing settings > Policy** no longer shows "Overage safety ceiling". The value was stored and audited but nothing applied it: sending limits come from the Octeth user group linked to each plan. A value saved before the upgrade stays in the database, unused. Set limits on the linked user groups.

#### `UI_BILLING_TAX_CALCULATOR` does not add tax calculation

`UI_BILLING_TAX_CALCULATOR` is new in `.oempro_env`, but no tax calculation ships with Octeth. The key names a PHP class implementing the interface's tax calculator contract and is an extension point only. Left empty, as shipped, every invoice is still calculated with zero tax, exactly as before.

## Upgrade checklist

1. **If an integration sends through `emailgateway.sendemail`, handle HTTP `403` with error code `12`** for a disabled account. Expect queued and scheduled gateway email to end as `Failed` with a `Sending blocked:` message when an account is disabled or a sender domain stops being active, and resend it after re-enabling if it is still wanted.
2. **Check the send-rate limits and the daily email limit on every user group your billing plans link to.** After the upgrade they apply to billing accounts, which were unlimited until now. If an account needs to send more than its group allows, give it a per-account override in the admin area.
3. **Mark every account that sends through the email gateway API or journeys `Trusted`**, or set `EMAILGATEWAY_REQUIRE_TRUSTED=false` before upgrading. If an integration sends through `emailgateway.sendemail`, handle HTTP `403` with error code `40`.
4. **If an integration creates users with `user.create` and relies on them being `Trusted`, pass `ReputationLevel=Trusted` explicitly.** Then review the accounts created through the new interface's registration page since v6.0.0, which are all `Trusted`.
5. **If an integration verifies sender domains with `user.senderdomain.verify`, handle a `Status` of `Blocked`** as "awaiting administrator approval", not as a failure. Handle the new refusals on a `Suspended` or `Blocked` domain: error `11` from `user.senderdomain.update`, error `3` from `user.senderdomain.delete` and `emailgateway.deletedomain`, and error `12` when disabling an `Approval Pending` domain.
6. **Optional: set `EMAILGATEWAY_RATE_LIMIT_FAIL_CLOSED=true`** if you prefer rejecting email gateway sends during a Redis outage to letting them through without a rate limit check.
7. **If a monitor or load balancer probes Octeth, make sure it treats HTTP `503` as down.** During a MySQL outage every page and API command, `system.health.check` included, now answers `503` with a plain-text `MySQL Error:` body instead of `200`.
8. **If an integration switches into accounts with `user.switch`, handle `ErrorCode 4`** as "account disabled": skip the account or enable it first. It replaces the `99998` that the next user command used to return.
9. **If an integration reads `MFA_RecoveryCode` from `user.current`, read it from the `user.update` response that enables two-factor authentication instead**, and store it then. `user.current` no longer returns it, and no other call returns it again.
10. **If an integration reads `SendMethodSMTPPassword` or `SendMethodSMTPUsername` from `usergroup.get` or `usergroups.get`, or `ConnectionParams.smtp_password` from `deliveryservers.get`, stop relying on them.** Use `HasSendMethodSMTPPassword` or `HasSMTPPassword` to tell whether one is stored. When updating a group or a server, omit the password to keep the stored one. If an SSO integration with **Return user data** read credentials from the returned JSON, it no longer receives them.
11. **If an integration polls `subscribers.import.get`, treat `ImportStatus` `Failed` as a finished import that did not complete.** Code that waits for `Completed` alone will otherwise keep polling a failed import forever.
12. **If an integration calls `subscribers.search`, treat error code `7` as a server-side failure and retry**, not as "no results". If it uses the `RulesJSON` form of `subscribers.delete` or `subscriber.unsubscribe`, expect codes `6` and `11` when the matching query fails, and retry.
13. **If you changed the permissions of `system/storage` or `system/bootstrap/cache` by hand, run `./cli/octeth.sh permissions:fix` once after upgrading.** Both trees are no longer world-writable. See [Upgrading Octeth](/v6.0.1/getting-started/upgrading-octeth#laravel-storage-is-no-longer-world-writable).
14. **If you set `UI_STRIPO_PLUGIN_ID` and `UI_STRIPO_SECRET_KEY` for the new interface in v6.0.0, enter the same Plugin ID and Secret Key in Admin > Settings > Integrations.** The new interface now reads the Stripo credentials from there and ignores the two keys. See [Upgrading Octeth](/v6.0.1/getting-started/upgrading-octeth#the-drag-and-drop-builder-in-the-new-interface-uses-the-integration-settings).
15. **If you receive import status webhooks, read `ImportStatus` in the final POST.** `Completed` means the import finished and `Failed` means it stopped early. Make the endpoint answer within 10 seconds, or the POST is abandoned.
16. **If `.oempro_env` has been edited by hand, check that every line is a comment, blank, or `KEY=VALUE`, and that values containing spaces are quoted.** An unparseable `.oempro_env` now stops Octeth with a message naming the line. See [Upgrading Octeth](/v6.0.1/getting-started/upgrading-octeth#an-unparseable-oempro-env-now-stops-octeth).
17. **If a sender posts to `/system/bounce_webhook?type=fluentd`, cap its batch at 1,000 records** (Vector `batch.max_events = 1000`) or raise `BOUNCE_WEBHOOK_FLUENTD_MAX_EVENTS`, and make it retry on HTTP `503`. A larger batch is now refused with HTTP `413`.
18. **If an integration or a saved segment relies on `Suppressed`, the `Suppressed` segment, `suppression.browse` or `suppression.stats` with a `ListID`, or the "suppression exist / not exist" segment rule, expect larger suppressed sets** that now include account-wide and system-wide entries for addresses on the list. Review campaigns sent to segments that use the "not exist" rule, and treat HTTP `500` with `ErrorCode` `100005` from these reads as a server-side failure to retry.
19. **If an integration reads `OrderNo` from `journey.get` or `journey.actions.update`, do not assume it restarts at 1 inside each Decision branch.** Order siblings by `OrderNo` within the same parent and branch. Re-clone journeys that were created with `journey.clone` before the upgrade if they have Decision branches.
20. **Optional: set `API_RESPONSEFORMAT_CASE_INSENSITIVE=true`** if your integrations send `ResponseFormat` in lowercase (`xml`) and expect XML. It is off by default, so those calls keep receiving JSON as before. Turning it on switches them to XML with `Content-Type: text/xml`, so check every integration that sends a lowercase value first. See [Error Handling](/v6.0.1/api-reference/error-handling#responseformat-xml-on-hard-failures).
21. **Review every account with Disable suppression check turned on.** From v6.0.1 its campaigns are sent to suppressed addresses, including hard bounces and spam complaints, as its journey and gateway email already were. Turn the option off on any account that should not do this.
22. **If an integration creates or renames custom fields with a TAB in `FieldName` and later looks the field up by that exact name, compare against the name with each TAB replaced by a space.** Fields created before the upgrade keep their TAB until renamed. Run the query under "A TAB in a custom field name is stored as a space" to find them.
23. **If you call `subscriber.subscribe` or `subscriber.update`, or run signup forms, with required custom fields, send a real value for every required field you submit.** An empty array, an unselected Date field and a whitespace-only value are now rejected (`ErrorCode` `6` from `subscriber.subscribe`, `8` from `subscriber.update`) with or without `EnforceRequiredFields` (on `subscriber.update`, unless `IgnoreAllOtherCustomFieldsExceptGivenOnes=true` is sent without `EnforceRequiredFields`). Fill the field in the integration or form, or set the field to not required. See [Required custom fields reject empty values](#required-custom-fields-reject-empty-values).
24. **If email content, a list web service integration or an archive template points at an internal host, move it to a public URL.** Remote content and integration URLs that resolve to a private, loopback, link-local or carrier-grade NAT address are now refused. See [URLs supplied by an account holder refuse internal destinations](#urls-supplied-by-an-account-holder-refuse-internal-destinations).
25. **If a journey Webhook action, an email gateway webhook or `STUCK_CAMPAIGN_WEBHOOK_URL` points at an internal host, move it to a publicly reachable endpoint.** The delivery worker now refuses internal destinations at send time. See [Webhook delivery refuses internal destinations](#webhook-delivery-refuses-internal-destinations).
26. **If Prevent user login from IP addresses not in the list is ticked, confirm that the address Octeth sees for your users is their real address before upgrading** (check `TRUSTED_PROXIES` behind a proxy), because signed-in users outside the list are now signed out, and `user.login` and user `SessionID` calls from outside the list are refused. Integrations that authenticate with a user `APIKey` are not affected. See [The user-area IP restriction applies to signed-in users](#the-user-area-ip-restriction-applies-to-signed-in-users).
27. **If an integration changes administrator passwords, handle the new failure codes as "nothing changed, retry"**: `11` from `admin.update`, `3` from `admin.passwordreset` and `24` from `admin.subadmin.update`. If it calls `admin.logout`, treat `ErrorCode` `1` as "signed out, but the remembered browser was not revoked" and revoke it from **Settings > Security**.
28. **If customers sign up through the new user interface, set `UI_MAIL_MAILER=smtp` with a working relay before upgrading**, including `UI_MAIL_USERNAME` and `UI_MAIL_PASSWORD` for a hosted relay. Under the default `log` mailer the signup link is hidden and `/user/register` refuses. See [Self-signup is offered only while the interface's mailer delivers](#self-signup-is-offered-only-while-the-interface-s-mailer-delivers).
29. **If email or SMS content uses a <code v-pre>{{ User:\* }}</code> or <code v-pre>{{ List:\* }}</code> tag outside the documented fields, replace it before upgrading**, since it now renders empty. For example, replace <code v-pre>{{ User:Username }}</code> with a fixed value. Then, if accounts you do not fully trust can author email, rotate the SMTP passwords on your user groups and the credentials on your delivery servers. See [User and List merge tags render only their documented fields](#user-and-list-merge-tags-render-only-their-documented-fields).
30. **If you send HTML fragments with no `<body>` tag, preview one before upgrading.** List, account and user group headers and footers are now added to it, including any unsubscribe link in the user group footer. See [HTML content without a `<body>` tag now carries headers and footers](#html-content-without-a-body-tag-now-carries-headers-and-footers).
31. **If an integration saves campaign emails with `email.update`, handle `ErrorCode` `21`** by sending a full From address, or a local part together with `SenderDomain`. See [`email.update` refuses a campaign From address that has no domain](#email-update-refuses-a-campaign-from-address-that-has-no-domain).
32. **Optional: if your user group footer adds `%Link:Unsubscribe%` and templates carry their own link, wrap the footer link in <code v-pre>{{#unless_unsubscribe}}...{{/unless_unsubscribe}}</code>** so each email shows one unsubscribe link. See [Users](/v6.0.1/using-octeth/users#adding-the-footer-unsubscribe-link-only-when-the-email-has-none).
33. **If an integration creates or updates segments with `RulesJSON`, handle HTTP `422` with `ErrorCode` `12`**, and send `RulesJSON` as a JSON string holding a list of rules or groups, at most three levels deep, with no rule carrying a key `0`. Review segments saved through the API before the upgrade: one stored with a deeper group or a key `0` rule now matches no subscribers, where it used to match its whole list. See [`segment.create` and `segment.update` refuse malformed `RulesJSON`](#segment-create-and-segment-update-refuse-malformed-rulesjson).
34. **If SMS content, SMS templates or journey SMS messages use the single-brace `{CustomField7}` merge tags, rewrite them as <code v-pre>{{ Subscriber:CustomField7 }}</code>** (or the field's merge tag alias) before sending again, and handle the new merge tag refusals from `smscampaign.create` (`14` to `16`), `smscampaign.update` (`17` to `19`) and `smscampaign.test` (`13`). See [SMS merge tags use the email syntax](#sms-merge-tags-use-the-email-syntax).
35. **If an integration creates SMS campaigns without `Timezone` and expects UTC, send `Timezone=UTC`.** The account's own timezone is now the default, and an unknown timezone name is refused. See [`smscampaign.create` uses the account's timezone, and refuses an unknown one](#smscampaign-create-uses-the-account-s-timezone-and-refuses-an-unknown-one).
36. **If an integration reads keys from `deliveryserver.get` `ConnectionParams` other than `smtp_host`, `smtp_port`, `smtp_secure`, `smtp_timeout`, `smtp_auth` and `smtp_username`, stop relying on them.** They are no longer returned.
37. **If a monitor alerts on any `Checks` value other than `OK` from `system.health.check`, decide how to treat the new `TrackingDomainTLS` warning**, and watch the public address separately if you relied on `AdminFrontend` and `UserFrontend` to probe it. See [`system.health.check` adds a `TrackingDomainTLS` check](#system-health-check-adds-a-trackingdomaintls-check-and-probes-the-login-pages-locally).

---

Previous releases: [v6.0.0](/v6.0.0/api-reference/behavior-changes), [v5.9.6](/v5.9.6/api-reference/behavior-changes)
