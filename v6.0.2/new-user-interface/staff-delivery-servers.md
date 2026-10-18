# Managing Delivery Servers in the Staff Area

A **delivery server** is an SMTP relay or MTA that Octeth sends email through. Each user group chooses a server for its marketing, transactional and autoresponder email, and a user, a global segment or a recipient domain route can name one too. The **Delivery servers** screens of the staff **Settings** group replace the classic admin **Settings > Delivery Servers** pages.

| Screen | Path on a default install | Permission |
|---|---|---|
| Delivery servers | `/user/staff/settings/delivery-servers` | DeliveryServers |
| Create delivery server | `/user/staff/settings/delivery-servers/new` | DeliveryServers |
| Edit delivery server | `/user/staff/settings/delivery-servers/<id>/edit` | DeliveryServers |

Open it from the staff sidebar: click **Settings**, then **Delivery servers**. The classic admin **Settings > Delivery Servers** link, and the old `/app/admin/deliveryservers/` addresses, open the same screens. The delivery server reports stay in the classic admin at `/app/admin/deliveryservers/report`.

## The list

The list shows every delivery server by name:

- **Name**, with the server's ID, host and port under it.
- **MAIL FROM domain**: the return path domain of the email it sends.
- **Used by**: the user groups that send through it, with their channels. Click a group to open it, when you have the User groups permission.
- **Verification**: **Passed**, how many checks failed, or **Not tested**, with the time of the last test.

Click a row to open the server. The row actions edit, clone and delete it.

### Clone a server

Click the **Clone** icon of a row. Octeth copies the server, its stored password included, names the copy after the original with "(Copy)" at the end, and opens it. User group assignments, delivery routes and email headers are not copied, and the copy has not been tested.

### Delete servers

Click the **Delete** icon of a row, or tick several rows and click **Delete**. Before anything is deleted, the confirmation lists everything that still sends through each server:

- **User groups**, with the channels they use the server for.
- **Users with their own delivery server.**
- **Global segments** whose sending settings name the server.
- **Recipient domain routes** that send to an MX host through it.
- **IP pools** and **IP addresses**, when the IP pool plug-in is installed.

User groups and users link to their staff pages when you have the permissions to open them. When your account is limited to some user groups, groups and users outside them are not named: the confirmation says how many more use the server.

Deleting switches the user groups to the system default server. Users, global segments, routes and IP pools keep pointing at the deleted server, and their email falls back to the system default without a warning, so change them first if that is not what you want. You can still confirm with **Delete anyway**. Email headers scoped to the server are deleted too. A delete cannot be undone.

If Octeth cannot read what uses a server, the confirmation says so. Treat the server as in use.

## Create a server

Click **Create delivery server** and fill in two cards.

**Connection:**

- **Name**: how staff recognise the server.
- **SMTP host**: the host name or IP address of the relay or MTA.
- **Port**: 587 for STARTTLS, 465 for SSL, or 25. Any port from 1 to 65535 is accepted.
- **Encryption**: **None**, **SSL** or **TLS (STARTTLS)**.
- **Timeout in seconds**: how long Octeth waits for the server to answer, 1 to 300. The default is 10.
- **Authentication**: turn it on when the server needs a username and password, then enter both.

**Domains:**

- **Link tracking domain** and **Open tracking domain**: the hosts used in tracked links and the open tracking image.
- **MAIL FROM domain**: the return path domain, used for SPF, DKIM and DMARC alignment and for bounce processing. An email address here sets the MAIL FROM address instead and turns bounce processing off, as Amazon SES and some relays require.
- **Enforced From address**: optional. Every email through this server is sent from it.
- **Use the list's sender address as the MAIL FROM address when possible** and **as the From address when possible**.
- **Rotate the sender**, and the **Sender rotation rules** as JSON. The screen checks that the rules are valid JSON; Octeth uses them as entered.

Click **Create delivery server**. Creating does not test the server: it opens on its **Verification** tab, where you send the first test.

## Edit a server

The edit page has three tabs. **Connection** and **Domains** hold the fields above, and **Save changes** on either saves both.

### The password

The password is never shown. When one is stored, the field says **A password is stored**: leave it empty to keep it, or enter a new one to replace it. A password belongs to one host, so when you change the **SMTP host** and leave the field empty, the stored password is cleared on save. Enter the password for the new host to keep sending with authentication.

### Changing a server in use

When you change the host, port, encryption, authentication, username or password of a server that something sends through, Octeth asks first. The confirmation lists the user groups, users, segments and routes it affects and how many users send through it. Their email goes through the new connection from the moment you save, so send a test right after.

Changing only the name, the domains or the sender settings saves without asking.

### Verification

The **Verification** tab shows the result of the last test for each check:

- **Test email delivery**: Octeth sends a test email through the server to your own address.
- **SPF record**, **DKIM record** and **DMARC record** of the MAIL FROM domain.
- **MAIL FROM domain**, **Link tracking domain** and **Open tracking domain**: their CNAME records point to this install.

Click **Send test and check DNS** to run every check again. A failed check shows the reason. Saving never tests the server, so test again after you change its connection or its domains. Octeth allows 10 tests in 5 minutes; after that the screen says how long to wait.

## Audit log

Every create, change, clone, delete and test is recorded in the staff audit log with the fields that changed. Passwords are never recorded.
