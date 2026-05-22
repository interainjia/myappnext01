"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode"; // 1. 引入解析库

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
      const payload = {
        user: values.username,
        passwd: values.password
      };

      const response = await fetch(`${API_BASE}/api/Account/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // 1. 存储真实的 Token
        localStorage.setItem('token', data.token);
        
        // 2. 存储 Refresh Token
        if (data.refresh_Token || data.refreshToken) {
            localStorage.setItem('refreshToken', data.refresh_Token || data.refreshToken);
        }
        
        // 3. 解码 Token 并提取角色 (核心修改)
        try {
          const decoded = jwtDecode(data.token) as any;
          // 优先取 UserRole，备选用全称 schema
          const role = decoded.UserRole || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          
          if (role) {
            // 因为你的 getAccess 函数接收的是数组 string[]，所以要用数组包起来
            const rolesArray = Array.isArray(role) ? role : [role];
            localStorage.setItem('userRoles', JSON.stringify(rolesArray));
          } else {
             // 如果没找到角色，存空数组
            localStorage.setItem('userRoles', JSON.stringify([]));
          }
        } catch (decodeErr) {
          console.error('Token 解析失败:', decodeErr);
          localStorage.setItem('userRoles', JSON.stringify([]));
        }
        
        // 4. 存储用户名
        localStorage.setItem('userName', values.username); 

        // 5. 重定向
        const urlParams = new URL(window.location.href).searchParams;
        const redirectUrl = urlParams.get('redirect') || '/dashboard';
        window.location.href = redirectUrl;
      } else {
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