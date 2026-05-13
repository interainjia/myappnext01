"use client";

import React, { useState } from 'react';
import { useForm, FieldValues } from "react-hook-form";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values: FieldValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // 对应 SKILL.md 中的注册接口 (LogOnVM)
      const response = await fetch('/api/Account/logon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          username: values.username,
          password: values.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 注册成功后跳转至登录页
        router.push('/login');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network error. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-2">
        <h2 className="text-[26px] font-bold text-[#333] text-center p-[10px] m-0">
          Create Account
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-2 rounded text-xs border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Username Field */}
        <div>
          <input
            {...register("username", { required: "Please enter a username" })}
            placeholder="Username"
            className="w-full h-12 px-4 rounded bg-[#eef2f9] border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900"
          />
          {errors.username && (
            <p className="text-xs text-red-500 mt-1">{errors.username.message as string}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <input
            {...register("email", { 
              required: "Please enter your email",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            type="email"
            placeholder="Email Address"
            className="w-full h-12 px-4 rounded bg-[#eef2f9] border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <input
            {...register("password", { 
              required: "Please set a password",
              minLength: { value: 6, message: "Minimum 6 characters" }
            })}
            type="password"
            placeholder="Password"
            className="w-full h-12 px-4 rounded bg-[#eef2f9] border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900"
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-4 bg-[#4db694] hover:bg-[#3d9a7d] text-white rounded font-medium text-base transition-colors flex items-center justify-center uppercase tracking-wider gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : (
            <>
              <UserPlus size={18} />
              Register
            </>
          )}
        </button>

        <div className="text-right mt-4 text-[15px] text-[#666]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#7a94ff] hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </>
  );
}