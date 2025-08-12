---
layout: doc
---

# Split Testing

The Split Testing API enables A/B and multivariate testing functionality for email campaigns, allowing you to optimize email performance through systematic testing of different variations.

::: warning Note
This section is under development. Documentation will be available soon.
:::

## API Endpoints Covered

This section will document the following split testing endpoints:

- **Split Test Management**
  - `SplitTest.Create` - Create a new split test campaign
  - `SplitTest.Update` - Update split test configuration
  - `SplitTest.Delete` - Remove a split test
  - `SplitTest.Get` - Retrieve split test details and results

- **Test Configuration**
  - `SplitTest.AddVariation` - Add new test variation
  - `SplitTest.UpdateVariation` - Modify existing variation
  - `SplitTest.SetTrafficSplit` - Configure traffic distribution
  - `SplitTest.SetWinningCriteria` - Define success metrics

- **Test Execution**
  - `SplitTest.Start` - Begin split test execution
  - `SplitTest.Pause` - Pause ongoing test
  - `SplitTest.Resume` - Resume paused test
  - `SplitTest.Stop` - End test and declare winner

- **Testing Features**
  - A/B testing (two variations)
  - Multivariate testing (multiple variables)
  - Subject line testing
  - Content and design testing
  - Send time optimization
  - Sender name testing
  - Statistical significance calculation
  - Automatic winner selection
  - Custom conversion tracking
  - Test duration and sample size management

## Coming Soon

Full documentation for these endpoints including request parameters, response formats, error codes, and usage examples will be added in future updates.