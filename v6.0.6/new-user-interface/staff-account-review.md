# Reviewing New Accounts

A new account that is not yet **Trusted** cannot send until a staff member approves it. **Account review** gives that account a page that shows what is paused and lets it answer your review questions, and gives you its answers on the customer page, where you approve it.

| Screen | Path on a default install | Permission |
|---|---|---|
| Account review settings | `/user/staff/settings/account-review` | Settings |
| Account review tab | `/user/staff/customers/<user ID>?tab=review` | User.Edit (approving needs User.Update) |
| The customer's review page | `/user/account/review` | Any signed-in customer with a sending hold |

## What holds an account

An account has a sending hold while either of these is true:

- Its reputation is not **Trusted**. Campaigns wait for approval, journey emails wait, and the email gateway API and SMTP relay refuse its sends.
- `PHONE_VERIFICATION_REQUIRED_TO_SEND_EG_EMAILS` is `true` in `.oempro_env` and the account has no verified phone number. The email gateway refuses its sends.

While a hold applies, every page of the account shows a banner with a button to its review page. The banner goes away, and the review page sends the customer to the dashboard, once no hold applies.

Answering the questions never changes the account's reputation. Only a staff member approves an account.

## What the customer sees

The review page has four parts:

- **What is paused**, and what works now (drafts, lists, imports, sender domains).
- **Review status**: "Not submitted", or "In review since" the date of the first submission.
- **Checklist**, which ticks itself: the phone number is verified (only when phone verification is required), the account has a sender domain it can send from, and the review questions are answered.
- **Review questions**, when at least one question is on.

The customer can change the answers until the account is approved. The account owner and team members with the Admin role answer the questions. Other team members see the page without the form.

## Set up the questions

Open **Settings**, then **Account review**.

1. For each question, choose **Off**, **Optional** or **Required**.
2. Enter the **Review team name**, for example `Compliance team`. The banner then reads "Your account is in manual review by the Compliance team." Leave it empty and the banner names no team.
3. Enter the **Review time** sentence, for example `Reviews take one business day.` It appears on the banner, the review page and the support page. Leave it empty to promise no time.
4. If you turn on the acceptable use policy question (C19), enter the **Acceptable use policy URL**. The customer sees a link to it next to the checkbox.
5. Click **Save account review settings**.

Until you save this page, these defaults apply:

| Mode | Questions |
|---|---|
| Required | C1 company name, C2 website, C4 industry, C6 what you will send, C9 how you collected contacts, C12 contacts now, C13 monthly volume |
| Optional | C3 address and country, C7 typical email, C10 signup form URL, C14 frequency, C15 previous platform, C18 API or SMTP relay use, C20 anything else |
| Off | C5 role, C8 sample email URL, C11 double opt-in, C16 past suspensions, C17 bounce and complaint rates, C19 acceptable use policy |

Turn every question off to hide the questionnaire. The review page then shows the holds, the checklist and the support link only.

A question that is off is not shown to the customer, and an answer to it is not kept when the customer saves again. Making a question required after a customer has submitted does not reset their review: their page asks them to answer the new question.

## When you are notified

The first time an account submits its answers, Octeth emails the alert address (`ALERT_RECIPIENT_EMAIL`, set under **Email delivery**) with the answers and a link to the account. The email goes through the install's system email settings. Later changes send another email at most once a day.

## Review and approve an account

1. Open the account from **Accounts > Users**.
2. Click the **Account review** tab. It shows the status, the submission time, the checklist and every answer the account gave, including answers to questions you have turned off since.
3. Click **Approve account**, then confirm. The account becomes **Trusted** and can send.

To ask the customer for more information, or to decline an account, reply to them by email and disable the account if needed. The review page has no "needs information" or "declined" state.
