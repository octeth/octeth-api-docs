---
layout: doc
title: API Behavior Changes in v6.0.1
description: Deliberate API behavior changes in Octeth v6.0.1 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.1

This page lists every deliberate change in v6.0.1 that an existing integration can observe, so you can check your code against it before upgrading.

::: info Release in progress
This page is written as changes merge during the release cycle, not at release time. A deliberate contract change reads as an ordinary bug fix in the commit log, so a page assembled from commit subjects at the end of a cycle will miss it.

If this notice is still here when the release ships, there were no observable API behavior changes in v6.0.1.
:::

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

### Credentials in admin and SSO responses

#### User group and delivery server responses no longer carry SMTP credentials

`usergroup.get` and `usergroups.get` no longer return `SendMethodSMTPUsername` or `SendMethodSMTPPassword`. Each group now carries `HasSendMethodSMTPPassword` (`true` when a password is stored). Every other group field is returned as before, with one exception: credential keys nested inside `Options` and `ThemeInformation` (for example `Password`, `APIKey`, `SendMethodSMTPPassword` or `smtp_password`) are removed at any depth. When `Options` holds such a key, the value is returned re-encoded without it, so its bytes can differ from the stored value. A value with no such key is returned byte for byte as stored. A column added to the user groups table in a later release is not returned until it is added to the response deliberately.

`deliveryservers.get` no longer returns `ConnectionParams.smtp_password`. Each server now carries `HasSMTPPassword`, and `DeliveryServerID` is an integer. Each server in the list is now exactly what `deliveryserver.get` returns for it, apart from the user group assignments both already computed. `ConnectionParams` carries `smtp_host`, `smtp_port`, `smtp_secure`, `smtp_timeout`, `smtp_auth` and `smtp_username`, and any other key is withheld.

`usergroup.update` and `deliveryserver.update` replace the whole record. Because an integration can no longer read the password back, both commands now keep the stored SMTP password when `SendMethodSMTPPassword` is omitted, and `usergroup.update` also keeps the stored `SendMethodSMTPUsername` when it is omitted. Before, an omitted value was stored as empty, which broke the group's or server's sending. Sending a value, including an empty string, still replaces the stored one.

This is a hardening change and a deliberate exception to the rule that a contract change goes behind an opt-in flag. These are platform credentials shared by every account in the group, and anything that logs or renders an admin response could expose them.

#### `admin.users.search` returns only published user fields

`admin.users.search` now returns the same user fields as `users.get`. It used to remove credential columns by name, so any column added to the users table later would have been returned by default. Now a column added later is not returned until it is added to the response deliberately. The fields returned today are unchanged.

#### Single sign-on "Return user data" no longer includes credentials

When an SSO source has **Return user data** (`Options.ReturnUserData`) enabled, the JSON it returns is now the same user projection `user.login` returns, plus `_SessionID`, `_Impersonate` and `_ImpersonateLeaveURL` as before. It no longer includes the password hash, `AuthToken`, the two-factor secrets, `APIKey`, or the group's SMTP and delivery-server credentials inside `GroupInformation`.

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
- **`subscribers.get` with `SubscriberSegment=Suppressed`** lists the effective view, with the additive `Scope` column, and `TotalSubscribers` counts the same set. With `SearchField` and `SearchKeyword` it still returns only list-scoped entries.
- **Segments.** The segment rule "suppression exist / not exist" now matches every address the send path drops. Saved segments that use it change membership and counts, and a "not exist" segment can shrink, which changes who receives a campaign sent to it.
- **Suppressed export.** An export with `Target=Suppressed` lists the effective view. A database failure now marks the export failed instead of producing an empty file.
- **Subscriber page.** The badge and the subscriber card in the user area no longer show a contact as suppressed because of another account's entry. A contact suppressed by this account, by a hard bounce or complaint, or by a pattern now shows as suppressed and Inactive on both.

A database failure while reading the effective view in `suppression.browse` or `suppression.stats` with a `ListID`, or in the `Suppressed` segment of `subscribers.get`, now answers the API hard-failure envelope (HTTP `500`, `ErrorCode` `100005`, `ErrorText` `API command failed`) instead of `Success: true` with an empty list or zero counts. If the per-page lookup behind the `Suppressed` flag fails, `subscribers.search` answers error code `7`, and `journey.action.subscribers` returns the rows with `Suppressed: false` and logs the failure.

The `Suppressed` segment total is cached for 300 seconds, so it can show the old count for up to five minutes after the upgrade. To refresh it at once, delete the cached totals:

```bash
docker exec oempro_redis redis-cli --scan --pattern 'subscriber_counts_*_suppressed_*' | xargs -r docker exec -i oempro_redis redis-cli del
```

`suppression.delete` is unchanged. It removes only entries in the requested scope, so an address can remain suppressed by an entry in another scope after a delete. There is no opt-in flag: the old answers disagreed with what a send actually drops.

#### Disable Suppression Check now applies to campaigns

An administrator can turn on **Disable suppression check in outgoing emails** for an account (the admin user edit page, or `user.update` with `DisableSuppressionCheck=true`). Before v6.0.1 it applied to journey, transactional and email gateway email only: campaigns still removed suppressed addresses from their recipients. From v6.0.1 campaigns honour it too. For such an account, a campaign is sent to addresses on the account's or the list's suppression list, to system-wide entries (hard bounces and spam complaints) and to addresses matching a global suppression pattern. The `Suppressed` flag and the campaign send now agree for every account.

Phone-only contacts are still never emailed, whatever the option says.

Accounts that already have the option on start mailing suppressed addresses from their next campaign after the upgrade. Mailing hard-bounced and complaining addresses can damage the sending reputation of shared IPs and domains. Before upgrading, list the accounts that have it on and turn it off where it is not needed.

## Tier 2: shape and value changes

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

### Journeys

#### Journey action `OrderNo` is numbered across the whole journey

`journey.actions.update` now numbers `OrderNo` in one depth-first sequence across the whole journey: a Decision, then its Yes branch, then its No branch, then the actions after the Decision. Before v6.0.1 it restarted at 1 inside every Decision branch, so a branch action could have an `OrderNo` at or below its parent's. The `OrderNo` values of branch actions returned by `journey.actions.update` and `journey.get` change from per-branch to journey-wide. The response shape is unchanged and siblings keep their order. Journeys saved before the upgrade keep their per-branch numbers until they are saved again. See [Update Journey Actions](/v6.0.1/api-reference/journeys#update-journey-actions).

`journey.clone`, `journeys.clone` and `journey.copytouser` number their copies the same way. `journey.clone` now also points each copied branch action at the clone's own Decision. Before v6.0.1 the branch actions of a clone pointed at the source journey's Decision and never ran. Actions that cannot be reached from a root action are no longer copied, as the other two clone commands already did. Journeys cloned before the upgrade are not repaired, so clone them again from the source, or rebuild their branches.

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

---

Previous releases: [v6.0.0](/v6.0.0/api-reference/behavior-changes), [v5.9.6](/v5.9.6/api-reference/behavior-changes)
