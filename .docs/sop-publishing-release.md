# SOP: Publishing a New Octeth Release

This SOP defines the complete process for publishing a new Octeth version release to the help portal. Follow these steps in order to ensure consistency and completeness.

## Prerequisites

Before starting the release publishing process:

1. **Source Changelog Available**: Ensure the source changelog exists at `/Users/cemhurturk/Development/oempro/.docs/changelog_vXXX.md`
2. **Version Documentation Created**: Version directory (e.g., `v5.7.3/`) must exist with all necessary documentation files
3. **Release Information**: Confirm the exact release date, version number, and key highlights

## Step 1: Read Source Materials

```bash
# Read the source changelog from Octeth/Oempro repository
Read: /Users/cemhurturk/Development/oempro/.docs/changelog_vXXX.md

# Read current changelog and roadmap files
Read: /Users/cemhurturk/Development/api-docs.octeth.com/vX.X.X/changelog.md
Read: /Users/cemhurturk/Development/api-docs.octeth.com/vX.X.X/roadmap.md
```

## Step 2: Update Changelog

Transform the source changelog into the api-docs format following the **Changelog Writing Standards** section in CLAUDE.md.

**Key Requirements:**
1. **Frontmatter**: Update title and description for new version
2. **Release Summary**: Include release date, development period, upgrade impact, breaking changes
3. **Should You Upgrade Table**: Priority levels (🔴 URGENT, 🟡 RECOMMENDED, 🟢 BENEFICIAL)
4. **Top New Features**: 3-5 highlighted features with "What's New", "Why It Matters", "Use Case Example", "How to Use"
5. **Security Fixes**: Separate prominent section if applicable
6. **Performance Improvements**: Grouped improvements
7. **Bug Fixes**: Categorized by type
8. **Complete Change List**: Collapsible `<details>` section
9. **Upgrade Guide**: Comprehensive step-by-step with prerequisites, troubleshooting, rollback
10. **Migration Notes**: Database, configuration, API, Docker changes
11. **For Developers**: Testing instructions, code examples, standards
12. **Previous Versions**: Preserve all older version changelogs in full

**File Location:**
```
/vX.X.X/changelog.md
```

**Edit Process:**
```bash
# Update the title and add new version section at the top
Edit: /Users/cemhurturk/Development/api-docs.octeth.com/vX.X.X/changelog.md

# Add new v5.7.3 content BEFORE the "## v5.7.2" section
# Preserve all previous versions below
```

## Step 3: Update Roadmap

Update the roadmap to reflect the new release status.

**Changes Required:**

1. **Update "Current Version" tip**:
   ```markdown
   ::: tip Current Version
   The latest stable release is **vX.X.X** (released [Date]). [View changelog](./changelog) to see what's new.
   :::
   ```

2. **Add version to table**:
   ```markdown
   | vX.X.X  | <Badge type="tip" text="Released" /> | [Date] | [Key highlights] |
   ```

3. **Update "What's Next?" section**:
   ```markdown
   ::: info What's Next?
   **vX.X.X+1** is currently in testing with select users. We're collecting feedback before the general release.

   **v6.0.0** is a major release under active development with significant platform improvements planned.
   :::
   ```

**File Location:**
```
/vX.X.X/roadmap.md
```

**Edit Process:**
```bash
# Update current version tip
Edit: /Users/cemhurturk/Development/api-docs.octeth.com/vX.X.X/roadmap.md

# Add new version row to version history table
Edit: /Users/cemhurturk/Development/api-docs.octeth.com/vX.X.X/roadmap.md

# Update "What's Next?" section
Edit: /Users/cemhurturk/Development/api-docs.octeth.com/vX.X.X/roadmap.md
```

## Step 4: Quality Assurance Checklist

Before finalizing, verify the changelog meets all standards:

**Changelog Quality Checklist:**
- [ ] Frontmatter complete with title and description
- [ ] Security alerts prominent if applicable
- [ ] "Should You Upgrade?" table present
- [ ] Top features highlighted with use cases and examples
- [ ] Upgrade guide comprehensive with prerequisites, steps, troubleshooting
- [ ] All code examples have correct syntax highlighting (```bash, ```json, etc.)
- [ ] Placeholder values used (no real credentials/IPs/names)
- [ ] VitePress components used appropriately (::: tip, ::: warning, ::: danger, ::: info)
- [ ] All older versions preserved in full
- [ ] Consistent terminology throughout
- [ ] No first-person narrative (no "I", "we")
- [ ] Clear audience targeting (users, admins, developers)
- [ ] Expected outputs shown for commands
- [ ] Rollback procedure included with warnings

**Roadmap Quality Checklist:**
- [ ] Current version tip updated with correct version and date
- [ ] New version added to version history table with Released badge
- [ ] Key highlights accurate and concise (max 60 chars)
- [ ] "What's Next?" section updated to reflect next version in testing
- [ ] Date format consistent (e.g., "Jan 3rd, 2026")

## Step 5: Document Verification

**Verify all links work:**
```markdown
# Check internal links
[View changelog](./changelog)  # Should point to same directory
[Learn more →](/vX.X.X/api-reference/...)  # Should use full path

# Verify version references
All version numbers should match (v5.7.3 throughout)
```

**Verify code examples:**
- All bash code blocks use ```bash
- All JSON code blocks use ```json
- All PHP code blocks use ```php
- Configuration examples properly formatted

**Verify VitePress components:**
- Security warnings use `::: danger`
- Important notes use `::: warning`
- Best practices use `::: tip`
- Additional context uses `::: info`
- Collapsible sections use `<details>` and `<summary>` tags

## Step 6: Final Review

**Read the updated files completely:**
```bash
# Review changelog
Read: /Users/cemhurturk/Development/api-docs.octeth.com/vX.X.X/changelog.md

# Review roadmap
Read: /Users/cemhurturk/Development/api-docs.octeth.com/vX.X.X/roadmap.md
```

**Checklist for Final Review:**
- [ ] Version numbers consistent throughout all documents
- [ ] Release dates match across changelog and roadmap
- [ ] Previous versions preserved intact in changelog
- [ ] No placeholder text (e.g., "TBA", "TODO") in released sections
- [ ] All sections complete and properly formatted
- [ ] No first-person narrative or casual language

## Step 7: Build and Test (Optional)

If requested by user, test the documentation locally:

```bash
# Navigate to project
cd /Users/cemhurturk/Development/api-docs.octeth.com

# Start dev server
npm run docs:dev

# Visit http://localhost:5173 to verify
# - Changelog renders correctly
# - Roadmap shows correct status
# - All links work
# - Code blocks have syntax highlighting
# - VitePress components render properly
```

## Common Issues and Solutions

**Issue: Old version content accidentally removed**
- **Solution**: Never delete previous version sections. Always add new version at the top.

**Issue: Inconsistent version numbers**
- **Solution**: Use search to verify all version references match (e.g., v5.7.3)

**Issue: Missing VitePress components**
- **Solution**: Review security fixes, important notes, and tips - ensure they use proper components

**Issue: Code blocks missing syntax highlighting**
- **Solution**: Verify all code blocks specify language: ```bash, ```json, ```php

**Issue: Placeholder values contain real data**
- **Solution**: Replace with standard placeholders:
  - IP: `203.0.113.10`
  - Email: `admin@example.com`
  - Domain: `octeth.example.com`
  - API Key: `your-api-key-here`

## Completion Criteria

The release publishing process is complete when:

1. ✅ Changelog updated with comprehensive new version section
2. ✅ Roadmap updated with new version as "Released"
3. ✅ All quality checklists verified
4. ✅ Previous version content preserved intact
5. ✅ No placeholder or real personal data present
6. ✅ All documentation standards followed
7. ✅ User confirms completion or review

## Post-Publication Steps (Optional)

If requested:
- Build production site: `npm run docs:build`
- Deploy to hosting: Follow deployment procedures
- Announce release: Notify users via appropriate channels
- Monitor feedback: Watch for user questions or issues
