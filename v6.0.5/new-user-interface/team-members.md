---
layout: doc
---

# Team Members

Team members let several people work in one Octeth account, each with their own email address, password and two-factor authentication. You decide what each person can do by giving them a role, and every sign-in and change is recorded with the person who made it.

Team members are part of your plan. If the Team page says your plan does not include team members, ask your service provider to add seats.

## Who is who

- **The account owner** signs in with the account's own username and password, exactly as before. The owner can do everything, including billing, and manages every team member.
- **A team member** signs in with their own email address and password, and works inside the accounts they were invited to. One person can belong to several accounts and switch between them without signing in again.

## Roles

| Role | What it can do |
|---|---|
| Admin | Everything except billing, including the team, API keys, sender domains, webhooks and account settings |
| Manager | Create, edit, import, export, delete and send for lists, subscribers, campaigns, journeys, autoresponders, templates, segments and SMS |
| Author | Create and edit content: campaign drafts, emails, templates, segments and SMS drafts. Cannot send, schedule, import, export or delete |
| Viewer | Read-only, reports included |

Menus and buttons a role cannot use are hidden. If a member still reaches something their role does not allow, Octeth refuses it and says "Your role does not allow this".

Only the account owner can open Billing and the account's own profile. An Admin can manage Manager, Author and Viewer members, but cannot invite or promote anyone to Admin and cannot change another Admin.

## Invite someone

1. Open **Team**, then **Members** in the left menu.
2. Click **Invite**.
3. Enter the person's email address and choose a role.
4. Click **Send invitation**.

The person gets an email with a link that works once and expires after 7 days. Pending invitations are listed under **Invitations**, where you can send one again (the old link stops working) or withdraw it.

Every member takes a seat, suspended members included, and so does every pending invitation. The Team page shows how many seats are in use.

## Accept an invitation

1. Open the link in the invitation email.
2. If you are new to team members, choose a password of at least 8 characters. If you already sign in as a team member for another account, enter that password instead.
3. Click **Accept and sign in**.

If you are already signed in as a team member with the invited address, the page shows **Accept** and then lets you open the new account. If your sign-in uses two-factor authentication, the page then asks for your password and the code from your authenticator app.

## Sign in as a team member

Sign in on the usual sign-in page with your email address and password.

- If you belong to one account, it opens straight away.
- If you belong to several, choose one from the list.
- If the account requires two-factor authentication (set by the account owner or by your plan) and you have not set it up, Octeth asks you to set it up first: scan the QR code with an authenticator app, save the recovery key, and enter the code.

Forgot your password? Use **Forgot password?** on the sign-in page. We email you a link to choose a new one. If that page says password reset is turned off, click **Reset your team member password** below the notice: your team member password is yours, so you can always reset it.

## Switch between accounts

When you belong to more than one account, the account name appears in the top bar. Click it and choose another account. You do not need to sign in again.

## Your sign-in settings

Open the menu under your name at the bottom left and choose **Your sign-in**. There you can:

- See which account you are working in and your role.
- Get an email with a link to change your password.
- Turn two-factor authentication on or off.

Your password and two-factor authentication belong to you, not to an account, so they work for every account you belong to.

## Change a role, suspend or remove a member

On **Team** > **Members**, open the menu at the end of a member's row.

- **Change role** gives the member a different role. They are signed out of the account and sign in again with the new role.
- **Suspend** signs the member out of this account at once and keeps them out until you choose **Reactivate**. A suspended member keeps their seat.
- **Remove from account** signs them out at once and emails them. Their sign-in keeps working for any other account they belong to.

When you remove a member who created API keys or AI assistant keys, the dialog lists those keys and asks what happens to each one:

- **Revoke** deletes the key.
- **Keep as my key** (account owner only) keeps the key working as the owner's own key. The removed person may still have it, so only keep a key you trust.
- **Leave, refused** keeps the key but every call with it is refused until you delete it under **API & webhooks**.

## Require two-factor authentication

You can make two-factor authentication mandatory for every team member of the account.

1. Open **Team**, then **Members** in the left menu.
2. Under **Security**, turn on **Require two-factor authentication for every team member**.
3. The dialog says how many active members do not use two-factor authentication yet. Click **Require it**.

Members without two-factor authentication are signed out of the account at once. The next time they switch into it, Octeth asks them to set it up first. Members who already use it are not affected, and neither is the account owner's own sign-in.

- The account owner and Admin members can turn the requirement on. Only the account owner can turn it off.
- If your plan already requires two-factor authentication from team members, the switch stays on and cannot be turned off here.
- The change is recorded in the audit log with the person who made it.

## The audit log

Open **Team** > **Audit log** to see sign-ins and every change made in the account, newest first, with who made it: the account owner, a team member, an API key, an AI assistant key or staff. Each entry shows the action, what it changed, whether it succeeded, and the IP address and browser it came from.

Filter by person, by action (for example `list.create`) or by date. Times are in UTC. Entries are kept for the number of days your service provider set, 365 by default. The account owner and Admin members can open the audit log.

## AI assistants and API keys

The account owner and Admin members can create API keys. A key a member creates acts with that member's role, and stops working when the member is removed or suspended.

Only the account owner can connect an AI assistant such as Claude or ChatGPT in this release. A team member who opens a connector link is asked to have the owner connect it.

## Things to know

- Team members sign in to the new user interface only. They cannot sign in to the legacy user area.
- The account's own Active sessions and Login activity tabs list the account owner's sign-ins. Team member sign-ins are in the audit log.
