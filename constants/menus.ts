// constants/menus.ts
import { Home, LayoutDashboard, Settings, Table, type LucideIcon } from 'lucide-react';

// 环境标识：判断是否为开发环境
// 优先使用 NEXT_PUBLIC_ENV_LABEL，备选 NODE_ENV，实在不行假设为 false
const envLabel = process.env.NEXT_PUBLIC_ENV_LABEL;
const nodeEnv = process.env.NODE_ENV;

export const isDev = envLabel === 'DEVELOPMENT' || nodeEnv === 'development' || envLabel === undefined;

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  access?: 'isAdmin' | 'isUser';
  hideInMenu?: boolean; 
  routes?: { name: string; path: string }[];
}

export const MENU_ITEMS: MenuItem[] = [
  { 
    name: 'Home', 
    path: '/home', 
    icon: Home 
  },
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Project List', 
    path: '/projects', 
    icon: Table 
  },
  { 
    name: 'Configuration', 
    path: '/configuration', 
    icon: Settings,
    access: 'isAdmin',
    routes: [
      { name: 'Menus', path: '/configuration/menu' },
      { name: 'Permissions', path: '/configuration/permission' },
      { name: 'Roles', path: '/configuration/role' },
      { name: 'Users', path: '/configuration/users' },
      { name: 'Projects', path: '/configuration/projects' },
    ]
  },
];
