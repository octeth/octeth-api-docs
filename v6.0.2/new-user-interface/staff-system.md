# The Staff System Screen

**System** shows which version of Octeth this install runs, the license it runs under, and the health of every service it depends on. It replaces the classic admin **About** and **License** pages.

| Screen | Path on a default install | Permission |
|---|---|---|
| System, About section | `/user/staff/system` | System |
| System, License section | `/user/staff/system?section=license` | System |
| System, System health section | `/user/staff/system?section=health` | System |

Open it from the staff sidebar: click **System**. The classic admin **Settings > License** and **Settings > About** links, and the link in the license notice at the top of the classic admin area, open the same screen.

The screen has three sections in a menu on the left.

## About

- **Version**: the product, the installed version, and the PHP and MySQL versions.
- **License**: whether the license is valid and which limits apply. Click **Open License** for the details.
- **Copyright**: the copyright line and, when one is set, a link to the license terms.

## License

The top card lists the license in effect:

- **License status**: Valid, or Not valid with the reason.
- **License key source**: a key pasted on this screen, `LICENSE_KEY` in `.oempro_env`, or none.
- **Limits in effect**, **Edition**, **User accounts** and **Active subscribers**. Unlimited means no cap.
- **License key**: the last four characters only. The full key is never shown.
- **Licensee**, **Plan**, **Licensed domain**, **Issued**, **Service expires** and **Updates until**, when the license is valid.
- **Pasted license key**, when a key was pasted but does not verify, for example after the install moved to another domain. `LICENSE_KEY` decides until you replace or remove it.

### Paste a license key

1. Copy the license key for this install's domain from your license page at my.octeth.com. The card names the domain the key must be for.
2. Paste it into **License key**. The lines that start with `-----BEGIN` and `-----END` may stay.
3. Click **Verify and save**.

The key is checked before it is saved. A valid key takes effect at once, and it takes precedence over `LICENSE_KEY` in `.oempro_env`. When the key is refused, the field says why, and nothing changes. The box is emptied after every attempt, and the key is never shown again.

::: warning
The license decides the user and subscriber limits of the whole install. Paste a key for this install's domain only.
:::

### Remove the pasted key

**Remove the pasted key** appears only when a key was pasted on this screen. Click it, then **Remove key** to confirm. `LICENSE_KEY` in `.oempro_env` decides the edition and the limits from then on.

::: info
Every save and removal is recorded in the staff audit log with the edition and the limits. The key itself is not recorded.
:::

## System health

Click **Run health check**. The check never runs on its own, because a run can take up to 30 seconds.

A banner above the table sums up the run: every check passed, passed with warnings, or how many checks failed. The table lists every check with its time in milliseconds and its status, and a total at the bottom:

- **OK**: the check passed.
- **Warning**: the check passed with a finding to look at. The text under it explains.
- **Failed**: the check failed. The text under it is the error the service reported.

The same checks are available to monitoring tools through the `system.health.check` API command.

## What was not carried over

The classic About page's database export, database repair, per-table check, PHP settings page and file download are removed. Use the `admin.database.check` and `admin.database.repair` API commands for checks and repairs, and `admin.system.info` for the PHP settings.
