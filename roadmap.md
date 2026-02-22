---
layout: doc
title: Octeth Product Roadmap
description: Track Octeth version releases, development status, and upcoming features
---

# Octeth Product Roadmap

This roadmap shows all past and upcoming Octeth releases. Use this page to track version history, plan upgrades, and see what's coming next.

::: tip Current Version
The latest stable release is **v5.8.0** (released February 15th, 2026). [View changelog](./changelog) to see what's new.
:::

## Understanding Version Numbers

Octeth uses semantic versioning:

- **Major releases** (v5.0.0, v6.0.0) - Significant new features and architectural changes
- **Minor releases** (v5.7.0) - New features and improvements, backward compatible
- **Patch releases** (v5.7.1, v5.7.2) - Bug fixes and minor enhancements

## Release Status Guide

Each version has a status badge indicating its current state:

| Status                                                   | Meaning                                                              |
|----------------------------------------------------------|----------------------------------------------------------------------|
| <Badge type="tip" text="Released" />                     | Stable version available for production use                          |
| <Badge type="warning" text="Collecting User Feedback" /> | Release candidate - testing with select users before general release |
| <Badge type="warning" text="Under Development" />        | Actively being developed - not yet available                         |

## Version History

[Click here](./changelog) to view detailed release notes for each version.

| Version |                          Status                          | Release Date   | Key Highlights                                       |
|---------|:--------------------------------------------------------:|----------------|------------------------------------------------------|
| v5.0.0  |           <Badge type="tip" text="Released" />           | Jan 3rd, 2022  | Initial v5 release                                   |
| v5.0.1  |           <Badge type="tip" text="Released" />           | May 2nd, 2022  | Email content spinning, CTR retention cohort         |
| v5.0.2  |           <Badge type="tip" text="Released" />           | Aug 17th, 2022 | Multi-role sub-admin accounts, campaign cloning      |
| v5.0.3  |           <Badge type="tip" text="Released" />           | Oct 3rd, 2022  | Improved personalization, delivery metrics           |
| v5.1.0  |           <Badge type="tip" text="Released" />           | Dec 26th, 2022 | Sender domain management, fallback personalization   |
| v5.1.1  |           <Badge type="tip" text="Released" />           | Mar 14th, 2023 | Link proxy add-on, bounce catcher                    |
| v5.5.0  |           <Badge type="tip" text="Released" />           | Apr 22nd, 2024 | Website event tracking, journey metrics              |
| v5.5.1  |           <Badge type="tip" text="Released" />           | Jun 24th, 2024 | Revenue calculation, Drip importer                   |
| v5.5.2  |           <Badge type="tip" text="Released" />           | Jul 30th, 2024 | New journey triggers, HAProxy SSL automation         |
| v5.5.3  |           <Badge type="tip" text="Released" />           | Aug 16th, 2024 | Segment management UI, RulesJSON                     |
| v5.5.4  |           <Badge type="tip" text="Released" />           | Aug 23rd, 2024 | Website event improvements, ClickHouse access        |
| v5.5.5  |           <Badge type="tip" text="Released" />           | Sep 21st, 2024 | One-click sender domain DNS setup                    |
| v5.6.0  |           <Badge type="tip" text="Released" />           | Mar 30th, 2025 | MySQL 8.0 upgrade, A/B testing, Event API            |
| v5.7.0  |           <Badge type="tip" text="Released" />           | Dec 1st, 2025  | Journey builder enhancements, Redis caching          |
| v5.7.1  |           <Badge type="tip" text="Released" />           | Dec 4th, 2025  | Google Postmaster integration, auto-resend campaigns |
| v5.7.2  |           <Badge type="tip" text="Released" />           | Dec 29th, 2025 | Multi-tag journey triggers, critical security fixes  |
| v5.7.3  |           <Badge type="tip" text="Released" />           | Jan 3rd, 2026  | Stuck campaign detector, security hardening          |
| v5.8.0  |           <Badge type="tip" text="Released" />           | Feb 15th, 2026 | Redesigned campaign creation, Caddy TLS, natural language segments |
| v5.9.0  |    <Badge type="warning" text="Under Development" />     | March 2026     | TBA                                                  |
| v6.0.0  |    <Badge type="warning" text="Under Development" />     | Early Q2 2026  | Major architecture updates                           |

::: info What's Next?
**v5.9.0** is currently under development with new features and improvements planned.

**v6.0.0** is a major release under active development with significant platform improvements planned.
:::

## Release Schedule

Octeth follows this general release cadence:

- **Patch releases** (v5.7.x) - As needed for bug fixes and minor improvements
- **Minor releases** (v5.x.0) - Every 3-6 months with new features
- **Major releases** (v6.0.0) - Annually with significant platform updates
