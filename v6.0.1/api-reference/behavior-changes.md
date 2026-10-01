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

## Tier 2: shape and value changes

None recorded yet.

## Upgrade checklist

1. **If an integration sends through `emailgateway.sendemail`, handle HTTP `403` with error code `12`** for a disabled account. Expect queued and scheduled gateway email to end as `Failed` with a `Sending blocked:` message when an account is disabled or a sender domain stops being active, and resend it after re-enabling if it is still wanted.

---

Previous releases: [v6.0.0](/v6.0.0/api-reference/behavior-changes), [v5.9.6](/v5.9.6/api-reference/behavior-changes)
