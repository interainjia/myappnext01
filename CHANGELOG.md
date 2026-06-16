# Changelog

All notable changes to this project will be documented in this file.

---

## [1.2.0] — 2026-06-16 — Version tracking & company font

### Features
- **Release Notes page**: Added `/changelog` page with vertical timeline UI — displays all versions, dates, and categorised change entries (Feature / Fix / Security / Chore / Docs).
- **App version display**: Version number now shown in login page footer and user dropdown menu, both reading from `package.json` via `NEXT_PUBLIC_APP_VERSION`. Dropdown version number links directly to the Release Notes page.
- **Typography — Avenir Next LT Pro**: Replaced the placeholder Arial fallback with the company variable font (`AvenirNextVariableRoman` + `AvenirNextVariableItalic`), covering weight range 100–900 with two files. Updated Tailwind `--font-sans` and `body` font-family.

---

## [1.1.0] — 2026-06-15 — Policy documents & asset updates

### Features
- **Login — Policy document links**: Added Terms Of Use, Privacy Policy, and Acceptable Use Policy links at the bottom of the login form. Each link opens the corresponding PDF in a GlassModal dialog (full-screen, frosted-glass style).

### Chores
- Updated login page background image (`cbbg.png`).
- Added `*:Zone.Identifier` to `.gitignore` to prevent Windows metadata files from being committed in the future.
- Removed accidentally committed Windows `Zone.Identifier` metadata files from the `public/docs/` directory.

---

## [1.0.0] — 2026-06-14 — Foundation release

### Features
- **UI — GlassModal**: Added reusable `GlassModal` component with Framer Motion animations, portal-based rendering, backdrop blur, and 4 size options (`sm` / `md` / `lg` / `xl`). Replaced all inline modal implementations across the app.
- Added request middleware, refresh token support, fetch timeout handling, and a global `ErrorBoundary` component.

### Bug Fixes
- **Profile**: Fixed case-insensitive handling of API response fields (`eid`, `userName`, `phone`).
- **Auth**: Prevented Azure SSO from triggering auto-relogin after explicit logout.

### Security
- Replaced Base64-only password reset token encoding with AES-256 encryption / server-side random token storage.
