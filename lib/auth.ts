/**
 * JWT Token 管理工具
 *
 * 职责：
 *  1. 解码 JWT payload（不验证签名）
 *  2. 过期检测 / 剩余时间计算
 *  3. auth-session cookie 同步（供 middleware.ts 读取）
 *  4. refreshToken 自动续期
 *  5. ensureValidToken — 统一入口，供 Dashboard Layout 调用
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// ─── 类型 ────────────────────────────────────────────────────────────────────

export interface JWTPayload {
  exp?: number;
  iat?: number;
  UserName?: string;
  name?: string;
  UserRole?: string | string[];
  refresh_Token?: string;
  [key: string]: unknown;
}

// ─── JWT 解码工具 ─────────────────────────────────────────────────────────────

/**
 * 解码 JWT payload（Base64URL → JSON），不验证签名
 * 在 Edge Runtime、Node.js 和浏览器中均可运行
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Base64URL → Base64（补齐 padding）
    const base64 = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(parts[1].length + ((4 - (parts[1].length % 4)) % 4), '=');

    const jsonStr =
      typeof window !== 'undefined'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf-8');

    return JSON.parse(jsonStr) as JWTPayload;
  } catch {
    return null;
  }
}

// ─── 过期检测 ─────────────────────────────────────────────────────────────────

/** 返回 token 距过期的剩余毫秒数；无 exp 字段或解码失败返回 -1 */
export function getTokenTTL(token: string): number {
  const payload = decodeToken(token);
  if (!payload?.exp) return -1;
  return payload.exp * 1000 - Date.now();
}

/** token 是否已过期（或无效） */
export function isTokenExpired(token: string): boolean {
  return getTokenTTL(token) <= 0;
}

/**
 * token 是否即将过期
 * @param thresholdMs 阈值（毫秒），默认 5 分钟
 */
export function isTokenExpiringSoon(
  token: string,
  thresholdMs = 5 * 60 * 1000,
): boolean {
  const ttl = getTokenTTL(token);
  return ttl > 0 && ttl <= thresholdMs;
}

// ─── auth-session Cookie ──────────────────────────────────────────────────────
//
//  这是一个**非 httpOnly** 的轻量标记 Cookie，供 middleware.ts 检查路由权限。
//  它不携带 JWT 内容，安全风险低。真正的 token 仍存储在 localStorage。
//  Cookie 的过期时间与 JWT exp 保持同步。

/** 设置 auth-session cookie（登录成功后调用） */
export function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') return;

  const payload = decodeToken(token);
  let cookieStr = 'auth-session=1; path=/; SameSite=Lax';

  if (payload?.exp) {
    cookieStr += `; expires=${new Date(payload.exp * 1000).toUTCString()}`;
  }

  document.cookie = cookieStr;
}

/** 清除 auth-session cookie（登出时调用） */
export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie =
    'auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}

// ─── Token 刷新 ───────────────────────────────────────────────────────────────

/**
 * 使用 refreshToken 向后端换取新的 accessToken
 * @returns 新 accessToken，失败返回 null
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/api/Account/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newToken: string | undefined =
      data.token ?? data.Token ?? data.accessToken ?? data.access_Token;

    if (!newToken || typeof newToken !== 'string') return null;

    // 持久化新 token
    localStorage.setItem('token', newToken);

    const newRefresh =
      data.refresh_Token ?? data.refreshToken ?? data.RefreshToken;
    if (newRefresh) localStorage.setItem('refreshToken', newRefresh);

    // 同步 cookie
    setAuthCookie(newToken);

    return newToken;
  } catch {
    return null;
  }
}

// ─── 统一 token 校验入口 ──────────────────────────────────────────────────────

/**
 * 确保当前 token 有效，按需自动刷新
 *
 * 逻辑：
 *  1. 无 token → 返回 null（调用方应跳转登录）
 *  2. token 已过期 → 尝试用 refreshToken 换新 token；失败返回 null
 *  3. token 即将过期（5min 内）→ 后台静默刷新（不阻塞当前请求）
 *  4. token 正常 → 直接返回
 *
 * @returns 有效的 accessToken 字符串，或 null（需要重新登录）
 */
export async function ensureValidToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  if (isTokenExpired(token)) {
    // 尝试刷新；返回 null 说明 refreshToken 也已失效
    return await refreshAccessToken();
  }

  if (isTokenExpiringSoon(token)) {
    // 静默后台刷新，不阻塞当前导航
    refreshAccessToken().catch(() => {
      // 刷新失败不处理，等下次 ensureValidToken 再重试
    });
  }

  return token;
}
