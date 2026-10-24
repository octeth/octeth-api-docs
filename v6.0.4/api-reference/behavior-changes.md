---
layout: doc
title: API Behavior Changes in v6.0.4
description: Deliberate API behavior changes in Octeth v6.0.4 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.4

This page lists every deliberate change in v6.0.4 that an existing integration can observe, so you can check your code against it before upgrading.

::: info Release in progress
This page is written as changes merge during the release cycle, not at release time. A deliberate contract change reads as an ordinary bug fix in the commit log, so a page assembled from commit subjects at the end of a cycle will miss it.

If this notice is still here when the release ships, there were no observable API behavior changes in v6.0.4.
:::

## Tier 1: changes that can break an integration

### Removed features

#### The ClickBank S2S postback address `/app/public/cbs2spostback/` is removed

`/app/public/cbs2spostback/` now answers HTTP 404, and the staff **Settings, S2S postback** screen in the new interface no longer shows a "ClickBank address".

The address recorded nothing. It accepted either a `tid` and `value` pair or ClickBank's encrypted notification, but every request ended in `{"success":false,"error":"Legacy SMS tracking is no longer supported"}` or an earlier validation error, because the legacy SMS tracking tables it wrote to were removed in an earlier release.

- **ClickBank instant notifications** are handled per subscriber list by `clickbank_webhook.php?list=<list hash>`. Copy the address from the list's integration settings, where the ClickBank secret key is also set.
- **Conversion postbacks** keep using `/system/s2s-postback/` with the parameter names on **Settings, S2S postback**. Nothing about that endpoint changed.

On an upgraded install, `./cli/octeth.sh upgrade:remove-retired-files` removes the old controller file.

### Security tightening

#### SSO tokens are single-use and `ValidForSeconds` is capped at 300

- **`sso.create` and `sso.update`** refuse a `ValidForSeconds` above `300` with error `8`. A source saved earlier with a larger value keeps working until it is next edited, and that edit must bring the value to `300` or less.
- **The SSO sign-in address** (`/app/sso?code=&token=`) accepts each token once. A second request with the same token inside its validity window returns `{"error": true, "message": "Token has already been used"}` and is counted as failed data. Mint a fresh token for every sign-in, including a retry after a network error.
- **A `check_time` more than 60 seconds ahead** of the Octeth server clock is refused with `Token check_time is in the future`.
- **`check_time` is compared with the server's Unix time.** Earlier versions added the server's timezone offset, so on a server not running in UTC a token lived longer or shorter than `ValidForSeconds`. On a UTC server nothing changes.
- **When Redis cannot be reached**, a sign-in is refused with `SSO sign-in is temporarily unavailable` instead of being accepted without replay protection.
- **With both Perform login and Return user data disabled**, a successful sign-in now returns `{"error": false, "message": "Signed in"}`. Earlier versions printed the decrypted token as plain text, including the password of a new user.

#### `smssuppression.add` and `smssuppression.patterns.add` respect a sub-admin's user groups

Under admin authentication, a sub-admin account limited to some user groups could add a suppressed number or a pattern at the `user` or `list` level for any account. Both commands now refuse an account outside the admin's allowed user groups with the same answer they give for an account that does not exist: error code `10` from `smssuppression.add` and `8` from `smssuppression.patterns.add`.

Unrestricted admins, the master admin API key and user API keys are not affected. The `system` level is unchanged.

## Tier 2: shape and value changes

None recorded yet.

## Upgrade checklist

1. **If a ClickBank account still sends instant notifications to `/app/public/cbs2spostback/`**, point it at the list's `clickbank_webhook.php?list=<list hash>` address instead. The old address never recorded a sale, so nothing that worked before stops working.
2. **If your SSO broker reuses a token** (for example to retry a failed request), change it to mint a new token per attempt.
3. **If an SSO source has Valid for (seconds) above 300**, lower it the next time you edit the source.
4. **If your SSO broker parsed the plain-text "Decrypted Token" response**, read the JSON `error` field instead.
5. **If a restricted sub-admin account adds SMS suppressions for other accounts** through `smssuppression.add` or `smssuppression.patterns.add`, check that every target account is in one of its allowed user groups, or call the commands with an unrestricted admin account.

---

Previous releases: [v6.0.3](/v6.0.3/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
