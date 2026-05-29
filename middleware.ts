/**
 * Next.js Middleware — 服务端路由保护
 *
 * ⚠️  运行环境说明：
 *   - `next dev`（开发服务器）：完整生效，Edge Runtime 执行
 *   - `next build` + `next start`（Node.js 服务器）：完整生效
 *   - `output: 'export'`（静态文件，Nginx 托管）：middleware 不运行
 *
 *  生产静态部署时，请在 Nginx 中添加等效规则：
 *
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │  # 保护 dashboard 路由（无 cookie 跳转登录）                       │
 *  │  location ~ ^/(home|dashboard|projects|configuration) {          │
 *  │    if ($cookie_auth-session = "") {                               │
 *  │      return 302 /login;                                          │
 *  │    }                                                             │
 *  │  }                                                               │
 *  │                                                                  │
 *  │  # 已登录时访问 /login 直接跳 /dashboard                           │
 *  │  location = /login {                                             │
 *  │    if ($cookie_auth-session != "") {                             │
 *  │      return 302 /dashboard;                                      │
 *  │    }                                                             │
 *  │  }                                                               │
 *  └─────────────────────────────────────────────────────────────────┘
 *
 * 工作原理：
 *  登录成功后，客户端会写入 `auth-session=1` cookie（见 lib/auth.ts setAuthCookie）。
 *  Middleware 检查此 cookie 决定是否放行，无需读取 localStorage。
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── 路由分类 ─────────────────────────────────────────────────────────────────

/** 需要登录才能访问的路径前缀 */
const PROTECTED_PREFIXES = [
  '/home',
  '/dashboard',
  '/projects',
  '/configuration',
];

/** 已登录时不应再访问的认证页（否则重定向到 dashboard） */
const AUTH_ONLY_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

// ─── Middleware 主函数 ─────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 读取 auth-session cookie（由 lib/auth.ts setAuthCookie 写入）
  const isAuthenticated = request.cookies.has('auth-session');

  // 1. 访问受保护路由 + 未登录 → 跳转到登录页，带上 redirect 参数
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // 只保留相对路径，防止开放重定向
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. 已登录 + 访问认证页 → 直接跳转 dashboard
  //    例外：带 ?loggedOut=true 的登录页是注销后的落地页，必须放行
  const isAuthPage = AUTH_ONLY_PATHS.some((p) => pathname === p);
  const isLoggingOut = request.nextUrl.searchParams.get('loggedOut') === 'true';

  if (isAuthPage && isAuthenticated && !isLoggingOut) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. 其他情况放行
  return NextResponse.next();
}

// ─── 路由匹配器 ───────────────────────────────────────────────────────────────
//
//  排除静态资源和 Next.js 内部路径，仅对页面路由执行 middleware。

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - _next/static  （静态文件）
     * - _next/image   （图片优化）
     * - favicon.ico
     * - img/          （public/img 目录下的图片资源）
     * - 常见静态文件后缀
     */
    '/((?!_next/static|_next/image|favicon\\.ico|img/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
