# The Default Opt-in Email

**Default opt-in email** sets the confirmation email that double opt-in subscribers receive when their list has no confirmation email of its own. It applies to every account on the install. It replaces the classic admin **Default Opt-in Email** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Default opt-in email | `/user/staff/settings/optin-email` | Settings |

Open it from the staff sidebar: click **Settings**, then **Default opt-in email**. The classic admin **Settings > Default Opt-in Email** link, and the old `/app/admin/defaultoptinemail/` address, open the same screen.

## When this email is sent

When someone subscribes to a double opt-in list, Octeth sends them a confirmation email. A list that has its own confirmation email always sends that one. A list without one sends this default email.

- It is sent as plain text.
- It is sent from the name and email address of the account that owns the list.
- The header and footer of that account's user group are added to it.

There is no preview or test send on this screen. To see the email, subscribe an address you can read to a double opt-in list that has no confirmation email of its own.

## Edit the email

1. Change the **Subject**.
2. Change the **Email text**. It must include `%Link:Confirm%`, the link that confirms the subscription.
3. Click **Save**.

The screen refuses a text without `%Link:Confirm%` and says so under the field. Write the tag exactly as shown, with the same capital letters, because that is the only spelling Octeth replaces with the link. Without it, subscribers could never confirm and would never join the list.

## Insert a merge tag

Click **Insert merge tag** beside the **Subject** or the **Email text**, then click a tag. It goes in where the cursor was. The menu offers the tags this email replaces:

| Tag | Becomes |
|---|---|
| `%Link:Confirm%` | The link that confirms the subscription |
| `%Link:Reject%` | The link that cancels the subscription request |
| `%Subscriber:EmailAddress%` | The subscriber's email address |
| `%Subscriber:SubscriberID%` | The subscriber's ID |
| `%Subscriber:HashedSubscriberID%` | A hash of the subscriber's ID |
| `%Date=Y-m-d%` | The date the email is sent, in the PHP date format after the `=` |

## Restore the default text

Click **Restore the default text** to fill the form with the subject and text a new install starts with. Nothing is saved until you click **Save**, so you can still leave the page to keep the current email.

## Who can use it

The screen needs the **Settings** permission. The classic page opened for the **Settings.General** permission but could not save with it, so a sub-administrator who holds only **Settings.General** does not see the screen. Every save is recorded in the staff audit log, which names the two settings that were saved, not their text.
