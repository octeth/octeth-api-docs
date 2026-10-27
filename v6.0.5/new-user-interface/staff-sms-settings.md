# The Staff SMS Settings Screen

The **Settings** screen of the staff **SMS** group holds the bulk SMS settings of the whole installation: how large a campaign may be, what a message costs, when campaigns send and how fast, the opt-out footer new campaigns start with, and how long SMS records are kept. It replaces the classic admin **Settings > Bulk SMS Settings** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| SMS settings | `/user/staff/sms/settings` | SMS and Settings |

Open it from the staff sidebar: click **SMS**, then **Settings**. The classic admin **Bulk SMS Settings** sidebar item and the old `/app/admin/smssettings/` address open the same screen.

## Where each value comes from

Every setting can come from three places, and the first one that has a value wins:

1. **Set here**: a value saved on this screen.
2. **.oempro_env**: the setting's key in the installation's `.oempro_env` file.
3. **Shipped default**: the value Octeth ships with.

The pill next to each setting's name says which one is in force. Under the field, the help text names the `.oempro_env` key, its value (or that it is not set) and the shipped default. If you edit `.oempro_env` and nothing changes, check the pill: a value saved here wins over the file.

## Sections

The settings are split into sections in the menu on the left:

- **Limits and cost**: campaign size, message cost, currency and drift tolerance.
- **Sending window**: quiet hours, default send rate and the journey capacity reserve.
- **Opt-out and replies**: the default opt-out footer, opt-out keywords and the reply attribution window.
- **Test sends**: how many campaign tests an account may send in a day, and how far apart.
- **Retention**: how long SMS events, campaign queue detail and received messages are kept.

The open section is part of the address, so you can link to one, for example `/user/staff/sms/settings?section=retention`.

## Changing a setting

1. Open the section in the menu on the left.
2. Change the fields you need.
3. Click the section's **Save** button, for example **Save limits and cost**.

Each section saves on its own, and only the fields you changed are saved. Opening another section before saving discards your unsaved changes. A change reaches the sending workers within about a minute.

Numbers take digits only, with a decimal point for the cost and the drift tolerance. The quiet-hours times take a 24-hour time such as `21:00`. A value Octeth cannot use is marked on its field, and nothing is saved until it is fixed.

## Handing a setting back to .oempro_env

A setting with the **Set here** pill has a **Reset** button. Click it, then the section's **Save** button: the saved value is removed and the `.oempro_env` value applies again. Emptying the field does the same.

For an on and off setting, choose **Use the deployment value**. On and Off save a value here.

Saving a value equal to the one already in force stores nothing, so the setting keeps following `.oempro_env`.

## The settings

| Setting | Shipped default | What it does |
|---|---|---|
| **Maximum recipients per campaign** | 1,000,000 | A campaign with a larger audience is refused before it is queued. |
| **Cost per message part** | 0.01 | Used for the cost estimate and the per-campaign cost. One message can be several parts. |
| **Cost currency** | USD | The currency of the cost figures. |
| **Cost drift tolerance** | 0.05 | A fraction from 0 to 1. A campaign is held when its real cost exceeds the estimate by more than this. |
| **Quiet hours start** | 21:00 | In the campaign's timezone. Sending pauses at this time. A campaign can set its own quiet hours instead. |
| **Quiet hours end** | 09:00 | Sending resumes at this time. |
| **Default send rate per minute** | 0 | The speed new campaigns start with, which the sender can change on the campaign. 0 means no cap other than the gateway's own rate limit. |
| **Journey capacity reserve (%)** | 10 | The share of gateway capacity kept for journey and transactional messages, at most 50. |
| **Append an opt-out footer by default** | On | Whether new campaigns start with the opt-out footer. |
| **Default opt-out footer** | ` Reply STOP to opt out.` | Leading and trailing spaces are kept. The shipped text starts with a space so it separates from the message. |
| **Opt-out keywords** | STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT | Comma separated. A reply with one of these words opts the sender out. |
| **Reply attribution window (days)** | 30 | How long after a send a reply is still credited to that campaign. |
| **Event retention (days)** | 365 | How long SMS events are kept for reports. 0 turns pruning off. |
| **Campaign queue retention (days)** | 365 | How long per-recipient campaign detail is kept. 0 turns pruning off. |
| **Inbound message retention (days)** | 365 | How long received messages and reply history are kept. 0 turns pruning off. |
| **Test sends per account per 24 hours** <Badge type="tip" text="New in v6.0.4" /> | 10 | How many campaign tests one account may send in any 24 hours, at most 1000. 0 turns test sends off. |
| **Seconds between test sends** <Badge type="tip" text="New in v6.0.4" /> | 30 | The wait after one test before the next, at most 3600. |

Octeth keeps each value inside a safe range when it uses it, for example a retention below 30 days other than 0 is read as 30.

## Audit and demo mode

Every save writes a row to the staff audit log with the settings changed and their old and new values. In demo mode the screen is read-only.

## Related

- [The Staff SMS Campaigns Screen](./staff-sms-campaigns)
- [SMS Campaigns](./sms-campaigns)
- [Get Bulk SMS Settings (Admin)](/v6.0.5/api-reference/sms-reporting#get-bulk-sms-settings-admin) and [Update Bulk SMS Settings (Admin)](/v6.0.5/api-reference/sms-reporting#update-bulk-sms-settings-admin), the API commands behind the screen
