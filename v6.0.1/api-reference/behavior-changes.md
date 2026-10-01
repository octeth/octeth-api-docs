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

## Tier 2: shape and value changes

None recorded yet.

## Upgrade checklist

1. **If an integration sends through `emailgateway.sendemail`, handle HTTP `403` with error code `12`** for a disabled account. Expect queued and scheduled gateway email to end as `Failed` with a `Sending blocked:` message when an account is disabled or a sender domain stops being active, and resend it after re-enabling if it is still wanted.
2. **Check the send-rate limits and the daily email limit on every user group your billing plans link to.** After the upgrade they apply to billing accounts, which were unlimited until now. If an account needs to send more than its group allows, give it a per-account override in the admin area.
3. **Optional: set `EMAILGATEWAY_RATE_LIMIT_FAIL_CLOSED=true`** if you prefer rejecting email gateway sends during a Redis outage to letting them through without a rate limit check.

---

Previous releases: [v6.0.0](/v6.0.0/api-reference/behavior-changes), [v5.9.6](/v5.9.6/api-reference/behavior-changes)
