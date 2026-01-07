# Octeth Help Portal Project Overview

## Project Description
This is the official help portal and documentation website for Octeth.com, an on-premise enterprise-grade email marketing software. The portal is built using VitePress and provides comprehensive documentation including installation guides, user guides, API reference, and developer resources for integrating with Octeth.

## Technology Stack
- **Framework**: VitePress v1.6.4
- **Language**: Markdown + Vue.js components
- **Build Tool**: Vite
- **Deployment**: Static site hosted at https://dev.octeth.com

## Project Structure

### Key Directories
- `.docs/` - Additional documentation and guides for AI assistance (SOPs, examples, version management)
- `.vitepress/` - VitePress configuration and build output
- `v5.x.x/` - Version-specific documentation (v5.5.x, v5.6.x, v5.7.x - current)
- `public/` - Static assets (logos, images)

### Version Directory Contents
Each version directory contains:
- `api-reference/` - API endpoint documentation (administrators, campaigns, journeys, subscribers, etc.)
- `plugin-development/` - Plugin hook reference
- `authorization.md` - API authentication guide
- `error-handling.md` - Error codes and handling
- `getting-started.md` - Quick start guide
- `index.md` - Version homepage
- `support.md` - Support information

### Additional Documentation in .docs/
- `sop-publishing-release.md` - Step-by-step process for publishing new releases
- `creating-new-version.md` - Guide for creating new version documentation
- `writing-standards-examples.md` - Detailed examples for writing standards

## Key Configuration Details

### VitePress Configuration (.vitepress/config.mjs)
- **Site Title**: "Octeth Help Portal"
- **Base URL**: https://dev.octeth.com
- **Theme**: Default VitePress theme with customizations
- **Search**: Local search provider enabled
- **Sitemap**: Automatically generated

### Navigation Structure
- **Main Nav**: Homepage, Version selector (v5.7.x current), Resources
- **Sidebar**: Auto-generated per version with Getting Started, API Reference, and Plugin Development sections

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
- **Authentication**: Multiple authentication methods and scopes
  - **Methods**: SessionID (temporary) or API Key (permanent)
  - **Scopes**: User scope or Admin scope
  - **Parameters**: 
    - User scope: `SessionID` or `APIKey`
    - Admin scope: `SessionID` or `AdminAPIKey`
- **Commands**: All endpoints use a `Command` parameter (e.g., "Campaign.Create")
- **Response Format**: JSON responses with Success, ErrorCode, ErrorText fields
- **Base URL**: `https://<octeth-installation-domain>/api.php`
- **Alternative Format**: Some admin endpoints use `/api/v1/` with Bearer token authentication

### Important Parameter Casing
API parameters often use specific casing that must be matched exactly:
- **Login endpoints**: Use lowercase for special parameters
  - `apikey` (not APIKey) for User.Login with API key
  - `adminapikey` (not AdminAPIKey) for Admin.Login
  - `tfacode` (not TFACode) for two-factor authentication
  - `tfarecoverycode` for 2FA recovery
  - `disablecaptcha` to bypass captcha
- **Most other endpoints**: Use PascalCase for field names
  - `SubscriberListName` (not subscriberlistname)
  - `EmailAddress`, `FirstName`, `LastName`, etc.
- **Always verify**: Check the actual PHP implementation files for correct parameter names

## Development Commands

See `package.json` for all available commands. Key commands:
- `npm run docs:dev` - Start development server with hot reload
- `npm run docs:build` - Build static site to .vitepress/dist/
- `npm run docs:preview` - Preview production build locally

## Important Features & Considerations

### Version Management
- Multiple API versions maintained simultaneously (v5.5.x, v5.6.x, v5.7.x)
- Current version is v5.7.x
- Homepage automatically redirects to current version
- Each version has independent documentation set

### API Authentication System

#### Authentication Methods
1. **Session ID** (Temporary)
   - Obtained via `User.Login` or `Admin.Login` endpoints
   - Expires after inactivity period
   - Suitable for interactive applications

2. **API Key** (Permanent)
   - **User API Key**: Created in User Dashboard > Settings > API Keys
   - **Admin API Key**: Found in Admin > Settings > Account > API tab
   - Never expires unless manually revoked
   - Recommended for automation and integrations

#### Authentication Scopes
1. **User Scope**
   - Access to user-level operations (lists, campaigns, subscribers)
   - Parameters: `SessionID` or `APIKey`
   
2. **Admin Scope**
   - Access to system-level operations (user management, system settings)
   - Parameters: `SessionID` or `AdminAPIKey`

#### Authentication Formats
1. **Standard Format** (`/api.php`)
   - Use form data with authentication parameter
   - Example: `APIKey=xxx` or `AdminAPIKey=xxx`

2. **Bearer Token Format** (`/api/v1/`)
   - Some admin endpoints use Bearer authentication
   - Example: `Authorization: Bearer xxx`

#### Additional Features
- **Two-Factor Authentication**: TFA support in login endpoints
- **Response Format**: Always includes `ResponseFormat="JSON"` parameter
- **Captcha**: Can be disabled with `DisableCaptcha=true` parameter
- **Password Masking**: User.Login response masks password as `****** masked ******`

### Documentation Features
- **Criteria Syntax**: Complex filtering system for segments, tags, journeys, fields
- **RulesJson**: JSON-based query language for advanced filtering
- **Hook Reference**: Extensibility through plugin system
- **Error Handling**: Standardized error codes across all endpoints

### External Resources
- **GitHub Repository**: https://github.com/octeth/octeth-api-docs
- **Client Area**: https://my.octeth.com/
- **Help Portal**: https://help.octeth.com/

## Creating New Versions

For detailed instructions on creating a new version of the documentation, see `.docs/creating-new-version.md`.

## Help Article Writing Standards

When creating or updating help articles (particularly in the `getting-started/` directories), follow these standards to ensure consistency, security, and quality across all documentation.

### Security & Privacy Guidelines

**CRITICAL**: Never include real personal information in documentation examples.

- **Names**: Use generic placeholders like "John Doe", "Jane Smith", or "Your Name"
- **Email Addresses**: Use example.com domain: "admin@example.com", "user@example.com"
- **IP Addresses**: Use reserved TEST-NET ranges (RFC 5737):
  - Primary example: `203.0.113.10` (from TEST-NET-3: 203.0.113.0/24)
  - Secondary example: `203.0.113.20`
  - Never use real production IP addresses
- **Passwords**: Use obvious placeholders: "YourSecurePassword123", "your-password-here"
- **API Keys**: Use placeholder format: "your-api-key-here", "sk_xxxxxxxxxxxxx"
- **License Keys**: Use placeholder format with masked characters
- **SSH Keys**: Reference as "Your SSH key" or "your-ssh-key-name"
- **Server Names**: Use generic names: "octeth-server", "octeth-link-proxy"
- **Provider Details**: Avoid company-specific details unless necessary for the tutorial

::: danger Never Commit Sensitive Information
Real credentials, IP addresses, names, or other personal information must NEVER appear in documentation. Always use placeholder values from reserved ranges.
:::

### Writing Style Standards

Maintain a consistent, professional tone across all documentation:

**Do:**
- ✓ Use imperative mood (command form): "Install the package", "Configure the server"
- ✓ Use second person ("you") when addressing the reader: "You will need to configure..."
- ✓ Be professional, clear, and concise
- ✓ Write for intermediate technical users - explain concepts but don't over-explain
- ✓ Use active voice: "The installer creates..." rather than "The installation is created by..."
- ✓ Use present tense for describing what happens: "This command starts the service"

**Don't:**
- ✗ Use first-person narrative: "I will install...", "We will configure..."
- ✗ Use passive voice unnecessarily: "The server should be configured..."
- ✗ Include personal anecdotes or experiences
- ✗ Use colloquial language or slang
- ✗ Leave steps unexplained

For detailed examples, see `.docs/writing-standards-examples.md`.

### Document Structure Standards

Every help article must follow this structure:

1. **Frontmatter** (required)
   ```markdown
   ---
   layout: doc
   ---
   ```

2. **Title** (H1 - one per document)
   ```markdown
   # Page Title
   ```

3. **Introduction Paragraph**
   - Brief explanation (2-4 sentences) of what this section covers
   - Set expectations for what the user will accomplish
   - Mention prerequisites if any

4. **Section Headings** (H2 for main sections, H3 for subsections)
   ```markdown
   ## Main Section
   ### Subsection
   ```

5. **Command Examples with Context**
   - Always explain what a command does BEFORE showing it
   - Show the command in a code block with proper syntax highlighting
   - Explain the expected outcome AFTER the command when helpful

6. **VitePress Components** (use appropriately)
   - Tips, warnings, and other contextual information

7. **Next Steps or Conclusion** (when applicable)
   - Link to related documentation
   - Suggest what to do next

**NO Empty Files**: Every file must have meaningful content. If a section isn't ready, don't create an empty file.

### VitePress Components Usage

Use VitePress custom containers to highlight important information:

```markdown
::: tip Best Practice
Use this for helpful suggestions and recommended approaches.
:::

::: info Additional Context
Use this for supplementary information that provides context.
:::

::: warning Important
Use this for important cautions that could lead to issues if ignored.
:::

::: danger Critical Warning
Use this for critical warnings about data loss, security risks, or irreversible actions.
:::
```

**When to Use Each:**

- **`::: tip`**: Best practices, optimization suggestions, helpful shortcuts
- **`::: info`**: Background information, architectural explanations, context
- **`::: warning`**: Important cautions, potential issues, things to remember
- **`::: danger`**: Data loss warnings, security risks, irreversible operations

### Code Examples Standards

All code examples must follow these guidelines:

1. **Specify Language** for syntax highlighting:
   ```markdown
   ```bash
   apt install docker
   ```

   ```javascript
   const server = require('express')()
   ```

   ```json
   {"key": "value"}
   ```
   ```

2. **Use Full Paths** in commands:
   ```bash
   # Good
   /opt/octeth/cli/octeth.sh health:check

   # Avoid (unless context is clear)
   ./octeth.sh health:check
   ```

3. **Include Comments** for complex commands:
   ```bash
   # Add Docker repository to apt sources
   echo "deb [arch=$(dpkg --print-architecture)] https://..." | tee /etc/apt/sources.list.d/docker.list
   ```

4. **Show Expected Output** when helpful:
   ```bash
   ls -la /opt/octeth/
   ```

   Output:
   ```
   drwxr-xr-x  5 root root 4096 Jan  1 12:00 cli
   drwxr-xr-x  3 root root 4096 Jan  1 12:00 config
   ```

5. **Test All Commands** before publishing - ensure they work and produce expected results

6. **Use Placeholder Values** consistently:
   - IP: `203.0.113.10`
   - Email: `admin@example.com`
   - Password: `YourSecurePassword123`
   - Domain: `octeth.example.com`

### Consistency Requirements

Maintain consistency across all documentation:

1. **Terminology**
   - Use the same term for the same concept throughout
   - Example: "server" not "machine" or "VM" interchangeably
   - Create a glossary for project-specific terms

2. **Placeholder Values**
   - Use the same placeholder values across all documents
   - See "Security & Privacy Guidelines" for standard placeholders

3. **File Naming**
   - Use lowercase with hyphens (kebab-case)
   - Examples: `server-setup.md`, `octeth-installation.md`
   - Not: `ServerSetup.md`, `octeth_installation.md`

4. **Command Format**
   - Always show full paths in examples
   - Be consistent with command options format (-v vs --verbose)

5. **Cross-References**
   - Link to related sections when mentioning them
   - Use relative paths: `[Server Setup](./server-setup)`
   - Keep links updated when reorganizing content

### Quality Checklist

Before publishing any help article, verify:

- [ ] **No personal/sensitive information present** (names, real emails, real IPs, passwords, API keys)
- [ ] **Consistent imperative writing style** (no first-person narrative)
- [ ] **Frontmatter included** with `layout: doc`
- [ ] **H1 title** at the top (only one per document)
- [ ] **Introduction paragraph** explaining what the section covers
- [ ] **All commands tested and working** with expected outcomes
- [ ] **VitePress components used appropriately** (tips, warnings, danger boxes)
- [ ] **Code blocks have language specified** (```bash, ```javascript, etc.)
- [ ] **Cross-references updated** and working
- [ ] **File has meaningful content** (no empty placeholder files)
- [ ] **Follows document structure standards** (intro, sections, examples, conclusion)
- [ ] **Terminology consistent** with other documentation
- [ ] **Placeholder values match** standards (TEST-NET IPs, example.com emails)
- [ ] **Commands use full paths** where applicable
- [ ] **Explanatory text** provided before/after commands

### Common Mistakes to Avoid

1. **Using first-person narrative**: "I will create a server..." → "Create a server..."
2. **Including real personal data**: Use placeholders from reserved ranges
3. **Empty or stub files**: Only create files with complete content
4. **Inconsistent terminology**: Pick one term and use it throughout
5. **Commands without context**: Always explain what a command does
6. **Missing VitePress components**: Use tips/warnings where appropriate
7. **Untested commands**: All commands must be verified before publishing
8. **Mixing writing styles**: Maintain imperative/instructional tone throughout

## Working with Octeth Source Code

When creating or updating API documentation, we reference the actual Octeth source code located at:
- **Source Code Path**: `/Users/cemhurturk/Development/oempro/`
- **Documentation Reference**: `/Users/cemhurturk/Development/oempro/CLAUDE.md`
- **Additional Rules**: `/Users/cemhurturk/Development/oempro/.cursor/rules/*`

### Source Code Structure
The Octeth/Oempro codebase contains:
- **API Endpoints**: `/includes/api/` directory
- **API Entrypoint**: `api.php` and `/includes/classes/api.inc.php`
- **Frontend Controllers**: `/includes/frontend/controllers/`
- **Backend System**: `/system/` (Laravel)
- **Classes**: `/includes/classes/`

### Documentation Workflow
1. Read actual API implementation from oempro codebase
2. Review code logic, parameters, and responses
3. Write accurate API docs based on actual implementation
4. Verify accuracy with existing code

### Important Notes
- Always reference actual source code for accurate documentation
- Review oempro CLAUDE.md and `.cursor/rules/` for conventions
- Ensure documentation matches implementation, not assumptions
- Do NOT make any code/file changes in the Octeth software project directory

## Changelog Writing Standards

When creating or updating changelog/release notes (particularly in version directories like `v5.7.2/changelog.md`), follow these standards to ensure consistency, clarity, and user-friendliness across all documentation.

### Document Structure

Every changelog must follow this structure:

1. **Frontmatter** (required)
   ```markdown
   ---
   layout: doc
   title: What's New in Octeth v5.7.x
   description: Release notes for Octeth v5.7.x - Brief highlights
   ---
   ```

2. **Security Alert** (if applicable - use VitePress danger component)
   ```markdown
   ::: danger Critical Security Update
   This release includes fixes for [vulnerability type]. **Immediate upgrade recommended.**
   :::
   ```

3. **Release Summary** (required)
   - Release date
   - Development period
   - Upgrade impact level (Low/Medium/High)
   - Breaking changes indicator
   - Brief 2-3 sentence overview

4. **"Should You Upgrade?" Table** (required for major releases)
   - Priority levels: 🔴 URGENT, 🟡 RECOMMENDED, 🟢 BENEFICIAL
   - Target audience segments
   - Clear reasoning

5. **Table of Contents** (use VitePress auto-TOC)
   ```markdown
   [[toc]]
   ```

6. **Top New Features** (3-5 highlighted features)
   - "What's New" - Brief description
   - "Why It Matters" - Business value
   - "Use Case Example" - Practical scenario
   - "How to Use" - Code examples with proper syntax highlighting
   - Links to detailed documentation

7. **Security Fixes** (if applicable - separate prominent section)
   - Use `::: danger` for critical security issues
   - List affected components
   - Explain resolution approach

8. **Performance Improvements** (grouped logically)
   - Use `::: tip` for best practices
   - Include code examples where helpful
   - Quantify improvements when possible

9. **Bug Fixes** (grouped by category)
   - Campaign & Email Fixes
   - Journey & Workflow Fixes
   - Configuration & Environment Fixes
   - Use checkmark bullets (✅)

10. **Upgrade Guide** (comprehensive step-by-step)
    - Prerequisites checklist
    - Numbered steps with explanations
    - Expected outputs for verification
    - "What this does" explanations
    - Troubleshooting section with `<details>` collapsibles
    - Rollback procedure with data loss warnings

11. **Migration Notes** (technical details)
    - Database changes
    - Environment variables
    - API changes
    - Docker/infrastructure updates

12. **Developer Resources** (for technical audience)
    - Testing instructions
    - Debugging tools
    - Code quality standards
    - Documentation requirements

13. **Additional Resources & Support** (links)

14. **Previous Versions** (preserved in full)
    - All older version changelogs included
    - Maintain original formatting

### Writing Style

**Do:**
- ✓ Use imperative mood for instructions: "Backup your database", "Run migrations"
- ✓ Use active voice: "This release fixes..." not "Fixes have been made..."
- ✓ Be professional, clear, and concise
- ✓ Focus on user impact and business value
- ✓ Use present tense for current state: "This release includes..."
- ✓ Target multiple audiences: end users, admins, developers
- ✓ Quantify improvements: "10x faster", "95% reduction"
- ✓ Use visual hierarchy with emojis sparingly (🎯 🔐 ⚡ 🐛 🐳)

**Don't:**
- ✗ Use first-person narrative: "I upgraded...", "We improved..."
- ✗ Include overly technical jargon without explanation
- ✗ Bury critical security information
- ✗ Make assumptions about user technical knowledge
- ✗ Use vague terms: "various improvements", "minor fixes"

### VitePress Components Usage

Use VitePress custom containers appropriately:

```markdown
::: danger Critical Warning
Use for security vulnerabilities, data loss risks, breaking changes that require immediate action.
:::

::: warning Important
Use for important upgrade considerations, configuration changes, potential issues.
:::

::: tip Best Practice
Use for recommended approaches, optimization suggestions, helpful shortcuts.
:::

::: info Additional Context
Use for background information, architectural explanations, supplementary details.
:::
```

**Collapsible Sections:**
```markdown
<details>
<summary><strong>Click to expand troubleshooting</strong></summary>

Content here...
</details>
```

### Security & Privacy Standards

**CRITICAL:** Never include real personal information in changelog examples.

- **Placeholder Values:**
  - API Keys: `your-api-key-here`, `sk_xxxxxxxxxxxxx`
  - Passwords: `YourSecurePassword123`, `your-password-here`
  - Email: `admin@example.com`, `user@example.com`
  - IP Addresses: Use TEST-NET ranges (`203.0.113.10`)
  - Server Names: `octeth-server`, `octeth.example.com`

### Code Examples Standards

1. **Always specify language** for syntax highlighting:
   ```markdown
   ```bash
   ./cli/octeth.sh health:check
   ```

   ```javascript
   const config = { ... }
   ```

   ```php
   $list = Lists::GetListByID($listID);
   ```
   ```

2. **Include "What this does" explanations**:
   ```markdown
   This command updates your database schema to support new v5.7.2 features:

   ```bash
   docker exec oempro_app bash -c "cd /var/www/html/cli/ && php5.6 dbmigrator.php migrate"
   ```

   **What this does:**
   - Adds composite index on Journeys table
   - Updates AuthToken handling schema
   - Adds campaign batch profiling support
   ```

3. **Show expected outputs**:
   ```markdown
   **Expected output:**
   ```
   Running migration 001_journey_composite_index.php... ✓
   All migrations completed successfully.
   ```
   ```

4. **Use full paths** in commands:
   ```bash
   # Good
   /opt/octeth/cli/octeth.sh health:check

   # Acceptable if context is clear
   ./cli/octeth.sh health:check
   ```

### Upgrade Guide Requirements

Every major/minor release must include:

1. **Prerequisites Checklist**
   - [ ] Server access requirements
   - [ ] Backup requirements
   - [ ] Time window requirements
   - [ ] Configuration review requirements

2. **Step-by-Step Instructions**
   - Number each step clearly
   - Explain what each step does BEFORE the command
   - Show expected outputs AFTER the command
   - Include verification steps

3. **Troubleshooting Section**
   - Common issues in collapsible `<details>` blocks
   - Symptoms clearly stated
   - Solutions with commands
   - When to contact support

4. **Rollback Procedure**
   - Include `::: danger` warning about data loss
   - Step-by-step rollback commands
   - When rollback is/isn't appropriate

### Audience Segmentation

Target content for specific audiences:

- **👤 End Users** - Focus on features, UI changes, business value
- **⚙️ System Admins** - Infrastructure, configuration, deployment
- **🔧 Developers** - API changes, code quality, testing tools

Use audience indicators or separate sections for different groups.

### Content Organization

**Progressive Disclosure:**
- Put critical information (security, breaking changes) at the top
- Use collapsible sections for detailed technical content
- Highlight top 3-5 features prominently
- Collapse full technical changelog into `<details>` section

**Scannable Format:**
- Use tables for comparison data
- Use checkboxes for task lists
- Use bullet points for lists
- Use bold for key terms
- Use code blocks for commands
- Use headings for clear hierarchy

### Version History Preservation

**IMPORTANT:** Never remove older version changelogs.

- All previous versions must remain in the changelog file
- Maintain original formatting for older versions
- Create separate pages if file becomes too large (5000+ lines)
- Link between related version pages

### Consistency Requirements

1. **Terminology** - Use consistent terms throughout
   - "Upgrade" vs "Update" - pick one
   - "Docker container" not "docker image" interchangeably
   - "Environment variable" not "env var" inconsistently

2. **Placeholder Values** - Use same examples throughout
   - IP: `203.0.113.10` (TEST-NET-3)
   - Email: `admin@example.com`
   - Domain: `octeth.example.com`

3. **Date Format** - Consistent date formatting
   - Release dates: "January 3, 2026"
   - Command outputs: "20260103_120000"

4. **Version References** - Consistent version numbering
   - v5.7.2 (with 'v' prefix)
   - Octeth v5.7.2 (in titles)

### Quality Checklist

Before publishing, verify:

- [ ] **Frontmatter complete** with title and description
- [ ] **Security alerts prominent** if applicable
- [ ] **"Should You Upgrade?" table** present for major releases
- [ ] **Top features highlighted** with use cases and examples
- [ ] **Upgrade guide comprehensive** with prerequisites, steps, troubleshooting
- [ ] **All code examples tested** with correct syntax highlighting
- [ ] **Placeholder values used** (no real credentials/IPs/names)
- [ ] **VitePress components used** appropriately (tip, warning, danger, info)
- [ ] **All older versions preserved** in full
- [ ] **Links verified** and working
- [ ] **Consistent terminology** throughout
- [ ] **No first-person narrative** (no "I", "we")
- [ ] **Clear audience targeting** for different user types
- [ ] **Expected outputs shown** for commands
- [ ] **Rollback procedure included** with warnings

### Common Mistakes to Avoid

1. **Removing older versions** - Never delete previous version changelogs
2. **Burying security fixes** - Always put security issues prominently at top
3. **Missing upgrade impact** - Users need to know: Low/Medium/High impact
4. **No rollback procedure** - Always include emergency rollback steps
5. **Vague descriptions** - "Various improvements" → Specific improvements listed
6. **Missing prerequisites** - Users need to know requirements BEFORE starting
7. **No expected outputs** - Show what success looks like for each step
8. **Inconsistent placeholder values** - Use same examples throughout document
9. **Wall of text** - Use tables, bullets, code blocks, collapsibles for scannability
10. **Missing troubleshooting** - Include common issues and solutions

### File Location

Changelogs should be located at `/vX.X.X/changelog.md`

For detailed changelog structure examples, see `.docs/writing-standards-examples.md`.

## Standard Operating Procedures (SOPs)

For detailed SOPs including publishing new releases, see `.docs/sop-publishing-release.md`.

## Contact & Support
- **Support Email**: support@octeth.com, hello@octeth.com
- **Company**: 50SAAS LLC
- **Documentation Issues**: Report at https://github.com/octeth/octeth-api-docs/issues