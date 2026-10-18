# Your Staff Profile

**Your profile** is where an administrator changes their own name, email address, username and password, turns their own two-factor authentication on or off with the Security permission, and, with the Settings permission, sets the sender of the emails the install sends on its own. It replaces the classic admin **Account** page and the two-factor part of the classic **Security** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Your profile | `/user/staff/profile` | Account |
| Your profile, Two-factor authentication section | `/user/staff/profile?section=two-factor` | Account and Security |
| Your profile, System emails section | `/user/staff/profile?section=system-emails` | Account and Settings |

Open it from the user menu: click your name at the bottom of the left menu, then **Your profile**. The classic admin **Settings > Account** link opens the same screen.

::: info
The screen acts as the administrator who is signed in, and every save is recorded in the staff audit log with the names of the fields that changed. The values themselves are not recorded.
:::

The screen has up to five sections in a menu on the left. Each section has its own button and saves only its own fields.

## Profile

Change your **Name**, **Email address** or **Username**, then click **Save profile**.

::: warning
You sign in with your username. Saving a new username signs you out of the staff area, and you sign in again with the new username. A name or email address change keeps you signed in.
:::

## Password

1. Enter your **Current password**. The eye icon at the right of the field shows what you typed.
2. Enter a **New password**, or click **Generate** to fill in a random one. Click the eye icon at the right of the field to see the password, and copy a generated password before you save.
3. Click **Change password**.

Saving signs you out of the staff area. Sign in again with the new password. When the current password is wrong, the field says so and nothing is changed.

## Two-factor authentication

Shown only to administrators with the Security permission. With two-factor authentication on, signing in to the admin area asks for a code from an authenticator app on your phone as well as your password. It applies to the new interface and to the classic admin area.

### Turn it on

1. Click **Set up two-factor authentication**.
2. Scan the QR code with an authenticator app such as 1Password, Authy or Google Authenticator. To enter the key by hand instead, copy the setup key under the QR code.
3. Copy the **recovery key** and keep it somewhere safe. It is shown only now.
4. Enter the six-digit code the app shows and click **Turn on**.

When the code is not accepted, check that the time on your phone is right and enter the newest code. **Cancel** leaves two-factor authentication off.

Turning it on revokes your remembered sign-ins of the classic admin area.

### Turn it off

Enter your **Current password** and click **Turn off two-factor authentication**. When the password is wrong, the field says so and two-factor authentication stays on.

::: tip
Lost your phone? Open the two-factor reset page of the classic admin area (`/app/admin/reset2fa/`, also linked from the sign-in code prompt) and enter your recovery key. It turns two-factor authentication off, and you can set it up again here.
:::

## System emails

Shown only to administrators with the Settings permission. These settings apply to the whole install:

- **Sender name** and **Sender email address**: the sender of the emails the install sends on its own, such as notifications and automated reports. The same name and address are used as the reply-to.
- **Alert recipient**: the address that receives system alerts.

Click **Save system emails**. Other settings are not changed.

## API access

What this section shows depends on your administrator account.

- **The main administrator** (the first administrator account of the install, which the master Admin API Key signs in as) sees the master Admin API Key, masked. Click **Reveal** to show it and **Copy** to copy it, then **Hide** to mask it again. Each reveal is recorded in the staff audit log. The key itself is not. The key is the `ADMIN_API_KEY` value in the install's `.oempro_env` file, so it is changed there, on the server.
- **Other administrators without permission limits** see no key. The master Admin API Key is the `ADMIN_API_KEY` value in the install's `.oempro_env` file, which only the server operator can read.
- **Sub-administrators with permission limits** see whether an API key of their own is issued. That key is issued, rotated and revoked under **Sub Admin Accounts** in the classic admin area, it is shown only once, when it is issued, and it carries only the sub-administrator's own permissions and user groups.

::: tip
The master key acts as the main administrator with every permission. Keep it out of shared documents and chat. If you are not the main administrator and need it, ask the person who runs the server, or issue a key of your own under **Sub Admin Accounts**.
:::
