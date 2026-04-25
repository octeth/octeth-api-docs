# Plugin Hook Reference

Complete reference guide for Octeth's plugin hook system. Learn how to extend and customize Octeth's functionality using hooks.

## Table Of Contents

[[toc]]

## Hook System Overview

Octeth's plugin system provides a powerful event-driven architecture that allows developers to extend and customize functionality without modifying core files. Hooks are execution points throughout the codebase where plugins can inject custom logic or modify data.

### Core Concepts

**Plugins** are self-contained modules stored in the `/plugins` directory. Each plugin:
- Extends the `Plugins` base class
- Registers hooks during the `load_*` function
- Implements callback functions for registered hooks
- Can be enabled/disabled through the admin interface

**Hooks** are named trigger points in the application that:
- Execute at specific points in the application flow
- Pass contextual data to registered callbacks
- Support multiple plugins responding to the same hook
- Execute callbacks based on priority (lower numbers execute first)

### Understanding Hook Types

Octeth supports four types of hooks:

#### 1. Action Hooks <Badge type="info" text="Action" />

Action hooks allow you to execute custom code at specific points without modifying data.

**Characteristics:**
- Execute custom functionality alongside core operations
- Do not modify parameters passed to them
- Return an array of results from all registered callbacks
- Ideal for: logging, notifications, integrations, side effects

**Execution Flow:**
```php
// Core code triggers the hook
$results = Plugins::HookListener('Action', 'User.Create', array($userID, $userData));
// $results contains array of return values from all registered plugins
```

#### 2. Filter Hooks <Badge type="tip" text="Filter" />

Filter hooks allow you to modify data before it's used or saved.

**Characteristics:**
- Receive data, modify it, and return the modified version
- Must return all parameters (modified or not)
- Chain multiple filters together in priority order
- Ideal for: content transformation, validation, data enrichment

**Execution Flow:**
```php
// Core code passes data through filter
list($subject, $htmlContent, $plainContent, $subscriber) = Plugins::HookListener(
    'Filter',
    'Email.Send.Before',
    array($subject, $htmlContent, $plainContent, $subscriber)
);
// Variables now contain filtered/modified values
```

#### 3. Menu Hooks <Badge type="info" text="Menu" />

Special action hooks for adding custom menu items to the Octeth interface.

**Characteristics:**
- Automatically triggers on `System.Menu.Add` action
- Receives menu context and current user information
- Returns menu items array to be merged with core menus

#### 4. API Hooks <Badge type="warning" text="API" />

Extend the Octeth API with custom endpoints.

**Characteristics:**
- Register custom API commands
- Specify authentication requirements (admin, user, or both)
- Handle API requests through plugin methods

### Hook Registration

Hooks are registered during plugin initialization in the `load_*` function:

```php
public static function load_myplugin()
{
    // Register lifecycle hooks
    parent::RegisterEnableHook('myplugin');
    parent::RegisterDisableHook('myplugin');

    // Register action hook
    parent::RegisterHook('Action', 'Campaign.Create.Post', 'myplugin', 'onCampaignCreate', 10, 1);

    // Register filter hook
    parent::RegisterHook('Filter', 'Email.Send.Before', 'myplugin', 'modifyEmail', 10, 4);

    // Register menu hook
    parent::RegisterMenuHook('myplugin', 'add_menu_items');

    // Register API hook
    parent::RegisterAPIHook('custom.command', 'myplugin', array('admin', 'user'));
}
```

### Hook Priority System

Priority determines the order in which hooks execute when multiple plugins register for the same hook.

- **Default priority:** 10
- **Lower numbers execute first:** 1, 5, 10, 15, 20
- **Same priority:** Execution order is undefined

**Example:**
```php
// Plugin A - executes first
parent::RegisterHook('Filter', 'Email.Send.Before', 'pluginA', 'callback', 5, 4);

// Plugin B - executes second
parent::RegisterHook('Filter', 'Email.Send.Before', 'pluginB', 'callback', 10, 4);

// Plugin C - executes third
parent::RegisterHook('Filter', 'Email.Send.Before', 'pluginC', 'callback', 15, 4);
```

### Hook Parameters

The `AcceptedArguments` parameter specifies how many arguments the callback function expects:

```php
// Register hook accepting 4 arguments
parent::RegisterHook('Filter', 'Email.Send.Before', 'myplugin', 'modifyEmail', 10, 4);

// Callback function must accept 4 parameters
public static function modifyEmail($subject, $htmlContent, $plainContent, $subscriber)
{
    // Modify email content
    $htmlContent = str_replace('{{custom}}', 'value', $htmlContent);

    // MUST return all parameters for Filter hooks
    return array($subject, $htmlContent, $plainContent, $subscriber);
}
```

**Important:** Filter hooks MUST return all parameters, even if unmodified.

## Creating Your First Plugin

### Basic Plugin Structure

```php
<?php
/**
 * My Custom Plugin
 * Name: My Custom Plugin
 * Description: Adds custom functionality to Octeth
 * Minimum Oempro Version: 5.0.0
 */

class myplugin extends Plugins
{
    public static $PluginCode = 'myplugin';

    /**
     * Plugin initialization - called when plugin loads
     */
    public static function load_myplugin()
    {
        // Register enable/disable hooks
        parent::RegisterEnableHook(self::$PluginCode);
        parent::RegisterDisableHook(self::$PluginCode);

        // Register custom hooks
        parent::RegisterHook('Action', 'Campaign.Create.Post', self::$PluginCode, 'onCampaignCreated', 10, 1);
        parent::RegisterHook('Filter', 'Email.Send.Before', self::$PluginCode, 'modifyEmailContent', 10, 4);
    }

    /**
     * Called when plugin is enabled
     */
    public static function enable_myplugin()
    {
        // Create database tables, set options, initialize data
        Database::$Interface->SaveOption('MyPlugin_Enabled', 'true');

        // Create plugin database table example
        $sql = "CREATE TABLE IF NOT EXISTS oempro_myplugin_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            data VARCHAR(255)
        )";
        Database::$Interface->ExecuteQuery($sql);
    }

    /**
     * Called when plugin is disabled
     */
    public static function disable_myplugin()
    {
        // Cleanup: remove options, drop tables if needed
        Database::$Interface->RemoveOption('MyPlugin_Enabled');
    }

    /**
     * Action hook callback - executed after campaign creation
     */
    public static function onCampaignCreated($campaignID)
    {
        // Log campaign creation
        Core::GetLogger()->info('Campaign created', array('campaign_id' => $campaignID));

        // Action hooks can return any value (stored in results array)
        return true;
    }

    /**
     * Filter hook callback - modify email content before sending
     */
    public static function modifyEmailContent($subject, $htmlContent, $plainContent, $subscriber)
    {
        // Add custom footer to HTML emails
        $footer = '<p style="color: #999;">Powered by MyPlugin</p>';
        $htmlContent = str_replace('</body>', $footer . '</body>', $htmlContent);

        // MUST return all parameters
        return array($subject, $htmlContent, $plainContent, $subscriber);
    }
}
```

### Directory Structure

```
plugins/
  myplugin/
    myplugin.php          # Main plugin class
    languages/            # Language files
      en/
        en.inc.php        # English translations
    assets/               # CSS, JS, images
    includes/             # Additional PHP classes
    README.md             # Plugin documentation
```

## Hook Naming Conventions

Octeth hooks follow consistent naming patterns for easy discovery and understanding:

### Pattern: `Entity.Action.Phase`

Most hooks follow this three-part pattern:

- **Entity:** The object or concept being acted upon (User, Campaign, Email, etc.)
- **Action:** The operation being performed (Create, Update, Delete, Send, etc.)
- **Phase:** When the hook fires (Pre, Post, Before, After, etc.)

**Examples:**
- `Campaign.Create.Post` - After a campaign is created
- `User.Update.Post.Successful` - After successful user update
- `Email.Send.Before` - Before email is sent
- `Subscriber.Delete.Post` - After subscriber deletion

### Pattern: `System.*`

System-level hooks for application-wide events:

- `System.Plugin.Enable` - Plugin activation
- `System.Plugin.Disable` - Plugin deactivation
- `System.Menu.Add` - Menu system initialization
- `System.Header.Load.Finished` - After header resources loaded

### Pattern: `UI.*`

User interface hooks for visual customization:

- `UI.User.Edit.Form` - User edit form rendering
- `UI.Campaign.Details` - Campaign details page
- `UI.User.HeaderLogo` - Header logo customization
- `UI.User.BeforeBodyClose` - Before closing body tag

### Pattern: `Worker.*`

Background worker process hooks:

- `Worker.Clicks` - Click tracking worker
- `Worker.Opens` - Open tracking worker
- `Worker.Journeys` - Journey processing worker
- `Worker.Webhooks` - Webhook delivery worker

### Pattern: `Cron.*`

Scheduled task hooks:

- `Cron.General` - General cron tasks
- `Cron.SendEngine` - Send engine cron
- `Cron.Bounce` - Bounce processing
- `Cron.FBL` - Feedback loop processing

## Lifecycle Hooks

Hooks that manage plugin and system lifecycle events.

### `System.Plugin.Enable` <Badge type="info" text="Action" />

Triggered when a plugin is enabled through the admin interface.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | None |
| **Returns** | N/A |
| **Location** | includes/classes/plugin.inc.php:150 |
| **Priority** | 10 (default) |

**Purpose:** Perform initialization tasks when plugin is activated. This is the ideal place to create database tables, set default configuration options, initialize data structures, or perform any one-time setup required by your plugin.

**Registration:**

::: code-group

```php [Plugin Registration]
public static function load_myplugin()
{
    parent::RegisterEnableHook('myplugin');
}

public static function enable_myplugin()
{
    // Create database tables
    $sql = "CREATE TABLE IF NOT EXISTS oempro_myplugin_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100),
        setting_value TEXT
    )";
    Database::$Interface->ExecuteQuery($sql);

    // Set default options
    Database::$Interface->SaveOption('MyPlugin_Version', '1.0.0');
    Database::$Interface->SaveOption('MyPlugin_ApiKey', '');

    // Initialize data
    Core::GetLogger()->info('MyPlugin enabled successfully');
}
```

:::

**Use Cases:**
- Creating plugin-specific database tables
- Setting default configuration values
- Initializing API connections
- Registering custom cron jobs
- Setting up directory structures

**Important Notes:**
- This hook fires ONLY when manually enabling the plugin, not on every page load
- Use `Database::$Interface->SaveOption()` to persist configuration
- Create tables with `IF NOT EXISTS` to avoid errors on re-enabling
- Always log activation for debugging purposes

---

### `System.Plugin.Disable` <Badge type="info" text="Action" />

Triggered when a plugin is disabled through the admin interface.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | None |
| **Returns** | N/A |
| **Location** | includes/classes/plugin.inc.php:163 |
| **Priority** | 10 (default) |

**Purpose:** Perform cleanup tasks when plugin is deactivated. Remove temporary data, clear caches, or disable features. Generally, you should NOT drop database tables here (users may re-enable the plugin), but you can remove options and temporary data.

**Registration:**

::: code-group

```php [Plugin Registration]
public static function load_myplugin()
{
    parent::RegisterDisableHook('myplugin');
}

public static function disable_myplugin()
{
    // Clear cached data
    $redisClient = new Predis\Client('tcp://'.OEMPRO_SERVICE_HOSTNAMES['oempro_redis'].':6379');
    $redisClient->del('myplugin:*');

    // Remove options (optional - consider keeping for re-enable)
    // Database::$Interface->RemoveOption('MyPlugin_ApiKey');

    // Log deactivation
    Core::GetLogger()->info('MyPlugin disabled');

    // NOTE: Generally DON'T drop tables - users may re-enable
    // Only drop tables if you're certain and have warned users
}
```

:::

**Use Cases:**
- Clearing plugin caches
- Removing temporary files
- Closing external connections
- Disabling cron jobs
- Cleaning up transient data

**Important Notes:**
- This hook fires when manually disabling the plugin
- Consider keeping database tables and configuration for re-enabling
- Clear caches and temporary data only
- Always provide clear warnings before destroying user data

---

### `System.Menu.Add` <Badge type="info" text="Action" />

Triggered when the admin menu system is initialized.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$menuContext` (string) - Menu context ('admin', 'user')<br>`$userData` (array) - Current user information |
| **Returns** | N/A |
| **Location** | Multiple menu rendering locations |
| **Priority** | 10 (default) |

**Purpose:** Add custom menu items to the Octeth admin interface. This hook allows plugins to integrate navigation items into the existing menu structure.

**Registration:**

::: code-group

```php [Plugin Registration]
public static function load_myplugin()
{
    parent::RegisterMenuHook('myplugin', 'set_menu_items');
}

public static function set_menu_items($menuContext, $userData)
{
    // Only show in admin menu
    if ($menuContext !== 'admin') {
        return;
    }

    // Check user permissions
    if (!in_array('Plugin.myplugin', $userData['Permissions'])) {
        return;
    }

    // Add menu item
    $menuItem = array(
        'label' => 'My Plugin',
        'icon' => 'fa fa-plugin',
        'url' => APP_URL . 'admin/plugins/myplugin',
        'children' => array(
            array(
                'label' => 'Settings',
                'url' => APP_URL . 'admin/plugins/myplugin/settings'
            ),
            array(
                'label' => 'Reports',
                'url' => APP_URL . 'admin/plugins/myplugin/reports'
            )
        )
    );

    // Add to Tools menu section
    global $ArrayMenu;
    $ArrayMenu['Tools']['children'][] = $menuItem;
}
```

:::

**Use Cases:**
- Adding plugin settings pages to admin menu
- Creating custom navigation sections
- Adding shortcuts to plugin features
- Integrating with existing menu categories

**Important Notes:**
- Modify the global `$ArrayMenu` variable to add menu items
- Always check user permissions before showing menu items
- Use Font Awesome icons for consistent UI
- Menu items are automatically hidden when plugin is disabled

---

## Authentication & User Hooks

Hooks for user authentication, login, and account management.

### `User.Login.Before` <Badge type="info" text="Action" />

Triggered before user login validation.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailAddress` (string) - User's email address |
| **Returns** | N/A |
| **Location** | includes/frontend/controllers/user/controller_index.php |

**Purpose:** Execute custom logic before user login. Useful for logging attempts, implementing rate limiting, or additional security checks.

**Example:**

::: code-group

```php [Plugin Registration]
parent::RegisterHook('Action', 'User.Login.Before', 'security', 'checkLoginAttempts', 10, 1);

public static function checkLoginAttempts($emailAddress)
{
    // Check login attempts from Redis
    $redis = new Predis\Client('tcp://'.OEMPRO_SERVICE_HOSTNAMES['oempro_redis'].':6379');
    $key = 'login:attempts:' . md5($emailAddress);
    $attempts = $redis->get($key) ?: 0;

    if ($attempts >= 5) {
        Core::GetLogger()->warning('Max login attempts reached', array('email' => $emailAddress));
        // Could implement account lockout here
    }

    return true;
}
```

:::

---

### `User.Login.Post` <Badge type="info" text="Action" />

Triggered after successful user login.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$userID` (int) - User ID<br>`$userData` (array) - User information |
| **Returns** | N/A |
| **Location** | includes/frontend/controllers/user/controller_index.php |

**Purpose:** Execute post-login actions like logging, session tracking, or sending notifications.

**Example:**

::: code-group

```php [Plugin Registration]
parent::RegisterHook('Action', 'User.Login.Post', 'security', 'logUserLogin', 10, 2);

public static function logUserLogin($userID, $userData)
{
    // Log successful login
    Core::GetLogger()->info('User logged in', array(
        'user_id' => $userID,
        'email' => $userData['EmailAddress'],
        'ip' => $_SERVER['REMOTE_ADDR']
    ));

    // Update last login timestamp
    Database::$Interface->ExecuteQuery(
        "UPDATE oempro_users SET LastLoginDate = NOW() WHERE UserID = " .
        MySQLWrapper::real_escape_string($userID)
    );

    return true;
}
```

:::

---

### `User.Login.InvalidUser` <Badge type="info" text="Action" />

Triggered when login fails due to invalid user.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailAddress` (string) - Attempted email address |
| **Returns** | N/A |

**Purpose:** Track failed login attempts for security monitoring.

---

### `User.Login.ValidationError` <Badge type="info" text="Action" />

Triggered when login validation fails.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailAddress` (string) - Email address<br>`$errorMessage` (string) - Validation error |
| **Returns** | N/A |

---

### `User.Create` <Badge type="info" text="Action" />

Triggered after new user account creation.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$userID` (int) - New user ID<br>`$userData` (array) - User data |
| **Returns** | N/A |

**Purpose:** Perform actions after user creation like sending welcome emails or initializing user-specific data.

---

### `User.Update.Post` <Badge type="info" text="Action" />

Triggered after user account update.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$userID` (int) - User ID<br>`$userData` (array) - Updated user data |
| **Returns** | N/A |

---

### `User.Update.Post.Successful` <Badge type="info" text="Action" />

Triggered after successful user update operation.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$userID` (int) - User ID |
| **Returns** | N/A |

---

### `User.Delete.Post` <Badge type="info" text="Action" />

Triggered after user deletion.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$userID` (int) - Deleted user ID |
| **Returns** | N/A |

**Purpose:** Cleanup user-related data in plugin tables when a user is deleted.

---

### `User.PasswordReset.Before` <Badge type="info" text="Action" />

Triggered before password reset operation.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$userID` (int) - User ID<br>`$emailAddress` (string) - User email |
| **Returns** | N/A |

---

## Campaign Hooks

Hooks for email campaign creation, management, and sending.

### `Campaign.Create.Post` <Badge type="info" text="Action" />

Triggered after a campaign is created.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - New campaign ID |
| **Returns** | N/A |
| **Location** | includes/frontend/controllers/user/controller_campaigns.php |

**Purpose:** Execute custom logic after campaign creation such as logging, validation, or triggering external workflows.

**Example:**

::: code-group

```php [Plugin Registration]
parent::RegisterHook('Action', 'Campaign.Create.Post', 'monitor', 'onCampaignCreated', 10, 1);

public static function onCampaignCreated($campaignID)
{
    // Get campaign details
    $campaign = Database::$Interface->GetRow('oempro_campaigns', 'CampaignID = ' . (int)$campaignID);

    // Log campaign creation
    Core::GetLogger()->info('Campaign created', array(
        'campaign_id' => $campaignID,
        'campaign_name' => $campaign['CampaignName'],
        'user_id' => $campaign['UserID']
    ));

    // Notify external system
    // self::notifyExternalCRM($campaign);

    return true;
}
```

:::

---

### `Campaign.Update.Post` <Badge type="info" text="Action" />

Triggered after campaign update.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Campaign ID |
| **Returns** | N/A |

---

### `Campaign.Delete.Post` <Badge type="info" text="Action" />

Triggered after campaign deletion.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Deleted campaign ID |
| **Returns** | N/A |

**Purpose:** Cleanup campaign-related plugin data.

---

### `Campaign.Queue.Generated` <Badge type="info" text="Action" />

Triggered after campaign queue is generated and ready for delivery.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Campaign ID<br>`$queueCount` (int) - Number of emails queued |
| **Returns** | N/A |
| **Location** | includes/classes/queue.inc.php |

**Purpose:** Notification that campaign is queued and will begin sending. Useful for analytics, notifications, or pre-send validations.

**Example:**

::: code-group

```php [Plugin Registration]
parent::RegisterHook('Action', 'Campaign.Queue.Generated', 'monitor', 'onQueueGenerated', 10, 2);

public static function onQueueGenerated($campaignID, $queueCount)
{
    Core::GetLogger()->info('Campaign queue generated', array(
        'campaign_id' => $campaignID,
        'queue_count' => $queueCount
    ));

    // Send notification to campaign owner
    // self::notifyCampaignOwner($campaignID, $queueCount);

    return true;
}
```

:::

---

### `Campaign.OnView` <Badge type="info" text="Action" />

Triggered when someone views a campaign in browser.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Campaign ID<br>`$subscriberID` (int) - Subscriber ID |
| **Returns** | N/A |

---

### `Campaign.SendingLimit.Reached` <Badge type="info" text="Action" />

Triggered when campaign reaches user's sending limit.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Campaign ID<br>`$userID` (int) - User ID |
| **Returns** | N/A |

**Purpose:** Notify about sending limit violations or implement custom limit handling.

---

### `Campaign.DailySendingLimit.Reached` <Badge type="info" text="Action" />

Triggered when daily sending limit is reached.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Campaign ID<br>`$userID` (int) - User ID |
| **Returns** | N/A |

---

### `Campaign.Interruption` <Badge type="info" text="Action" />

Triggered when campaign sending is interrupted.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Campaign ID<br>`$reason` (string) - Interruption reason |
| **Returns** | N/A |

---

### `Campaign.ManuallyPaused` <Badge type="info" text="Action" />

Triggered when user manually pauses a campaign.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Campaign ID |
| **Returns** | N/A |

---

## Email Hooks

Hooks for email content modification and delivery.

### `Email.Send.Before` <Badge type="tip" text="Filter" />

**Most commonly used hook** - Triggered before email content is processed for sending.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$subject` (string) - Email subject<br>`$htmlContent` (string) - HTML body<br>`$plainContent` (string) - Plain text body<br>`$subscriber` (array) - Subscriber data |
| **Returns** | Array: `[$subject, $htmlContent, $plainContent, $subscriber]` |
| **Location** | includes/classes/emails.inc.php:715<br>includes/classes/queue.inc.php:1909<br>includes/classes/transaction_emails.inc.php:345 |
| **Usage Count** | 18 instances across codebase |

**Purpose:** Modify email content before personalization and final processing. This is the primary hook for content transformation, adding dynamic elements, or implementing custom merge tags.

**Examples:**

::: code-group

```php [RSS Content Plugin]
// Real example from octrss plugin
parent::RegisterHook('Filter', 'Email.Send.Before', 'octrss', 'detectRSSTags', 10, 4);

public static function detectRSSTags($subject, $htmlContent, $plainContent, $subscriber = [])
{
    // Parse and replace RSS tags in HTML content
    if ($htmlContent != '') {
        $htmlContent = self::findRSSBlocks($htmlContent);
    }

    // Parse and replace RSS tags in plain content
    if ($plainContent != '') {
        $plainContent = self::findRSSBlocks($plainContent);
    }

    // MUST return all parameters
    return array($subject, $htmlContent, $plainContent, $subscriber);
}
```

```php [Custom Footer]
parent::RegisterHook('Filter', 'Email.Send.Before', 'customfooter', 'addFooter', 10, 4);

public static function addFooter($subject, $htmlContent, $plainContent, $subscriber)
{
    // Add custom footer to HTML emails
    $footer = '<div style="margin-top: 20px; padding: 10px; border-top: 1px solid #ddd;">';
    $footer .= '<p style="color: #999; font-size: 11px;">Custom footer text</p>';
    $footer .= '</div>';

    if ($htmlContent != '') {
        $htmlContent = str_replace('</body>', $footer . '</body>', $htmlContent);
    }

    // Add footer to plain text
    if ($plainContent != '') {
        $plainContent .= "\n\n---\nCustom footer text";
    }

    return array($subject, $htmlContent, $plainContent, $subscriber);
}
```

```php [Content Validation]
parent::RegisterHook('Filter', 'Email.Send.Before', 'validator', 'validateContent', 5, 4);

public static function validateContent($subject, $htmlContent, $plainContent, $subscriber)
{
    // Check for spam words
    $spamWords = array('viagra', 'casino', 'lottery');

    foreach ($spamWords as $word) {
        if (stripos($htmlContent, $word) !== false) {
            Core::GetLogger()->warning('Spam word detected', array('word' => $word));
            // Could modify content or block sending
        }
    }

    // Validate HTML structure
    if ($htmlContent != '') {
        // Ensure proper HTML structure
        if (stripos($htmlContent, '<html') === false) {
            $htmlContent = '<!DOCTYPE html><html><body>' . $htmlContent . '</body></html>';
        }
    }

    return array($subject, $htmlContent, $plainContent, $subscriber);
}
```

:::

**Use Cases:**
- Adding custom merge tags or variables
- Inserting dynamic content (RSS, weather, countdown timers)
- Content validation and spam checking
- Adding tracking pixels or custom scripts
- Implementing custom footer/header logic
- A/B testing content modifications

**Important Notes:**
- Executes BEFORE personalization - subscriber data is available but tags not yet replaced
- MUST return all 4 parameters in the same order
- Modifications affect ALL recipients of this email
- Use `Email.Send.EachRecipient` for per-recipient modifications
- High-priority hook (execute early with priority < 10) to modify before other plugins

---

### `Email.Send.EachRecipient` <Badge type="tip" text="Filter" />

Triggered for each individual recipient during email sending.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$subject` (string) - Email subject<br>`$htmlContent` (string) - HTML body<br>`$plainContent` (string) - Plain text body<br>`$subscriber` (array) - Current recipient data<br>`$context` (string) - Send context |
| **Returns** | Array: `[$subject, $htmlContent, $plainContent, $subscriber, $context]` |
| **Location** | includes/classes/emails.inc.php<br>includes/classes/queue.inc.php |
| **Usage Count** | 17 instances |

**Purpose:** Modify email content for each individual recipient. This hook executes AFTER personalization, so merge tags are already replaced. Ideal for recipient-specific logic.

**Example:**

::: code-group

```php [Personalized Offers]
parent::RegisterHook('Filter', 'Email.Send.EachRecipient', 'offers', 'personalizeOffers', 10, 5);

public static function personalizeOffers($subject, $htmlContent, $plainContent, $subscriber, $context)
{
    // Skip for test sends
    if ($context === 'Browser Preview') {
        return array($subject, $htmlContent, $plainContent, $subscriber, $context);
    }

    // Get subscriber's purchase history
    $purchaseCount = self::getSubscriberPurchases($subscriber['EmailAddress']);

    // Show different offer based on purchase history
    if ($purchaseCount > 5) {
        $offer = 'VIP Exclusive: 30% OFF';
    } elseif ($purchaseCount > 0) {
        $offer = 'Welcome Back: 20% OFF';
    } else {
        $offer = 'First Time: 15% OFF';
    }

    $htmlContent = str_replace('{{OFFER}}', $offer, $htmlContent);

    return array($subject, $htmlContent, $plainContent, $subscriber, $context);
}
```

:::

---

### `Email.Create.Post` <Badge type="info" text="Action" />

Triggered after email template is created.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailID` (int) - Email template ID |
| **Returns** | N/A |

---

### `Email.Update.Post` <Badge type="info" text="Action" />

Triggered after email template is updated.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailID` (int) - Email template ID |
| **Returns** | N/A |

---

### `Email.Delete.Pre` <Badge type="info" text="Action" />

Triggered before email template deletion.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailID` (int) - Email template ID |
| **Returns** | N/A |

---

### `Email.Send.Successful` <Badge type="info" text="Action" />

Triggered after successful email delivery.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailID` (int) - Email ID<br>`$subscriberID` (int) - Subscriber ID<br>`$campaignID` (int) - Campaign ID |
| **Returns** | N/A |

**Purpose:** Track successful deliveries, update statistics, or trigger follow-up actions.

---

### `Email.Send.Stop` <Badge type="info" text="Action" />

Triggered when email sending is stopped.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailID` (int) - Email ID<br>`$reason` (string) - Stop reason |
| **Returns** | N/A |

---

## Personalization Hooks

Hooks for customizing personalization tags and content merge.

### `Personalization.Before` <Badge type="tip" text="Filter" />

Triggered before personalization engine processes content.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$content` (string) - Content to personalize<br>`$subscriber` (array) - Subscriber data<br>`$campaign` (array) - Campaign data |
| **Returns** | Array: `[$content, $subscriber, $campaign]` |
| **Location** | includes/classes/personalization.inc.php |

**Purpose:** Modify content before standard personalization tags are processed. Add custom tags or preprocessing logic.

---

### `Personalization.After` <Badge type="tip" text="Filter" />

Triggered after personalization engine processes content.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$content` (string) - Personalized content<br>`$subscriber` (array) - Subscriber data |
| **Returns** | Array: `[$content, $subscriber]` |

**Purpose:** Post-process content after standard tags are replaced. Clean up remaining tags or add final touches.

---

### `PersonalizationTags.Campaign.Subject` <Badge type="tip" text="Filter" />

Add custom personalization tags for campaign subject lines.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$tags` (array) - Available tags |
| **Returns** | Array: `[$tags]` |

---

### `PersonalizationTags.Campaign.Content` <Badge type="tip" text="Filter" />

Add custom personalization tags for campaign content.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$tags` (array) - Available tags |
| **Returns** | Array: `[$tags]` |
| **Location** | includes/classes/personalization.inc.php |

**Purpose:** Register custom merge tags that appear in the personalization tag selector.

**Example:**

::: code-group

```php [Custom Tags]
parent::RegisterHook('Filter', 'PersonalizationTags.Campaign.Content', 'customtags', 'addCustomTags', 10, 1);

public static function addCustomTags($tags)
{
    // Add custom tags to the tag selector
    $tags['Custom'] = array(
        '%CURRENT_YEAR%' => 'Current Year',
        '%CURRENT_MONTH%' => 'Current Month Name',
        '%WEATHER%' => 'Local Weather',
        '%RANDOM_PRODUCT%' => 'Random Product Recommendation'
    );

    return array($tags);
}
```

:::

---

### `PersonalizationTags.Autoresponder.Subject` <Badge type="tip" text="Filter" />

Add custom personalization tags for autoresponder subject lines.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$tags` (array) - Available tags |
| **Returns** | Array: `[$tags]` |

---

### `PersonalizationTags.Autoresponder.Content` <Badge type="tip" text="Filter" />

Add custom personalization tags for autoresponder content.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$tags` (array) - Available tags |
| **Returns** | Array: `[$tags]` |

---

### `Personalization.SystemLinkList` <Badge type="tip" text="Filter" />

Customize the list of system links available for personalization.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$links` (array) - System links |
| **Returns** | Array: `[$links]` |

---

## Subscriber Hooks

Hooks for subscriber management and data operations.

### `Subscriber.Create.Post` <Badge type="info" text="Action" />

Triggered after new subscriber is created.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$subscriberID` (int) - New subscriber ID<br>`$listID` (int) - List ID<br>`$subscriberData` (array) - Subscriber information |
| **Returns** | N/A |
| **Location** | includes/classes/subscribers.inc.php |

**Purpose:** Execute actions when new subscriber joins, such as triggering welcome sequences, updating external CRMs, or custom analytics.

**Example:**

::: code-group

```php [CRM Integration]
parent::RegisterHook('Action', 'Subscriber.Create.Post', 'crmintegration', 'syncToC RM', 10, 3);

public static function syncToCRM($subscriberID, $listID, $subscriberData)
{
    // Get full subscriber details
    $subscriber = Database::$Interface->GetRow(
        'oempro_subscribers',
        'SubscriberID = ' . (int)$subscriberID
    );

    // Sync to external CRM
    self::sendToCRM(array(
        'email' => $subscriber['EmailAddress'],
        'first_name' => $subscriberData['FirstName'],
        'last_name' => $subscriberData['LastName'],
        'list_id' => $listID,
        'subscribed_at' => date('Y-m-d H:i:s')
    ));

    Core::GetLogger()->info('Subscriber synced to CRM', array(
        'subscriber_id' => $subscriberID
    ));

    return true;
}
```

:::

---

### `Subscriber.Import.Post` <Badge type="info" text="Action" />

Triggered after subscriber import completes.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$importID` (int) - Import job ID<br>`$stats` (array) - Import statistics |
| **Returns** | N/A |

---

### `Subscriber.Delete.Post` <Badge type="info" text="Action" />

Triggered after subscriber deletion.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$subscriberID` (int) - Deleted subscriber ID |
| **Returns** | N/A |

**Purpose:** Cleanup subscriber-related plugin data or sync deletions to external systems.

---

### `Delete.Subscriber` <Badge type="info" text="Action" />

General subscriber deletion hook (fires for various deletion scenarios).

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$subscriberID` (int) - Subscriber ID |
| **Returns** | N/A |

---

### `SubscriberRuleFields` <Badge type="tip" text="Filter" />

Add custom fields to subscriber segmentation rules.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$fields` (array) - Available rule fields |
| **Returns** | Array: `[$fields]` |
| **Location** | includes/classes/segments.inc.php |

**Purpose:** Extend the segment builder with custom subscriber fields or calculated values.

---

## Journey Hooks

Hooks for Journey Builder automation workflows.

### `Journeys.ActionProcess.Before` <Badge type="tip" text="Filter" />

Triggered before processing a journey action.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$actionData` (array) - Action configuration<br>`$subscriberData` (array) - Subscriber in journey<br>`$journeyData` (array) - Journey configuration |
| **Returns** | Array: `[$actionData, $subscriberData, $journeyData]` |
| **Location** | system/Workers/JourneyWorker.php |

**Purpose:** Modify journey action behavior, add custom conditions, or implement custom action types.

---

### `Journey.Webhook.Action.Payload` <Badge type="tip" text="Filter" />

Modify webhook payload before sending from journey action.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$payload` (array) - Webhook payload data<br>`$actionConfig` (array) - Action configuration<br>`$subscriber` (array) - Subscriber data |
| **Returns** | Array: `[$payload, $actionConfig, $subscriber]` |
| **Location** | system/Workers/JourneyWorker.php |

**Purpose:** Customize webhook data sent from Journey Builder webhook actions.

**Example:**

::: code-group

```php [Custom Webhook Data]
parent::RegisterHook('Filter', 'Journey.Webhook.Action.Payload', 'webhooks', 'customizePayload', 10, 3);

public static function customizePayload($payload, $actionConfig, $subscriber)
{
    // Add custom fields to webhook payload
    $payload['custom_data'] = array(
        'subscriber_score' => self::calculateScore($subscriber),
        'last_purchase' => self::getLastPurchase($subscriber['EmailAddress']),
        'tags' => self::getSubscriberTags($subscriber['SubscriberID'])
    );

    // Add authentication header
    $payload['headers']['X-API-Key'] = self::getAPIKey();

    return array($payload, $actionConfig, $subscriber);
}
```

:::

---

### `Journey.Delete.Post` <Badge type="info" text="Action" />

Triggered after journey deletion.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$journeyID` (int) - Deleted journey ID |
| **Returns** | N/A |

---

## Integration Hooks

Hooks for external service integrations.

### `Integrations.Update.Post` <Badge type="tip" text="Filter" />

Triggered after integration settings update.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$integrationData` (array) - Integration configuration<br>`$integrationType` (string) - Type of integration |
| **Returns** | Array: `[$integrationData, $integrationType]` |

---

### `EmailGateway.Domain.Verify` <Badge type="info" text="Action" />

Triggered when domain verification is requested.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$domain` (string) - Domain name<br>`$userID` (int) - User ID |
| **Returns** | N/A |

---

### `EmailGateway.VerifyDomain.Verified` <Badge type="info" text="Action" />

Triggered after successful domain verification.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$domain` (string) - Verified domain<br>`$userID` (int) - User ID |
| **Returns** | N/A |

---

### `EmailGateway.Email.PreSendAction` <Badge type="info" text="Action" />

Triggered before email gateway processes email.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailData` (array) - Email information<br>`$gatewayConfig` (array) - Gateway configuration |
| **Returns** | N/A |

---

### `EmailGateway.Email.PostDelivery` <Badge type="info" text="Action" />

Triggered after email gateway delivers email.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$emailData` (array) - Email information<br>`$deliveryResult` (array) - Delivery status |
| **Returns** | N/A |

---

### `EmailGateway.DeliveryServer.ConnectionParams` <Badge type="tip" text="Filter" />

Modify delivery server connection parameters.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$params` (array) - Connection parameters |
| **Returns** | Array: `[$params]` |

**Purpose:** Customize SMTP connection settings before connecting.

---

## UI Customization Hooks

Hooks for customizing the user interface.

### `UI.User.HeaderLogo` <Badge type="tip" text="Filter" />

Customize the header logo in user interface.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$logoHTML` (string) - Logo HTML markup |
| **Returns** | Array: `[$logoHTML]` |
| **Location** | templates/weefive/desktop/user/includes/header.php |

**Purpose:** Replace or modify the header logo for white-labeling.

**Example:**

::: code-group

```php [Custom Logo]
parent::RegisterHook('Filter', 'UI.User.HeaderLogo', 'uilogo', 'customizeLogo', 10, 1);

public static function customizeLogo($logoHTML)
{
    // Get custom logo from plugin settings
    $customLogoURL = Database::$Interface->GetOption('UILogo_CustomURL');

    if (!empty($customLogoURL[0]['OptionValue'])) {
        $logoHTML = '<img src="' . htmlspecialchars($customLogoURL[0]['OptionValue']) . '"
                          alt="Logo" style="max-height: 40px;">';
    }

    return array($logoHTML);
}
```

:::

---

### `UI.User.BeforeBodyClose` <Badge type="info" text="Action" />

Insert custom HTML/JavaScript before closing body tag.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | None |
| **Returns** | N/A |

**Purpose:** Add custom tracking scripts, live chat widgets, or analytics code.

**Example:**

::: code-group

```php [Analytics Script]
parent::RegisterHook('Action', 'UI.User.BeforeBodyClose', 'analytics', 'addTrackingCode', 10, 0);

public static function addTrackingCode()
{
    ?>
    <script>
    // Google Analytics
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-XXXXX-Y', 'auto');
    ga('send', 'pageview');
    </script>
    <?php
}
```

:::

---

### `UI.User.Edit.Form` <Badge type="info" text="Action" />

Add custom fields to user edit form.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$userID` (int) - User being edited<br>`$userData` (array) - User data |
| **Returns** | N/A |

---

### `UI.User.Edit.LeftSide` <Badge type="info" text="Action" />

Add content to left sidebar of user edit page.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$userID` (int) - User ID<br>`$userData` (array) - User data |
| **Returns** | N/A |

---

### `UI.Campaign.Details` <Badge type="info" text="Action" />

Add custom content to campaign details page.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$campaignID` (int) - Campaign ID<br>`$campaignData` (array) - Campaign data |
| **Returns** | N/A |

---

## Cron & Worker Hooks

Hooks for scheduled tasks and background workers.

### `Cron.General` <Badge type="info" text="Action" />

General cron hook for scheduled tasks.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | None |
| **Returns** | N/A |
| **Location** | cli/cron.general.php |
| **Frequency** | Executes every cron run (typically every 5-15 minutes) |

**Purpose:** Execute recurring tasks like cleanup operations, data synchronization, report generation, or external API polling.

**Example:**

::: code-group

```php [Scheduled Cleanup]
parent::RegisterHook('Action', 'Cron.General', 'cleanup', 'performCleanup', 10, 0);

public static function performCleanup()
{
    // Clean up old temporary files
    $tempDir = APP_PATH . '/data/tmp/';
    $files = glob($tempDir . '*');
    $now = time();

    foreach ($files as $file) {
        if (is_file($file)) {
            if ($now - filemtime($file) >= 60 * 60 * 24 * 7) { // 7 days
                unlink($file);
                Core::GetLogger()->info('Deleted old temp file', array('file' => basename($file)));
            }
        }
    }

    // Clean up old session data
    $redis = new Predis\Client('tcp://'.OEMPRO_SERVICE_HOSTNAMES['oempro_redis'].':6379');
    // Cleanup logic here

    return true;
}
```

```php [External Sync]
parent::RegisterHook('Action', 'Cron.General', 'sync', 'syncExternalData', 10, 0);

public static function syncExternalData()
{
    // Only run once per hour
    $lastRun = Database::$Interface->GetOption('Sync_LastRun');
    if (!empty($lastRun) && (time() - strtotime($lastRun[0]['OptionValue'])) < 3600) {
        return false;
    }

    // Fetch data from external API
    $data = self::fetchFromAPI();

    // Update local database
    foreach ($data as $item) {
        self::processItem($item);
    }

    // Update last run time
    Database::$Interface->SaveOption('Sync_LastRun', date('Y-m-d H:i:s'));

    Core::GetLogger()->info('External data sync completed');
    return true;
}
```

:::

**Use Cases:**
- Cleaning up old data
- Synchronizing with external systems
- Generating scheduled reports
- Processing queued items
- Updating cached data
- Monitoring system health

**Important Notes:**
- Cron frequency depends on system configuration
- Keep execution time under 1-2 minutes
- Log all operations for debugging
- Implement locking to prevent concurrent runs
- Store last run timestamp to control frequency

---

### `Cron.SendEngine` <Badge type="info" text="Action" />

Send engine cron hook.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | None |
| **Returns** | N/A |

---

### `Cron.Bounce` <Badge type="info" text="Action" />

Bounce processing cron hook.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | None |
| **Returns** | N/A |

---

### `Cron.FBL` <Badge type="info" text="Action" />

Feedback loop processing cron hook.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | None |
| **Returns** | N/A |

---

### `Worker.Clicks` <Badge type="info" text="Action" />

Click tracking worker hook.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$clickData` (array) - Click information |
| **Returns** | N/A |

---

### `Worker.Opens` <Badge type="info" text="Action" />

Open tracking worker hook.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$openData` (array) - Open tracking information |
| **Returns** | N/A |

---

### `Worker.Journeys` <Badge type="info" text="Action" />

Journey processing worker hook.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$journeyData` (array) - Journey information |
| **Returns** | N/A |

---

## Tracking & Analytics Hooks

Hooks for tracking subscriber interactions.

### `Track.Open` <Badge type="info" text="Action" />

Triggered when email open is tracked.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$subscriberID` (int) - Subscriber ID<br>`$campaignID` (int) - Campaign ID<br>`$emailID` (int) - Email ID |
| **Returns** | N/A |
| **Location** | web_open.php |

**Purpose:** Record custom analytics when subscriber opens email.

---

### `LinkTracking.BeforeRedirection` <Badge type="info" text="Action" />

Triggered before link click redirection.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$linkData` (array) - Link information<br>`$subscriberID` (int) - Subscriber ID |
| **Returns** | N/A |
| **Location** | web_link.php |

**Purpose:** Execute custom logic before redirecting subscriber to clicked link.

---

## List Management Hooks

Hooks for mailing list operations.

### `List.Create.Post` <Badge type="info" text="Action" />

Triggered after mailing list creation.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$listID` (int) - New list ID<br>`$listData` (array) - List information |
| **Returns** | N/A |

---

### `List.Update.Post` <Badge type="info" text="Action" />

Triggered after mailing list update.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$listID` (int) - List ID<br>`$listData` (array) - Updated list data |
| **Returns** | N/A |

---

### `List.Delete.Post` <Badge type="info" text="Action" />

Triggered after mailing list deletion.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$listID` (int) - Deleted list ID |
| **Returns** | N/A |

**Purpose:** Cleanup list-related plugin data.

---

## Import/Export Hooks

Hooks for data import and export operations.

### `Import.Started` <Badge type="info" text="Action" />

Triggered when subscriber import starts.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$importID` (int) - Import job ID<br>`$importConfig` (array) - Import configuration |
| **Returns** | N/A |

---

### `Import.Completed` <Badge type="info" text="Action" />

Triggered when subscriber import completes successfully.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$importID` (int) - Import job ID<br>`$stats` (array) - Import statistics |
| **Returns** | N/A |

**Purpose:** Post-import processing, notifications, or analytics.

---

### `Import.Failed` <Badge type="info" text="Action" />

Triggered when subscriber import fails.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$importID` (int) - Import job ID<br>`$error` (string) - Error message |
| **Returns** | N/A |

---

## API Extension Hooks

Hooks for extending the Octeth API.

### `Api.Plugin.Extend` <Badge type="info" text="Action" />

Hook for plugins to extend API functionality.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$apiCommand` (string) - API command<br>`$apiData` (array) - API request data |
| **Returns** | N/A |

---

### Registering Custom API Endpoints

Use `RegisterAPIHook` to add custom API commands:

```php
public static function load_myplugin()
{
    // Register custom API endpoint
    parent::RegisterAPIHook('custom.getData', 'myplugin', array('admin', 'user'));
}

/**
 * API method must be named: api_{command_with_underscores}
 */
public static function api_custom_getData($APIData)
{
    // Validate request
    if (!isset($APIData['id'])) {
        return array(
            'Success' => false,
            'ErrorCode' => 400,
            'Message' => 'Missing required parameter: id'
        );
    }

    // Process request
    $data = self::fetchData($APIData['id']);

    // Return response
    return array(
        'Success' => true,
        'ErrorCode' => 0,
        'Data' => $data
    );
}
```

**API Call Example:**
```bash
curl -X POST https://your-octeth.com/api/ \
  -d "Command=custom.getData" \
  -d "APIKey=your_api_key" \
  -d "id=123"
```

---

## Database Query Hooks

Advanced hooks for modifying database queries.

### `MysqlQueryGetRowsFilter` <Badge type="tip" text="Filter" />

Filter database query results.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$rows` (array) - Query results<br>`$table` (string) - Table name<br>`$conditions` (string) - WHERE clause |
| **Returns** | Array: `[$rows, $table, $conditions]` |

**Purpose:** Modify or filter database query results before they're returned.

---

### `MysqlCriteriaFilter` <Badge type="tip" text="Filter" />

Modify SQL WHERE criteria before query execution.

| Property | Value |
|---|---|
| **Type** | Filter |
| **Parameters** | `$criteria` (string) - WHERE clause<br>`$table` (string) - Table name |
| **Returns** | Array: `[$criteria, $table]` |

**Purpose:** Add additional WHERE conditions to database queries dynamically.

---

## Custom Field Hooks

Hooks for custom field management.

### `CustomField.Create.Post` <Badge type="info" text="Action" />

Triggered after custom field creation.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$fieldID` (int) - Custom field ID |
| **Returns** | N/A |

---

### `CustomField.Update.Post` <Badge type="info" text="Action" />

Triggered after custom field update.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$fieldID` (int) - Custom field ID |
| **Returns** | N/A |

---

### `CustomField.Delete.Post` <Badge type="info" text="Action" />

Triggered after custom field deletion.

| Property | Value |
|---|---|
| **Type** | Action |
| **Parameters** | `$fieldID` (int) - Deleted custom field ID |
| **Returns** | N/A |

---

## Deletion Hooks

Comprehensive hooks for entity deletion operations.

### User Group Deletion

- `UserGroup.Delete.Post` - After user group deletion
- `Delete.UserGroup` - General user group deletion

### Delivery Server Deletion

- `Delete.DeliveryServer` - After delivery server deletion

### Email Template Deletion

- `Delete.Email` - After email template deletion
- `Email.Template.Delete.Post` - After email template deletion

### Webhook Deletion

- `Delete.Webhook` - After webhook deletion

### Other Deletion Hooks

- `Delete.Attachment` - Attachment deletion
- `Delete.AutoResponder` - Autoresponder deletion
- `Delete.Campaign` - Campaign deletion
- `Delete.Client` - Client deletion
- `Delete.CustomField` - Custom field deletion
- `Delete.Journey` - Journey deletion
- `Delete.List` - List deletion
- `Delete.MediaLibraryItem` - Media library item deletion
- `Delete.Segments` - Segment deletion
- `Delete.SenderDomain` - Sender domain deletion
- `Delete.Tag` - Tag deletion
- `Delete.Template` - Template deletion
- `Delete.Theme` - Theme deletion
- `Delete.TransactionEmail` - Transactional email deletion
- `Delete.User` - User deletion
- `Delete.WebserviceIntegration` - Web service integration deletion

---

## Best Practices

### 1. Always Return Required Values

**Filter hooks MUST return all parameters:**

```php
// ✅ CORRECT
public static function modifyEmail($subject, $htmlContent, $plainContent, $subscriber)
{
    $htmlContent .= '<p>Footer</p>';
    return array($subject, $htmlContent, $plainContent, $subscriber);
}

// ❌ WRONG - Missing return statement
public static function modifyEmail($subject, $htmlContent, $plainContent, $subscriber)
{
    $htmlContent .= '<p>Footer</p>';
}
```

### 2. Check Hook Parameters

Always validate parameters before using them:

```php
public static function processData($data)
{
    // Check if data exists and is valid
    if (empty($data) || !is_array($data)) {
        Core::GetLogger()->warning('Invalid data passed to hook');
        return $data;
    }

    // Safe to process
    return $data;
}
```

### 3. Use Appropriate Priority

Set priority based on when your hook should execute:

```php
// Execute early (before other plugins)
parent::RegisterHook('Filter', 'Email.Send.Before', 'myplugin', 'callback', 5, 4);

// Execute at default time (with most plugins)
parent::RegisterHook('Filter', 'Email.Send.Before', 'myplugin', 'callback', 10, 4);

// Execute late (after other plugins)
parent::RegisterHook('Filter', 'Email.Send.Before', 'myplugin', 'callback', 20, 4);
```

### 4. Log Important Operations

Use the logging system for debugging:

```php
public static function myHookCallback($data)
{
    try {
        // Your logic here
        Core::GetLogger()->info('Operation completed', array('data_id' => $data['id']));
        return $data;
    } catch (Exception $e) {
        Core::GetLogger()->error('Hook error', array(
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ));
        return $data; // Return original data on error
    }
}
```

### 5. Handle Errors Gracefully

Never break the application flow:

```php
public static function riskyOperation($data)
{
    try {
        // Potentially failing operation
        $result = self::callExternalAPI($data);
        $data['external_id'] = $result['id'];
    } catch (Exception $e) {
        // Log error but don't break execution
        Core::GetLogger()->error('API call failed', array('error' => $e->getMessage()));
        // Continue with original data
    }

    return array($data);
}
```

### 6. Use Database Options for Configuration

Store plugin settings properly:

```php
// Save option
Database::$Interface->SaveOption('MyPlugin_APIKey', 'abc123');

// Retrieve option
$options = Database::$Interface->GetOption('MyPlugin_APIKey');
$apiKey = $options[0]['OptionValue'] ?? '';
```

### 7. Clean Up Resources

Always clean up in disable hook:

```php
public static function disable_myplugin()
{
    // Clear caches
    $redis = new Predis\Client('tcp://'.OEMPRO_SERVICE_HOSTNAMES['oempro_redis'].':6379');
    $keys = $redis->keys('myplugin:*');
    foreach ($keys as $key) {
        $redis->del($key);
    }

    // Remove temporary files
    $tempDir = PLUGIN_PATH . 'myplugin/temp/';
    if (is_dir($tempDir)) {
        array_map('unlink', glob("$tempDir/*"));
    }

    // Note: Generally keep database tables for re-enabling
}
```

### 8. Use Constants Properly

Leverage Octeth constants:

```php
// Application path
APP_PATH . '/data/files/'

// Plugin path
PLUGIN_PATH . 'myplugin/assets/'

// App URL
APP_URL . 'admin/plugins/myplugin'

// Database table prefix
MYSQL_TABLE_PREFIX . 'myplugin_data'
```

### 9. Respect User Permissions

Check permissions before showing UI or executing actions:

```php
public static function set_menu_items($menuContext, $userData)
{
    // Check if user has permission
    if (!in_array('Plugin.myplugin', $userData['Permissions']) &&
        !in_array('*', $userData['Permissions'])) {
        return;
    }

    // Add menu items
}
```

### 10. Document Your Hooks

Always document which hooks your plugin uses:

```php
/**
 * My Custom Plugin
 *
 * Registered Hooks:
 * - Email.Send.Before (Filter) - Adds custom footer to emails
 * - Campaign.Create.Post (Action) - Logs campaign creation
 * - Cron.General (Action) - Performs daily cleanup
 * - System.Menu.Add (Action) - Adds admin menu items
 */
class myplugin extends Plugins
{
    // Plugin code
}
```

---

## Common Patterns

### Pattern: Content Modification

Modify email or page content:

```php
parent::RegisterHook('Filter', 'Email.Send.Before', 'myplugin', 'modifyContent', 10, 4);

public static function modifyContent($subject, $htmlContent, $plainContent, $subscriber)
{
    // Find and replace
    $htmlContent = str_replace('{{CUSTOM_TAG}}', 'Custom Value', $htmlContent);

    // Add elements
    if (strpos($htmlContent, '</body>') !== false) {
        $footer = '<div class="custom-footer">Footer content</div>';
        $htmlContent = str_replace('</body>', $footer . '</body>', $htmlContent);
    }

    return array($subject, $htmlContent, $plainContent, $subscriber);
}
```

### Pattern: External API Integration

Call external services from hooks:

```php
parent::RegisterHook('Action', 'Subscriber.Create.Post', 'integration', 'syncToAPI', 10, 3);

public static function syncToAPI($subscriberID, $listID, $subscriberData)
{
    try {
        $response = self::callAPI('POST', '/subscribers', array(
            'email' => $subscriberData['EmailAddress'],
            'name' => $subscriberData['FirstName'] . ' ' . $subscriberData['LastName'],
            'list_id' => $listID
        ));

        if ($response['success']) {
            // Store external ID
            Database::$Interface->SaveOption(
                'Integration_ExternalID_' . $subscriberID,
                $response['id']
            );
        }
    } catch (Exception $e) {
        Core::GetLogger()->error('API sync failed', array(
            'subscriber_id' => $subscriberID,
            'error' => $e->getMessage()
        ));
    }

    return true;
}
```

### Pattern: Conditional Logic

Execute hook logic conditionally:

```php
parent::RegisterHook('Filter', 'Email.Send.Before', 'conditional', 'conditionalModify', 10, 4);

public static function conditionalModify($subject, $htmlContent, $plainContent, $subscriber)
{
    // Get campaign ID from context
    global $ArrayCampaign;

    // Only modify for specific campaigns
    $enabledCampaigns = array(123, 456, 789);
    if (!in_array($ArrayCampaign['CampaignID'], $enabledCampaigns)) {
        return array($subject, $htmlContent, $plainContent, $subscriber);
    }

    // Only for specific subscriber segments
    if ($subscriber['SubscriberStatus'] !== 'Active') {
        return array($subject, $htmlContent, $plainContent, $subscriber);
    }

    // Apply modifications
    $htmlContent = self::applyModifications($htmlContent);

    return array($subject, $htmlContent, $plainContent, $subscriber);
}
```

### Pattern: Caching

Cache expensive operations:

```php
parent::RegisterHook('Filter', 'Email.Send.Before', 'cache', 'addCachedContent', 10, 4);

public static function addCachedContent($subject, $htmlContent, $plainContent, $subscriber)
{
    $redis = new Predis\Client('tcp://'.OEMPRO_SERVICE_HOSTNAMES['oempro_redis'].':6379');
    $cacheKey = 'content:weather:' . date('Y-m-d-H');

    // Try to get from cache
    $weather = $redis->get($cacheKey);

    if ($weather === null) {
        // Cache miss - fetch fresh data
        $weather = self::fetchWeatherData();
        $redis->setex($cacheKey, 3600, $weather); // Cache for 1 hour
    }

    // Replace tag with cached content
    $htmlContent = str_replace('{{WEATHER}}', $weather, $htmlContent);

    return array($subject, $htmlContent, $plainContent, $subscriber);
}
```

---

## Troubleshooting

### Hook Not Executing

**Problem:** Your hook callback is not being called.

**Solutions:**
1. Verify plugin is enabled in admin panel
2. Check hook name spelling matches exactly
3. Ensure callback function is static and public
4. Verify AcceptedArguments count matches parameters
5. Check logs for PHP errors

```php
// Debug: Log when hook is registered
public static function load_myplugin()
{
    Core::GetLogger()->info('Registering hooks for myplugin');
    parent::RegisterHook('Action', 'Campaign.Create.Post', 'myplugin', 'onCampaignCreate', 10, 1);
}

// Debug: Log when hook executes
public static function onCampaignCreate($campaignID)
{
    Core::GetLogger()->info('Hook executed', array('campaign_id' => $campaignID));
    return true;
}
```

### Filter Hook Not Modifying Data

**Problem:** Your filter hook runs but data doesn't change.

**Solutions:**
1. Ensure you're returning ALL parameters as array
2. Check priority - another plugin may be overriding
3. Verify you're modifying the correct parameter index

```php
// ❌ WRONG - Not returning all parameters
public static function modify($subject, $content)
{
    $content .= 'Footer';
    return $content; // Missing subject!
}

// ✅ CORRECT
public static function modify($subject, $content)
{
    $content .= 'Footer';
    return array($subject, $content); // Returns both
}
```

### Memory or Performance Issues

**Problem:** Plugin causes memory errors or slow performance.

**Solutions:**
1. Avoid loading large datasets in hooks
2. Use caching for expensive operations
3. Limit database queries
4. Process data in batches

```php
// ❌ BAD - Loads all subscribers every time
public static function processEmail($subject, $content, $plain, $subscriber)
{
    $allSubscribers = Database::$Interface->GetRows('oempro_subscribers');
    // Process...
    return array($subject, $content, $plain, $subscriber);
}

// ✅ GOOD - Uses caching and specific queries
public static function processEmail($subject, $content, $plain, $subscriber)
{
    $redis = new Predis\Client('tcp://'.OEMPRO_SERVICE_HOSTNAMES['oempro_redis'].':6379');
    $key = 'subscriber:' . $subscriber['SubscriberID'];

    $data = $redis->get($key);
    if ($data === null) {
        $data = self::getSubscriberData($subscriber['SubscriberID']);
        $redis->setex($key, 3600, serialize($data));
    } else {
        $data = unserialize($data);
    }

    // Process with cached data...
    return array($subject, $content, $plain, $subscriber);
}
```

---

## Additional Resources

### Related Documentation

- **Plugin Development Guide:** `.cursor/rules/plugin.mdc`
- **System Architecture:** `CLAUDE-architecture.md`
- **Development Conventions:** `CLAUDE-conventions.md`
- **Database Schema:** `.docs/database/`

### Helper Functions

**Database Operations:**
```php
// Save option
Database::$Interface->SaveOption($key, $value);

// Get option
$result = Database::$Interface->GetOption($key);
$value = $result[0]['OptionValue'] ?? '';

// Execute query
Database::$Interface->ExecuteQuery($sql);

// Get rows
$rows = Database::$Interface->GetRows($table, $where);

// Get single row
$row = Database::$Interface->GetRow($table, $where);
```

**Logging:**
```php
// Info level
Core::GetLogger()->info('Message', array('key' => 'value'));

// Warning level
Core::GetLogger()->warning('Message', array('key' => 'value'));

// Error level
Core::GetLogger()->error('Message', array('key' => 'value'));

// Debug level (requires OEMPRO_LOG_LEVEL=DEBUG)
Core::GetLogger()->debug('Message', array('key' => 'value'));
```

**Redis Caching:**
```php
$redis = new Predis\Client('tcp://'.OEMPRO_SERVICE_HOSTNAMES['oempro_redis'].':6379');

// Set with expiration
$redis->setex('key', 3600, 'value'); // Expires in 1 hour

// Get
$value = $redis->get('key');

// Delete
$redis->del('key');

// Check exists
if ($redis->exists('key')) {
    // Key exists
}
```

### Finding Hook Usage

**Search for hook registrations:**
```bash
grep -r "RegisterHook.*'HookName'" plugins/
```

**Search for hook executions:**
```bash
grep -r "HookListener.*'HookName'" includes/ cli/
```

**List all hooks in a file:**
```bash
grep -n "RegisterHook\|HookListener" path/to/file.php
```

---

## Hook Index

### Action Hooks (by Category)

**Lifecycle:**
- System.Plugin.Enable
- System.Plugin.Disable
- System.Menu.Add
- System.Header.Load.Finished

**Authentication:**
- User.Login.Before
- User.Login.Post
- User.Login.InvalidUser
- User.Login.ValidationError
- Admin.Login.Before
- Admin.Login.InvalidUser
- Admin.Login.ValidationError
- Client.Login.Before
- Client.Login.Post
- Client.Login.InvalidUser
- Client.Login.ValidationError

**User Management:**
- User.Create
- User.Update.Post
- User.Update.Post.Successful
- User.Delete.Post
- User.PasswordReset.Before
- UserGroup.Create.Post
- UserGroup.Update.Post
- UserGroup.Delete.Post

**Campaigns:**
- Campaign.Create.Post
- Campaign.Update.Post
- Campaign.Delete.Post
- Campaign.Queue.Generated
- Campaign.OnView
- Campaign.SendingLimit.Reached
- Campaign.DailySendingLimit.Reached
- Campaign.Interruption
- Campaign.ManuallyPaused

**Emails:**
- Email.Create.Post
- Email.Update.Post
- Email.Delete.Pre
- Email.Send.Successful
- Email.Send.Stop
- AutoResponder.Email.Send.JustBefore

**Subscribers:**
- Subscriber.Create.Post
- Subscriber.Import.Post
- Subscriber.Delete.Post
- Delete.Subscriber

**Lists:**
- List.Create.Post
- List.Update.Post
- List.Delete.Post

**Journeys:**
- Journey.Delete.Post

**Tracking:**
- Track.Open
- LinkTracking.BeforeRedirection

**Cron:**
- Cron.General
- Cron.SendEngine
- Cron.Bounce
- Cron.FBL
- Cron.TransactionalSend

**Workers:**
- Worker.Clicks
- Worker.Opens
- Worker.Journeys
- Worker.Webhooks

**Import/Export:**
- Import.Started
- Import.Completed
- Import.Failed

**Email Gateway:**
- EmailGateway.Domain.Verify
- EmailGateway.VerifyDomain.Verified
- EmailGateway.Domain.Create
- EmailGateway.Domain.Delete
- EmailGateway.Email.PreSendAction
- EmailGateway.Email.PostDelivery
- EmailGateway.Email.Delivery.Successful
- EmailGateway.Email.Delivery.Failed
- EmailGateway.DeliveryLimit.Reached
- EmailGateway.DeliveryLimit.ApproachingLimit

**UI:**
- UI.All
- UI.User.Edit.Form
- UI.User.Edit.LeftSide
- UI.User.BeforeBodyClose
- UI.Campaign.Details

### Filter Hooks (by Category)

**Email Content:**
- Email.Send.Before
- Email.Send.EachRecipient

**Personalization:**
- Personalization.Before
- Personalization.After
- Personalization.SystemLinkList
- PersonalizationTags.Campaign.Subject
- PersonalizationTags.Campaign.Content
- PersonalizationTags.Autoresponder.Subject
- PersonalizationTags.Autoresponder.Content
- PersonalizationTags.Confirmation.Subject
- PersonalizationTags.Confirmation.Content

**Journeys:**
- Journeys.ActionProcess.Before
- Journey.Webhook.Action.Payload

**Subscribers:**
- SubscriberRuleFields

**Database:**
- MysqlQueryGetRowsFilter
- MysqlCriteriaFilter

**Email Gateway:**
- EmailGateway.DeliveryServer.ConnectionParams
- EmailGateway.Email.PreSendFilter
- EmailGateway.UnsubscribeLinkEnabled

**UI:**
- UI.User.HeaderLogo
- UI.User.Browse.ImpersonateLink
- UI.User.Group.SubscriptionPlans

**Integrations:**
- Integrations.Update.Post

---

*Last Updated: 2025-01-28*
*Octeth Version: 5.7.0+*
*Total Hooks Documented: 160+ Action Hooks, 30+ Filter Hooks*
