# Creating a New Version - Step-by-Step Guide

When releasing a new version of the documentation, follow these steps:

## 1. Copy Previous Version Directory

```bash
cp -r v5.6.x v5.7.x  # Replace with appropriate version numbers
```

## 2. Update VitePress Configuration

Edit `.vitepress/config.mjs`:

### Update Navigation (nav section):
- Add the new version at the top of the version list with the label "(In development)"
- Leave `CURRENT_VERSION` at the top of the file on the released version. The menu adds "(Current)" to that version automatically

```javascript
items: [
    {text: 'v6.0.7 (In development)', link: '/v6.0.7/'},
    {text: 'v6.0.6', link: '/v6.0.6/'},
]
```

### On Release Day
- Set `CURRENT_VERSION` in `.vitepress/config.mjs` to the released version
- Remove "(In development)" from its menu item
- Point the two hero links and the fallback path in `index.md` at the released version

Versions that leave the `BUILT_VERSIONS` window get redirect stubs at build time (see `buildEnd` in `config.mjs`), so their old URLs keep working. Link to a released version's `behavior-changes` page from `changelog.md` only while it is built. After it leaves the window, the stub sends readers to the page's source on GitHub.

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
