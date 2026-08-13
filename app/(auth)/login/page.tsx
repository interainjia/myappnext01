"use client";

import React, { useState, useEffect } from 'react';
import { useForm, FieldValues } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { setAuthCookie } from "@/lib/auth";
import { fetchWithTimeout, RequestTimeoutError } from "@/lib/fetch";
import GlassModal from "@/components/ui/GlassModal";

const DOC_CONFIG = {
  terms:   { title: 'Terms Of Use',          src: '/docs/terms-of-use.pdf' },
  privacy: { title: 'Privacy Policy',        src: '/docs/privacy-policy.pdf' },
  aup:     { title: 'Acceptable Use Policy', src: '/docs/acceptable-use-policy.pdf' },
} as const;

type DocKey = keyof typeof DOC_CONFIG;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  // 新增状态：控制刚进页面时的 SSO 自动检测状态
  // 临时将这行改成 false，先验证你的密码登录功能
  const [isCheckingSso, setIsCheckingSso] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<DocKey | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // 🚀 核心逻辑 1：页面加载时，自动探测并尝试 Cookie 换 JWT
  useEffect(() => {
    // 如果 URL 里有 loggedOut 参数，说明用户刚注销，写入 sessionStorage 作为持久标记
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('loggedOut')) {
      sessionStorage.setItem('justLoggedOut', '1');
      setIsCheckingSso(false);
      return;
    }

    // sessionStorage 标记存在，也跳过 SSO 自动检测（防止刷新后标记丢失带来的循环）
    if (sessionStorage.getItem('justLoggedOut')) {
      sessionStorage.removeItem('justLoggedOut');
      setIsCheckingSso(false);
      return;
    }

    const checkSsoLogin = async () => {
      try {
        // 🚨 极其关键：必须配置 credentials: 'include'，浏览器才会携带跨域 Cookie 请求后端
        // 超时 8 秒：SSO 检测是非阻塞的，不应让用户等太久
        const response = await fetchWithTimeout(`${API_BASE}/api/Account/sso-exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          timeout: 8_000,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            // 登录成功，执行通用的 Token 存储逻辑
            handleSuccessfulLogin(data.token, data.refresh_Token || data.refreshToken);
            return; // 成功跳转后直接 return，不再执行后续代码
          }
        }
      } catch (err) {
        if (err instanceof RequestTimeoutError) {
          console.log("SSO check timed out, falling back to manual login.");
        } else {
          console.log("SSO check failed or no active session found.", err);
        }
      } finally {
        // 无论成功失败，关闭骨架屏检测状态，展示正常登录 UI
        setIsCheckingSso(false);
      }
    };

    checkSsoLogin();
  }, []);

  // 提取公共的登录成功处理逻辑，供 SSO 和 密码登录 复用
  const handleSuccessfulLogin = (token: string, refreshToken?: string) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    try {
      const decoded = jwtDecode(token) as any;
      const role = decoded.UserRole || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if (role) {
        const rolesArray = Array.isArray(role) ? role : [role];
        localStorage.setItem('userRoles', JSON.stringify(rolesArray));
      } else {
        localStorage.setItem('userRoles', JSON.stringify([]));
      }

      // 存储用户名
      localStorage.setItem('userName', decoded.UserName || decoded.name || 'User');
    } catch (e) {
      localStorage.setItem('userRoles', JSON.stringify([]));
    }

    // 🍪 同步写入 auth-session cookie，供 middleware.ts 检查路由权限
    setAuthCookie(token);

    // 重定向到主页
    // 🔒 安全校验：只允许以 / 开头的相对路径，防止开放重定向攻击
    // 攻击者可能构造 ?redirect=https://evil.com 诱导用户跳转到恶意网站
    const urlParams = new URL(window.location.href).searchParams;
    const rawRedirect = urlParams.get('redirect') || '';
    const redirectUrl = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';
    // 使用 replace 可以防止用户在 dashboard 按"后退"键又回到登录页
    window.location.replace(redirectUrl);
  };

  // 🚀 核心逻辑 2：传统的账号密码登录
  const onSubmit = async (values: FieldValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // 带 15 秒超时的密码登录请求
      const response = await fetchWithTimeout(`${API_BASE}/api/Account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: values.username,
          passwd: values.password,
        }),
      });

      const responseText = await response.text();

      if (response.ok && responseText) { 
        let token = responseText;
        try {
          // 尝试解析 JSON，处理 {"token": "..."} 或 {"Token": "..."} 或 "\"quoted_token\""
          const data = JSON.parse(responseText);
          if (data && typeof data === 'object') {
            token = data.token || data.Token || data.data || responseText;
          } else if (typeof data === 'string') {
            token = data;
          }
        } catch {
          // 如果不是 JSON，则保持原样（纯字符串 Token）
        }
        
        if (token && typeof token === 'string' && token.length > 10) {
          handleSuccessfulLogin(token); 
        } else {
          setError('Login succeeded but no valid token was received.');
        }
      } else {
        // 如果后端返回错误，尝试解析错误信息
        try {
           const errorData = JSON.parse(responseText);
           setError(errorData.Message || errorData.message || 'Login failed. Please check credentials.');
        } catch {
           setError(responseText || 'Login failed. Please check credentials.');
        }
      }
    } catch (err) {
      if (err instanceof RequestTimeoutError) {
        setError('Request timed out. Please check your network and try again.');
      } else {
        setError('Network error. Please make sure the backend server is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 如果正在静默检测 SSO，展示全屏 Loading 体验更好，防止登录框闪烁
  if (isCheckingSso) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#4db694] mb-4" size={48} />
        <p className="text-[#666] dark:text-slate-400">Checking secure session...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2">
        <h2 className="text-[26px] font-bold text-[#333] dark:text-slate-100 text-center p-[10px] m-0">
          Sign In
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 p-2 rounded text-xs border border-red-100 dark:border-red-900/60 text-center">
            {error}
          </div>
        )}

        <div>
          <input
            {...register("username", { required: "Please enter your username" })}
            placeholder="UserName"
            className="w-full h-12 px-4 rounded bg-[#eef2f9] dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div>
          <input
            {...register("password", { required: "Please enter your password" })}
            type="password"
            placeholder="******"
            className="w-full h-12 px-4 rounded bg-[#eef2f9] dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="text-right mt-4">
          <Link href="/forgot-password" className="text-[#7a94ff] dark:text-[#93a9ff] text-[15px] hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-4 bg-[#4db694] hover:bg-[#3d9a7d] text-white rounded font-medium text-base transition-colors flex items-center justify-center uppercase tracking-wider"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "LOG IN"}
        </button>

        {/* 🚀 核心逻辑 3：指向你同事写的 UC 中转链接 */}
        {/* 注意：把 r= 后面的地址换成你 Next.js 本地的调试地址，比如 localhost:3000/login */}
        <div className="text-right mt-4">
          <Link
            href="https://uc.crownbio.com/sysuser/loginazure?r=cbsz-bioweb3.crownbio.com:455/login&s=1&l=en"
            className="text-[#7a94ff] dark:text-[#93a9ff] text-[15px] hover:underline font-medium"
          >
            Sign In With Azure
          </Link>
        </div>

        <div className="text-right mt-2 text-[15px] text-[#666] dark:text-slate-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#7a94ff] dark:text-[#93a9ff] hover:underline">
            Create an account
          </Link>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {(Object.keys(DOC_CONFIG) as DocKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveDoc(key)}
            className="text-xs text-[#999] dark:text-slate-500 hover:text-[#4db694] hover:underline transition-colors"
          >
            {DOC_CONFIG[key].title}
          </button>
        ))}
      </div>

      <p className="mt-2 text-[10px] text-gray-300 dark:text-slate-600 text-center select-none">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>

      <GlassModal
        open={activeDoc !== null}
        onClose={() => setActiveDoc(null)}
        title={activeDoc ? DOC_CONFIG[activeDoc].title : ''}
        size="xl"
      >
        {activeDoc && (
          <iframe
            src={DOC_CONFIG[activeDoc].src}
            className="w-full rounded"
            style={{ height: '70vh', border: 'none' }}
          />
        )}
      </GlassModal>
    </>
  );
}