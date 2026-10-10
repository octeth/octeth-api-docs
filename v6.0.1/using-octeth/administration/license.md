---
layout: doc
---

# License <Badge type="tip" text="New in v6.0.1" />

The **Settings > License** page in the administrator area shows the license your installation runs with and the limits it sets, and it is where you paste a new license key. This article covers what the page shows, the notices the administrator area displays about the license, what happens when a limit is reached, and how the license key is tied to your installation's domain.

Octeth v6.0.1 and newer read the signed license key from the [Octeth Client Area](https://my.octeth.com/). To get a key, see [Preparations](/v6.0.1/getting-started/preparations#license-key).

## The License Page

Open **Settings > License** in the administrator area. The page needs the **System** administrator privilege, the same one the About page needs.

### What the page shows

| Row | What it means |
|---|---|
| **License status** | **Valid**, or **Not valid** followed by the reason, for example that no license key is set, that the key is damaged, or that it is for a different domain. |
| **License key source** | Where the key in use comes from: **Pasted on this page**, **LICENSE_KEY in .oempro_env**, or **None**. |
| **Limits in effect** | **From the license key** when the key is valid. Otherwise the grace period with the days left, or the Community Edition limits. |
| **Edition** | **Standard** or **Community**. |
| **User accounts** | The number of user accounts the license allows, or **Unlimited**. Administrator accounts are not counted. |
| **Active subscribers** | The number of active subscribers the license allows across the whole installation, or **Unlimited**. |
| **License key** | The key masked to its last four characters, for example `****7K2M`. The full key is never shown. |
| **Licensee**, **Plan**, **Licensed domain**, **Issued**, **Service expires**, **Updates until** | Read from a valid license key. |
| **Pasted license key** | Shown only when a pasted key is stored but no longer verifies, with the reason. |

### Paste a license key

1. In the client area, copy the license key for your installation's domain.
2. Open **Settings > License** and paste the key into the **License key** box under **Paste your license key**. The line above the box names the domain the key must be for.
3. Click **Verify and save**.

Octeth verifies the key before it saves it. A key that does not verify is refused with the reason and nothing changes. The one-line key, the same key wrapped over several lines, and the block between `-----BEGIN OCTETH LICENSE-----` and `-----END OCTETH LICENSE-----` are all accepted. The box is never filled in with the stored key.

### A pasted key wins while it is valid

A key saved on this page is stored in the database and takes precedence over `LICENSE_KEY` in `.oempro_env` for as long as it verifies. If it stops verifying, for example after you change `APP_URL`, `LICENSE_KEY` decides and the page shows the pasted key's reason in the **Pasted license key** row.

To go back to `LICENSE_KEY`, click **Remove the pasted license key**. The button appears only when a pasted key is stored. Remove the pasted key whenever you change `LICENSE_KEY` by hand, otherwise the pasted key keeps winning.

You can also set `LICENSE_KEY` during installation or upgrade. See [Octeth Configuration](/v6.0.1/getting-started/octeth-configuration) and [Upgrading Octeth](/v6.0.1/getting-started/upgrading-octeth#set-the-license-key).

## Notices in the Administrator Area

The administrator area shows a notice at the top of every page when one of these applies. Each license notice links to the License page.

| Notice | When it appears |
|---|---|
| **Grace period countdown** | No valid license key is set and the 30-day grace period is running. The notice names the reason, the days left, and the Community Edition limits that apply afterwards. |
| **Invalid or missing key** | No valid license key is set and the grace period is over, or the installation never had one. The notice names the reason and says the Community Edition limits apply. |
| **Limit reached** | The user account limit or the active subscriber limit is reached. The notice shows how many are in use out of how many are allowed. |
| **Updates expired** | The running release is newer than the license's **Updates until** date. Your license stays valid and nothing is blocked. A license without an **Updates until** date never shows this notice. |

## Limits and the Community Edition

Without a valid license key, the installation runs with the Community Edition limits: **one user account** and **10,000 active subscribers**, counted across every list. A license key that starts with `CE` also runs with these limits.

When a limit is reached, Octeth refuses to add more:

- **New user accounts** are refused in the administrator area, on the sign-up page and through the API. The `user.create` API call answers with error code `16`.
- **New subscribers** are refused on subscribe forms, through the API, in imports, in journeys and in website tracking. An import stops once the remaining allowance is used, and the rows imported before that point stay.

Nothing else stops. Existing users and subscribers stay, updates to existing subscribers keep working, and campaigns and journeys keep sending to existing subscribers.

A subscriber who is on two lists counts twice. Unsubscribed, unconfirmed and hard-bounced subscribers are not counted.

To raise the limits, paste a license key with higher limits. Community Edition owners get a new license key from the client area.

## Domain Binding

Each license key names one domain. Octeth checks it against one host only: the host of `APP_URL` in `.oempro_env`. The comparison ignores case and a leading `www.`, so a key for `example.com` matches `https://www.Example.com/`.

Recipient-facing hosts are never checked against the license. Sender domains, tracking, link and open domains, unsubscribe links, and web forms served from other hosts all work, and you can use any number of them.

If you change `APP_URL` to another host, the current key no longer verifies. Add the new domain to your license in the client area, copy the new key, and paste it on the License page. Changing or adding a domain always needs a new key.

## Offline Verification

Octeth verifies the license key on the server, with the public keys shipped in each release. Nothing calls my.octeth.com while Octeth runs, so a firewall that blocks outbound traffic does not affect the license.

## Grace Period

An installation that existed before v6.0.1 and has no valid license key gets 30 days from the first time it runs without one. During those 30 days its limits do not change. The License page, the administrator area notice, the installer and the upgrade command all show the days left. After 30 days the Community Edition limits apply until a valid key is set.

A fresh installation and an installation with a `CE` key have no grace period.

## Troubleshooting

**"the license key is for example.com, but this install's APP_URL is app.example.net"**

The key was issued for a different domain than the host in `APP_URL`. Either correct `APP_URL`, or add the `APP_URL` host to your license in the client area and use the new key. For an internationalised domain, write `APP_URL` in its `xn--` form, because license keys name the domain in that form.

**"the license key is a short key, not the signed license key from my.octeth.com"**

`LICENSE_KEY` holds an older short key (`OCT-...`) or another value that is not a signed license key. Copy the license key from the client area with **Show license key** and set it again.

**"this server cannot verify license keys because the paragonie/sodium_compat package is missing"**

The installer and the upgrade command also report this one. It means the `composer install` step inside the `oempro_app` container did not finish, most often because the server cannot reach packagist.org or github.com. Until it is fixed, every license key is refused: the installation runs on the grace period and then drops to the Community Edition limits.

1. Check `docker logs oempro_app` for the composer error and fix its cause.
2. Run `./cli/octeth.sh composer:install`.
3. Confirm with `docker exec oempro_app php5.6 /var/www/html/cli/license_verify.php --self-test`. The output should include `verifier=available`.

A fresh installation rolls back when this check fails. An upgrade completes, prints the error again after its summary and exits with status 1, so the fix above can be applied without running the upgrade again.

## Next Steps

- [Preparations](/v6.0.1/getting-started/preparations#license-key) for getting a license key from the client area
- [Upgrading Octeth](/v6.0.1/getting-started/upgrading-octeth#set-the-license-key) for setting the key during an upgrade
- [Octeth Configuration](/v6.0.1/getting-started/octeth-configuration) for `LICENSE_KEY` and `APP_URL`
