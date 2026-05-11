"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Send, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

interface ForgotPasswordFormData {
  email?: string;
  code?: string;
  newPassword?: string;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: 发送邮件, 2: 重置密码
  const { register, handleSubmit } = useForm<ForgotPasswordFormData>();

  const onSendMail = (data: ForgotPasswordFormData) => {
    console.log("Sending mail to:", data.email);
    setStep(2);
  };

  const onReset = (data: ForgotPasswordFormData) => console.log("Resetting with:", data);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
      <div className="flex flex-col items-center mb-6">
        <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-4">
          <KeyRound size={32} />
        </div>
        <h2 className="text-2xl font-bold">找回密码</h2>
        <p className="text-sm text-slate-500 text-center mt-2">
          {step === 1 ? "输入您的注册邮箱，我们将为您发送验证码" : "请输入收到的验证码并设置新密码"}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmit(onSendMail)} className="space-y-4">
          <input {...register("email", { required: true })} type="email" placeholder="email@example.com" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
            发送验证码 <Send size={18} />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onReset)} className="space-y-4">
          <input {...register("code", { required: true })} placeholder="验证码" className="w-full px-4 py-2 border rounded-lg outline-none" />
          <input {...register("newPassword", { required: true })} type="password" placeholder="新密码" className="w-full px-4 py-2 border rounded-lg outline-none" />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">重置密码</button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1">
          <ArrowLeft size={14} /> 返回登录
        </Link>
      </div>
    </div>
  );
}