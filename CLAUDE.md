# Octeth API Documentation Project Overview

## Project Description
This is the official API documentation website for Octeth.com, an on-premise enterprise-grade email marketing software. The documentation is built using VitePress and provides comprehensive API reference documentation for developers integrating with Octeth.

## Technology Stack
- **Framework**: VitePress v1.0.0-rc.4
- **Language**: Markdown + Vue.js components
- **Build Tool**: Vite
- **Deployment**: Static site hosted at https://dev.octeth.com

## Project Structure

### Root Directory
```
api-docs.octeth.com/
├── .vitepress/           # VitePress configuration
│   ├── config.mjs       # Main configuration file
│   ├── cache/           # Build cache
│   └── dist/            # Production build output
├── api-reference/       # Latest API documentation (symlink/copy of current version)
├── plugin-development/  # Plugin development documentation
├── public/              # Static assets (logos)
├── v5.5.x/             # Version 5.5.x documentation (legacy)
├── v5.6.x/             # Version 5.6.x documentation
├── v5.7.x/             # Version 5.7.x documentation (current)
├── index.md            # Homepage (redirects to current version)
├── merge-docs.js       # Utility to merge all docs into single file
├── package.json        # Node dependencies
├── README.md           # Development instructions
├── CLAUDE.md           # Project documentation for AI assistance
└── TASKS.md            # Task tracking for improvements
```

### Version Directories Structure
Each version directory (v5.5.x, v5.6.x, v5.7.x) contains:
```
v5.x.x/
├── api-reference/
│   ├── administrators.md     # Admin management endpoints
│   ├── criteria-syntax.md    # RulesJson criteria documentation
│   ├── custom-fields.md      # Custom field management
│   ├── email-campaigns.md    # Campaign management
│   ├── email-contents.md     # Email content management
│   ├── email-gateway.md      # Email gateway configuration
│   ├── events.md             # Event tracking (v5.6.x only)
│   ├── journey-actions.md    # Journey action management
│   ├── journeys.md           # Customer journey automation
│   ├── segments.md           # Audience segmentation
│   ├── sender-domains.md     # Sender domain configuration
│   ├── subscriber-lists.md   # List management
│   ├── subscribers.md        # Subscriber management
│   ├── suppression-lists.md  # Suppression list management
│   ├── system-management.md  # System configuration
│   ├── tags.md              # Tag management
│   └── users.md             # User management
├── plugin-development/
│   └── hook-reference.md     # Plugin hook documentation
├── authorization.md          # API authentication guide
├── error-handling.md         # Error codes and handling
├── getting-started.md        # Quick start guide
├── index.md                  # Version homepage
└── support.md               # Support information
```

## Key Configuration Details

### VitePress Configuration (.vitepress/config.mjs)
- **Site Title**: "Octeth Developer Portal"
- **Base URL**: https://dev.octeth.com
- **Theme**: Default VitePress theme with customizations
- **Search**: Local search provider enabled
- **Appearance**: Dark mode disabled
- **Analytics**: 
  - Fathom Analytics (site: HSMUHQVG)
  - PostHog (key: phc_ygHo6UNsJBeftPHqARO3gDFqYnsug63Xy5d9QW6cKEg)
- **Logo**: Dynamic (light/dark mode support)
- **Sitemap**: Generated with hostname https://dev.octeth.com

### Navigation Structure
- **Main Nav**:
  - Homepage
  - Version selector (v5.7.x current, v5.6.x, v5.5.x legacy)
  - Resources (Client Area, Help Portal, Contact)
- **Sidebar**: Auto-generated based on version with three main sections:
  1. Getting Started section
  2. API Reference section (all endpoints)
  3. Plugin Development section

## API Documentation Format

### Standard Endpoint Documentation Structure
Each API endpoint follows this format:
1. **Endpoint Title** with HTTP method badge
2. **Endpoint URL**: `/api.php`
3. **Description**: Brief explanation of the endpoint's purpose
4. **Request Body Parameters**: Table with Parameter, Description, Required columns
5. **Code Examples**: Using VitePress code groups with tabs for:
   - Example Request (cURL)
   - Success Response (JSON)
   - Error Response (JSON)
   - Error Codes (text list)

### Common API Patterns
- **Authentication**: SessionID or APIKey required for all endpoints
- **Commands**: All endpoints use a `Command` parameter (e.g., "Campaign.Create")
- **Response Format**: JSON responses with Success, ErrorCode, ErrorText fields
- **Base URL**: `https://<octeth-installation-domain>/api.php`

## Development Commands

### Local Development
```bash
npm run docs:dev
# Starts development server with hot reload
```

### Production Build
```bash
npm run docs:build
# Builds static site to .vitepress/dist/
```

### Preview Production Build
```bash
npm run docs:preview
# Preview built site locally
```

### Merge Documentation Utility
```bash
node merge-docs.js
# Merges all markdown files from v5.6.x into single merged-docs.md file
```

## Important Features & Considerations

### Version Management
- Multiple API versions maintained simultaneously (v5.5.x, v5.6.x, v5.7.x)
- Current version is v5.7.x
- Homepage automatically redirects to current version
- Each version has independent documentation set

### API Key Features
- **User Authentication**: User.Login endpoint for session management
- **Admin Authentication**: Admin.Login endpoint for admin sessions
- **API Keys**: Alternative to session-based auth
- **Two-Factor Authentication**: TFA support in login endpoints

### Documentation Features
- **Criteria Syntax**: Complex filtering system for segments, tags, journeys, fields
- **RulesJson**: JSON-based query language for advanced filtering
- **Hook Reference**: Extensibility through plugin system
- **Error Handling**: Standardized error codes across all endpoints

### External Resources
- **GitHub Repository**: https://github.com/octeth/octeth-api-docs
- **Client Area**: https://my.octeth.com/
- **Help Portal**: https://help.octeth.com/
- **Changelog**: https://help.octeth.com/whats-new

## Recent Updates (from git history)
- Updated criteria syntax documentation with new operators and aggregation parameters
- Enhanced journey API with 'JourneyCompleted' trigger option
- Standardized request body parameter formatting across endpoints
- Added campaign event filtering improvements

## Build & Deployment Notes
- Build output goes to `.vitepress/dist/`
- Site is configured for static hosting
- Sitemap automatically generated for SEO
- External links open with icon indicator
- Last updated timestamps shown on all pages

## Custom Components & Scripts
- **merge-docs.js**: Node.js utility to concatenate all documentation into single file
- **Homepage Redirect**: Vue component auto-redirects root to current version

## Creating a New Version - Step-by-Step Guide

When releasing a new version of the API documentation, follow these steps:

### 1. Copy Previous Version Directory
```bash
cp -r v5.6.x v5.7.x  # Replace with appropriate version numbers
```

### 2. Update VitePress Configuration
Edit `.vitepress/config.mjs`:

#### Update Navigation (nav section):
- Change the current version label to include "(Current)"
- Remove "(Current)" from the previous version
- Add the new version at the top of the version list

```javascript
items: [
    {text: 'v5.7.x (Current)', link: '/v5.7.x/'},
    {text: 'v5.6.x', link: '/v5.6.x/'},
    {text: 'v5.5.x', link: '/v5.5.x/'},
]
```

#### Add Sidebar Configuration:
- Copy the entire sidebar configuration from the previous version
- Update all paths to point to the new version directory
- Update the section title to reflect the new version

```javascript
'/v5.7.x/': [
    {
        text: 'OCTETH V5.7.X',
        // ... rest of configuration
    }
]
```

### 3. Update Homepage Redirect
Edit `index.md`:

#### Update action buttons:
```markdown
actions:
  - theme: brand
    text: Get Started
    link: /v5.7.x/getting-started
  - theme: alt
    text: API Reference
    link: /v5.7.x/api-reference/administrators
```

#### Update auto-redirect script:
```javascript
router.go('/v5.7.x/')  // Update to new version
```

### 4. Update Version Homepage
Edit `v5.7.x/index.md`:
- Update the hero name to reflect the new version
- Update all internal links to point to the new version path

### 5. Verify Setup
```bash
npm run docs:dev
```
Visit the development server to ensure:
- Homepage redirects to new version
- Navigation shows correct current version
- All sidebar links work properly
- Version selector displays all versions correctly

### 6. Update Documentation Files
Update CLAUDE.md to reflect the new version in:
- Project structure
- Navigation structure
- Version management section

### Notes
- The `api-reference/` directory in root can be updated to mirror the current version if needed
- Each version maintains its own complete documentation set
- Previous versions remain accessible but are no longer marked as current

## Working with Octeth Source Code

When creating or updating API documentation, we reference the actual Octeth source code located at:
- **Source Code Path**: `/Users/cemhurturk/Development/oempro/`
- **Documentation Reference**: `/Users/cemhurturk/Development/oempro/CLAUDE.md`
- **Additional Rules**: `/Users/cemhurturk/Development/oempro/.cursor/rules/*`

### Source Code Structure
The Octeth/Oempro codebase contains:
- **API Endpoints**: Located in `/includes/api/` directory
- **Frontend Controllers**: CodeIgniter controllers in `/includes/frontend/controllers/`
- **Backend System**: Laravel framework in `/system/` directory
- **Classes**: Core functionality in `/includes/classes/`
- **API Entrypoint**: Located in `api.php` and `/includes/classes/api.inc.php`. Each API endpoint is defined and registered in one of these files.

### Documentation Workflow
1. **Analyze Source**: Read actual API implementation from oempro codebase
2. **Understand Behavior**: Review code logic, parameters, and responses
3. **Create Documentation**: Write accurate API docs based on actual implementation
4. **Verify Accuracy**: Cross-reference with existing code and test cases

### Important Notes
- Always reference the actual source code for accurate documentation
- The oempro CLAUDE.md file contains development conventions and architecture details
- Check `.cursor/rules/` for additional coding standards and patterns
- Ensure documentation matches the actual implementation, not assumptions
- Do NOT make any code/file changes in the Octeth software project directory.

## Contact & Support
- **Support Email**: support@octeth.com, hello@octeth.com
- **Company**: 50SAAS LLC
- **Documentation Issues**: Report at https://github.com/octeth/octeth-api-docs/issues