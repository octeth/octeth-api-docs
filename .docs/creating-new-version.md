# Creating a New Version - Step-by-Step Guide

When releasing a new version of the documentation, follow these steps:

## 1. Copy Previous Version Directory

```bash
cp -r v5.6.x v5.7.x  # Replace with appropriate version numbers
```

## 2. Update VitePress Configuration

Edit `.vitepress/config.mjs`:

### Update Navigation (nav section):
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

### Add Sidebar Configuration:
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

## 3. Update Homepage Redirect

Edit `index.md`:

### Update action buttons:
```markdown
actions:
  - theme: brand
    text: Get Started
    link: /v5.7.x/getting-started
  - theme: alt
    text: API Reference
    link: /v5.7.x/api-reference/administrators
```

### Update auto-redirect script:
```javascript
router.go('/v5.7.x/')  // Update to new version
```

## 4. Update Version Homepage

Edit `v5.7.x/index.md`:
- Update the hero name to reflect the new version
- Update all internal links to point to the new version path

## 5. Verify Setup

```bash
npm run docs:dev
```

Visit the development server to ensure:
- Homepage redirects to new version
- Navigation shows correct current version
- All sidebar links work properly
- Version selector displays all versions correctly

## 6. Update Documentation Files

Update CLAUDE.md to reflect the new version in:
- Project structure
- Navigation structure
- Version management section

## Notes

- The `api-reference/` directory in root can be updated to mirror the current version if needed
- Each version maintains its own complete documentation set
- Previous versions remain accessible but are no longer marked as current
