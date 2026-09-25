---
layout: doc
title: API Behavior Changes in v6.0.0
description: Deliberate API behavior changes in Octeth v6.0.0 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.0

This page lists every deliberate change in v6.0.0 that an existing integration can observe, so you can check your code against it before upgrading.

::: warning Read this before upgrading
v6.0.0 is a security release. Most of the entries below are **refusals of requests that were previously accepted**, so an integration can break even though no successful call changes shape. The [upgrade checklist](#upgrade-checklist) at the end is the short version.
:::

## Tier 1: changes that can break an integration

### Authentication and credentials

#### `user.login` no longer accepts a stored password hash

The undocumented `PasswordEncrypted` parameter is removed. While it was truthy, `user.login` compared the supplied `Password` **verbatim** against the stored hash instead of salting and hashing it first, which made the hash a working credential in its own right. It had no flag, no privilege check and no restriction to internal callers.

`user.login` now always salts and hashes the supplied password. Send the user's real password with the parameter omitted.

A request that still sends the parameter is **ignored, not rejected**, so an integration that sent it alongside a real password keeps working. Only one that sent a hash stops working, and it answers the existing `{"Success":false,"ErrorCode":[3],"ErrorText":["Invalid login information"]}`, exactly as a wrong password always did.

If your integration only ever held the hash, it was relying on the vulnerability. Use a per-user API key from the user's API Keys screen, `user.switch` under admin authentication, or SSO.

#### Credential fields are removed from six endpoints

| Endpoint | Auth | Fields no longer returned |
|---|---|---|
| `user.get` | admin | `UserInformation.Password`, `.AuthToken`, `.2FA_SecretKey`, `.2FA_RecoveryKey`, `.APIKey`, `.PreviewMyEmailAPIKey`, and inside `GroupInformation`: `SendMethodSMTPUsername`, `SendMethodSMTPPassword`, the rest of the `SendMethod*` family, every `Payment*` column, and the whole `DeliveryServerInformation` block including each server's `ConnectionParams` |
| `users.get` | admin | The same user columns, on every row of `Users` |
| `user.switch` | admin | The same as `user.get`, under `UserInfo` |
| `user.login` | login credentials | `UserInfo.Password` (already a masked placeholder, now gone with it), `.AuthToken`, `.2FA_SecretKey`, `.2FA_RecoveryKey`, `.APIKey`, `.PreviewMyEmailAPIKey` |
| `user.current` | user | `UserInfo.2FA_RecoveryKey`, which was returned on every call including while two-factor authentication was off |
| `admin.login` | login credentials | `AdminInfo.Password`, `.AuthToken`, `.2FA_SecretKey`, `.2FA_RecoveryKey`, plus a new boolean `APIKeyIssued` |

Nothing else about these responses changed: same keys, same names, same nesting, minus those fields.

The group `SendMethod*` and `DeliveryServerInformation` values are the **platform's own relay credentials**, shared by every account in the group, which is why they are the most serious item here. Replacements: read a delivery server through `deliveryserver.get`, which returns a `HasSMTPPassword` boolean instead of the password; read group configuration through the user group endpoints under an admin credential.

`2FA_SecretKey` and `2FA_RecoveryKey` are still available where the account screen legitimately needs them: `user.current` returns `MFA_SecretKey` and `MFA_QRCode` while two-factor authentication is off, and `MFA_RecoveryCode` while it is on.

This is a deliberate exception to the rule that a contract change goes behind an opt-in flag. The fields are credentials, so there is no configuration under which returning them is correct.

#### The `internal.*` command namespace requires a shared-secret header

Every command whose name begins with `internal.` is refused unless the request carries a valid `X-Octeth-Signature` header. Today that is `Internal.Bounce.Register` and `Internal.S2SPostback.Register`, both of which were previously reachable with no credential of any kind.

```
X-Octeth-Signature: sha256(OEMPRO_PASSWORD_SALT + ADMIN_API_KEY + OEMPRO_PASSWORD_SALT)
```

A missing or wrong header answers HTTP 401 with `ErrorCode 99998` and nothing is processed. The requirement applies to **every transport**, including the `Mode=XML` / `XMLData` form.

Nobody using Octeth as shipped is affected: both commands are called only by Octeth's own processes, and every call site was updated in the same change. You are affected only if you built an integration that posts one of these commands directly to `api.php`. The admin **Bounce Processing** screen displays the current value.

#### `Subscriber.Unsubscribe` requires a credential

The command was dispatched with no authorization test and took the acting account from the `ListID` in the request rather than from a credential. Four changes:

1. **A credential is required**: a user `APIKey` or `SessionID`, an admin credential, or the internal `X-Octeth-Signature`. Anything else answers HTTP 401 with `ErrorCode 99998`.
2. **A user may only act on a list they own.** Another account's `ListID` answers `ErrorCode 4`, the same code an unknown list has always returned, so the response does not reveal whether that list exists.
3. **The `RulesJSON` bulk branch requires a credential**, refused with the new `ErrorCode 12`.
4. **`AddToGlobalSuppression=true` no longer suppresses across accounts.** The account-scoped suppression entry is still written for every caller, so the opt-out is fully honoured wherever that account sends. The install-wide entry is now written only for an admin credential.

**Customer opt-outs are unaffected.** RFC 8058 one-click unsubscribe still works with no credential and no confirmation step, because Gmail and Yahoo POST to `u.php`, which never passes through `api.php`. Every unsubscribe link already delivered keeps working, the link format is unchanged, and the embeddable unsubscribe form posts to `unsubscribe.php`.

You are affected only if you built an integration that posts `Subscriber.Unsubscribe` to `api.php` with no credential. Add a user `APIKey`.

#### `user.update` can require `CurrentPassword`

`user.update` gained an additive `CurrentPassword` parameter and the `USER_UPDATE_REQUIRE_CURRENT_PASSWORD` setting.

- A supplied `CurrentPassword` is **always** verified. A wrong value answers `ErrorCode 10`.
- Whether **omitting** it alongside `Password` is refused depends on the setting. When on, the call answers `ErrorCode 9`.
- This applies **only to a caller authenticated as the user**. An admin-authenticated caller is never asked for it.

The code default is `false`, so an upgrade keeps working. The shipped example file sets it `true`, and an upgrade that lacks the key entirely picks up the example value when environment files are merged. **That is the one combination that changes behaviour with no operator action**, so see the upgrade checklist.

#### `user.update` refuses an array-valued `Password`

`Password` arriving as an array now answers `ErrorCode 11`, for every caller including an admin. It was previously accepted and reported success, while PHP's array-to-string conversion set the stored hash to `md5(SALT . 'Array' . SALT)`, making the password the literal string `Array` on every account updated that way. It also bypassed the `CurrentPassword` confirmation, which only engages for a scalar. No working integration sends an array here.

#### `user.passwordreset` tokens now expire after one hour

The token `user.passwordremind` issues previously had no expiry: it stopped working only once the password next changed, so a link sitting in a mailbox or a browser history stayed usable indefinitely. It now carries a one-hour expiry and a signature, matching the admin equivalent from v5.9.3.

**The token format changes, so any reset link issued before the upgrade stops working.** There is nothing to migrate; the user requests a new link. Expect a small number of "my reset link says invalid" reports in the first hour.

The token is also now single use **under concurrency**. The consuming update is a compare-and-set, so two requests arriving together with the same token no longer both succeed and both email a different password. The loser answers `ErrorCode 2`, the same code as an expired or tampered token. Treat `ErrorCode 2` on a reset as "request a new link".

#### Two-factor codes: the window narrows to 90 seconds and codes are single use

- The accepted window was three 30-second steps either side of the current one, three and a half minutes in total. It is now one step either side, 90 seconds, which is what RFC 6238 recommends.
- A code that has verified once cannot verify again. The consumed step is recorded for three minutes.
- The comparison is an exact string match rather than a numeric one. A code with surrounding whitespace is still accepted because it is trimmed first, and a code beginning with zero still works, but a value that merely coerces to the right number is refused.

An account holder may notice that a code copied slowly now has to be submitted within a minute and a half, and that a double-clicked sign-in form may report an invalid code. Re-entering the next code works. If Redis is unreachable the single-use check is skipped and a warning is logged, deliberately: locking every account out during a cache outage is the worse outcome.

#### `disable2fa` is ignored over HTTP

`user.login` and `admin.login` accept `disable2fa` with a `disable2fatoken` to skip the two-factor challenge. Both parameters are now stripped from any request arriving through `api.php`, so they work only for Octeth's own in-process callers, which is what they were always for. An external caller that sent them gets the ordinary challenge. They appear in no API reference page.

#### `SessionID` format validation, and the session id changes on login

A `SessionID` that is not a plausible session id is refused with `ErrorCode 99998` and HTTP 400 before anything else runs. The accepted shape is 22 to 128 characters of letters, digits, comma and hyphen, which covers every alphabet PHP can generate. An id produced by `user.login` or `admin.login` always matches.

Separately, `user.login`, `admin.login` and `user.switch` now return a session id that differs from any id supplied on the same request. **An integration that presents a `SessionID`, calls a login command, then keeps using the id it originally sent must use the `SessionID` from the login response instead.** This is the standard defence against session fixation, and the response id was always the one to use.

### Ownership and scoping

#### `journey.actions.update` validates every object reference

Journey action payloads used to accept an id belonging to another account and store it, and the stored id was then dereferenced with no owner filter. New refusals, all HTTP 422 with the endpoint's existing `Errors` array shape, applied before anything is written:

| Code | Message | Input that now fails |
|---|---|---|
| 12 | `Email not found` | `EmailID` that is not an email the caller owns |
| 13 | `Sender domain not found` | `SenderDomainID` that is not the caller's |
| 14 | `Subscriber list not found` | `TargetListID` on `Subscribe` or `Unsubscribe` |
| 15 | `Subscriber tag not found` | `TargetTagID` on `AddTag` or `RemoveTag` |
| 16 | `Target journey not found` | `TargetJourneyID` on `StartJourney` or `ExitJourney` |
| 17 | `Custom field not found` | `TargetCustomFieldID` that is neither the caller's own field nor a system-global field |
| 18 | `Invalid WebhookURL parameter` | a Webhook action URL that is not a publicly reachable http or https address |

Each also answers `Invalid <name> reference` with the same code when the value is present but not a digits-only id. `1.9`, `-1`, `foo` and similar are refused rather than cast. Two of those used to slip through in opposite directions: `foo` cast to `0` and was read as "not selected", while `1.9` was checked as object 1 and then rounded to 2 by MySQL on the way into the column, so the stored reference pointed at an object the check never looked at.

Still accepted unchanged: `0` and an empty string mean "not selected"; a system-global custom field; a single id or a list of ids for `TargetJourneyID`; ids inside a Decision node's branches.

The Journey Builder's own save path is covered by the same shared implementation, so a canvas save carrying a foreign reference is refused with a page error naming the action, and nothing is written.

#### `list.update` validates its behaviour columns

| ErrorCode | ErrorText | Input that now fails |
|---|---|---|
| 23 | `Invalid subscriber list id for <FieldName>` | `OptInSubscribeTo`, `OptInUnsubscribeFrom`, `OptOutSubscribeTo` or `OptOutUnsubscribeFrom` set to a list the caller does not own |
| 24 | `Invalid email id for <FieldName>` | `OptInConfirmationEmailID` set to an email the caller does not own |

Both also answer the same code for a value that is not a digits-only id. These five columns are integers, so the value that is validated is now also the value stored: the endpoint writes the canonical integer rather than the raw request string. `0` and an empty string still clear the field.

#### Sub-admin accounts are scoped to their allowed user groups

Nine admin commands enforced the sub-admin privilege list but never the sub-admin's allowed **user groups**, so a sub-admin limited to one group could read, modify, credit, impersonate and delete accounts in every other group. Each now refuses a target outside the caller's groups with `ErrorCode 5003`.

Affected: `User.Get`, `User.Create`, `User.Update`, `User.AddCredits`, `User.Switch`, `Users.Delete`, `User.PaymentPeriods`, `User.PaymentPeriods.Update`, and `Users.Get` (which **filters** rather than refusing, `TotalUsers` included). `User.PaymentPeriod.Get` already enforced this.

Two rules worth knowing. `Users.Get` with `RelUserGroupID=ActivationPendingSenderDomains` is refused outright, because that listing builds from a join that cannot carry a group restriction. And `Users.Delete` is **all or nothing**: if any id in the list is outside the caller's groups, nothing is deleted, because the response has no field to report which ids were skipped.

**Nothing changes for the master `ADMIN_API_KEY`**, for any admin account without the restriction flag, or for calls made under user authentication. If your integration uses the master key, this entry does not apply to it.

### Input validation

#### Ids that reach SQL must be plain integers

`customfields.get` (`SubscriberListID`), `customfields.copy` (`SourceListID`, `TargetListID`) and `media.folderdelete` (`FolderID`) now require `[0-9]+`. Anything else is refused with the code that command already used for an unresolvable id: `2` for `customfields.get` and `media.folderdelete`, `3` and `4` for the two `customfields.copy` parameters.

| Input | Before | Now |
|---|---|---|
| `7`, `007` | accepted | accepted, unchanged |
| `7 ` (trailing space), `7abc`, `7.0` | treated as list 7 | refused |
| `-1`, `0x07`, `1e3` | treated as 0 or 1 | refused |
| an array value | PHP warning, then refused | refused, no warning |

A caller sending a genuine integer id, which is what every client library does, sees no change.

**Also fixed on `customfields.copy`:** a zero-padded id such as `0007` now copies correctly. Every SQL comparison already resolved it to list 7 so the ownership checks passed, but the subscriber table name is built by string concatenation, so the copy tried to alter a table that does not exist. The metadata row had already been inserted and the failed alter was not checked, so the response was `Success: true` while the target list gained a field with no column behind it.

#### Remote URLs must be publicly reachable

Three places now resolve a URL's host and refuse any address that is not publicly routable, which covers loopback, RFC 1918, link-local, carrier-grade NAT, IPv6 unique-local, the loopback shorthands such as `127.1` and `2130706433`, and any DNS name pointing inward:

- **`subscribers.import`**, `ImportFrom.CSV.URL`, refused with the existing `Code 18`. Only the message differs, so a client that handles `18` needs no change.
- **`subscribers.import`**, `ImportStatusUpdateWebhookURL`, refused with the new `Code 28`. This parameter had no validation at all before.
- **`emailgateway.addwebhook` and `emailgateway.addwebhook.public`**, which previously refused only four literal host strings. The existing codes are unchanged: `6` for a scheme or syntax problem, `7` for a destination problem.

On `emailgateway.addwebhook.public` only, a `WebhookURL` that is absent, not a string, or syntactically invalid is still refused by that endpoint's own pre-check with `Code 3`, which predates this change and is left in place so a refusal a caller may already handle does not move.

Operators registering a webhook against a host that only resolves on their internal network must expose it on a publicly resolvable name. There is no setting to switch this off.

#### The local MTA path is validated

The "Send Method: Local MTA" path is validated before it is saved and before it is used to send. It was previously accepted verbatim and handed to the operating system, so a value containing a space was treated as a command with arguments rather than a path.

| Command | Parameter | Error code |
|---|---|---|
| `settings.update` | `SEND_METHOD_LOCALMTA_PATH` | `22` |
| `settings.emailsendingtest` | `send_method_localmta_path` | `3` |
| `usergroup.create` / `.update` / `.patch` | `SendMethodLocalMTAPath` | `35` |

A valid path is absolute, has no whitespace or shell metacharacters, has no relative segment, names a file that exists and is executable, and has a file name containing one of `sendmail`, `qmail`, `smtp`, `exim`, `postfix`, `mta` or `mail`.

**An empty value stays valid wherever the path is saved.** It is the shipped default and the admin screens post the field on every save whatever the send method. `settings.emailsendingtest` is the exception: it sends rather than saves, so a `LocalMTA` test needs a real path.

Sending is checked at the point of use on both mail engines, so a path stored before this release is refused rather than run, the message is not sent, and the reason is logged once per distinct path.

#### Segment rules are validated when saved

The user segment editor now validates submitted rules before saving, which it did not do before. The admin global-segment screen and the `global.segment.*` commands have validated the same way since v5.9.4, so this brings the user screen in line. Every rule the rule builder itself produces passes; a hand-edited or scripted submission may now be refused.

A segment already holding an invalid activity value **keeps matching nobody** and now says so in the log at ERROR level, which the default log level shows. Its audience does not change: the value used to make the query invalid, so the query failed and the segment selected nobody. It still selects nobody, but by design, through a valid query, with the reason recorded. Re-save the segment in the editor to clear it.

One narrow difference if such a segment is set to "Match Any Rule": it is the invalid **rule** that matches nobody, not the whole segment, so the segment's other rules still apply. With the default "Match All Rules" the outcome is the same as before.

### Removed features

#### The built-in PayPal Express Checkout gateway is removed

`payment.php` and `payment_result.php` now return HTTP 404, and the PayPal Express section of **Settings, ESP Settings, Payment Gateway** is gone.

The callback endpoint authenticated nothing: it did not verify the notification came from PayPal, it took the account and invoice identity from a value supplied in the request, and it marked an invoice paid and granted credits on a single status field in the request body. Repairing it correctly means a signature-verified callback, a replay guard and an amount comparison, which is a new payment integration rather than a patch.

- `settings.update` no longer accepts `PAYPALEXPRESSSTATUS`, `PAYPALEXPRESSBUSINESSNAME`, `PAYPALEXPRESSPURCHASEDESCRIPTION` or `PAYPALEXPRESSCURRENCY`. Sending one is **ignored rather than refused**, so an existing integration does not start returning errors.
- `settings.get` and `system.getsettings` still return those values, because the columns remain. They are historical data and nothing reads them.
- Invoice receipt emails no longer carry a PayPal payment link. `%Payment:Links%` still works and renders empty with no gateway configured.

**Your stored configuration is untouched and no migration drops it.** Replacements already in the product: the *Third party payment gateway* option on the same screen, or a plugin using the `PaymentReceipt.Email.PaymentLinks` filter hook.

### The admin area and the new user interface

#### The admin IP allow-list is enforced on every admin request

Authorized IP Addresses was checked only while the admin login page rendered, so a session already open, and the "remember me" cookie, worked from any address. It is now checked on every authenticated admin request, on every admin and plugin admin screen, and before the cookie can sign anybody in. A refused request has its admin session destroyed and is sent to the login page.

This is **not behind a flag**, deliberately: the list has no effect until an operator fills it in, and the address compared is the same one the login page always compared, so it can only refuse someone who could not have signed in from that address today.

Requests from `127.0.0.1` and `::1` stay exempt, so `system.health.check` and the cron probes keep working. See the upgrade checklist for the `TRUSTED_PROXIES` warning, which is the way this change most commonly goes wrong.

#### The admin API allow-list now exempts the new user interface

`ADMIN_API_ENFORCE_ALLOWED_IP` no longer refuses admin-key calls that arrive from the new user interface's own container, while `UI_ENABLED` is `true`. On v5.9.6 those calls were refused like any other, which made the whole staff side of the interface unusable on an install with a non-empty list, and stopped customers signing up or recovering a password.

Nothing else changes. A call from any other address is measured against the list exactly as before, including one presenting `X-Forwarded-For: 192.168.99.110`, and so is a call from any other container on the Docker network. The match is on the address the TCP connection was received from, not on the resolved client address, so no request header can influence it and external traffic, which always arrives from the bundled proxy, can never satisfy it.

`UI_ENABLED` must be the literal lowercase `true`. `1`, `yes`, `on` and `TRUE` are read as off, here and by the container entrypoint, the reverse proxy and the command line tool alike, so an interface that is switched off grants no exemption. An operator who added `192.168.99.110` to the list as a v5.9.6 workaround can remove it; leaving it is harmless. Exemptions are recorded at DEBUG as `Admin API call exempted from ADMIN_ALLOWED_IP`.

#### The admin "remember me" cookie is hardened

It previously held a reversible encoding of a bare admin id with no timestamp, no nonce and no tie to the password, written without `HttpOnly` and without `Secure`. A copied value kept working after its browser expiry and after a password change, and it signed the admin in with no 2FA step.

It now carries a keyed binding to the current password hash and its issue time, is always `HttpOnly`, and is `Secure` when the install is served over HTTPS. It stops working when the password changes and when its 14-day lifetime expires, both checked server-side. **An admin with 2FA enabled is not signed in by the cookie at all.**

Cookies issued before the upgrade are in the old format and are rejected, so those admins sign in once more.

#### The new user interface

- **The API debug console (`?_debug=1`) is restricted.** It now requires a staff session and either `APP_ENV=local` or `UI_DEBUG_CONSOLE_ENABLED=true`. A customer session can no longer enable it, and a flag stored in a session before the upgrade is discarded. Credential-shaped fields are removed from the response bodies it renders whatever the setting, so the flag decides who may open the console, not how much it discloses.
- **Every absolute URL is built from `APP_URL` rather than the incoming request**, and `X-Forwarded-Host` is no longer honoured. `X-Forwarded-Proto`, `X-Forwarded-For` and `X-Forwarded-Port` are unchanged. Emailed password-reset and verification links used to be rooted at the request host while the interface trusted a client-supplied forwarded host from every peer.
- **If `APP_URL` is not an absolute `scheme://host` URL**, the interface logs a critical error and the password-reset and registration flows answer "temporarily unavailable" rather than mailing a link a client can steer. Every other screen keeps working.
- **Session payloads are encrypted**, so everyone signed in to the interface is signed out once when its container restarts after the upgrade. The legacy areas are unaffected.
- **Self-signup now follows the admin user-signup setting** under Settings, ESP settings, the same setting the legacy signup page has always used. With signup off, the interface hides the signup link on every signed-out page and `/user/register` redirects to sign-in, where it previously offered a working form regardless. With signup on and the interface's own billing off, a new account lands in the user group named on that screen rather than in the interface's own default group. With billing on, placement is unchanged. Verification links issued before the setting was switched off still activate their accounts.
- **A pending two-factor challenge expires after ten minutes**, and adding a second account from the account switcher is refused when that account has two-factor authentication enabled. That never worked: the challenge page is a signed-out page, so a signed-in user was redirected away from it.

## Tier 2: shape and value changes

- **`admin.login`** now uses the projection `admin.get` already used, so `AdminInfo.AdminID` is a JSON **number** where it used to be a quoted string, and `AdminInfo.Options` is always an object or array rather than sometimes a JSON string. Both match what `admin.get`, `admin.subadmin.get` and `admin.subadmins.get` have always returned. `AdminID` is the only field whose type changes anywhere in this release.
- **`customfields.copy`** answers a scalar `ErrorCode: 4` for a non-integer `TargetListID` where the later ownership lookup answered `ErrorCode: [4]` as a single-element array. A caller that indexes `ErrorCode[0]` should handle both.
- **Reset passwords are 16 characters**, up from 5, and come from the operating system's cryptographic random source. An integration that stored, truncated or displayed the old value in a fixed-width field should be checked.
- **`Core::GenerateRandomString()` applies a 16-character floor to every caller.** One other in-product consumer is affected and the effect is cosmetic: the random component of a generated sender-domain DNS record grows from 10 to 16 characters. Regenerating a domain's records already produced a fresh value each time.
- **`journey.actions.update` no longer returns the resolved object for an id that is not the caller's.** Before, the write response itself carried the other account's email subject and body. Such an id now comes back as `false` in the hydrated `ActionParameters`, the same value an id that no longer exists has always produced.
- **`journey.clone` copies the stored action parameters rather than the hydrated ones**, so a cloned `SendEmail` action no longer carries a copy of the referenced email's subject and body inside its own parameters. Callers reading `Actions[].ActionParameters.Email` on a cloned journey still get it, because the read path hydrates on the way out as it always did.

## Upgrade checklist

1. **Search your integrations for `PasswordEncrypted`.** If any call sends a stored hash as the password, it stops working. Switch to a per-user API key or `user.switch`.
2. **Check anything that reads `Password`, `AuthToken`, `APIKey`, the 2FA keys, or group `SendMethod*` and `DeliveryServerInformation` values** out of `user.get`, `users.get`, `user.switch`, `user.login`, `user.current` or `admin.login`. Those fields are gone.
3. **If you post `Internal.Bounce.Register` or `Internal.S2SPostback.Register` directly to `api.php`, add the `X-Octeth-Signature` header before upgrading**, or those calls answer 401 and the bounces or conversions they carry are not recorded.
4. **If you post `Subscriber.Unsubscribe` to `api.php` with no credential, add a user `APIKey`.** Customer opt-out links, the RFC 8058 endpoint and the embeddable form are unaffected.
5. **If an integration changes a user's own password through `user.update`, send `CurrentPassword`** or set `USER_UPDATE_REQUIRE_CURRENT_PASSWORD=false`. This is the one setting whose shipped example value differs from the code default, so an upgrade that adds the key starts enforcing it with no operator action.
6. **If an integration presents a `SessionID` and then calls a login command, use the `SessionID` from the login response** rather than the one it sent.
7. **Expect reset links issued before the upgrade to stop working.** Users request a new link.
8. **If you use restricted sub-admin accounts**, confirm each integration's target accounts are inside that sub-admin's allowed user groups, or switch it to the master key if it is meant to be cross-tenant. Do not remove the restriction flag to make one call work: that grants every group on the install.
9. **If you use "Local MTA" as a send method**, check the stored path at Settings, Email Delivery **and** on every user group that overrides the send method. Remove any trailing arguments and confirm the binary exists and is executable.
10. **If Settings, Security, Authorized IP Addresses is filled in, check it before upgrading.** Two traps. If you run your own proxy or CDN in front of Octeth, list it in `TRUSTED_PROXIES` first, otherwise Octeth records the proxy's address for every visitor and the list matches the wrong thing. And a proxy rule on the `/app/admin/` path prefix does **not** restrict the admin area, because the front controller also answers at `/app/index.php?/admin/` and four more shapes. If you lock yourself out, loopback is exempt, or clear the value with `UPDATE oempro_config SET ADMIN_ALLOWED_IP = '' WHERE ConfigID = 1;` followed by `docker exec oempro_redis redis-cli DEL system_config_1`.
11. **If PayPal Express Checkout was ticked** at Settings, ESP Settings, Payment Gateway, your customers cannot buy credits after the upgrade until you configure the *Third party payment gateway* option or install a plugin. Remove any IPN URL still pointing at `payment_result.php`.
12. **Check that `APP_URL` is the hostname your users actually reach the install on**, and that it is an absolute `scheme://host` URL. The new user interface now roots its links, redirects and asset URLs there.

---

Previous releases: [v5.9.6](/v5.9.6/api-reference/behavior-changes)
