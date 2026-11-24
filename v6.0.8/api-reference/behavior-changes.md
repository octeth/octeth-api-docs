---
layout: doc
title: API Behavior Changes in v6.0.8
description: Deliberate API behavior changes in Octeth v6.0.8 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.8

This page lists every deliberate change in v6.0.8 that an existing integration can observe, so you can check your code against it before upgrading.

::: info Release in progress
This page is written as changes merge during the release cycle, not at release time. A deliberate contract change reads as an ordinary bug fix in the commit log, so a page assembled from commit subjects at the end of a cycle will miss it.

If this notice is still here when the release ships, there were no observable API behavior changes in v6.0.8.
:::

## Tier 1: changes that can break an integration

None recorded yet.

## Tier 2: shape and value changes

### SMS campaigns

#### SMS campaign reads say when an account rate limit is holding a campaign

`smscampaign.get` returns a new `RateLimitHold` key, and `smscampaign.browse` a new top-level `RateLimitHolds` key keyed by `SMSCampaignID` (octeth/oempro#3418). Each hold has `Interval`, `Limit` and `Reason`, and appears only for a `Sending` campaign that an account SMS rate limit is holding. `RateLimitHold` is `null` and `RateLimitHolds` is empty when nothing is held.

**Not affected:** every existing key and the campaign rows, which are unchanged.

**Who needs to act:** nobody. A client that rejects unknown keys must accept the new ones.

## Upgrade checklist

Nothing to check yet.

---

Previous releases: [v6.0.7](/v6.0.7/api-reference/behavior-changes), [v6.0.6](/v6.0.6/api-reference/behavior-changes), [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
