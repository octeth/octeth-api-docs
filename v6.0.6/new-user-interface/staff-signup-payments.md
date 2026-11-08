# Staff Sign-up and Payments

**Sign-up and payments** decides whether visitors can create their own account and where a new account lands, and sets the currency, tax, payment receipt email and credit purchase gateway of the classic billing. It replaces the classic admin **ESP Settings** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Sign-up and payments | `/user/staff/settings/signup-payments` | Settings |

Open it from the staff sidebar: click **Settings**, then **Sign-up and payments**. The classic admin no longer links to it, but the old `/app/admin/espsettings/` address opens this screen. A form posted to the old address is refused and changes nothing.

The screen has four sections in the menu on the left. Each one has its own **Save** button and saves only its own settings.

## Sign-up

### Self-signup

Turn on **Let visitors create an account** to show the sign-up link on the sign-in page and open the sign-up page. Turned off, only an administrator can create accounts. The new sign-up page and the classic `signup.php` page both follow this switch. A change takes effect on the sign-up page within a minute.

**New account reputation** sets the reputation every new account starts with:

- **Untrusted**: each campaign of a new account waits for an administrator's approval before it sends.
- **Trusted**: a new account sends campaigns without approval.

It applies to accounts created by sign-up, by single sign-on, and through the API when the call names no reputation. Sign-up screening can still hold a suspicious account as Untrusted. Choosing **Trusted** asks you to confirm before it is saved. Accounts that already exist keep their reputation.

### New accounts

These settings show while self-signup is on.

- **User group**: the user group a new account joins. **Let visitors choose a group** shows a list of groups on the classic sign-up page. The new sign-up page has no list and puts the account in the first group you pick under **Groups visitors can choose**.
- **Groups visitors can choose**: shows when the user group is **Let visitors choose a group**. Pick at least one.
- **Language**: the language of the classic sign-up page, and of an account created by single sign-on. Only installed languages are offered.
- **Fields on the classic sign-up page**: the details the classic sign-up page asks for next to the email address, username and password. First name, last name and company name are required on the form when you pick them. The new sign-up page does not use this list.

Listing the user groups needs the **User groups** permission as well. Without it, or when the list cannot be read, the screen offers only the groups already stored, shown as **User group #** and the group's ID, so a save never removes them. A sub-administrator limited to some user groups sees only those groups, and stored groups outside them are kept the same way.

While self-signup is off, the screen hides these settings and leaves them as they are.

## Currency and tax

- **Currency**: shown after every amount of the classic billing, for example `USD` or `EUR`.
- **Tax (%)**: added to every payment period invoice and email credit purchase. Use `0` for no tax. The tax must be a number, 0 or more.

Both are required.

## Receipt email

The payment receipt email is sent to an account at the end of each payment period of the classic billing, when an administrator sends the payment request. The **Subject** and the **Email text** are both required. Line breaks in the text are kept.

Click **Insert merge tag** beside either field, then click a tag. It goes in where the cursor was.

| Tag | Becomes |
|---|---|
| `%User:FirstName%` | The account's first name |
| `%User:LastName%` | The account's last name |
| `%Period:StartDate%` | The start date of the payment period |
| `%Period:FinishDate%` | The end date of the payment period |
| `%Period:TotalAmount%` | The total amount to pay |
| `%Period:ReceiptDetails%` | The usage and charges of the period (email text only) |
| `%Payment:Links%` | Payment links added by a plugin (email text only) |

## Credit purchases

Turn on **Send credit purchases to my payment gateway** to send an account that buys email credits in the classic user area to your own payment page. Turned off, the classic user area offers no way to buy credits.

Enter the **Gateway address**. It must start with `https://` or `http://` and contain no spaces. These placeholders in the address are replaced before the buyer is sent there:

| Placeholder | Becomes |
|---|---|
| `_User:UserID_` | The account ID |
| `_User:FirstName_` | The first name |
| `_User:LastName_` | The last name |
| `_User:EmailAddress_` | The email address |
| `_Credits_` | The number of credits bought |
| `_TotalAmount_` | The total amount, tax included |
| `_PurchaseLogID_` | The ID of the purchase log entry |

For example: `https://pay.example.com/?amount=_TotalAmount_&ref=_PurchaseLogID_`. Octeth does not add the credits itself. After a successful payment, your gateway adds them with the `User.Update` API call.

## Who can use it

The screen needs the **Settings** permission. Every save is recorded in the staff audit log, which names the settings that changed, not their values.
