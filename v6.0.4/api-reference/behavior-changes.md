---
layout: doc
title: API Behavior Changes in v6.0.4
description: Deliberate API behavior changes in Octeth v6.0.4 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.4

This page lists every deliberate change in v6.0.4 that an existing integration can observe, so you can check your code against it before upgrading.

## Tier 1: changes that can break an integration

### Removed features

#### The ClickBank S2S postback address `/app/public/cbs2spostback/` is removed

`/app/public/cbs2spostback/` now answers HTTP 404, and the staff **Settings, S2S postback** screen in the new interface no longer shows a "ClickBank address".

The address recorded nothing. It accepted either a `tid` and `value` pair or ClickBank's encrypted notification, but every request ended in `{"success":false,"error":"Legacy SMS tracking is no longer supported"}` or an earlier validation error, because the legacy SMS tracking tables it wrote to were removed in an earlier release.

- **ClickBank instant notifications** are handled per subscriber list by `clickbank_webhook.php?list=<list hash>`. Copy the address from the list's integration settings, where the ClickBank secret key is also set.
- **Conversion postbacks** keep using `/system/s2s-postback/` with the parameter names on **Settings, S2S postback**. Nothing about that endpoint changed.

On an upgraded install, `./cli/octeth.sh upgrade:remove-retired-files` removes the old controller file.

### Security tightening

#### `smscampaign.test` sends only to verified test numbers, with a daily limit and a cooldown

`smscampaign.test` used to send a test of a campaign to any `RecipientNumber`, with only the account's SMS rate limits (unlimited by default) in the way, so an account could message any phone through test sends. It now refuses a number the account has not verified, with error code `14`. A number is verified by adding it with `sms.testnumber.add`, which texts it a six-digit code through a gateway the account may use, then passing that code to `sms.testnumber.verify`. An account can hold at most 5 test numbers and be sent at most 3 codes in any 24 hours, 60 seconds apart.

Test sends are also limited per account to 10 in any 24 hours (error `16`) and 30 seconds apart (error `17`), set install-wide in the staff SMS settings as `SMSTestDailyLimit` and `SMSTestCooldownSeconds`. A limit of `0` turns test sends off (error `15`). There is no flag to keep the old behaviour: the old behaviour was the spam route this closes. Before upgrading, add and verify the numbers an integration sends tests to. The success response is unchanged. (octeth/oempro#3734)

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

#### Object ids must be plain numbers in eleven commands

`email.update`, `tag.update`, `list.update`, `segment.update`, `customfield.update`, `autoresponder.update`, `subscriber.update`, `subscribers.import`, `email.template.update`, `usergroup.update` and the `EmailID` parameter of `subscriber.unsubscribe` now refuse an object id that is not a plain number (digits, with surrounding spaces allowed). An array or object value, or a string such as `5abc`, gets the error the command already returns for an unknown id. A numeric id behaves exactly as before.

`tag.update` had no unknown-id error, because a `TagID` you do not own matched no row and the call still answered success. A malformed `TagID` now gets error code `1`, the same code as a missing `TagID`. A well-formed `TagID` you do not own still answers success, as before.

#### Exponent, decimal and signed ids are refused where ownership is checked

The commands below checked an id against what you own, then used the value you sent. MySQL reads `117e1` as `1170` and stores `1.9` as `2`, so a malformed id could pass the check as one record and act on another. They now accept an id only when it is a whole number of 1 or more written in digits. Leading zeros still work (`007` is 7). Spellings such as `1e3`, `1.9`, `5.0` or `+5` are refused, and nothing is written or deleted.

| Command | Parameter | Error code for a malformed id |
|---|---|---|
| `campaigns.delete` | `Campaigns` | `2` |
| `subscribers.delete` | `SubscriberListID` | `5` (Invalid list id) |
| `campaign.update` | A/B testing variation `EmailID` | `24` |
| `segment.create` | `SubscriberListID` | `4` |
| `segments.copy` | `SourceListID`, `TargetListID` | `4` |
| `segments.delete` | `Segments` | `2` (new code: Invalid segment ids; no segments were deleted) |
| `automated_reports.create` | `FilterTags` | `6` |
| `automated_reports.update` | `FilterTags` | `5` |
| `customfield.create` | `SubscriberListID` | `8` |
| `users.delete` (sub-admin limited to some user groups) | `Users` | `5003` |
| `user.update` (sub-admin limited to some user groups) | `RelUserGroupID` | `5003` |

The master admin API key and unrestricted admins are not affected. A blank or zero `SubscriberListID` on `subscribers.delete` still means the global suppression list.

#### `admin.passwordremind` no longer reveals whether an address is an administrator

`admin.passwordremind` needs no authentication, and an email address that belongs to no administrator used to return `{"Success": false, "ErrorCode": [3]}`. Anyone could use that answer to find out which addresses are administrator accounts. Such an address now returns `{"Success": true, "ErrorCode": 0}`, the same body as a real administrator's address, and no email is sent.

- **An integration that showed "no such administrator" on `ErrorCode 3`** loses that signal by design. Show the same "if the address is registered, a reset link is on its way" message for every success.
- **With `ReturnParams` and the master `AdminAPIKey`**, the response carries `PasswordResetToken` as an empty string for an unknown address. Treat an empty token as "send nothing".
- **Unchanged:** a missing address (`emailaddress`), a malformed one (`[2]`), the HTTP 429 brute-force refusal from v6.0.2 and the email sent to a real administrator.

This change is on by default, with no setting to restore the old answer, because the old answer was the disclosure (octeth/oempro#3437).

#### "Remember me" in the classic user area signs everyone in once more after the upgrade

The "Remember me" cookie of the classic user area (`/app/user/`) is now a random token whose hash is stored on the server, the same design the admin login already uses. A remembered browser is signed out when the user signs out in that browser, uses "log out of all accounts", changes their password, turns on two-factor authentication, has their account disabled or deleted, or after 14 days from the first sign-in, whichever comes first.

- **Every existing cookie stops working once.** A cookie issued before the upgrade is not accepted and is removed silently, so users who ticked "Remember me" see the login form one more time and can tick it again.
- **No "Remember me" for accounts with two-factor authentication.** Such a user is never remembered, and a remembered browser stops working as soon as two-factor authentication is turned on, so the code is always asked for.
- **The cookie is HttpOnly**, and Secure when `APP_URL` starts with `https://`. Page scripts can no longer read it.
- **To sign a user out of every remembered browser** from the admin side, change the user's password or disable the account.
- **`user.update` has a new `ErrorCode 12`.** A call that changes the password, turns on two-factor authentication or disables the account also revokes the user's remembered browsers. If that revoke cannot be recorded, nothing is saved and the call answers `ErrorCode 12` instead of reporting success. Every successful response is unchanged.

The new interface at `/user/` is not affected: its "Remember me" already used a random server-side token (octeth/oempro#3230).

#### A revoked user session is refused by the API

The new interface's **Account, Active sessions** tab now ends the Octeth session behind a revoked device, through the new [`user.logout`](/v6.0.4/api-reference/users#user-logout) command. Before v6.0.4 a revoke signed the device out of the interface only, and its `SessionID` kept working against `api.php` until it expired.

- **A `SessionID` that was revoked** (Revoke, Sign out all other sessions, or `user.logout` with `TargetSessionHashes`) now answers `{"Success":false,"ErrorCode":99998,"ErrorText":"This session was signed out from another device"}` on every command, whether it arrives as the `SessionID` parameter or as the session cookie, and the session is ended. The legacy user area signs the same session out too. Sign in again with `user.login` to get a new one.
- **Signing out of the new interface**, or logging one saved account out of its account switcher, now ends that account's `SessionID` too.
- **Unchanged:** a `SessionID` that was not revoked answers exactly as before, and user `APIKey` calls are not affected.

#### An array or object sent for a single-value parameter is refused

Every command now answers HTTP 400 with `{"Success":false,"ErrorCode":100017,"ErrorText":"Parameter 'password' must be a single value, not an array."}` when a top-level parameter that takes a single value arrives as an array or object, for example `Password[]=x` in a form body or a JSON array where a string is expected. The check runs before the credentials are checked and before the command does anything (octeth/oempro#2954).

- **Before:** the value was turned into the text `Array`, into an empty value, or dropped, without an error. On `user.update` that skipped the current-password check and stored a predictable password.
- **Unchanged:** parameters that a command documents as a list or a structure (`Tags`, rule bundles, journey actions, custom field options, the email gateway `To`, `Cc` and `Attachments` and the rest) accept one as before, and every request that sends single values answers exactly as before.
- **Operators** can set `API_SCALAR_PARAMETER_CHECK=log` in `.oempro_env` to log such requests instead of refusing them, while an integration is corrected. See [error code 100017](/v6.0.4/api-reference/error-handling#request-shape-errors).

### Stricter validation

#### Segment rules refuse a `status` key on an operator that has no status

`sms-events` rules gained the Keitaro operators `integration clicked`, `not integration clicked`, `integration converted` and `not integration converted`, and the two converted operators take an optional `status` key (see [Segmenting on Keitaro activity](/v6.0.4/api-reference/segments#create-a-segment)).

- **Now:** `segment.create` and `segment.update` refuse a rule that carries a non-empty `status` key on any other operator, including the existing `sent`, `delivered`, `failed`, `clicked`, `replied` and `opted out` operators and their negations, with error code `12` and "The status filter is only available for Keitaro conversion rules." (HTTP 422). Nothing is saved.
- **Before:** the key was accepted, stored and ignored when the segment was evaluated.
- **Unchanged:** a rule without a `status` key, or with `status` absent, `null` or `""`, is validated and evaluated as before. A segment stored earlier with such a key still evaluates as before, and is refused only when it is saved again without removing the key (octeth/oempro#3720).

## Tier 2: shape and value changes

#### Journeys send to soft-bounced subscribers

A subscriber whose `BounceType` is `Soft` and whose `SubscriptionStatus` is `Subscribed` is now treated as active by journeys, the same way campaigns have always treated them. Only a hard bounce takes a subscriber out.

- **Send Email and Send SMS journey actions** now send to a soft-bounced subscriber. Earlier versions skipped them with the reason `Bounced` ("Subscriber has bounced") in the action's execution metadata. A hard-bounced subscriber is still skipped with that reason.
- **Scheduled-pull journeys** now select soft-bounced subscribers and still exclude hard-bounced ones.
- **Journey reports and per-action counts** therefore show more sends on lists that hold soft-bounced subscribers.
- **The new interface** shows a soft-bounced subscriber as Active with a "Soft bounce" badge, and segment browsing and segment exports include them. "Bounced" now means a hard bounce.
- **Unchanged:** campaigns, `Subscribers.Search` with `AddMustHaveFilters`, and the bounce processor's soft-to-hard threshold, which still turns repeated soft bounces into a hard bounce.

#### Multi-list campaigns skip journey enrollees only on lists that ask for it

The list setting "Skip subscribers already in a journey or auto responder" (`DoNotSendEmailCampaignIfRecipientIsEnrolledInJourneyOrAutoresponder` in the list `Options`) now applies to that list's recipients only.

- **Before:** when a campaign was sent to several lists and one of them had the setting on, Octeth removed journey and autoresponder enrollees from every list in the campaign, including lists that had it off.
- **Now:** a list with the setting on loses its own enrollees, and a list with it off keeps them. A campaign sent to lists that all have the setting on, or all have it off, is unchanged, and so is every single-list campaign.
- **Autoresponder enrollees above 10,000:** when more than 10,000 recipients of one list were waiting for an autoresponder email, earlier versions removed only part of them and logged the full number. All of them are now removed, and the log shows the number actually removed.
- **New per-campaign override:** `campaign.create` and `campaign.update` accept `JourneyEnrolleeHandling` (`list`, `include` or `exclude`), and `campaign.get` returns it inside `Options` once it is set. `list`, or no value, keeps the per-list behavior above. See [Update a Campaign](/v6.0.4/api-reference/campaigns#update-a-campaign).

#### SMS campaigns refuse the tracking code tag outside a link

`smscampaign.create` and `smscampaign.update` accept the new <code v-pre>{{ SMS:TrackingCode }}</code> tag inside a link URL, for Keitaro tracking links (see [User Integrations](/v6.0.4/api-reference/user-integrations)).

- **Now:** a message that has the tag outside a link URL is refused with the new error code 22, "The <code v-pre>{{ SMS:TrackingCode }}</code> tag can only be used inside a link." (HTTP 422).
- **Before:** the same message was refused as a merge tag that cannot be read, code 16 on `smscampaign.create` and code 19 on `smscampaign.update`.
- **Unchanged:** a message without the tag is validated and sent exactly as before. There is no flag, because the only affected messages were already refused (octeth/oempro#3720).

#### `integrations` is a reserved URL slug in the new user interface

The new interface has a new **Integrations** page at `/user/integrations`.

- **Now:** a `UI_BRAND_SLUG_*` value of `integrations` in `.oempro_env` is ignored when the interface container starts, with the warning "is a path the new user interface already uses for a fixed page", and that section keeps its default slug. `php artisan brand:check` lists it as reserved too.
- **Before:** `integrations` was accepted as a slug.
- **Unchanged:** every other slug. An installation that never set a slug to `integrations` sees no difference (octeth/oempro#3720).

#### SMS reporting accepts the Keitaro event names

Keitaro activity is stored as two new SMS event types, `integration_click` and `integration_conversion`.

- **Now:** `smscampaign.stats.timeseries` (in `Events`) accepts the two names. `smscampaign.events.browse`, `smscampaign.events.export.post`, `smscampaign.stats.breakdown` and `subscriber.sms.events.get` accept them only with the new `IncludeIntegrations` parameter, and leave those events out without it. `sms.stats.account` returns their daily rows only with `IncludeIntegrations`. `smscampaign.stats` adds an `Integrations` block only with `IncludeIntegrations` and only for a campaign with a tracking-tag link.
- **Before:** the two names were refused with error code 4, "Unknown event type".
- **The flag:** `IncludeIntegrations` on `smscampaign.stats`, `smscampaign.events.browse`, `smscampaign.events.export.post`, `smscampaign.stats.breakdown`, `subscriber.sms.events.get` and `sms.stats.account` accepts `1`, `true` or `yes` in any letter case, the same values as `include_bots`. Any other value, or no value, is off.
- **Unchanged:** a call that names neither event and does not pass `IncludeIntegrations` returns exactly what it did before, including the default event list of `smscampaign.stats.timeseries`. `smscampaign.stats.timeseries` has no flag for the newly accepted names, because they were refused before and its default event list leaves them out (octeth/oempro#3720).

## Upgrade checklist

1. **If a ClickBank account still sends instant notifications to `/app/public/cbs2spostback/`**, point it at the list's `clickbank_webhook.php?list=<list hash>` address instead. The old address never recorded a sale, so nothing that worked before stops working.
2. **If your SSO broker reuses a token** (for example to retry a failed request), change it to mint a new token per attempt.
3. **If an SSO source has Valid for (seconds) above 300**, lower it the next time you edit the source.
4. **If your SSO broker parsed the plain-text "Decrypted Token" response**, read the JSON `error` field instead.
5. **If a restricted sub-admin account adds SMS suppressions for other accounts** through `smssuppression.add` or `smssuppression.patterns.add`, check that every target account is in one of its allowed user groups, or call the commands with an unrestricted admin account.
6. **If your integration sends an object id as anything other than a plain number** to one of the eleven commands above (for example `"12abc"` or a JSON array), send the numeric id instead.
7. **If your integration sends an id in exponent, decimal or signed form** (for example `1e3`, `5.0` or `+5`) to one of the commands in the ownership-check table above, send the plain digits instead.
8. **If your integration tells an operator "no such administrator" when `admin.passwordremind` returns `ErrorCode 3`**, show one neutral "if the address is registered, a reset link is on its way" message for every success instead.
9. **Expect users of the classic user area who ticked "Remember me" to sign in once more** after the upgrade. Accounts with two-factor authentication are no longer remembered at all.
10. **If an integration reuses a `SessionID` it got by signing in as a user who also signs in to the new interface**, expect error 99998 after that user revokes the session or signs out, and sign in again with `user.login`. Integrations that authenticate with a user `APIKey` are not affected.
11. **If your integration sends a form field with `[]` or a JSON array or object** for a parameter that takes one value, send a single value instead (for a list, use the format the command documents, usually a comma-separated string). Watch for `ErrorCode 100017` after the upgrade.
12. **If you read journey send counts or skip reasons**, expect more sends and fewer `Bounced` skips on lists with soft-bounced subscribers.
13. **If you send one campaign to several lists and only some of them skip journey enrollees**, expect enrollees on the other lists to receive it. Set `JourneyEnrolleeHandling` to `exclude` on the campaign to skip them on every list.

---

Previous releases: [v6.0.3](/v6.0.3/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
