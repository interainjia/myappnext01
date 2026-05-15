"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";

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

      let response;
      let data;

      try {
        response = await fetch('/api/Account/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        data = await response.json();
      } catch (err) {
        // Fallback for development/local testing when backend is not running
        const isMockAdmin = values.username === 'admin' && values.password === '123456';
        const isMockDsb = values.username === 'dsb' && values.password === 'dsb123';
        
        if (isMockAdmin || isMockDsb) {
          console.warn(`Backend unreachable. Using mock login for ${values.username}.`);
          response = { ok: true } as any;
          data = {
            token: 'mock-jwt-token',
            refresh_Token: 'mock-refresh-token',
            userRoles: isMockAdmin ? ['Admin'] : ['User']
          };
        } else {
          console.error('Login fetch error:', err);
          throw err;
        }
      }

      if (response.ok && data.token) {
        // 1. Store the JWT and Refresh Token
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refresh_Token);
        if (data.userRoles) {
          localStorage.setItem('userRoles', JSON.stringify(data.userRoles));
        }
        
        // 2. STORE THE USERNAME
        localStorage.setItem('userName', values.username); 

        // 3. REDIRECT: Using window.location to force a fresh state load
        const urlParams = new URL(window.location.href).searchParams;
        const redirectUrl = urlParams.get('redirect') || '/dashboard';
        window.location.href = redirectUrl;
      } else {
        setError(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError('Network error. Please make sure the backend server is running.');
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
          <Link href="/user/forgot-password" size="sm" className="text-[#7a94ff] text-[15px] hover:underline">
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
