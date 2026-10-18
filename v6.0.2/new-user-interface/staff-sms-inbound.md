# The Staff Inbound SMS Screen

The **Inbound** screen of the staff **SMS** group lists every reply and opt-out received on the install's SMS gateways, newest first. Use it to read what recipients answered, to find opt-outs whose unsubscribe failed, and to see the replies that could not be matched to any account. It replaces the classic admin **Reports > Inbound SMS** page. The screen is read-only.

| Screen | Path on a default install | Permission |
|---|---|---|
| Inbound SMS | `/user/staff/sms/inbound` | SMS and Settings |

Open it from the staff sidebar: click **SMS**, then **Inbound**. The classic admin **Reports > Inbound SMS** menu item and the old `/app/admin/smsinbound/` addresses open the same screen, with their filters applied.

## Who sees which messages

An administrator without a user group limit sees every message, including unattributed replies.

An administrator limited to some user groups sees only the messages attributed to accounts in those groups. An unattributed reply belongs to no account, so it is not shown to them, and a note above the list says so.

## Why a reply is unattributed

Octeth matches a reply to the message it answers, and through it to the account and the campaign. When nothing matches, the reply is **unattributed**. On a gateway shared between accounts it could belong to any of them, so Octeth shows it here and to no account.

## Filtering the list

Use the toolbar above the list. Each filter applies as you type or choose:

- **From number** matches the start of the sending number. Type digits only: `1555` finds `15551234567`.
- **Any status** limits the list to **Pending**, **Processed**, **Unattributed** or **Failed**.
- **All messages** limits the list to **Opt-outs**, **Not opt-outs**, or **Unsubscribe failed**.
- **Any gateway** shows the messages one gateway received.
- The date button limits the list by the date a message was received, in UTC: **All time** (the default), the last 7, 30 or 90 days, the last 12 months, or a custom range. A custom range may set only **From** or only **To**.

**Clear filters** removes every filter. The list shows 50 messages per page. The filters and the page are part of the address, so you can bookmark or share a filtered view, for example `/user/staff/sms/inbound?optout=failed`.

**SMS campaigns** at the right of the toolbar opens the SMS campaigns across every account, see [The Staff SMS Campaigns Screen](./staff-sms-campaigns).

## Reading a row

| Column | What it shows |
|---|---|
| **Received (UTC)** | The date and, under it, the time the gateway received the message. |
| **Gateway** | The gateway that received it, or its ID when the gateway was deleted. |
| **From / To** | The sending number, and under it the number it was sent to. |
| **Message** | The message text, up to two lines. Click it to show the whole message, and again to fold it. |
| **Status** | **Processed**, **Pending** (not processed yet), **Unattributed** (no account matched) or **Failed**, with the reason under it. |
| **Account** | The account the reply belongs to, with its email address. A long name or address is shortened, and the full text shows when you point at it. Click the name to open the account. **Unattributed** when no account matched. |
| **Campaign** | The SMS campaign the reply answers, with its ID. **None** when no campaign matched. |
| **Opt-out** | **Opt-out** when the message unsubscribed the contact, with **Whole gateway** under it when it opted the number out of every account on the gateway, and the result of the unsubscribe that followed: **Unsubscribe done**, **Unsubscribe pending** or **Unsubscribe failed**. **No** for other messages. |

The table fits a desktop window. In a narrower window, scroll it sideways inside its card.

## Opt-outs whose unsubscribe failed

An opt-out always suppresses the number, so the contact receives no more SMS. When the unsubscribe that follows fails, the contact is still counted as subscribed on its list. Choose **Unsubscribe failed** to list these messages, then check the account's list.

## Related

- [The Staff SMS Campaigns Screen](./staff-sms-campaigns)
- [SMS Campaigns](./sms-campaigns)
- [Browse Inbound SMS (Admin)](/v6.0.2/api-reference/sms-reporting#browse-inbound-sms-admin), the API command behind the screen
