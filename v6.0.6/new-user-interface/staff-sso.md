# Managing SSO Sources in the Staff Area

An **SSO source** lets another application, such as a customer portal, sign people in to Octeth with an encrypted, signed link. Each source has a code, which the application sends in every link, and two keys, which only the application and Octeth know. The **SSO** screens of the staff **Settings** group replace the classic admin **Settings > Single Sign On** section.

| Screen | Path on a default install | Permission |
|---|---|---|
| SSO | `/user/staff/settings/sso` | Settings.SSO |
| Create SSO source | `/user/staff/settings/sso/new` | Settings.SSO |
| Edit SSO source | `/user/staff/settings/sso/<id>/edit` | Settings.SSO |

Open it from the staff sidebar: click **Settings**, then **SSO**. The classic admin **Settings > Single Sign On** link, and the old `/app/admin/sso/` addresses, open the same screens.

How the connected application builds a sign-in link, and what Octeth does with it, is explained in [Single Sign-On (SSO) Integration](/v6.0.6/using-octeth/integrations/sso).

## The list

The list shows every SSO source by name:

- **Name**, with the source's ID under it.
- **Code**: what the application sends in every sign-in link.
- **Expires**: when the source stops accepting links, in server time, or **Never**. A source past its expiry is marked **Expired**.
- **Options**: **Creates users**, **Signs in** and **Returns user data**, for the options that are on.
- **Updated**: when the source was last changed.

Click a row to open the source. To delete sources, tick their rows, click **Delete** and confirm. Links signed with a deleted source's keys stop working at once, its statistics are deleted too, and it cannot be restored.

## Create a source

Click **Create SSO source** and fill in:

- **Name**: how your team recognises the source.
- **Code**: letters, digits, underscores and dashes, unique across sources.
- **Description**: optional.
- **Expires**: optional, in server time (UTC). After this moment the source refuses every link. Leave it empty to never expire.
- **Valid for (seconds)**: how long a link stays valid after the application creates it. The default is 5 seconds. Keep it short.
- **Create the user when no account matches**: on by default. A link for someone without an Octeth account creates one. When off, the link is refused.
- **Sign the user in**: on by default. Opens the user area signed in as that user.
- **Return the user data**: off by default. Answers the link with the user's account data as JSON instead of opening a page.

Click **Create SSO source**. The source's page opens on **Credentials** with its two keys shown in full. Copy them into the application now: they are hidden as soon as you leave the page or change anything on it.

## Details

The **Details** tab holds the same fields as the create form. Click **Save changes** to save them.

Changing the **Code** asks for a confirmation first. The application sends the code in every link, so its links are refused from the moment you save until it uses the new code.

## Credentials

The **Credentials** tab shows the two keys, masked:

- **Key 1** encrypts the data of a link.
- **Key 2** signs it, so Octeth can tell it was not changed on the way.

Click **Reveal** to show both keys, and **Copy** to copy one. They stay in the page only until you leave it or click anything else on it, and every reveal is recorded in the staff audit log.

Click **Rotate keys** to replace both keys, for example after a key leaked. A confirmation explains that the application stops working until it gets the new keys. After you confirm, the new keys are shown once. The rotation is recorded in the staff audit log.

**Sign-in link example** is a PHP script that builds a sign-in link for this source. It shows placeholders for the keys until you reveal them.

## Statistics

The **Statistics** tab draws four counters per day:

| Counter | Counts |
|---|---|
| **Accepted links** | Links whose data was decrypted, verified and on time |
| **Refused links** | Links that were refused: a wrong key, a missing field, a link past its valid-for time, an unknown user with user creation off, or a failed sign-up or sign-in |
| **Sign-ins** | Users signed in by a link |
| **Sign-ups** | Accounts created by a link |

The totals of the window are shown above the chart. Choose **7 days**, **30 days** or **90 days** at the top right of the card; the default is 30 days. Choose a counter to draw only that one, or **All**. Days follow server time.

::: tip
A rising number of refused links right after a change on the application side usually means a wrong key, a wrong code or a server clock that is off by more than the valid-for time.
:::

## Coming from the classic Single Sign On section

- The keys are no longer printed on every visit. Reveal them when you need them.
- Keys can now be rotated without deleting the source.
- The classic statistics chart showed sign-ins under the sign-ups label and the other way round. The new chart labels each one correctly.
- A POST to an old `/app/admin/sso/` address is refused and changes nothing.
