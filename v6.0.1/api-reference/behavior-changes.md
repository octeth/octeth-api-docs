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

## Tier 2: shape and value changes

None recorded yet.

## Upgrade checklist

1. **If an integration sends through `emailgateway.sendemail`, handle HTTP `403` with error code `12`** for a disabled account. Expect queued and scheduled gateway email to end as `Failed` with a `Sending blocked:` message when an account is disabled or a sender domain stops being active, and resend it after re-enabling if it is still wanted.
2. **Check the send-rate limits and the daily email limit on every user group your billing plans link to.** After the upgrade they apply to billing accounts, which were unlimited until now. If an account needs to send more than its group allows, give it a per-account override in the admin area.
3. **Mark every account that sends through the email gateway API or journeys `Trusted`**, or set `EMAILGATEWAY_REQUIRE_TRUSTED=false` before upgrading. If an integration sends through `emailgateway.sendemail`, handle HTTP `403` with error code `40`.
4. **If an integration creates users with `user.create` and relies on them being `Trusted`, pass `ReputationLevel=Trusted` explicitly.** Then review the accounts created through the new interface's registration page since v6.0.0, which are all `Trusted`.
5. **If an integration verifies sender domains with `user.senderdomain.verify`, handle a `Status` of `Blocked`** as "awaiting administrator approval", not as a failure. Handle the new refusals on a `Suspended` or `Blocked` domain: error `11` from `user.senderdomain.update`, error `3` from `user.senderdomain.delete` and `emailgateway.deletedomain`, and error `12` when disabling an `Approval Pending` domain.
6. **Optional: set `EMAILGATEWAY_RATE_LIMIT_FAIL_CLOSED=true`** if you prefer rejecting email gateway sends during a Redis outage to letting them through without a rate limit check.

---

Previous releases: [v6.0.0](/v6.0.0/api-reference/behavior-changes), [v5.9.6](/v5.9.6/api-reference/behavior-changes)
