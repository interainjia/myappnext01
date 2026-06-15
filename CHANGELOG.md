# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased] — 2026-06-15

### Features
- **Login — Policy document links**: Added Terms Of Use, Privacy Policy, and Acceptable Use Policy links at the bottom of the login form. Each link opens the corresponding PDF in a GlassModal dialog (full-screen, frosted-glass style).
- **Typography — Avenir Next LT Pro**: Replaced the placeholder Arial fallback with the company font. Uses variable fonts (`AvenirNextVariableRoman` + `AvenirNextVariableItalic`) covering weight range 100–900 with just two files. Updated Tailwind `--font-sans` theme variable and `body` font-family.

### Bug Fixes
- Removed accidentally committed Windows `Zone.Identifier` metadata files from the `public/docs/` directory.

### Chores
- Updated login page background image (`cbbg.png`).
- Added `*:Zone.Identifier` to `.gitignore` to prevent Windows metadata files from being committed in the future.

---

## 2026-06-14

### Features
- **UI — GlassModal**: Added reusable `GlassModal` component with Framer Motion animations, portal-based rendering, backdrop blur, and 4 size options (`sm` / `md` / `lg` / `xl`). Replaced all inline modal implementations across the app.

### Bug Fixes
- **Profile**: Fixed case-insensitive handling of API response fields (`eid`, `userName`, `phone`).
- **Auth**: Prevented Azure SSO from triggering auto-relogin after explicit logout.
- **Security**: Replaced Base64-only password reset token encoding with AES-256 encryption / server-side random token storage.

### Features (earlier)
- Added request middleware, refresh token support, fetch timeout handling, and a global `ErrorBoundary` component.
