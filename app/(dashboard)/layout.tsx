"use client";

import React, { useEffect, useState } from 'react';
import { MENU_ITEMS } from '@/constants/menus';
import { getAccess } from '@/lib/access';
import { toastError } from '@/lib/toast';
import { ensureValidToken, clearAuthCookie } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ChevronDown, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 权限与显示状态
  const [userAccess, setUserAccess] = useState({ isAdmin: false, isUser: false });
  
  // 修复 Hydration 问题
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState('User');

  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem('userName');
    if (savedName) setDisplayName(savedName);
    // 🔒 P1-#3：JSON.parse 加 try-catch，防止 localStorage 被篡改时 crash
    let roles: string[] = [];
    try {
      roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      if (!Array.isArray(roles)) roles = [];
    } catch {
      roles = [];
    }
    setUserAccess(getAccess(roles));
  }, []);

  // Token 校验 + 自动刷新
  useEffect(() => {
    if (!mounted) return;

    // /home 是欢迎页，不做强制 token 检查（与原逻辑保持一致）
    if (pathname === '/home') return;

    const validateAndRefresh = async () => {
      // ensureValidToken：已过期 → 尝试 refresh；即将过期 → 后台静默刷新
      const validToken = await ensureValidToken();

      if (!validToken) {
        toastError("Your session has expired, please log in again.");
        clearAuthCookie();
        localStorage.clear();
        // 短暂延迟让 toast 先渲染，再跳转
        setTimeout(() => { window.location.href = '/login'; }, 1200);
      }
    };

    validateAndRefresh();
  }, [mounted, pathname]);

  const handleLogout = async () => {
    try {
      // 1. 尝试通知后端清理 Cookie（使用相对路径 /api/ 配合 Nginx 转发）
      await fetch(`/api/Account/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error("Logout API call failed, but proceeding with local cleanup.");
    } finally {
      // 2. 清除 auth-session cookie，阻止 middleware 继续放行受保护路由
      clearAuthCookie();

      // 3. 无论接口是否报错，必须清空本地状态并跳转
      localStorage.clear();
      sessionStorage.clear();

      // 4. 彻底跳转到登录页，并带上标记防止 SSO 自动检测逻辑再次循环
      window.location.replace('/login?loggedOut=true');
    }
  };

  const filteredMenus = MENU_ITEMS.filter(item => {
    if (!mounted) return !item.access && !item.hideInMenu;
    if (item.hideInMenu) return false;
    if (!item.access) return true;
    if (item.access === 'isAdmin') return userAccess.isAdmin;
    return userAccess.isUser;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full bg-slate-900 text-slate-300 shadow-md">
        <div className="w-full px-6 h-16 flex items-center justify-between relative">
          
          {/* 1. 左侧 Logo */}
          <div className="flex items-center z-10">
            <Link href="/home" className="flex-shrink-0">
              <Image src="/img/cblogo.svg" alt="Crown Bioscience" width={160} height={40} className="h-10 w-auto" />
            </Link>
          </div>

          {/* 2. 中间 菜单区域 (下拉菜单结构) */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
            {filteredMenus.map((item) => {
              const isActive = pathname.startsWith(item.path);
              const hasSubmenu = item.routes && item.routes.length > 0;
              const Icon = item.icon;

              return (
                <div key={item.path} className="relative group">
                  <Link
                    href={item.path}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-[#4db694] text-white shadow-sm' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                    {hasSubmenu && (
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-200 group-hover:rotate-180 ${isActive ? 'text-white/70' : 'text-slate-500'}`} 
                      />
                    )}
                  </Link>

                  {/* 传统上下结构的下拉子菜单 */}
                  {hasSubmenu && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-[60]">
                      <div className="absolute top-[-6px] left-6 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45"></div>
                      {item.routes!.map(sub => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          className={`block px-4 py-2.5 text-sm transition-colors ${
                            pathname === sub.path 
                              ? 'text-[#4db694] bg-slate-50 font-semibold' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-[#4db694]'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* 3. 右侧 用户信息 */}
          <div className="flex items-center gap-4 z-10">
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#4db694] flex items-center justify-center text-xs font-bold text-white uppercase">
                  {mounted ? displayName.charAt(0) : 'U'}
                </div>
                <span className="text-sm font-medium text-slate-300">
                  {mounted ? displayName : '...'}
                </span>
                <ChevronDown size={14} className="text-slate-500 transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {/* 用户下拉菜单 */}
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-[60]">
                <div className="absolute top-[-6px] right-6 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45"></div>

                <Link
                  href="/configuration/profile"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#4db694] transition-colors"
                >
                  <UserIcon size={16} />
                  Profile
                </Link>

                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>

                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                <Link
                  href="/changelog"
                  className="block px-4 py-1.5 text-[10px] text-slate-400 text-center hover:text-[#4db694] transition-colors"
                >
                  v{process.env.NEXT_PUBLIC_APP_VERSION}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 w-full p-6 lg:p-10">
        <div className="w-full h-full">
          {children}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="py-4 text-center text-slate-400 text-xs border-t border-slate-200 bg-white">
        © 2026 Crown Bioscience Inc. All rights reserved.
      </footer>
    </div>
  );
}
