---
layout: doc
---

# Client API (removed)

The client sub-account feature and its thirteen `Client.*` API commands were removed in v5.9.1 (issue #1875). There is no replacement: the feature was discontinued, not renamed.

The following commands are no longer registered. Calling any of them returns the invalid-command envelope shown below, with HTTP status `400`:

`Client.Create`, `Client.Update`, `Clients.Get`, `Clients.Delete`, `Client.Login`, `Client.PasswordRemind`, `Client.PasswordReset`, `Client.AssignCampaigns`, `Client.AssignSubscriberLists`, `Client.Lists.Get`, `Client.List.Get`, `Client.Campaigns.Get`, `Client.Campaign.Get`

```json
{
  "Success": false,
  "ErrorCode": 100003,
  "ErrorText": "Invalid API command: \"clients.get\" not found. Please check your command name or use versioned endpoints: /api/v1/ or /api/legacy/.",
  "Errors": [
    {
      "Code": 100003,
      "Message": "Invalid API command: \"clients.get\" not found. Please check your command name or use versioned endpoints: /api/v1/ or /api/legacy/."
    }
  ]
}
```

If an integration still calls these commands, remove the calls. Data that used to be scoped to a client (assigned lists and campaigns) belongs to the owning user account and is reachable through the user-scoped commands in [Lists](./lists.md) and [Campaigns](./campaigns.md).

This page is kept so that old links resolve. It will be dropped from the sidebar in a later version.
