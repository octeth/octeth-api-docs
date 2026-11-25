# Reviewing New Accounts

A new account that is not yet **Trusted** cannot send until a staff member approves it. **Account review** gives that account a page that shows what is paused and lets it answer your review questions, and gives you its answers on the customer page, where you approve it.

| Screen | Path on a default install | Permission |
|---|---|---|
| Account reviews | `/user/staff/reviews` | User.Edit (deciding needs User.Update) |
| Account review settings | `/user/staff/settings/account-review` | Settings |
| Account review tab | `/user/staff/customers/<user ID>?tab=review` | User.Edit (approving needs User.Update) |
| The customer's review page | `/user/account/review` | Any signed-in customer with a sending hold |

## What holds an account

An account has a sending hold while either of these is true:

- Its reputation is not **Trusted**. Campaigns wait for approval, journey emails and SMS wait, auto responders wait, SMS campaigns stop and the SMS API, the email gateway API and the SMTP relay refuse its sends.
- `PHONE_VERIFICATION_REQUIRED_TO_SEND_EG_EMAILS` is `true` in `.oempro_env` and the account has no verified phone number. The email gateway refuses its sends.

While a hold applies, every page of the account shows a banner with a button to its review page. The banner goes away, and the review page sends the customer to the dashboard, once no hold applies.

`PHONE_VERIFICATION_REQUIRED_TO_SEND_EG_EMAILS` is deprecated as a way to approve accounts. Use account review.

Answering the questions never changes the account's reputation. Only a staff member approves an account.

## Choose which accounts start in review

A new account starts **Untrusted** or **Trusted** by the first of these that is set:

1. The reputation the caller gives, for example the staff **Create user** page.
2. The user group's **New accounts** setting, on the **General** tab of the group: **Wait for review**, **Start approved** or **Follow the install setting**.
3. **New account reputation** under **Settings > Sign-up**.

Existing accounts are never changed by these settings.

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

Octeth also tells you when an account that waits for review does one of these, once per account for each:

| What happened | Email | Slack | Webhook |
|---|---|---|---|
| It signed up | Yes | Yes | `account_review.pending` |
| It changed its plan | Yes | Yes | `account_review.plan_changed` |
| It verified its first sender domain | Yes | Yes | `account_review.domain_verified` |
| It tried to send for the first time | Yes, for the email gateway | Yes | `account_review.blocked_send` |

Slack needs `ACCOUNT_REVIEW_SLACK_WEBHOOK_URL` in `.oempro_env`. Webhooks are set on the [Webhooks](./webhooks) page. The emails and Slack messages go out within about 5 minutes. The email about a blocked email gateway send can repeat once a day.

## The review queue

**Accounts > Account reviews** lists every account that waits for review, oldest first.

- **To review** holds every account that you have not declined. **Answers submitted** holds the ones that answered your questions. **Declined** holds the ones you declined.
- Filter by text (name, company, email, website or signup IP), user group, country and account age.
- Each row shows the signup IP and country, the plan and its payment status, the sender domains and their age, what the account says it sends, and the signals: signup screening, a refused send, a failed payment, the email domain and a different last sign-in address. The country next to the IP shows only when the server has the PHP geoip extension.
- **Approve** sets the account to **Trusted**. A note is optional.
- **Decline** needs a note. It changes nothing for the customer: the account still cannot send, and the customer still sees that it is in review. It leaves the **To review** list until the customer changes their answers.
- Select several accounts to approve or decline them together with one note.

## Review one account

1. Open the account from the queue, or from **Accounts > Users**, and click the **Account review** tab.
2. Read the status, the **Signals** and every answer the account gave, including answers to questions you have turned off since.
3. Click **Approve account** or **Decline**.

On an approved account, **Send back to review** sets it to **Untrusted** and needs a note. It stops sending at once on every channel, queued email gateway messages included.

**Decision history** lists every decision with the staff member, the time, the note and what could be seen at that moment. A reputation change on the staff edit page is listed too, and so is an account approved through the API, as "Outside the staff area". Customers never see it. Deleting the account deletes its history.

## The signup email

A new account that waits for review gets one email, after its email address is confirmed. Existing accounts get nothing.

To change it, open **Settings > Account review** and use the **Signup email** card. The **Message** accepts `{first_name}`, `{brand}` and `{review_url}` (a link to the review page), and the **Subject** accepts `{brand}`. Turn it off to send nothing. The email goes through the install's system email settings. A refused email is tried again every 10 minutes for 7 days.

## The approval email

When an account that submitted its review answers becomes **Trusted**, Octeth emails the customer within a minute or two. The email goes through the install's system email settings and template.

An account that never submitted the review questions gets no email, so promoting existing accounts in bulk emails no one. Moving an account back to **Untrusted** sends nothing. Each account gets the approval email once.

To change it, open **Settings > Account review** and use the **Approval email** card:

1. Turn **Email the customer when their account is approved** off to send nothing, or leave it on.
2. Change the **Subject**. It accepts `{brand}`, your brand name.
3. Change the **Message**. It accepts `{first_name}` (the customer's first name), `{brand}` and `{dashboard_url}` (a link to their dashboard). It is sent as plain text with line breaks kept.
4. Click **Save account review settings**.

The default subject is "Your account is approved", and the default message says the account was reviewed, sending is enabled, and links to the dashboard.

If the system email settings are wrong, the email is retried every minute for 24 hours and then dropped.

To ask the customer for more information, email them from their staff page. The review page has no "needs information" or "declined" state, so declining an account does not tell the customer. Disable the account when you are sure it is abusive.
