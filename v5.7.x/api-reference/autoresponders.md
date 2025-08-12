---
layout: doc
---

# Autoresponders

The Autoresponders API provides comprehensive automation capabilities for creating and managing automated email sequences based on subscriber actions, dates, and custom triggers.

::: warning Note
This section is under development. Documentation will be available soon.
:::

## API Endpoints Covered

This section will document the following autoresponder management endpoints:

- **Autoresponder Management**
  - `Autoresponder.Create` - Create a new autoresponder sequence
  - `Autoresponder.Update` - Update existing autoresponder settings
  - `Autoresponder.Delete` - Remove an autoresponder
  - `Autoresponder.Get` - Retrieve specific autoresponder details

- **Autoresponder Listing**
  - `Autoresponders.Get` - Retrieve all autoresponders
  - `Autoresponders.GetByList` - Get autoresponders for specific lists
  - `Autoresponders.GetStats` - Retrieve autoresponder performance statistics
  - `Autoresponders.GetActive` - List currently active autoresponders

- **Sequence Management**
  - `Autoresponder.AddStep` - Add new step to sequence
  - `Autoresponder.UpdateStep` - Modify existing sequence step
  - `Autoresponder.DeleteStep` - Remove step from sequence
  - `Autoresponder.ReorderSteps` - Change sequence step order

- **Automation Features**
  - Time-based triggers and delays
  - Action-based triggers (subscription, click, open)
  - Date-based automation (birthdays, anniversaries)
  - Conditional logic and branching
  - A/B testing for autoresponder sequences
  - Dynamic content personalization
  - Goal tracking and conversion measurement

## Coming Soon

Full documentation for these endpoints including request parameters, response formats, error codes, and usage examples will be added in future updates.