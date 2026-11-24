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

### Subscribers

#### `RulesJSON` accepts SMS activity rules

`subscribers.search`, `subscribers.delete`, `subscriber.tag`, `subscriber.untag`, `subscriber.unsubscribe` and `subscribers.journey.bulk` now accept a `RulesJSON` whose rules are `sms-events` (octeth/oempro#4157). Before v6.0.8 such a payload was refused as invalid RulesJSON (`ErrorCode` `6` on `subscribers.search`, `8` on `subscribers.journey.bulk`, `7` on the others), although the same rule worked in a saved segment. A bulk command sent with an SMS activity rule now acts on the contacts the rule matches.

**Who needs to act:** nobody, unless an integration relied on the refusal to skip SMS rules.

### Segments

#### `converted` and `not converted` SMS operators

`sms-events` rules accept `converted` and `not converted`, which match the same contacts as `integration converted` and `not integration converted` and take the same `status` key (octeth/oempro#4157). The older pair stays accepted. The new interface offers "Converted" and "Did not convert" for new rules and shows a saved rule that uses the older pair as "Converted (legacy rule)".

The two `sms-events` status error texts no longer name Keitaro: "The status filter is only available for conversion rules." and "The conversion status must be text of 1 to 64 characters." The error code is still `12`.

**Who needs to act:** an integration that compares `ErrorText` against the old "Keitaro conversion" messages.

## Upgrade checklist

- If your integration matches the `ErrorText` "The status filter is only available for Keitaro conversion rules." or "The Keitaro conversion status must be text of 1 to 64 characters.", match error code `12` or the new texts instead.

---

Previous releases: [v6.0.7](/v6.0.7/api-reference/behavior-changes), [v6.0.6](/v6.0.6/api-reference/behavior-changes), [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
