# Your Staff Profile

**Your profile** is where an administrator changes their own name, email address, username and password, and, with the Settings permission, the sender of the emails the install sends on its own. It replaces the classic admin **Account** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Your profile | `/user/staff/profile` | Account |
| Your profile, System emails section | `/user/staff/profile?section=system-emails` | Account and Settings |

Open it from the user menu: click your name at the bottom of the left menu, then **Your profile**. The classic admin **Settings > Account** link opens the same screen.

::: info
The screen acts as the administrator who is signed in, and every save is recorded in the staff audit log with the names of the fields that changed. The values themselves are not recorded.
:::

The screen has four sections in a menu on the left. Each section has its own **Save** button and saves only its own fields.

## Profile

Change your **Name**, **Email address** or **Username**, then click **Save profile**.

::: warning
You sign in with your username. Saving a new username signs you out of the staff area, and you sign in again with the new username. A name or email address change keeps you signed in.
:::

## Password

1. Enter your **Current password**.
2. Enter a **New password**, or click **Generate** to fill in a random one. Click **Show** to see it, and copy a generated password before you save.
3. Click **Change password**.

Saving signs you out of the staff area. Sign in again with the new password. When the current password is wrong, the field says so and nothing is changed.

## System emails

Shown only to administrators with the Settings permission. These settings apply to the whole install:

- **Sender name** and **Sender email address**: the sender of the emails the install sends on its own, such as notifications and automated reports. The same name and address are used as the reply-to.
- **Alert recipient**: the address that receives system alerts.

Click **Save system emails**. Other settings are not changed.

## API access

This section never shows an API key.

- **Administrators without permission limits** use the master Admin API Key. It is the `ADMIN_API_KEY` value in the install's `.oempro_env` file, which only the server operator can read.
- **Sub-administrators with permission limits** see whether an API key of their own is issued. That key is issued, rotated and revoked under **Sub Admin Accounts** in the classic admin area, it is shown only once, when it is issued, and it carries only the sub-administrator's own permissions and user groups.

::: tip
If you need the master key and cannot read `.oempro_env`, ask the person who runs the server. The interface no longer displays it.
:::
