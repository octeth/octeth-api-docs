# The Staff Email Delivery Screen

The **Email delivery** screen of the staff **Delivery** group holds the sending settings of the whole installation: how email leaves Octeth when a user group has no delivery server of its own, where bounces and complaints go, the headers Octeth adds, the seed list and the other install-wide delivery settings. It replaces the classic admin **Settings > Email Delivery** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Email delivery | `/user/staff/settings/email-delivery` | Settings |

Open it from the staff sidebar: click **Delivery**, then **Email delivery**. The classic admin **Email Delivery** sidebar item and the old `/app/admin/emaildelivery/` address open the same screen.

## Sections

The settings are split into sections in the menu on the left. The open section is part of the address, so you can link to one, for example `/user/staff/settings/email-delivery?section=bounces`.

- **Send method**: the send method and its connection, and the test email.
- **Bounces**: the bounce domain, the soft bounce threshold, forwarding of postmaster mail, failure notifications and the bounce mailbox.
- **Complaints and inboxes**: the abuse report address, `X-Complaints-To`, the feedback loop and unsubscribe-by-email addresses, and the feedback loop mailbox.
- **Headers**: the `X-Mailer` header and the custom headers added to every email.
- **Advanced**: the seed list, reply forwarding, relay domains, the pre-header block, the Sender header domain and subscriber snapshots.

Each section has its own **Save** button and saves only the settings of that section that you changed. If the stored settings changed since you opened the page, for example from another tab, nothing is saved and the screen shows the stored values, so make your change again. When nothing changed, saving says so and sends nothing. If you open another section with unsaved changes, Octeth asks whether to discard them.

::: info
Every save, test email, header added and header removed is recorded in the staff audit log, with the section and the names of the settings involved. Values and passwords are never recorded.
:::

## Passwords are never shown

The SMTP password, the Postmark server API token and the two mailbox passwords are write-only. The screen only says whether one is stored.

- Leave the field blank to keep the stored password.
- A stored password is kept only while the server stays the same. If you change the SMTP host, choose another provider, or change a mailbox host, enter the password for the new server. A password is never sent to a different server.
- On an SMTP server that needs no authentication, a new host clears the stored password.

## Send method

Choose how email leaves Octeth when a user group has no delivery server of its own:

| Method | What you enter |
|---|---|
| **SMTP server** | Host, port, encryption (none, SSL or TLS), timeout, and whether the server needs a username and password. |
| **SendGrid** | Username (`apikey`) and the API key. Octeth connects to `smtp.sendgrid.net`. |
| **Mailgun** | The SMTP login of your Mailgun domain and its password. Octeth connects to `smtp.mailgun.org`. |
| **Amazon SES** | The SMTP endpoint of your region (for example `email-smtp.us-east-1.amazonaws.com`) and your SES SMTP credentials. Octeth connects on port 25 with TLS. |
| **Postmark** | A server API token, which Postmark takes as both username and password. |
| **PowerMTA pickup directory** | The virtual MTA and the pickup directory from your PowerMTA configuration. |
| **Local MTA (sendmail)** | The absolute path of the MTA binary, with no arguments, for example `/usr/sbin/sendmail`. |
| **Save to disk** | A directory where each email is written as a file instead of being sent, for testing. |

**PHP mail()** is shown only on an installation that already uses it. The Octeth containers ship no sendmail, so choose another method.

Click **Save send method**. Saving does not test the connection.

### Test email

**Send test email** sends a test email with the saved settings to the alert recipient of the system settings, the address set on the staff [profile](./staff-profile) screen. Save your changes first: unsaved changes are not tested. If the mail server refuses the email, its answer is shown. Sending a test needs the **Delivery servers** privilege as well.

## Bounces

| Setting | What it does |
|---|---|
| **Bounce domain** | Bounces are sent to this domain. Its mail server needs a catch-all rule. Required. |
| **Soft bounces before a hard bounce** | How many soft bounces turn an address into a hard bounce. Required. |
| **Forward postmaster mail to** | Email to `abuse@`, `postmaster@` and `root@` of your sender domains is forwarded to this address. Leave it empty to turn forwarding off. |
| **Failure notifications** | Emails you when a delivery report cannot be processed. |

### Bounce mailbox

Turn on **Mailbox** to have Octeth read delivery reports from an IMAP mailbox, then enter its host, port, username, password and whether it needs SSL. When you save a change to the mailbox while it is on, Octeth signs in to it first, and nothing is saved when that fails: the mail server's answer is shown on the **IMAP host** field.

See [Bounce Processing](/v6.0.4/using-octeth/email-deliverability/bounce-processing).

## Complaints and inboxes

| Setting | What it does |
|---|---|
| **Abuse report address** | Abuse reports are sent to this address. Required. |
| **X-Complaints-To** | Sent to recipients in the `X-Complaints-To` header, so use a monitored mailbox. `complaints@%sender_domain%` follows each sending domain. Required. |
| **Feedback loop address** | The address you enrolled in mailbox providers' feedback loop programs. |
| **Unsubscribe by email address** | Adds a `mailto:` fallback to the `List-Unsubscribe` header. It must reach the bounce mailbox, which processes these requests. Leave it empty for no fallback. |

The **Feedback loop mailbox** works like the bounce mailbox, for spam complaints. See [Complaint Processing](/v6.0.4/using-octeth/email-deliverability/complaint-processing).

## Headers

**X-Mailer** is the sender identifier in the `X-Mailer` header of every outgoing email. A user group can override it, and clearing both leaves the header out of campaign email.

**Custom headers** are added to every email Octeth hands to your MTA, so it can categorise and prioritise them. Click **Add header**, then enter:

- **Header name**: letters, digits and `-`, no spaces or colons, for example `X-List-ID`.
- **Applies to**: all emails, campaigns, autoresponders or transactional email.
- **Value**: one line. Type <code v-pre>{{</code> to list the merge tags of the chosen email type, then keep typing to filter, and press Enter or click one to insert it. Merge tags that do not apply to an email are removed from the value when it is sent.
- **Delivery server**: every delivery server, or one. Choosing one needs the **Delivery servers** privilege.

To remove a header, click its delete icon and confirm.

## Advanced

| Setting | What it does |
|---|---|
| **Seed list** | Each address gets a copy of every campaign sent. One address on each line. |
| **Reply forwarding** | One `alias:forward-to` pair on each line, for example `*@sender2.com:target2@email.com`. Replies to a matching address are forwarded. |
| **Relay domains** | The domains the built-in SMTP server relays for. One domain on each line. |
| **Pre-header block** | The HTML that carries an email's pre-header text. `_PreHeaderText_` is replaced with the text. **Use the default** fills in the standard block. |
| **Sender header domain** | When set, every email carries a `Sender` header at this domain unless its delivery server enforces a MAIL FROM domain. Leave it empty for no `Sender` header. |
| **Subscriber snapshot** | Keeps a copy of each recipient's data at send time, to personalise the web version later. It slows down queue generation for large lists. |

## What moved and what did not

- The on-demand SSL domain check address the classic page showed is not on this screen. The bundled reverse proxy reads it from `CADDY_DOMAIN_VERIFY_CODE` in `.oempro_env`.
- Delivery servers, which take precedence over the send method for the user groups they are assigned to, are on [Managing Delivery Servers in the Staff Area](./staff-delivery-servers).
