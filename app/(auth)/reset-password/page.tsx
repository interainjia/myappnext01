"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useForm, FieldValues } from "react-hook-form";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [pageError, setPageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // 新增：保存原始的加密 Token
  const [encryptedToken, setEncryptedToken] = useState<string>('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    
    if (tokenParam) {
      // 修复 Base64 在 URL 传输中 '+' 被替换为空格的问题
      const safeToken = tokenParam.replace(/ /g, '+');
      setEncryptedToken(safeToken);
      // 注意：这里不再尝试用 atob() 去解密它！
    } else {
      setPageError("The password reset link is invalid or missing the security token. Please request a new one.");
    }
  }, [searchParams]);

  const onSubmit = async (values: FieldValues) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      // 注意：这里的接口字段需要和你的后端 Reset 接口匹配
      const response = await fetch(`${API_BASE}/api/Account/reset`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: encryptedToken, // 直接把加密串发回给后端
          pwd: values.pwd,
          pwd2: values.pwd2
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        let errorMessage = 'Password reset failed. Please try again.';
        try {
          const data = await response.json();
          errorMessage = data.message || data.Info || errorMessage;
        } catch {
          // Ignore
        }
        setSubmitError(errorMessage);
      }
    } catch {
      setSubmitError('Network error. Please make sure the server is running and CORS is enabled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-[26px] font-bold text-[#333] text-center p-[10px] m-0">
          Reset Password
        </h2>
        <p className="text-sm text-[#666] text-center px-4">
          {isSuccess 
            ? "Your password has been successfully updated." 
            : pageError 
              ? "Invalid Reset Link"
              : "Enter your new password below to update your account."}
        </p>
      </div>

      {pageError ? (
        <div className="mt-6 text-center space-y-4">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm border border-red-100">
            {pageError}
          </div>
          <Link 
            href="/forgot-password" 
            className="inline-flex items-center justify-center px-6 py-2 bg-[#4db694] text-white rounded hover:bg-[#3d9a7d] transition-all"
          >
            Request New Link
          </Link>
        </div>
      ) : !isSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {submitError && (
            <div className="bg-red-50 text-red-500 p-2 rounded text-xs border border-red-100 text-center">
              {submitError}
            </div>
          )}

          {/* 移除了 email 字段，因为前端现在不知道 email 是什么，它被安全地加密在 Token 里了 */}

          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">New Password</label>
            <input
              type="password"
              {...register("pwd", { 
                required: "Please enter a new password",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
              placeholder="Enter new password"
              className="w-full h-12 px-4 rounded bg-[#eef2f9] border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900"
            />
            {errors.pwd && (
              <p className="text-xs text-red-500 mt-1">{errors.pwd.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333] mb-1">Confirm Password</label>
            <input
              type="password"
              {...register("pwd2", { 
                required: "Please confirm your new password",
                validate: value => value === getValues("pwd") || "Passwords do not match"
              })}
              placeholder="Re-enter new password"
              className="w-full h-12 px-4 rounded bg-[#eef2f9] border-none outline-none focus:ring-2 focus:ring-[#4db694] transition-all text-slate-900"
            />
            {errors.pwd2 && (
              <p className="text-xs text-red-500 mt-1">{errors.pwd2.message as string}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-4 bg-[#4db694] hover:bg-[#3d9a7d] text-white rounded font-medium text-base transition-colors flex items-center justify-center uppercase tracking-wider disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
        </form>
      ) : (
        <div className="mt-6 text-center space-y-4">
          <div className="flex justify-center text-[#4db694]">
            <CheckCircle2 size={48} />
          </div>
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center px-6 py-2 border border-[#4db694] text-[#4db694] rounded hover:bg-[#4db694] hover:text-white transition-all"
          >
            Proceed to Login
          </Link>
        </div>
      )}

      {!isSuccess && !pageError && (
        <div className="text-right mt-6">
          <Link href="/login" className="text-[#7a94ff] text-[15px] hover:underline flex items-center justify-end gap-1">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-[#4db694] mb-4" size={40} />
        <p className="text-[#666]">Loading...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}