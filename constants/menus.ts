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
    name: 'Configuration', 
    path: '/configuration', 
    icon: Settings,
    access: 'isAdmin',
    // 逻辑：如果是开发环境，则强制显示，方便调试
    hideInMenu: !isDev, 
    routes: [
      { name: 'User Settings', path: '/configuration/users' },
      { name: 'System Settings', path: '/configuration/system' },
    ]
  },
  { 
    name: 'Project List', 
    path: '/projects', 
    icon: Table 
  },
];
