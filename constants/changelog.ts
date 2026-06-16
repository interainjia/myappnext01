export type ChangeType = 'feat' | 'fix' | 'security' | 'chore' | 'docs';

export interface ChangeEntry {
  type: ChangeType;
  scope?: string;
  description: string;
}

export interface VersionRelease {
  version: string;
  date: string;
  highlight?: string;
  changes: ChangeEntry[];
}

export const CHANGELOG: VersionRelease[] = [
  {
    version: '1.2.0',
    date: '2026-06-16',
    highlight: 'Version tracking & company font',
    changes: [
      { type: 'feat', scope: 'ui',    description: 'Add Release Notes page with vertical timeline' },
      { type: 'feat', scope: 'ui',    description: 'Show app version in login page footer and user dropdown menu' },
      { type: 'feat', scope: 'ui',    description: 'Replace global font with Avenir Next LT Pro variable font (weight 100–900)' },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-15',
    highlight: 'Policy documents & asset updates',
    changes: [
      { type: 'feat',  scope: 'login', description: 'Add Terms Of Use, Privacy Policy, and Acceptable Use Policy links at login page bottom — each opens a GlassModal PDF viewer' },
      { type: 'chore', scope: 'assets', description: 'Update login page background image' },
      { type: 'chore', scope: 'git',    description: 'Add *:Zone.Identifier to .gitignore to block Windows metadata files' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-14',
    highlight: 'Foundation release',
    changes: [
      { type: 'feat',     scope: 'ui',       description: 'Add reusable GlassModal component with Framer Motion animations, portal rendering, backdrop blur, and 4 size options' },
      { type: 'feat',     scope: 'ui',       description: 'Replace all inline modal implementations with GlassModal' },
      { type: 'fix',      scope: 'profile',  description: 'Handle case-insensitive API response fields for eid, userName, and phone' },
      { type: 'fix',      scope: 'auth',     description: 'Prevent Azure SSO auto-relogin after explicit logout' },
      { type: 'security', scope: 'auth',     description: 'Replace Base64-only password reset token encoding with AES-256 encryption / server-side random token storage' },
      { type: 'feat',     scope: 'auth',     description: 'Add request middleware, refresh token support, fetch timeout handling, and global ErrorBoundary component' },
    ],
  },
];
