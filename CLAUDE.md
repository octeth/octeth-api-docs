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
├── v5.5.x/             # Version 5.5.x documentation
├── v5.6.x/             # Version 5.6.x documentation (current)
├── index.md            # Homepage (redirects to current version)
├── merge-docs.js       # Utility to merge all docs into single file
├── package.json        # Node dependencies
└── README.md           # Development instructions
```

### Version Directories Structure
Each version directory (v5.5.x, v5.6.x) contains:
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
  - Version selector (v5.6.x current, v5.5.x legacy)
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
- Multiple API versions maintained simultaneously (v5.5.x, v5.6.x)
- Current version is v5.6.x
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

## Contact & Support
- **Support Email**: support@octeth.com, hello@octeth.com
- **Company**: 50SAAS LLC
- **Documentation Issues**: Report at https://github.com/octeth/octeth-api-docs/issues