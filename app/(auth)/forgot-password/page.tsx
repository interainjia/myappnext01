"use client";

import React, { useState } from 'react';
import { useForm, FieldValues } from "react-hook-form";
import { Loader2, ArrowLeft } from "lucide-react"; // 👈 重新引入 ArrowLeft
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values: FieldValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(`${API_BASE}/api/Account/send-mail-forgot-password`);
      url.searchParams.append('email', values.email);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // 忽略 JSON 解析错误
      }

      if (response.ok) {
        setIsSent(true);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((data as any).message || (data as any).Info || 'Operation failed. Please try again.');
      }
    } catch {
      setError('Network error. Please make sure the server is running and CORS is enabled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-[26px] font-bold text-[#333] text-center p-[10px] m-0">
          Forgot Password
        </h2>
        <p className="text-sm text-[#666] text-center px-4">
          {isSent 
            ? "A password reset link has been sent to your email." 
            : "Enter your email address and we'll send you a link to reset your password."}
        </p>
      </div>

      {!isSent ? (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-2 rounded text-xs border border-red-100 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#333] mb-1">Email Address</label>
              <input
                {...register("email", { 
                  required: "Please enter your email",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="Please enter your email"
                className="w-full h-12 px-4 rounded bg-[#eef2f9] border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-4 bg-[#4db694] hover:bg-[#3d9a7d] text-white rounded font-medium text-base transition-colors flex items-center justify-center uppercase tracking-wider"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </button>
          </form>

          {/* 👈 发送成功前（未发送状态下），显示底部的返回链接 */}
          <div className="text-right mt-6">
            <Link href="/login" className="text-[#7a94ff] text-[15px] hover:underline flex items-center justify-end gap-1">
              <ArrowLeft size={14} /> Return to Login
            </Link>
          </div>
        </>
      ) : (
        // 👈 发送成功后，只显示中央的大按钮，底部链接隐藏
        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-6 py-2 border border-[#4db694] text-[#4db694] rounded hover:bg-[#4db694] hover:text-white transition-all"
          >
            Back to Login
          </Link>
        </div>
      )}
    </>
  );
}