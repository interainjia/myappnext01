"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// 引入环境变量指向真实后端 API 地址
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // 注意：确保这里的字段名 (user/passwd) 与你后端 Swagger 接口要求的一致
      // 如果后端要求的是 username 和 password，请在此处修改
      const payload = {
        user: values.username,
        passwd: values.password
      };

      // 1. 直接调用真实 API，不再使用 try-catch 包裹 mock 逻辑
      const response = await fetch(`${API_BASE}/api/Account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // 2. 存储真实的 Token
        localStorage.setItem('token', data.token);
        
        // 兼容后端返回字段名的不同命名习惯 (refreshToken 或 refresh_Token)
        if (data.refresh_Token || data.refreshToken) {
            localStorage.setItem('refreshToken', data.refresh_Token || data.refreshToken);
        }
        
        if (data.userRoles) {
          localStorage.setItem('userRoles', JSON.stringify(data.userRoles));
        }
        
        // 3. 存储用户名
        localStorage.setItem('userName', values.username); 

        // 4. 重定向
        const urlParams = new URL(window.location.href).searchParams;
        const redirectUrl = urlParams.get('redirect') || '/dashboard';
        window.location.href = redirectUrl;
      } else {
        // 如果后端返回 400/401 错误，显示后端的错误信息
        setError(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please make sure the backend server is running and CORS is enabled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-2">
        <h2 className="text-[26px] font-bold text-[#333] text-center p-[10px] m-0">
          Sign In
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-2 rounded text-xs border border-red-100 text-center">
            {error}
          </div>
        )}

        <div>
          <input
            {...register("username", { required: "Please enter your username" })}
            placeholder="UserName"
            className="w-full h-12 px-4 rounded bg-[#eef2f9] border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900"
          />
          {errors.username && (
            <p className="text-xs text-red-500 mt-1">{errors.username.message as string}</p>
          )}
        </div>

        <div>
          <input
            {...register("password", { required: "Please enter your password" })}
            type="password"
            placeholder="******"
            className="w-full h-12 px-4 rounded bg-[#eef2f9] border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900"
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>
          )}
        </div>

        <div className="text-right mt-4">
          <Link href="/user/forgot-password" className="text-[#7a94ff] text-[15px] hover:underline">
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

        <div className="text-right mt-2 text-sm text-[#666]">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#7a94ff] hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </>
  );
}